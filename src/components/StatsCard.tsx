import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatsCard({ title, value, icon, trend, trendUp, className }: StatsCardProps) {
  return (
    <div className={cn(
      "bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-all duration-300",
      className
    )}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-2 text-foreground font-display">{value}</h3>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 mt-1 text-xs font-medium",
              trendUp ? "text-emerald-500" : "text-rose-500"
            )}>
              <span>{trendUp ? "↑" : "↓"}</span>
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-lg bg-primary/5 text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}
