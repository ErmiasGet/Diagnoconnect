import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FileText, Calendar, Stethoscope, PillBottle, FlaskConical, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { emrService } from "../../lib/api";
import type { EmrRecord } from "../../types";

const recordIcons: Record<string, React.ElementType> = {
  soap: Stethoscope,
  progress: FileText,
  discharge: PillBottle,
  referral: ChevronRight,
};

const recordColors: Record<string, string> = {
  soap: "bg-blue-100 text-blue-600",
  progress: "bg-emerald-100 text-emerald-600",
  discharge: "bg-amber-100 text-amber-600",
  referral: "bg-purple-100 text-purple-600",
};

export function MedicalRecordsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["emr-records"],
    queryFn: () => emrService.getRecords({ limit: 50 }),
  });

  return (
    <DashboardLayout title="Medical Records">
      <div className="space-y-6">
        <p className="text-gray-600 dark:text-gray-400">
          Your complete medical history in one place
        </p>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border p-5">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              No records yet
            </h3>
            <p className="mt-1 text-gray-500">Your medical records will appear here after your visits.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
            <div className="space-y-6">
              {data?.data?.map((record: EmrRecord, index: number) => {
                const Icon = recordIcons[record.type] || FileText;
                const colorClass = recordColors[record.type] || "bg-gray-100 text-gray-600";
                const soapContent = record.type === "soap" ? record.content as Record<string, string> : null;

                return (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative ml-12"
                  >
                    <div className={`absolute -left-12 flex h-8 w-8 items-center justify-center rounded-full ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
                                {record.type} Note
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {record.type.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                              {format(new Date(record.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                        </div>

                        {soapContent && (
                          <div className="mt-4 space-y-3">
                            {["subjective", "objective", "assessment", "plan"].map((field) => (
                              soapContent[field] ? (
                                <div key={field} className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
                                  <p className="text-xs font-semibold uppercase text-gray-500 mb-1">{field}</p>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">{soapContent[field]}</p>
                                </div>
                              ) : null
                            ))}
                          </div>
                        )}

                        {record.doctor && (
                          <p className="mt-3 text-sm text-gray-500">
                            By Dr. {record.doctor.firstName} {record.doctor.lastName}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
