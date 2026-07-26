import { useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Mail, CreditCard, ToggleLeft, Database, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Separator } from "../../components/ui/separator";
import { Textarea } from "../../components/ui/textarea";
import toast from "react-hot-toast";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);
    toast.success("Settings saved successfully!");
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure platform settings and preferences.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs defaultValue="platform" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="platform">Platform</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          <TabsContent value="platform" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Platform Settings</CardTitle>
                <CardDescription>General platform configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="platformName">Platform Name</Label>
                    <Input id="platformName" defaultValue="DiagnoConnect" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input id="supportEmail" type="email" defaultValue="support@diagnosconnect.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultTimezone">Default Timezone</Label>
                    <Input id="defaultTimezone" defaultValue="Africa/Addis_Ababa" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultCurrency">Default Currency</Label>
                    <Input id="defaultCurrency" defaultValue="ETB" />
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Platform Limits</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxOrgs">Max Organizations</Label>
                      <Input id="maxOrgs" type="number" defaultValue={500} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxUsersPerOrg">Max Users per Org</Label>
                      <Input id="maxUsersPerOrg" type="number" defaultValue={500} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxStorage">Max Storage (GB)</Label>
                      <Input id="maxStorage" type="number" defaultValue={100} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Email Configuration</CardTitle>
                <CardDescription>Configure email service settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input id="smtpHost" defaultValue="smtp.gmail.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input id="smtpPort" defaultValue={587} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpUser">SMTP Username</Label>
                    <Input id="smtpUser" defaultValue="noreply@diagnosconnect.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPass">SMTP Password</Label>
                    <Input id="smtpPass" type="password" defaultValue="••••••••" />
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="emailFrom">From Name</Label>
                  <Input id="emailFrom" defaultValue="DiagnoConnect" />
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="emailEnabled" defaultChecked />
                  <Label htmlFor="emailEnabled">Enable email notifications</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Gateway Settings</CardTitle>
                <CardDescription>Configure payment processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="paymentProvider">Payment Provider</Label>
                    <Input id="paymentProvider" defaultValue="Telebirr / CBE Birr" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="merchantId">Merchant ID</Label>
                    <Input id="merchantId" defaultValue="DC-MERCH-001" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input id="apiKey" type="password" defaultValue="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">Webhook URL</Label>
                    <Input id="webhookUrl" defaultValue="https://api.diagnosconnect.com/api/v1/webhooks/payment" />
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Payment Methods</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Switch id="telebirr" defaultChecked />
                      <Label htmlFor="telebirr">Telebirr</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="cbe" defaultChecked />
                      <Label htmlFor="cbe">CBE Birr</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="bankTransfer" defaultChecked />
                      <Label htmlFor="bankTransfer">Bank Transfer</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="creditCard" />
                      <Label htmlFor="creditCard">Credit/Debit Card</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Feature Toggles</CardTitle>
                <CardDescription>Enable or disable platform features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "EMR Module", description: "Electronic Medical Records system", enabled: true },
                  { name: "Appointment Booking", description: "Online appointment scheduling", enabled: true },
                  { name: "Lab Results Portal", description: "Patient lab results access", enabled: true },
                  { name: "Prescription Management", description: "Digital prescription system", enabled: true },
                  { name: "Insurance Claims", description: "Insurance claim processing", enabled: true },
                  { name: "Chat System", description: "Real-time messaging between users", enabled: true },
                  { name: "Radiology Module", description: "Radiology image management", enabled: false },
                  { name: "Analytics Dashboard", description: "Advanced analytics and reporting", enabled: true },
                  { name: "Multi-language Support", description: "Amharic and English support", enabled: false },
                ].map((feature, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{feature.name}</p>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                    <Switch defaultChecked={feature.enabled} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Backup Management</CardTitle>
                <CardDescription>Manage system backups</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">Last Backup</p>
                    <p className="text-xs text-muted-foreground">Dec 15, 2024 at 06:00 AM (2.4 GB)</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Database className="mr-2 h-4 w-4" />
                    Backup Now
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="autoBackup" defaultChecked />
                  <Label htmlFor="autoBackup">Enable automatic daily backups</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retentionDays">Backup Retention (days)</Label>
                  <Input id="retentionDays" type="number" defaultValue={30} className="w-32" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
