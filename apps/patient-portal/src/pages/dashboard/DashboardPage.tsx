import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Calendar,
  PillBottle,
  FlaskConical,
  CreditCard,
  ArrowRight,
  Clock,
  TrendingUp,
  Activity,
  FileText,
  CalendarPlus,
  MessageSquare,
  Stethoscope,
} from "lucide-react";
import { format } from "date-fns";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { useAuth } from "../../hooks/useAuth";
import { appointmentService, prescriptionService, billingService } from "../../lib/api";
import { formatCurrency, formatDate } from "../../lib/utils";
import type { Appointment, Prescription, Invoice } from "../../types";

const statsCards = [
  {
    title: "Upcoming Appointments",
    icon: Calendar,
    color: "bg-blue-50 text-blue-600",
    iconBg: "bg-blue-100",
    key: "appointments",
  },
  {
    title: "Active Prescriptions",
    icon: PillBottle,
    color: "bg-emerald-50 text-emerald-600",
    iconBg: "bg-emerald-100",
    key: "prescriptions",
  },
  {
    title: "Pending Lab Results",
    icon: FlaskConical,
    color: "bg-amber-50 text-amber-600",
    iconBg: "bg-amber-100",
    key: "labs",
  },
  {
    title: "Outstanding Balance",
    icon: CreditCard,
    color: "bg-red-50 text-red-600",
    iconBg: "bg-red-100",
    key: "balance",
  },
];

const quickActions = [
  { label: "Book Appointment", icon: CalendarPlus, href: "/appointments/book", color: "bg-blue-600 hover:bg-blue-700" },
  { label: "View Records", icon: FileText, href: "/medical-records", color: "bg-emerald-600 hover:bg-emerald-700" },
  { label: "Chat with Doctor", icon: MessageSquare, href: "/chat", color: "bg-purple-600 hover:bg-purple-700" },
  { label: "Lab Results", icon: FlaskConical, href: "/lab-results", color: "bg-amber-600 hover:bg-amber-700" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function DashboardPage() {
  const { user } = useAuth();
  const patient = user?.patient;

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["appointments", "upcoming"],
    queryFn: () => appointmentService.getAll({ status: "scheduled", limit: 5 }),
  });

  const { data: prescriptions, isLoading: prescriptionsLoading } = useQuery({
    queryKey: ["prescriptions", "recent"],
    queryFn: () => prescriptionService.getAll({ limit: 5 }),
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["invoices", "pending"],
    queryFn: () => billingService.getInvoices({ status: "pending", limit: 5 }),
  });

  const upcomingCount = appointments?.pagination?.total || 0;
  const prescriptionCount = prescriptions?.pagination?.total || 0;
  const totalOutstanding = invoices?.data?.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0) || 0;

  const statValues: Record<string, number | string> = {
    appointments: upcomingCount,
    prescriptions: prescriptionCount,
    labs: 3,
    balance: formatCurrency(totalOutstanding),
  };

  return (
    <DashboardLayout title="Dashboard">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item} className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                Welcome back, {patient?.firstName}! 👋
              </h2>
              <p className="mt-1 text-blue-100">
                {format(new Date(), "EEEE, MMMM d, yyyy")} — Here's your health overview
              </p>
            </div>
            <div className="hidden md:block">
              <Activity className="h-20 w-20 text-blue-300/50" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.key} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                      <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                        {statValues[stat.key]}
                      </p>
                    </div>
                    <div className={`rounded-xl p-3 ${stat.iconBg}`}>
                      <Icon className={`h-6 w-6 ${stat.color.split(" ")[1]}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        <motion.div variants={item} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} to={action.href}>
                <div className={`${action.color} flex items-center gap-3 rounded-xl p-4 text-white transition-transform hover:scale-[1.02]`}>
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="text-sm font-medium">{action.label}</span>
                </div>
              </Link>
            );
          })}
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div variants={item}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
                <Link to="/appointments">
                  <Button variant="ghost" size="sm">
                    View All <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {appointmentsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : appointments?.data?.length === 0 ? (
                  <div className="py-8 text-center">
                    <Calendar className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2 text-sm text-gray-500">No upcoming appointments</p>
                    <Link to="/appointments/book">
                      <Button size="sm" className="mt-3">
                        <CalendarPlus className="mr-2 h-4 w-4" /> Book Now
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments?.data?.slice(0, 4).map((apt: Appointment) => (
                      <div key={apt.id} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                          <Stethoscope className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            Dr. {apt.doctor?.firstName} {apt.doctor?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(apt.date)} • {apt.timeSlot}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="mr-1 h-3 w-3" />
                          {apt.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Recent Prescriptions</CardTitle>
                <Link to="/prescriptions">
                  <Button variant="ghost" size="sm">
                    View All <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {prescriptionsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : prescriptions?.data?.length === 0 ? (
                  <div className="py-8 text-center">
                    <PillBottle className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2 text-sm text-gray-500">No prescriptions yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {prescriptions?.data?.slice(0, 4).map((rx: Prescription) => (
                      <div key={rx.id} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                          <PillBottle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {rx.medications?.[0]?.name || "Prescription"}
                            {rx.medications?.length > 1 && ` +${rx.medications.length - 1} more`}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Dr. {rx.doctor?.firstName} {rx.doctor?.lastName} • {formatDate(rx.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Health Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border p-4 text-center">
                  <p className="text-sm text-gray-500">Blood Type</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{patient?.bloodType || "—"}</p>
                </div>
                <div className="rounded-xl border p-4 text-center">
                  <p className="text-sm text-gray-500">Total Visits</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    <TrendingUp className="inline h-5 w-5 text-emerald-500" /> 12
                  </p>
                </div>
                <div className="rounded-xl border p-4 text-center">
                  <p className="text-sm text-gray-500">Allergies</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    {patient?.allergies?.length || 0}
                  </p>
                </div>
                <div className="rounded-xl border p-4 text-center">
                  <p className="text-sm text-gray-500">Insurance</p>
                  <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                    {patient?.insuranceProvider || "Not enrolled"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
