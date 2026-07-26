import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, CheckCircle2, Clock, AlertCircle, ChevronRight, X } from "lucide-react";
import { format } from "date-fns";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { laboratoryService } from "../../lib/api";
import type { LabResult } from "../../types";

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  completed: { color: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 },
  pending: { color: "bg-amber-100 text-amber-800", icon: Clock },
  cancelled: { color: "bg-red-100 text-red-800", icon: AlertCircle },
};

export function LabResultsPage() {
  const [selectedResult, setSelectedResult] = useState<LabResult | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["lab-results"],
    queryFn: () => laboratoryService.getResults({ limit: 50 }),
  });

  return (
    <DashboardLayout title="Lab Results">
      <div className="space-y-6">
        <p className="text-gray-600 dark:text-gray-400">
          View your laboratory test results
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-xl border p-5">
                <Skeleton className="h-5 w-32 mb-3" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="py-16 text-center">
            <FlaskConical className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              No lab results yet
            </h3>
            <p className="mt-1 text-gray-500">Your lab results will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data?.data?.map((result: LabResult, index: number) => {
              const config = statusConfig[result.status] || statusConfig.pending;
              const StatusIcon = config.icon;
              return (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedResult(result)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {result.testName}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {format(new Date(result.createdAt), "MMM d, yyyy")}
                          </p>
                        </div>
                        <Badge className={config.color}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {result.status}
                        </Badge>
                      </div>
                      {result.status === "completed" && (
                        <div className="mt-3 rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
                          <p className="text-xs text-gray-500">Result</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {result.result} {result.unit}
                          </p>
                          {result.referenceRange && (
                            <p className="text-xs text-gray-500">Ref: {result.referenceRange}</p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        <Dialog open={!!selectedResult} onOpenChange={() => setSelectedResult(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedResult?.testName}</DialogTitle>
            </DialogHeader>
            {selectedResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
                    <p className="text-xs text-gray-500">Result</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedResult.result} {selectedResult.unit}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
                    <p className="text-xs text-gray-500">Reference Range</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedResult.referenceRange || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="text-sm font-medium">{format(new Date(selectedResult.createdAt), "MMMM d, yyyy")}</p>
                </div>
                {selectedResult.notes && (
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
                    <p className="text-xs text-gray-500">Notes</p>
                    <p className="text-sm">{selectedResult.notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
