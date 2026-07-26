import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Stethoscope,
  Plus,
  CalendarPlus,
  X,
  Check,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Skeleton } from "../../components/ui/skeleton";
import { appointmentService } from "../../lib/api";
import { formatDate } from "../../lib/utils";
import toast from "react-hot-toast";
import type { Appointment } from "../../types";

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  "checked-in": "bg-purple-100 text-purple-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  "no-show": "bg-amber-100 text-amber-800",
};

export function AppointmentsPage() {
  const { data: upcomingData, isLoading: upcomingLoading, refetch: refetchUpcoming } = useQuery({
    queryKey: ["appointments", "upcoming"],
    queryFn: () => appointmentService.getAll({ status: "scheduled", limit: 20 }),
  });

  const { data: pastData, isLoading: pastLoading } = useQuery({
    queryKey: ["appointments", "past"],
    queryFn: () => appointmentService.getAll({ status: "completed", limit: 20 }),
  });

  const { data: cancelledData, isLoading: cancelledLoading } = useQuery({
    queryKey: ["appointments", "cancelled"],
    queryFn: () => appointmentService.getAll({ status: "cancelled", limit: 20 }),
  });

  const handleCancel = async (id: string) => {
    try {
      await appointmentService.cancel(id, "Cancelled by patient");
      toast.success("Appointment cancelled");
      refetchUpcoming();
    } catch {
      toast.error("Failed to cancel appointment");
    }
  };

  const handleCheckIn = async (id: string) => {
    try {
      await appointmentService.checkIn(id);
      toast.success("Checked in successfully!");
      refetchUpcoming();
    } catch {
      toast.error("Failed to check in");
    }
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-white p-5 shadow-sm dark:bg-gray-900 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
            <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {appointment.doctor?.specialization}
            </p>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(appointment.date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {appointment.timeSlot}
              </span>
            </div>
            {appointment.reason && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Reason: {appointment.reason}
              </p>
            )}
          </div>
        </div>
        <Badge className={statusColors[appointment.status] || "bg-gray-100 text-gray-800"}>
          {appointment.status}
        </Badge>
      </div>
      {appointment.status === "scheduled" && (
        <div className="mt-4 flex gap-2 border-t pt-4">
          <Button size="sm" onClick={() => handleCheckIn(appointment.id)}>
            <Check className="mr-1 h-4 w-4" /> Check In
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleCancel(appointment.id)}>
            <X className="mr-1 h-4 w-4" /> Cancel
          </Button>
        </div>
      )}
    </motion.div>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border p-5">
          <div className="flex items-start gap-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-52" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="py-12 text-center">
      <Calendar className="mx-auto h-12 w-12 text-gray-300" />
      <p className="mt-3 text-gray-500">{message}</p>
    </div>
  );

  return (
    <DashboardLayout title="Appointments">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400">Manage your appointments</p>
          <Link to="/appointments/book">
            <Button>
              <CalendarPlus className="mr-2 h-4 w-4" /> Book Appointment
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4">
            {upcomingLoading ? (
              <LoadingSkeleton />
            ) : upcomingData?.data?.length === 0 ? (
              <EmptyState message="No upcoming appointments. Book one now!" />
            ) : (
              <div className="space-y-4">
                {upcomingData?.data?.map((apt: Appointment) => (
                  <AppointmentCard key={apt.id} appointment={apt} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4">
            {pastLoading ? (
              <LoadingSkeleton />
            ) : pastData?.data?.length === 0 ? (
              <EmptyState message="No past appointments found." />
            ) : (
              <div className="space-y-4">
                {pastData?.data?.map((apt: Appointment) => (
                  <AppointmentCard key={apt.id} appointment={apt} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="mt-4">
            {cancelledLoading ? (
              <LoadingSkeleton />
            ) : cancelledData?.data?.length === 0 ? (
              <EmptyState message="No cancelled appointments." />
            ) : (
              <div className="space-y-4">
                {cancelledData?.data?.map((apt: Appointment) => (
                  <AppointmentCard key={apt.id} appointment={apt} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
