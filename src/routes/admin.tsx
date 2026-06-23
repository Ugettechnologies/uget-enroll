import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin")({
  component: AdminWrapper,
});

function AdminWrapper() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("adminAuth") === "true";
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "uget@admin" && password === "admin@10717") {
      setIsAuthenticated(true);
      sessionStorage.setItem("adminAuth", "true");
      setError("");
    } else {
      setError("Invalid email or password");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background/50">
        <div className="w-full max-w-md p-8 space-y-6 bg-card border rounded-xl shadow-lg">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Admin Login</h1>
            <p className="text-sm text-muted-foreground">Enter your credentials to access the dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="text" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <Button type="submit" className="w-full">Sign In</Button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminDashboard onLogout={() => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("adminAuth");
  }} />;
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [applications, setApplications] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refName, setRefName] = useState("");
  const [refCode, setRefCode] = useState("");

  useEffect(() => {
    async function fetchData() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const [appsRes, refsRes] = await Promise.all([
        supabase.from("scholarship_applications").select("*").order("created_at", { ascending: false }),
        supabase.from("referral_codes").select("*").order("created_at", { ascending: false }),
      ]);
      if (appsRes.data) setApplications(appsRes.data);
      if (refsRes.data) setReferrals(refsRes.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const downloadCSV = () => {
    if (!applications.length) return;
    
    // Get headers
    const headers = Object.keys(applications[0]);
    
    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...applications.map(row => 
        headers.map(header => {
          const val = row[header];
          // Escape quotes and wrap in quotes to handle commas in values
          return `"${String(val !== null && val !== undefined ? val : "").replace(/"/g, '""')}"`;
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `uget-applications-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refName || !supabase) return;
    
    // Generate a unique code (e.g. NAME-1234)
    const randomHex = Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0');
    const cleanName = refName.split(" ")[0].replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const code = `${cleanName}-${randomHex}`;
    
    const { data, error } = await supabase.from("referral_codes").insert({
      referrer_name: refName,
      code: code,
    }).select();
    
    if (!error && data) {
      setReferrals([data[0], ...referrals]);
      setRefName("");
      setRefCode(code);
    } else {
      console.error(error);
      alert("Error generating referral code: " + (error?.message || "Unknown error"));
    }
  };

  const deleteReferral = async (id: string) => {
    if (!supabase) return;
    if (!confirm("Are you sure you want to delete this referral code?")) return;
    
    const { error } = await supabase.from("referral_codes").delete().eq("id", id);
    if (!error) {
      setReferrals(referrals.filter(ref => ref.id !== id));
    } else {
      console.error(error);
      alert("Error deleting referral code: " + (error?.message || "Unknown error"));
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-[95vw]">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Uget Academy — Admin</h1>
        <div className="flex items-center gap-4">
          <Button onClick={downloadCSV} className="bg-primary text-primary-foreground">
            Export CSV
          </Button>
          <Button onClick={onLogout} variant="outline">
            Sign Out
          </Button>
        </div>
      </div>

      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>
          <TabsTrigger value="referrers">Referrers ({referrals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="border rounded-lg shadow-sm">
          <div className="overflow-x-auto whitespace-nowrap">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Track</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>State/Region</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Highest Qual.</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Course of Study</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead>Studied Before</TableHead>
                  <TableHead>Experience Level</TableHead>
                  <TableHead>Has Computer</TableHead>
                  <TableHead>Has Internet</TableHead>
                  <TableHead>Can Commit</TableHead>
                  <TableHead>Heard From</TableHead>
                  <TableHead>Referral Code</TableHead>
                  <TableHead>Signature</TableHead>
                  <TableHead>Agreed to Terms</TableHead>
                  <TableHead>Track Reason</TableHead>
                  <TableHead>Why Apply</TableHead>
                  <TableHead>Goals</TableHead>
                  <TableHead>2 Year Vision</TableHead>
                  <TableHead>Residential Address</TableHead>
                  <TableHead>LinkedIn</TableHead>
                  <TableHead>Portfolio</TableHead>
                  <TableHead>GitHub</TableHead>
                  <TableHead>Design Profile</TableHead>
                  <TableHead>Other Links</TableHead>
                  <TableHead>Emergency Name</TableHead>
                  <TableHead>Emergency Rel.</TableHead>
                  <TableHead>Emergency Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={35} className="text-center py-4">Loading...</TableCell></TableRow>
                ) : applications.length === 0 ? (
                  <TableRow><TableCell colSpan={35} className="text-center py-4">No applications found.</TableCell></TableRow>
                ) : (
                  applications.map((app, i) => (
                    <TableRow key={i}>
                      <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{app.track}</TableCell>
                      <TableCell className="font-medium">{app.full_name}</TableCell>
                      <TableCell>{app.email}</TableCell>
                      <TableCell>{app.phone}</TableCell>
                      <TableCell>{app.gender}</TableCell>
                      <TableCell>{app.date_of_birth || "-"}</TableCell>
                      <TableCell>{app.state_region}</TableCell>
                      <TableCell>{app.country}</TableCell>
                      <TableCell>{app.highest_qualification}</TableCell>
                      <TableCell>{app.institution || "-"}</TableCell>
                      <TableCell>{app.course_of_study || "-"}</TableCell>
                      <TableCell>{app.current_status}</TableCell>
                      <TableCell>{app.studied_before ? "Yes" : "No"}</TableCell>
                      <TableCell>{app.experience_level}</TableCell>
                      <TableCell>{app.has_computer ? "Yes" : "No"}</TableCell>
                      <TableCell>{app.has_internet ? "Yes" : "No"}</TableCell>
                      <TableCell>{app.can_commit ? "Yes" : "No"}</TableCell>
                      <TableCell>{app.heard_from}</TableCell>
                      <TableCell>{app.referral_code || "-"}</TableCell>
                      <TableCell>{app.signature}</TableCell>
                      <TableCell>{app.agreed_to_terms ? "Yes" : "No"}</TableCell>
                      <TableCell className="max-w-xs truncate" title={app.track_reason}>{app.track_reason}</TableCell>
                      <TableCell className="max-w-xs truncate" title={app.why_apply}>{app.why_apply}</TableCell>
                      <TableCell className="max-w-xs truncate" title={app.goals}>{app.goals}</TableCell>
                      <TableCell className="max-w-xs truncate" title={app.two_year_vision}>{app.two_year_vision}</TableCell>
                      <TableCell className="max-w-xs truncate" title={app.residential_address}>{app.residential_address || "-"}</TableCell>
                      <TableCell>{app.linkedin_url || "-"}</TableCell>
                      <TableCell>{app.portfolio_url || "-"}</TableCell>
                      <TableCell>{app.github_url || "-"}</TableCell>
                      <TableCell>{app.design_profile_url || "-"}</TableCell>
                      <TableCell>{app.other_links || "-"}</TableCell>
                      <TableCell>{app.emergency_name || "-"}</TableCell>
                      <TableCell>{app.emergency_relationship || "-"}</TableCell>
                      <TableCell>{app.emergency_phone || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="referrers" className="border rounded-lg shadow-sm p-6 space-y-6">
          <div className="max-w-md space-y-4">
            <h2 className="text-xl font-semibold">Generate New Referral Code</h2>
            <form onSubmit={generateReferral} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Referrer Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. John Doe" 
                  value={refName} 
                  onChange={(e) => setRefName(e.target.value)} 
                  required
                />
              </div>
              <Button type="submit">Generate Code</Button>
            </form>
            {refCode && (
              <div className="p-4 bg-primary/10 rounded-lg mt-4 border border-primary/20">
                <p className="text-sm font-medium text-primary mb-1">Generated Code:</p>
                <p className="text-2xl font-mono">{refCode}</p>
              </div>
            )}
          </div>

          <div className="pt-6 border-t">
            <h2 className="text-xl font-semibold mb-4">Existing Referrers</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date Created</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((ref, i) => (
                  <TableRow key={i}>
                    <TableCell>{new Date(ref.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{ref.referrer_name}</TableCell>
                    <TableCell className="font-mono">{ref.code}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => deleteReferral(ref.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {referrals.length === 0 && !loading && (
                  <TableRow><TableCell colSpan={4} className="text-center py-4">No referrers generated yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
