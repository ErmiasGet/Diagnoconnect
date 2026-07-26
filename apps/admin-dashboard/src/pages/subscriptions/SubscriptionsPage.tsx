import { useState } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { CreditCard, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";
import { StatsCard } from "../../components/ui/StatsCard";
import { ChartCard } from "../../components/ui/ChartCard";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { formatDate, formatCurrency } from "../../lib/utils";

const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444"];

const planDistribution = [
  { plan: "Free", count: 32 },
  { plan: "Basic", count: 48 },
  { plan: "Professional", count: 56 },
  { plan: "Enterprise", count: 20 },
];

const revenueByPlan = [
  { month: "Jul", free: 0, basic: 180000, professional: 680000, enterprise: 1240000 },
  { month: "Aug", free: 0, basic: 195000, professional: 720000, enterprise: 1335000 },
  { month: "Sep", free: 0, basic: 200000, professional: 780000, enterprise: 1420000 },
  { month: "Oct", free: 0, basic: 210000, professional: 800000, enterprise: 1290000 },
  { month: "Nov", free: 0, basic: 215000, professional: 830000, enterprise: 1305000 },
  { month: "Dec", free: 0, basic: 220000, professional: 860000, enterprise: 1376000 },
];

const mockSubscriptions = [
  { id: "1", organization: "Black Lion Hospital", plan: "enterprise", status: "active", monthlyPrice: 50000, nextBilling: "2025-01-15", endDate: "2025-01-15" },
  { id: "2", organization: "St. Paul's Medical Center", plan: "professional", status: "active", monthlyPrice: 25000, nextBilling: "2025-01-20", endDate: "2025-01-20" },
  { id: "3", organization: "Mekelle General Hospital", plan: "enterprise", status: "active", monthlyPrice: 50000, nextBilling: "2025-01-20", endDate: "2025-01-20" },
  { id: "4", organization: "Jimma University Hospital", plan: "professional", status: "active", monthlyPrice: 25000, nextBilling: "2025-01-25", endDate: "2025-01-25" },
  { id: "5", organization: "Ethio Diagnostic Lab", plan: "basic", status: "active", monthlyPrice: 10000, nextBilling: "2025-01-10", endDate: "2025-01-10" },
  { id: "6", organization: "Hawassa Medical Center", plan: "professional", status: "past_due", monthlyPrice: 25000, nextBilling: "2024-12-15", endDate: "2024-12-15" },
  { id: "7", organization: "Dire Dawa Health Center", plan: "basic", status: "active", monthlyPrice: 10000, nextBilling: "2025-01-12", endDate: "2025-01-12" },
  { id: "8", organization: "Hayat Pharmacy Network", plan: "basic", status: "active", monthlyPrice: 10000, nextBilling: "2025-01-05", endDate: "2025-01-05" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function SubscriptionsPage() {
  const totalRevenue = mockSubscriptions.reduce((a, s) => a + s.monthlyPrice, 0);
  const activeSubs = mockSubscriptions.filter((s) => s.status === "active").length;
  const expiringSoon = mockSubscriptions.filter((s) => {
    const daysUntil = (new Date(s.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysUntil <= 30 && daysUntil > 0;
  }).length;

  const planColors: Record<string, "default" | "success" | "warning" | "secondary"> = {
    free: "secondary",
    basic: "default",
    professional: "success",
    enterprise: "warning",
  };

  const statusBadge = (status: string) => {
    const variants: Record<string, "success" | "warning" | "destructive" | "default"> = {
      active: "success",
      past_due: "warning",
      cancelled: "destructive",
      trialing: "default",
    };
    return <Badge variant={variants[status] || "default"}>{status.replace("_", " ")}</Badge>;
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <p className="text-muted-foreground mt-1">Manage platform subscriptions and billing.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total MRR" value={totalRevenue} prefix="ETB " icon={DollarSign} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <StatsCard title="Active Subscriptions" value={activeSubs} icon={CreditCard} iconColor="text-primary" iconBg="bg-primary/10" />
        <StatsCard title="Avg. Revenue/Sub" value={Math.round(totalRevenue / mockSubscriptions.length)} prefix="ETB " icon={TrendingUp} iconColor="text-violet-600" iconBg="bg-violet-50" />
        <StatsCard title="Expiring Soon" value={expiringSoon} icon={AlertTriangle} iconColor="text-amber-600" iconBg="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={itemVariants}>
          <ChartCard title="Plan Distribution" description="Active subscriptions by plan" timeRangeOptions={["all"]} defaultTimeRange="all">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={4} dataKey="count" nameKey="plan">
                  {planDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ChartCard title="Revenue by Plan" description="Monthly revenue breakdown by plan tier" timeRangeOptions={["30d", "90d", "12m"]} defaultTimeRange="12m">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByPlan}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }} formatter={(v: number) => [`ETB ${v.toLocaleString()}`, ""]} />
                <Legend />
                <Bar dataKey="basic" stackId="a" fill="#2563EB" name="Basic" />
                <Bar dataKey="professional" stackId="a" fill="#10B981" name="Professional" />
                <Bar dataKey="enterprise" stackId="a" fill="#F59E0B" name="Enterprise" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Organization</th>
                    <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Plan</th>
                    <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Monthly Price</th>
                    <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Next Billing</th>
                    <th className="h-12 px-4 text-left text-sm font-medium text-muted-foreground">Valid Until</th>
                  </tr>
                </thead>
                <tbody>
                  {mockSubscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-4 text-sm font-medium">{sub.organization}</td>
                      <td className="p-4"><Badge variant={planColors[sub.plan]} className="capitalize">{sub.plan}</Badge></td>
                      <td className="p-4 text-sm">ETB {sub.monthlyPrice.toLocaleString()}</td>
                      <td className="p-4">{statusBadge(sub.status)}</td>
                      <td className="p-4 text-sm text-muted-foreground">{formatDate(sub.nextBilling)}</td>
                      <td className="p-4 text-sm text-muted-foreground">{formatDate(sub.endDate)}</td>
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
