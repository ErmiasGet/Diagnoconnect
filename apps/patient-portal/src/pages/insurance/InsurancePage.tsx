import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Shield, FileText, CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Skeleton } from "../../components/ui/skeleton";
import { insuranceService } from "../../lib/api";
import { formatCurrency, formatDate } from "../../lib/utils";
import type { InsurancePolicy, InsuranceClaim } from "../../types";

const claimStatusConfig: Record<string, { variant: "success" | "warning" | "destructive" | "outline"; icon: React.ElementType }> = {
  approved: { variant: "success", icon: CheckCircle2 },
  paid: { variant: "success", icon: CheckCircle2 },
  processing: { variant: "warning", icon: Clock },
  submitted: { variant: "outline", icon: Clock },
  denied: { variant: "destructive", icon: XCircle },
};

export function InsurancePage() {
  const { data: policiesData, isLoading: policiesLoading } = useQuery({
    queryKey: ["insurance-policies"],
    queryFn: () => insuranceService.getPolicies({ limit: 20 }),
  });

  const { data: claimsData, isLoading: claimsLoading } = useQuery({
    queryKey: ["insurance-claims"],
    queryFn: () => insuranceService.getClaims({ limit: 20 }),
  });

  return (
    <DashboardLayout title="Insurance">
      <div className="space-y-6">
        <p className="text-gray-600 dark:text-gray-400">
          Manage your insurance policies and claims
        </p>

        <Tabs defaultValue="policies" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-sm">
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="claims">Claims</TabsTrigger>
          </TabsList>

          <TabsContent value="policies" className="mt-4">
            {policiesLoading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="rounded-xl border p-5">
                    <Skeleton className="h-5 w-40 mb-3" />
                    <Skeleton className="h-4 w-64 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            ) : policiesData?.data?.length === 0 ? (
              <div className="py-16 text-center">
                <Shield className="mx-auto h-16 w-16 text-gray-300" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                  No insurance policies
                </h3>
                <p className="mt-1 text-gray-500">You haven't added any insurance policies yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {policiesData?.data?.map((policy: InsurancePolicy) => (
                  <motion.div
                    key={policy.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30">
                            <Shield className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {policy.provider?.name || "Insurance Provider"}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Policy: {policy.policyNumber}
                            </p>
                            <div className="mt-3 grid grid-cols-2 gap-3">
                              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2">
                                <p className="text-xs text-gray-500">Coverage</p>
                                <p className="font-bold text-gray-900 dark:text-white">{policy.coveragePercentage}%</p>
                              </div>
                              <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2">
                                <p className="text-xs text-gray-500">Max Coverage</p>
                                <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(policy.maxCoverage)}</p>
                              </div>
                            </div>
                            <p className="mt-2 text-xs text-gray-400">
                              Valid: {formatDate(policy.startDate)} - {formatDate(policy.endDate)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="claims" className="mt-4">
            {claimsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl border p-4">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                ))}
              </div>
            ) : claimsData?.data?.length === 0 ? (
              <div className="py-16 text-center">
                <FileText className="mx-auto h-16 w-16 text-gray-300" />
                <p className="mt-3 text-gray-500">No claims submitted yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {claimsData?.data?.map((claim: InsuranceClaim) => {
                  const config = claimStatusConfig[claim.status] || claimStatusConfig.submitted;
                  const StatusIcon = config.icon;
                  return (
                    <motion.div
                      key={claim.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  Claim #{claim.id.slice(-8).toUpperCase()}
                                </h3>
                                <Badge variant={config.variant}>
                                  <StatusIcon className="mr-1 h-3 w-3" />
                                  {claim.status}
                                </Badge>
                              </div>
                              <p className="mt-1 text-sm text-gray-500">
                                Policy: {claim.policy?.policyNumber} • {formatDate(claim.createdAt)}
                              </p>
                            </div>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {formatCurrency(claim.amount)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
