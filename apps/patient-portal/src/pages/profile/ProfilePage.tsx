import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Calendar, Heart, Shield, Loader2, Save, Camera } from "lucide-react";
import toast from "react-hot-toast";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useAuth } from "../../hooks/useAuth";
import { patientService } from "../../lib/api";
import { getInitials } from "../../lib/utils";

const profileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().min(10),
  address: z.string().min(5),
  city: z.string().min(2),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const patient = user?.patient;
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: {
      firstName: patient?.firstName || "",
      lastName: patient?.lastName || "",
      phone: patient?.phone || "",
      address: patient?.address || "",
      city: patient?.city || "",
      bloodType: patient?.bloodType || "",
      allergies: patient?.allergies?.join(", ") || "",
      emergencyContact: patient?.emergencyContact || "",
      emergencyPhone: patient?.emergencyPhone || "",
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    if (!patient) return;
    setIsSaving(true);
    try {
      await patientService.update(patient.id, {
        ...data,
        allergies: data.allergies ? data.allergies.split(",").map((a) => a.trim()) : [],
      });
      await refreshUser();
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout title="Profile">
      <div className="mx-auto max-w-3xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20 border-4 border-white/30">
                <AvatarImage src={patient?.profileImage} />
                <AvatarFallback className="bg-white/20 text-2xl">
                  {getInitials(patient?.firstName || "P", patient?.lastName || "T")}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 rounded-full bg-white p-1.5 text-blue-600 shadow-md hover:bg-gray-50">
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{patient?.firstName} {patient?.lastName}</h2>
              <p className="text-blue-100">{user?.email}</p>
              <p className="text-sm text-blue-200">Patient ID: {patient?.id?.slice(-8).toUpperCase()}</p>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="medical">Medical</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit(onSubmit)}>
            <TabsContent value="personal" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input id="firstName" className="pl-10" {...register("firstName")} />
                      </div>
                      {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" {...register("lastName")} />
                      {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input id="phone" className="pl-10" {...register("phone")} />
                    </div>
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input id="address" className="pl-10" {...register("address")} />
                    </div>
                    {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" {...register("city")} />
                    {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medical" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Medical Information</CardTitle>
                  <CardDescription>Your medical details for better care</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bloodType">Blood Type</Label>
                    <div className="relative">
                      <Heart className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input id="bloodType" placeholder="e.g., A+, B-, O+" className="pl-10" {...register("bloodType")} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies (comma-separated)</Label>
                    <Input id="allergies" placeholder="e.g., Penicillin, Peanuts" {...register("allergies")} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="emergency" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Emergency Contact</CardTitle>
                  <CardDescription>Someone we can reach in case of emergency</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Contact Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input id="emergencyContact" className="pl-10" {...register("emergencyContact")} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Contact Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input id="emergencyPhone" className="pl-10" {...register("emergencyPhone")} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <div className="flex justify-end mt-6">
              <Button type="submit" disabled={!isDirty || isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
