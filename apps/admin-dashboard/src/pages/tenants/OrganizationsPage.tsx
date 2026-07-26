import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Users, UserRound, Clock, Search, Filter } from "lucide-react";
import { StatsCard } from "../../components/ui/StatsCard";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { formatDate } from "../../lib/utils";

const mockOrganizations = [
  { id: "1", name: "Black Lion Hospital", type: "hospital", status: "active", userCount: 245, patientCount: 12400, admin: { firstName: "Abebe", lastName: "Kebede" }, createdAt: "2024-01-15" },
  { id: "2", name: "St. Paul's Medical Center", type: "hospital", status: "active", userCount: 189, patientCount: 8900, admin: { firstName: "Daniel", lastName: "Mulugeta" }, createdAt: "2024-02-20" },
  { id: "3", name: "Addis Clinic Plus", type: "clinic", status: "pending_approval", userCount: 32, patientCount: 1200, admin: { firstName: "Sarah", lastName: "Tesfaye" }, createdAt: "2024-12-08" },
  { id: "4", name: "Ethio Diagnostic Lab", type: "diagnostic_center", status: "active", userCount: 45, patientCount: 5600, admin: { firstName: "Yonas", lastName: "Alemayehu" }, createdAt: "2024-03-10" },
  { id: "5", name: "Hayat Pharmacy Network", type: "pharmacy", status: "active", userCount: 28, patientCount: 3400, admin: { firstName: "Fatima", lastName: "Ahmed" }, createdAt: "2024-04-05" },
  { id: "6", name: "Mekelle General Hospital", type: "hospital", status: "active", userCount: 312, patientCount: 15600, admin: { firstName: "Tewodros", lastName: "Berhe" }, createdAt: "2024-01-20" },
  { id: "7", name: "Hawassa Medical Center", type: "hospital", status: "suspended", userCount: 178, patientCount: 7800, admin: { firstName: "Liya", lastName: "Girma" }, createdAt: "2024-02-15" },
  { id: "8", name: "Bahir Dar Clinic", type: "clinic", status: "pending_approval", userCount: 18, patientCount: 890, admin: { firstName: "Samuel", lastName: "Worku" }, createdAt: "2024-11-22" },
  { id: "9", name: "Dire Dawa Health Center", type: "clinic", status: "active", userCount: 52, patientCount: 2100, admin: { firstName: "Hana", lastName: "Jibreel" }, createdAt: "2024-05-12" },
  { id: "10", name: "Jimma University Hospital", type: "hospital", status: "active", userCount: 278, patientCount: 11200, admin: { firstName: "Dawit", lastName: "Mengistu" }, createdAt: "2024-01-25" },
  { id: "11", name: "Addis Diagnostic Center", type: "diagnostic_center", status: "active", userCount: 38, patientCount: 4200, admin: { firstName: "Ruth", lastName: "Tadesse" }, createdAt: "2024-06-08" },
  { id: "12", name: "Arba Minch Pharmacy", type: "pharmacy", status: "pending_approval", userCount: 12, patientCount: 560, admin: { firstName: "Kibrom", lastName: "Haile" }, createdAt: "2024-12-01" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function OrganizationsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = mockOrganizations.filter((org) => {
    const matchSearch = org.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || org.type === typeFilter;
    const matchStatus = statusFilter === "all" || org.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const activeCount = mockOrganizations.filter((o) => o.status === "active").length;
  const pendingCount = mockOrganizations.filter((o) => o.status === "pending_approval").length;
  const byType = mockOrganizations.reduce((acc, o) => { acc[o.type] = (acc[o.type] || 0) + 1; return acc; }, {} as Record<string, number>);

  const statusBadge = (status: string) => {
    const variants: Record<string, "success" | "warning" | "destructive" | "default"> = {
      active: "success",
      pending_approval: "warning",
      suspended: "destructive",
      inactive: "default",
    };
    return <Badge variant={variants[status] || "default"}>{status.replace("_", " ")}</Badge>;
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold">Organizations</h1>
        <p className="text-muted-foreground mt-1">Manage all healthcare organizations on the platform.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Organizations" value={mockOrganizations.length} icon={Building2} iconColor="text-primary" iconBg="bg-primary/10" />
        <StatsCard title="Active" value={activeCount} icon={Building2} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <StatsCard title="Pending Approval" value={pendingCount} icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatsCard title="Total Users" value={mockOrganizations.reduce((a, o) => a + o.userCount, 0)} icon={Users} iconColor="text-violet-600" iconBg="bg-violet-50" />
      </div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">All Organizations</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search organizations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-64" />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="hospital">Hospital</SelectItem>
                  <SelectItem value="clinic">Clinic</SelectItem>
                  <SelectItem value="diagnostic_center">Diagnostic Center</SelectItem>
                  <SelectItem value="laboratory">Laboratory</SelectItem>
                  <SelectItem value="pharmacy">Pharmacy</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Name</th>
                    <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Type</th>
                    <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Admin</th>
                    <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Users</th>
                    <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Patients</th>
                    <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Created</th>
                    <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((org) => (
                    <tr key={org.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-4 text-sm font-medium">{org.name}</td>
                      <td className="p-4 text-sm capitalize">{org.type.replace("_", " ")}</td>
                      <td className="p-4 text-sm">{org.admin.firstName} {org.admin.lastName}</td>
                      <td className="p-4 text-sm">{org.userCount}</td>
                      <td className="p-4 text-sm">{org.patientCount.toLocaleString()}</td>
                      <td className="p-4">{statusBadge(org.status)}</td>
                      <td className="p-4 text-sm text-muted-foreground">{formatDate(org.createdAt)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/organizations/${org.id}`)}>View</Button>
                          {org.status === "pending_approval" && (
                            <>
                              <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">Approve</Button>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/80">Reject</Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
