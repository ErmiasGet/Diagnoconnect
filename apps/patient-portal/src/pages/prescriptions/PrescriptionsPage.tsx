import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { PillBottle, Calendar, Stethoscope, Clock } from "lucide-react";
import { format } from "date-fns";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { prescriptionService } from "../../lib/api";
import { formatDate } from "../../lib/utils";
import type { Prescription } from "../../types";

export function PrescriptionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["prescriptions"],
    queryFn: () => prescriptionService.getAll({ limit: 50 }),
  });

  return (
    <DashboardLayout title="Prescriptions">
      <div className="space-y-6">
        <p className="text-gray-600 dark:text-gray-400">
          Your medication prescriptions
        </p>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border p-5">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="py-16 text-center">
            <PillBottle className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              No prescriptions yet
            </h3>
            <p className="mt-1 text-gray-500">Your prescriptions will appear here after your visits.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.data?.map((rx: Prescription, index: number) => (
              <motion.div
                key={rx.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
                          <PillBottle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {rx.medications?.[0]?.name}
                              {rx.medications?.length > 1 && ` +${rx.medications.length - 1} more`}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {rx.medications?.length} medication{rx.medications?.length !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                          <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Stethoscope className="h-3.5 w-3.5" />
                              Dr. {rx.doctor?.firstName} {rx.doctor?.lastName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(rx.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {rx.medications?.map((med, i) => (
                        <div key={i} className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
                          <p className="font-medium text-gray-900 dark:text-white">{med.name}</p>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {med.frequency}
                            </span>
                            <span>•</span>
                            <span>{med.dosage}</span>
                            <span>•</span>
                            <span>{med.duration}</span>
                          </div>
                          {med.instructions && (
                            <p className="mt-1 text-xs text-gray-400 italic">{med.instructions}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
