import { motion } from "framer-motion";
import { Card, CardContent } from "./card";
import { cn, formatNumber } from "../../lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  prefix?: string;
  suffix?: string;
}

export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  prefix = "",
  suffix = "",
}: StatsCardProps) {
  const isPositive = change && change > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold">
                {prefix}{typeof value === "number" ? formatNumber(value) : value}{suffix}
              </p>
              {change !== undefined && (
                <div className={cn("flex items-center gap-1 text-sm font-medium", isPositive ? "text-emerald-600" : "text-red-600")}>
                  {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span>{isPositive ? "+" : ""}{change}%</span>
                  <span className="text-muted-foreground font-normal">vs last month</span>
                </div>
              )}
            </div>
            <div className={cn("p-3 rounded-xl", iconBg)}>
              <Icon className={cn("h-6 w-6", iconColor)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
