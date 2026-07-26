import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Bell,
  Check,
  CheckCheck,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  FileText,
  PillBottle,
  CreditCard,
} from "lucide-react";
import { format } from "date-fns";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { notificationService } from "../../lib/api";
import toast from "react-hot-toast";
import type { Notification } from "../../types";

const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  info: { icon: Info, color: "bg-blue-100 text-blue-600" },
  warning: { icon: AlertTriangle, color: "bg-amber-100 text-amber-600" },
  success: { icon: CheckCircle2, color: "bg-emerald-100 text-emerald-600" },
  error: { icon: XCircle, color: "bg-red-100 text-red-600" },
};

export function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationService.getAll({ limit: 50 }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
  });

  const unreadCount = data?.data?.filter((n: Notification) => !n.read).length || 0;

  return (
    <DashboardLayout title="Notifications">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 dark:text-gray-400">
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              <CheckCheck className="mr-1 h-4 w-4" /> Mark all read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-4 rounded-xl border p-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-72" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              No notifications
            </h3>
            <p className="mt-1 text-gray-500">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data?.data?.map((notification: Notification, index: number) => {
              const config = typeConfig[notification.type] || typeConfig.info;
              const TypeIcon = config.icon;
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card
                    className={`transition-colors ${
                      !notification.read
                        ? "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.color}`}>
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h3 className={`text-sm font-semibold ${!notification.read ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <button
                              onClick={() => markReadMutation.mutate(notification.id)}
                              className="shrink-0 ml-2 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4 text-gray-400" />
                            </button>
                          )}
                        </div>
                        <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {format(new Date(notification.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
