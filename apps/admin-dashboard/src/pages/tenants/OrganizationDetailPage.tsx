import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Building2, Users, UserRound, HardDrive, CreditCard, Activity, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { StatsCard } from "../../components/ui/StatsCard";
import { formatDate } from "../../lib/utils";

const mockOrgDetail = {
  id: "1",
  name: "Black Lion Hospital",
  type: "hospital",
  email: "admin@blacklionhospital.com",
  phone: "+251-11-123-4567",
  address: "Sidist Kilo, Addis Ababa",
  city: "Addis Ababa",
  country: "Ethiopia",
  status: "active",
  createdAt: "2024-01-15",
  userCount: 245,
  patientCount: 12400,
  storageUsed: 45.2,
  subscription: {
    plan: "enterprise",
    status: "active",
    monthlyPrice: 50000,
    startDate: "2024-01-15",
    endDate: "2025-01-15",
    maxUsers: 500,
    maxPatients: 50000,
    maxStorage: 100,
  },
  recentActivity: [
    { action: "User registered", detail: "Dr. Alem Berhan joined", time: "2 hours ago" },
    { action: "Report generated", detail: "Monthly patient summary", time: "5 hours ago" },
    { action: "Settings updated", detail: "Email configuration changed", time: "1 day ago" },
    { action: "Backup completed", detail: "Automated daily backup", time: "1 day ago" },
    { action: "User registered", detail: "Nurse Hanna Tesfaye joined", time: "2 days ago" },
  ],
};

export default function OrganizationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const org = mockOrgDetail;

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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/organizations")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{org.name}</h1>
          <p className="text-muted-foreground mt-1 capitalize">{org.type.replace("_", " ")}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {statusBadge(org.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Users" value={org.userCount} icon={Users} iconColor="text-primary" iconBg="bg-primary/10" />
        <StatsCard title="Patients" value={org.patientCount} icon={UserRound} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <StatsCard title="Storage Used" value={`${org.storageUsed} GB`} icon={HardDrive} iconColor="text-violet-600" iconBg="bg-violet-50" />
        <StatsCard title="Plan" value={org.subscription.plan.charAt(0).toUpperCase() + org.subscription.plan.slice(1)} icon={CreditCard} iconColor="text-amber-600" iconBg="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Organization Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Organization</p>
                  <p className="text-sm font-medium">{org.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{org.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{org.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm font-medium">{org.address}, {org.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">{formatDate(org.createdAt)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {org.recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Activity className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.detail}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subscription Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Plan</p>
              <p className="text-sm font-bold capitalize">{org.subscription.plan}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Monthly Price</p>
              <p className="text-sm font-bold">ETB {org.subscription.monthlyPrice.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Max Users</p>
              <p className="text-sm font-bold">{org.subscription.maxUsers}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Max Patients</p>
              <p className="text-sm font-bold">{org.subscription.maxPatients.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Storage Limit</p>
              <p className="text-sm font-bold">{org.subscription.maxStorage} GB</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Valid Until</p>
              <p className="text-sm font-bold">{formatDate(org.subscription.endDate)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
