import { useState } from "react";
import { motion } from "framer-motion";
import { Users as UsersIcon, Search, Filter } from "lucide-react";
import { StatsCard } from "../../components/ui/StatsCard";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { formatDate } from "../../lib/utils";

const mockUsers = [
  { id: "1", firstName: "Abebe", lastName: "Kebede", email: "abebe@blacklion.com", role: "admin", organization: "Black Lion Hospital", status: "active", lastLogin: "2024-12-15T10:30:00" },
  { id: "2", firstName: "Daniel", lastName: "Mulugeta", email: "daniel@stpauls.com", role: "admin", organization: "St. Paul's Medical Center", status: "active", lastLogin: "2024-12-15T09:15:00" },
  { id: "3", firstName: "Dr. Alem", lastName: "Berhan", email: "alem@blacklion.com", role: "doctor", organization: "Black Lion Hospital", status: "active", lastLogin: "2024-12-15T08:00:00" },
  { id: "4", firstName: "Sarah", lastName: "Tesfaye", email: "sarah@addisclinic.com", role: "admin", organization: "Addis Clinic Plus", status: "active", lastLogin: "2024-12-14T16:45:00" },
  { id: "5", firstName: "Nurse Hanna", lastName: "Tesfaye", email: "hanna@blacklion.com", role: "nurse", organization: "Black Lion Hospital", status: "active", lastLogin: "2024-12-14T14:20:00" },
  { id: "6", firstName: "Yonas", lastName: "Alemayehu", email: "yonas@ethiodiag.com", role: "admin", organization: "Ethio Diagnostic Lab", status: "active", lastLogin: "2024-12-14T11:30:00" },
  { id: "7", firstName: "Fatima", lastName: "Ahmed", email: "fatima@hayat.com", role: "admin", organization: "Hayat Pharmacy Network", status: "inactive", lastLogin: "2024-12-10T09:00:00" },
  { id: "8", firstName: "Lab Tech Biniyam", lastName: "Adebe", email: "biniyam@stpauls.com", role: "lab_tech", organization: "St. Paul's Medical Center", status: "active", lastLogin: "2024-12-15T07:30:00" },
  { id: "9", firstName: "Tewodros", lastName: "Berhe", email: "tewodros@mekelle.com", role: "admin", organization: "Mekelle General Hospital", status: "active", lastLogin: "2024-12-15T10:00:00" },
  { id: "10", firstName: "Liya", lastName: "Girma", email: "liya@hawassa.com", role: "admin", organization: "Hawassa Medical Center", status: "suspended", lastLogin: "2024-12-01T08:45:00" },
  { id: "11", firstName: "Dr. Dawit", lastName: "Mengistu", email: "dawit@jimma.edu", role: "doctor", organization: "Jimma University Hospital", status: "active", lastLogin: "2024-12-15T09:30:00" },
  { id: "12", firstName: "Receptionist Meron", lastName: "Gebremedhin", email: "meron@blacklion.com", role: "receptionist", organization: "Black Lion Hospital", status: "active", lastLogin: "2024-12-15T08:15:00" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = mockUsers.filter((u) => {
    const matchSearch = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const roleColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
    admin: "default",
    doctor: "success",
    nurse: "secondary",
    lab_tech: "warning",
    receptionist: "secondary",
    patient: "outline",
  };

  const statusBadge = (status: string) => {
    const variants: Record<string, "success" | "warning" | "destructive"> = {
      active: "success",
      inactive: "warning",
      suspended: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground mt-1">Manage all users across organizations on the platform.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Total Users" value={mockUsers.length} icon={UsersIcon} iconColor="text-primary" iconBg="bg-primary/10" />
        <StatsCard title="Active Users" value={mockUsers.filter((u) => u.status === "active").length} icon={UsersIcon} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <StatsCard title="Administrators" value={mockUsers.filter((u) => u.role === "admin").length} icon={UsersIcon} iconColor="text-violet-600" iconBg="bg-violet-50" />
      </div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">All Users</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-64" />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="nurse">Nurse</SelectItem>
                  <SelectItem value="lab_tech">Lab Tech</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
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
                    <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Email</th>
                    <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Role</th>
                    <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Organization</th>
                    <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-4 text-sm font-medium">{user.firstName} {user.lastName}</td>
                      <td className="p-4 text-sm text-muted-foreground">{user.email}</td>
                      <td className="p-4"><Badge variant={roleColors[user.role] || "default"} className="capitalize">{user.role.replace("_", " ")}</Badge></td>
                      <td className="p-4 text-sm">{user.organization}</td>
                      <td className="p-4">{statusBadge(user.status)}</td>
                      <td className="p-4 text-sm text-muted-foreground">{user.lastLogin ? formatDate(user.lastLogin) : "Never"}</td>
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
