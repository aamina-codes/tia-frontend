import { cn } from "@/lib/utils";
import type { HealthStatus } from "./statusUtils";
import { statusLabel } from "./statusUtils";

interface StatusBadgeProps {
  status: HealthStatus;
  label?: string;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  className?: string;
}

const STATUS_STYLES: Record<
  HealthStatus,
  { chip: string; dot: string; ring: string }
> = {
  normal: {
    chip: "bg-health-normal/15 text-health-normal border-health-normal/40",
    dot: "bg-health-normal",
    ring: "shadow-glow-normal",
  },
  borderline: {
    chip: "bg-health-borderline/15 text-health-borderline border-health-borderline/40",
    dot: "bg-health-borderline",
    ring: "shadow-glow-borderline",
  },
  moderate: {
    chip: "bg-health-moderate/15 text-health-moderate border-health-moderate/40",
    dot: "bg-health-moderate",
    ring: "shadow-glow-moderate",
  },
  high: {
    chip: "bg-health-high/15 text-health-high border-health-high/40",
    dot: "bg-health-high",
    ring: "shadow-glow-high",
  },
  info: {
    chip: "bg-health-info/15 text-health-info border-health-info/40",
    dot: "bg-health-info",
    ring: "shadow-glow-info",
  },
  na: {
    chip: "bg-health-na/15 text-health-na border-health-na/40",
    dot: "bg-health-na",
    ring: "",
  },
};

const SIZES = {
  sm: "text-[10px] px-2 py-0.5 gap-1",
  md: "text-xs px-2.5 py-1 gap-1.5",
  lg: "text-sm px-3 py-1.5 gap-2",
};

const DOT = { sm: "w-1.5 h-1.5", md: "w-2 h-2", lg: "w-2.5 h-2.5" };

export function StatusBadge({
  status,
  label,
  size = "md",
  pulse = false,
  className,
}: StatusBadgeProps) {
  const styles = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold uppercase tracking-wide",
        styles.chip,
        SIZES[size],
        className,
      )}
    >
      <span
        className={cn(
          "rounded-full",
          styles.dot,
          DOT[size],
          pulse && (status === "high" ? "animate-pulse-warning" : "animate-pulse-soft"),
        )}
      />
      {label ?? statusLabel(status)}
    </span>
  );
}

export default StatusBadge;
