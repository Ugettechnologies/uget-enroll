import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
});

function AdminDashboard() {
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
      alert("Error generating referral code. Ensure the referral_codes table exists.");
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Uget Academy — Admin</h1>
        <Button onClick={downloadCSV} className="bg-primary text-primary-foreground">
          Export CSV
        </Button>
      </div>

      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>
          <TabsTrigger value="referrers">Referrers ({referrals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="border rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Track</TableHead>
                  <TableHead>Referral Code</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-4">Loading...</TableCell></TableRow>
                ) : applications.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-4">No applications found.</TableCell></TableRow>
                ) : (
                  applications.map((app, i) => (
                    <TableRow key={i}>
                      <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{app.full_name}</TableCell>
                      <TableCell>{app.email}</TableCell>
                      <TableCell>{app.phone}</TableCell>
                      <TableCell>{app.track}</TableCell>
                      <TableCell>{app.referral_code || "-"}</TableCell>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((ref, i) => (
                  <TableRow key={i}>
                    <TableCell>{new Date(ref.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{ref.referrer_name}</TableCell>
                    <TableCell className="font-mono">{ref.code}</TableCell>
                  </TableRow>
                ))}
                {referrals.length === 0 && !loading && (
                  <TableRow><TableCell colSpan={3} className="text-center py-4">No referrers generated yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
