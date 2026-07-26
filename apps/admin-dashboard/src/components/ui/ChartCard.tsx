import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  timeRangeOptions?: string[];
  defaultTimeRange?: string;
  onTimeRangeChange?: (range: string) => void;
  actions?: React.ReactNode;
}

export function ChartCard({
  title,
  description,
  children,
  timeRangeOptions = ["7d", "30d", "90d", "12m"],
  defaultTimeRange = "30d",
  onTimeRangeChange,
  actions,
}: ChartCardProps) {
  const [timeRange, setTimeRange] = useState(defaultTimeRange);

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    onTimeRangeChange?.(value);
  };

  const timeRangeLabels: Record<string, string> = {
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    "90d": "Last 90 days",
    "12m": "Last 12 months",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRangeOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {timeRangeLabels[option] || option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
