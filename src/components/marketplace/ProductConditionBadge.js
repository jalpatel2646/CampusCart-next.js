import { cn } from "@/utils/cn";
import { Badge } from "@/components/common/Badge";
import { Sparkles, ThumbsUp, Minus, PackageCheck } from "lucide-react";

const CONDITION_MAP = {
  "Like New": { variant: "success", icon: Sparkles },
  Good: { variant: "info", icon: ThumbsUp },
  Fair: { variant: "warning", icon: Minus },
  Used: { variant: "default", icon: PackageCheck },
};

/**
 * Displays product condition as a styled badge.
 */
export function ProductConditionBadge({ condition, size = "md", className }) {
  const config = CONDITION_MAP[condition] || CONDITION_MAP["Used"];

  return (
    <Badge
      variant={config.variant}
      size={size}
      icon={config.icon}
      className={className}
    >
      {condition}
    </Badge>
  );
}
