import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Building2, Users, UserRound, DollarSign, Activity, Cpu, Clock, AlertTriangle } from "lucide-react";
import { StatsCard } from "../../components/ui/StatsCard";
import { ChartCard } from "../../components/ui/ChartCard";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useAuth } from "../../hooks/useAuth";
import { formatCurrency } from "../../lib/utils";

const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

const mockDashboardData = {
  totalOrganizations: 156,
  totalUsers: 12480,
  totalPatients: 89320,
  monthlyRevenue: 2456000,
  organizationsChange: 12.5,
  usersChange: 18.3,
  patientsChange: 22.1,
  revenueChange: 15.7,
  revenueByMonth: [
    { month: "Jan", revenue: 1800000 },
    { month: "Feb", revenue: 1950000 },
    { month: "Mar", revenue: 2100000 },
    { month: "Apr", revenue: 1850000 },
    { month: "May", revenue: 2200000 },
    { month: "Jun", revenue: 2350000 },
    { month: "Jul", revenue: 2100000 },
    { month: "Aug", revenue: 2250000 },
    { month: "Sep", revenue: 2400000 },
    { month: "Oct", revenue: 2300000 },
    { month: "Nov", revenue: 2350000 },
    { month: "Dec", revenue: 2456000 },
  ],
  organizationsByType: [
    { type: "Hospitals", count: 42 },
    { type: "Clinics", count: 58 },
    { type: "Diagnostic Centers", count: 31 },
    { type: "Laboratories", count: 18 },
    { type: "Pharmacies", count: 7 },
  ],
  userGrowthByMonth: [
    { month: "Jan", count: 820 },
    { month: "Feb", count: 940 },
    { month: "Mar", count: 1100 },
    { month: "Apr", count: 980 },
    { month: "May", count: 1250 },
    { month: "Jun", count: 1400 },
    { month: "Jul", count: 1150 },
    { month: "Aug", count: 1320 },
    { month: "Sep", count: 1480 },
    { month: "Oct", count: 1560 },
    { month: "Nov", count: 1280 },
    { month: "Dec", count: 1400 },
  ],
  subscriptionDistribution: [
    { plan: "Free", count: 32 },
    { plan: "Basic", count: 48 },
    { plan: "Professional", count: 56 },
    { plan: "Enterprise", count: 20 },
  ],
  recentOrganizations: [
    { id: "1", name: "Black Lion Hospital", type: "hospital", status: "active", users: 245, patients: 12400, createdAt: "2024-12-15" },
    { id: "2", name: "St. Paul's Medical Center", type: "hospital", status: "active", users: 189, patients: 8900, createdAt: "2024-12-10" },
    { id: "3", name: "Addis Clinic Plus", type: "clinic", status: "pending_approval", users: 32, patients: 1200, createdAt: "2024-12-08" },
    { id: "4", name: "Ethio Diagnostic Lab", type: "diagnostic_center", status: "active", users: 45, patients: 5600, createdAt: "2024-12-05" },
    { id: "5", name: "Hayat Pharmacy Network", type: "pharmacy", status: "active", users: 28, patients: 3400, createdAt: "2024-12-01" },
    { id: "6", name: "Mekelle General Hospital", type: "hospital", status: "active", users: 312, patients: 15600, createdAt: "2024-11-28" },
    { id: "7", name: "Hawassa Medical Center", type: "hospital", status: "suspended", users: 178, patients: 7800, createdAt: "2024-11-25" },
    { id: "8", name: "Bahir Dar Clinic", type: "clinic", status: "pending_approval", users: 18, patients: 890, createdAt: "2024-11-22" },
  ],
  topOrganizations: [
    { name: "Black Lion Hospital", users: 245, patients: 12400 },
    { name: "Mekelle General Hospital", users: 312, patients: 15600 },
    { name: "St. Paul's Medical Center", users: 189, patients: 8900 },
    { name: "Hawassa Medical Center", users: 178, patients: 7800 },
    { name: "Ethio Diagnostic Lab", users: 45, patients: 5600 },
  ],
  systemHealth: {
    apiResponseTime: 145,
    uptime: 99.97,
    activeUsers: 1247,
    errorRate: 0.12,
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const data = mockDashboardData;

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
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.firstName || "Admin"} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your platform today.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Organizations"
          value={data.totalOrganizations}
          change={data.organizationsChange}
          icon={Building2}
          iconColor="text-primary"
          iconBg="bg-primary/10"
        />
        <StatsCard
          title="Total Users"
          value={data.totalUsers}
          change={data.usersChange}
          icon={Users}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatsCard
          title="Total Patients"
          value={data.totalPatients}
          change={data.patientsChange}
          icon={UserRound}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
        />
        <StatsCard
          title="Monthly Revenue"
          value={data.monthlyRevenue}
          change={data.revenueChange}
          icon={DollarSign}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          prefix="ETB "
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <ChartCard title="Revenue Overview" description="Monthly revenue for the last 12 months" timeRangeOptions={["30d", "90d", "12m"]} defaultTimeRange="12m">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={data.revenueByMonth}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                  formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ChartCard title="Organizations by Type" description="Distribution across categories" timeRangeOptions={["all"]} defaultTimeRange="all">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie data={data.organizationsByType} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={4} dataKey="count" nameKey="type">
                  {data.organizationsByType.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <ChartCard title="User Growth" description="Monthly user registrations" timeRangeOptions={["30d", "90d", "12m"]} defaultTimeRange="12m">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.userGrowthByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }}
                />
                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ChartCard title="Subscription Plans" description="Active subscriptions by plan" timeRangeOptions={["all"]} defaultTimeRange="all">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data.subscriptionDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="count" nameKey="plan">
                  {data.subscriptionDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Organizations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-10 px-4 text-left text-sm font-medium text-muted-foreground">Name</th>
                      <th className="h-10 px-4 text-left text-sm font-medium text-muted-foreground">Type</th>
                      <th className="h-10 px-4 text-left text-sm font-medium text-muted-foreground">Users</th>
                      <th className="h-10 px-4 text-left text-sm font-medium text-muted-foreground">Patients</th>
                      <th className="h-10 px-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrganizations.map((org) => (
                      <tr key={org.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4 text-sm font-medium">{org.name}</td>
                        <td className="p-4 text-sm capitalize">{org.type.replace("_", " ")}</td>
                        <td className="p-4 text-sm">{org.users}</td>
                        <td className="p-4 text-sm">{org.patients.toLocaleString()}</td>
                        <td className="p-4">{statusBadge(org.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-medium">API Response</span>
                </div>
                <span className="text-sm font-bold">{data.systemHealth.apiResponseTime}ms</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Uptime</span>
                </div>
                <span className="text-sm font-bold text-emerald-600">{data.systemHealth.uptime}%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-violet-600" />
                  <span className="text-sm font-medium">Active Users</span>
                </div>
                <span className="text-sm font-bold">{data.systemHealth.activeUsers}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <span className="text-sm font-medium">Error Rate</span>
                </div>
                <span className="text-sm font-bold">{data.systemHealth.errorRate}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Organizations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.topOrganizations.map((org, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground w-5">#{i + 1}</span>
                    <span className="text-sm font-medium">{org.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{org.users} users</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
