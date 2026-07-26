import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CreditCard, Receipt, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Skeleton } from "../../components/ui/skeleton";
import { billingService } from "../../lib/api";
import { formatCurrency, formatDate } from "../../lib/utils";
import type { Invoice, Payment } from "../../types";

const statusConfig: Record<string, { variant: "success" | "warning" | "destructive" | "outline"; icon: React.ElementType }> = {
  paid: { variant: "success", icon: CheckCircle2 },
  pending: { variant: "warning", icon: Clock },
  partial: { variant: "warning", icon: Clock },
  overdue: { variant: "destructive", icon: AlertCircle },
  cancelled: { variant: "outline", icon: AlertCircle },
};

export function BillingPage() {
  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => billingService.getInvoices({ limit: 50 }),
  });

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: () => billingService.getPayments({ limit: 50 }),
  });

  const totalPending = invoicesData?.data?.reduce(
    (sum, inv) => sum + (inv.totalAmount - inv.paidAmount),
    0
  ) || 0;

  const totalPaid = invoicesData?.data?.reduce((sum, inv) => sum + inv.paidAmount, 0) || 0;

  return (
    <DashboardLayout title="Billing">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Outstanding</p>
                  <p className="mt-1 text-2xl font-bold text-red-600">{formatCurrency(totalPending)}</p>
                </div>
                <div className="rounded-xl bg-red-50 p-3">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Paid</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Invoices</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    {invoicesData?.pagination?.total || 0}
                  </p>
                </div>
                <div className="rounded-xl bg-blue-50 p-3">
                  <Receipt className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="invoices" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-sm">
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="mt-4">
            {invoicesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl border p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : invoicesData?.data?.length === 0 ? (
              <div className="py-16 text-center">
                <Receipt className="mx-auto h-16 w-16 text-gray-300" />
                <p className="mt-3 text-gray-500">No invoices yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoicesData?.data?.map((invoice: Invoice) => {
                  const config = statusConfig[invoice.status] || statusConfig.pending;
                  const StatusIcon = config.icon;
                  const remaining = invoice.totalAmount - invoice.paidAmount;
                  return (
                    <motion.div
                      key={invoice.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  Invoice #{invoice.id.slice(-8).toUpperCase()}
                                </h3>
                                <Badge variant={config.variant}>
                                  <StatusIcon className="mr-1 h-3 w-3" />
                                  {invoice.status}
                                </Badge>
                              </div>
                              <p className="mt-1 text-sm text-gray-500">
                                {formatDate(invoice.createdAt)} • {invoice.items?.length} item(s)
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {formatCurrency(invoice.totalAmount)}
                              </p>
                              {remaining > 0 && (
                                <p className="text-sm text-red-600">
                                  Remaining: {formatCurrency(remaining)}
                                </p>
                              )}
                            </div>
                          </div>
                          {remaining > 0 && (
                            <div className="mt-3">
                              <Button size="sm">
                                <CreditCard className="mr-1 h-4 w-4" /> Pay Now
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="payments" className="mt-4">
            {paymentsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl border p-4">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                ))}
              </div>
            ) : paymentsData?.data?.length === 0 ? (
              <div className="py-16 text-center">
                <CreditCard className="mx-auto h-16 w-16 text-gray-300" />
                <p className="mt-3 text-gray-500">No payments yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentsData?.data?.map((payment: Payment) => (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              Payment #{payment.id.slice(-8).toUpperCase()}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {formatDate(payment.createdAt)} • {payment.method}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-emerald-600">
                              {formatCurrency(payment.amount)}
                            </p>
                            <Badge variant={payment.status === "completed" ? "success" : "outline"}>
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
