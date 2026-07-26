import { motion } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Globe, Zap, Users } from "lucide-react";
import { ChartCard } from "../../components/ui/ChartCard";
import { StatsCard } from "../../components/ui/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

const userGrowthData = [
  { month: "Jan", patients: 5200, doctors: 320, nurses: 180, admins: 95, others: 225 },
  { month: "Feb", patients: 5800, doctors: 350, nurses: 200, admins: 100, others: 250 },
  { month: "Mar", patients: 6400, doctors: 380, nurses: 215, admins: 105, others: 275 },
  { month: "Apr", patients: 5900, doctors: 365, nurses: 210, admins: 102, others: 260 },
  { month: "May", patients: 7200, doctors: 410, nurses: 230, admins: 110, others: 300 },
  { month: "Jun", patients: 8100, doctors: 445, nurses: 245, admins: 115, others: 325 },
  { month: "Jul", patients: 7500, doctors: 420, nurses: 235, admins: 112, others: 305 },
  { month: "Aug", patients: 8400, doctors: 460, nurses: 255, admins: 118, others: 340 },
  { month: "Sep", patients: 9200, doctors: 490, nurses: 270, admins: 122, others: 365 },
  { month: "Oct", patients: 9800, doctors: 510, nurses: 285, admins: 125, others: 380 },
  { month: "Nov", patients: 8900, doctors: 485, nurses: 275, admins: 120, others: 355 },
  { month: "Dec", patients: 9500, doctors: 520, nurses: 290, admins: 128, others: 395 },
];

const revenueData = [
  { month: "Jan", subscriptions: 1500000, services: 300000 },
  { month: "Feb", subscriptions: 1650000, services: 300000 },
  { month: "Mar", subscriptions: 1800000, services: 300000 },
  { month: "Apr", subscriptions: 1550000, services: 300000 },
  { month: "May", subscriptions: 1900000, services: 300000 },
  { month: "Jun", subscriptions: 2050000, services: 300000 },
  { month: "Jul", subscriptions: 1800000, services: 300000 },
  { month: "Aug", subscriptions: 1950000, services: 300000 },
  { month: "Sep", subscriptions: 2100000, services: 300000 },
  { month: "Oct", subscriptions: 2000000, services: 300000 },
  { month: "Nov", subscriptions: 2050000, services: 300000 },
  { month: "Dec", subscriptions: 2150000, services: 306000 },
];

const geographicData = [
  { region: "Addis Ababa", organizations: 62, users: 5200 },
  { region: "Amhara", organizations: 28, users: 2100 },
  { region: "Oromia", organizations: 25, users: 1800 },
  { region: "Tigray", organizations: 18, users: 1400 },
  { region: "SNNPR", organizations: 12, users: 980 },
  { region: "Dire Dawa", organizations: 6, users: 520 },
  { region: "Others", organizations: 5, users: 480 },
];

const featureUsageData = [
  { feature: "EMR", usage: 92 },
  { feature: "Appointments", usage: 88 },
  { feature: "Lab Results", usage: 76 },
  { feature: "Prescriptions", usage: 82 },
  { feature: "Billing", usage: 71 },
  { feature: "Chat", usage: 64 },
  { feature: "Insurance", usage: 45 },
  { feature: "Radiology", usage: 38 },
];

const apiUsageData = [
  { endpoint: "/api/patients", calls: 125000, avgResponseTime: 120 },
  { endpoint: "/api/appointments", calls: 98000, avgResponseTime: 95 },
  { endpoint: "/api/lab-results", calls: 76000, avgResponseTime: 145 },
  { endpoint: "/api/prescriptions", calls: 64000, avgResponseTime: 110 },
  { endpoint: "/api/billing", calls: 52000, avgResponseTime: 180 },
  { endpoint: "/api/emr", calls: 45000, avgResponseTime: 200 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function AnalyticsPage() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Platform-wide analytics and insights.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Users" value={11833} change={18.3} icon={Users} iconColor="text-primary" iconBg="bg-primary/10" />
        <StatsCard title="Monthly Growth" value="15.7%" icon={TrendingUp} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <StatsCard title="API Calls/mo" value="460000" icon={Zap} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatsCard title="Active Regions" value={7} icon={Globe} iconColor="text-violet-600" iconBg="bg-violet-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={itemVariants}>
          <ChartCard title="User Growth Trends" description="Monthly user breakdown by role">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDoctors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }} />
                <Legend />
                <Area type="monotone" dataKey="patients" stroke="#2563EB" fill="url(#colorPatients)" name="Patients" />
                <Area type="monotone" dataKey="doctors" stroke="#10B981" fill="url(#colorDoctors)" name="Doctors" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ChartCard title="Revenue Analytics" description="Revenue breakdown by source">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }} formatter={(v: number) => [`ETB ${v.toLocaleString()}`, ""]} />
                <Legend />
                <Area type="monotone" dataKey="subscriptions" stroke="#10B981" fill="url(#colorSubs)" name="Subscriptions" />
                <Area type="monotone" dataKey="services" stroke="#8B5CF6" fill="transparent" name="Services" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={itemVariants}>
          <ChartCard title="Geographic Distribution" description="Organizations and users by region" timeRangeOptions={["all"]} defaultTimeRange="all">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={geographicData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="region" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }} />
                <Legend />
                <Bar dataKey="organizations" fill="#2563EB" name="Organizations" radius={[4, 4, 0, 0]} />
                <Bar dataKey="users" fill="#10B981" name="Users" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ChartCard title="Feature Usage" description="Platform feature utilization" timeRangeOptions={["7d", "30d", "90d"]} defaultTimeRange="30d">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={featureUsageData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" stroke="#94A3B8" fontSize={12} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="feature" stroke="#94A3B8" fontSize={12} width={100} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }} formatter={(v: number) => [`${v}%`, "Usage"]} />
                <Bar dataKey="usage" radius={[0, 4, 4, 0]}>
                  {featureUsageData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">API Usage</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Endpoint</th>
                    <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Total Calls</th>
                    <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Avg Response Time</th>
                    <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {apiUsageData.map((api, i) => (
                    <tr key={i} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-4 text-sm font-mono font-medium">{api.endpoint}</td>
                      <td className="p-4 text-sm">{api.calls.toLocaleString()}</td>
                      <td className="p-4 text-sm">{api.avgResponseTime}ms</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${api.avgResponseTime < 150 ? "bg-emerald-100 text-emerald-800" : api.avgResponseTime < 200 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>
                          {api.avgResponseTime < 150 ? "Healthy" : api.avgResponseTime < 200 ? "Moderate" : "Slow"}
                        </span>
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
