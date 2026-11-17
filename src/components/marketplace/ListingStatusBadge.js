import { Badge } from "@/components/common/Badge";
import { Archive, CheckCircle, Clock, ShoppingCart } from "lucide-react";

const STATUS_MAP = {
  Available: { variant: "success", icon: CheckCircle, dot: true },
  Reserved: { variant: "warning", icon: Clock, dot: true },
  Sold: { variant: "error", icon: ShoppingCart, dot: true },
  Inactive: { variant: "default", icon: Archive, dot: true },
};

/**
 * Displays listing availability status as a styled badge.
 */
export function ListingStatusBadge({ status, size = "md", className }) {
  const config = STATUS_MAP[status] || STATUS_MAP["Available"];

  return (
    <Badge variant={config.variant} size={size} dot={config.dot} className={className}>
      {status}
    </Badge>
  );
}
