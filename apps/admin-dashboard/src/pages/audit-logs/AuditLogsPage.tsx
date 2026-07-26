import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Search, Filter, Download } from "lucide-react";
import { StatsCard } from "../../components/ui/StatsCard";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { formatDateTime } from "../../lib/utils";

const mockAuditLogs = [
  { id: "1", userName: "Abebe Kebede", organization: "Black Lion Hospital", action: "user.login", entity: "User", entityId: "u-123", ipAddress: "192.168.1.45", createdAt: "2024-12-15T10:30:00", details: { browser: "Chrome 120" } },
  { id: "2", userName: "System", organization: "-", action: "backup.completed", entity: "System", entityId: "bk-456", ipAddress: "10.0.0.1", createdAt: "2024-12-15T06:00:00", details: { size: "2.4GB" } },
  { id: "3", userName: "Daniel Mulugeta", organization: "St. Paul's Medical Center", action: "org.settings.update", entity: "Organization", entityId: "org-789", ipAddress: "192.168.2.12", createdAt: "2024-12-14T16:45:00", details: { field: "email_config" } },
  { id: "4", userName: "Sarah Tesfaye", organization: "Addis Clinic Plus", action: "user.register", entity: "User", entityId: "u-234", ipAddress: "192.168.3.78", createdAt: "2024-12-14T14:20:00", details: {} },
  { id: "5", userName: "Super Admin", organization: "-", action: "org.approve", entity: "Organization", entityId: "org-321", ipAddress: "10.0.0.1", createdAt: "2024-12-14T11:00:00", details: { orgName: "Addis Clinic Plus" } },
  { id: "6", userName: "Fatima Ahmed", organization: "Hayat Pharmacy Network", action: "subscription.upgrade", entity: "Subscription", entityId: "sub-654", ipAddress: "192.168.4.33", createdAt: "2024-12-13T09:15:00", details: { from: "basic", to: "professional" } },
  { id: "7", userName: "Tewodros Berhe", organization: "Mekelle General Hospital", action: "user.create", entity: "User", entityId: "u-345", ipAddress: "192.168.5.67", createdAt: "2024-12-13T08:30:00", details: { role: "doctor" } },
  { id: "8", userName: "Super Admin", organization: "-", action: "org.suspend", entity: "Organization", entityId: "org-987", ipAddress: "10.0.0.1", createdAt: "2024-12-12T15:00:00", details: { reason: "Payment overdue" } },
  { id: "9", userName: "Liya Girma", organization: "Hawassa Medical Center", action: "user.login_failed", entity: "User", entityId: "u-456", ipAddress: "192.168.6.22", createdAt: "2024-12-12T10:45:00", details: { attempts: 3 } },
  { id: "10", userName: "System", organization: "-", action: "alert.high_error_rate", entity: "System", entityId: "sys-001", ipAddress: "10.0.0.1", createdAt: "2024-12-12T04:30:00", details: { errorRate: "2.3%" } },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");

  const filtered = mockAuditLogs.filter((log) => {
    const matchSearch = `${log.userName} ${log.action} ${log.organization}`.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === "all" || log.action.startsWith(actionFilter);
    const matchEntity = entityFilter === "all" || log.entity === entityFilter;
    return matchSearch && matchAction && matchEntity;
  });

  const actionBadge = (action: string) => {
    if (action.includes("login_failed") || action.includes("suspend") || action.includes("error")) {
      return <Badge variant="destructive">{action}</Badge>;
    }
    if (action.includes("login") || action.includes("create") || action.includes("register") || action.includes("approve")) {
      return <Badge variant="success">{action}</Badge>;
    }
    if (action.includes("update") || action.includes("upgrade")) {
      return <Badge variant="default">{action}</Badge>;
    }
    return <Badge variant="secondary">{action}</Badge>;
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">Track all platform activity and security events.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Total Logs" value={mockAuditLogs.length} icon={FileText} iconColor="text-primary" iconBg="bg-primary/10" />
        <StatsCard title="Failed Logins" value={mockAuditLogs.filter((l) => l.action.includes("login_failed")).length} icon={FileText} iconColor="text-destructive" iconBg="bg-red-50" />
        <StatsCard title="Today's Activity" value={mockAuditLogs.filter((l) => l.createdAt.startsWith("2024-12-15")).length} icon={FileText} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
      </div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">System Logs</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-64" />
              </div>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Entity" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Organization">Organization</SelectItem>
                  <SelectItem value="Subscription">Subscription</SelectItem>
                  <SelectItem value="System">System</SelectItem>
                </SelectContent>
              </Select>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Action" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="user">User Actions</SelectItem>
                  <SelectItem value="org">Organization Actions</SelectItem>
                  <SelectItem value="subscription">Subscription Actions</SelectItem>
                  <SelectItem value="system">System Events</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Timestamp</th>
                    <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">User</th>
                    <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Organization</th>
                    <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Action</th>
                    <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Entity</th>
                    <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">IP Address</th>
                    <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                      <td className="p-4 text-sm font-medium">{log.userName}</td>
                      <td className="p-4 text-sm text-muted-foreground">{log.organization}</td>
                      <td className="p-4">{actionBadge(log.action)}</td>
                      <td className="p-4 text-sm">{log.entity}</td>
                      <td className="p-4 text-sm font-mono text-muted-foreground">{log.ipAddress}</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {log.details && Object.keys(log.details).length > 0
                          ? JSON.stringify(log.details)
                          : "-"}
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
