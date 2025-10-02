import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  AlertTriangle, 
  TrendingUp,
  User,
  Hash,
  Target
} from "lucide-react";

interface MeterReading {
  id: string;
  sequence: number;
  meterNumber: string;
  customerName: string;
  address: string;
  lastReading: number;
  currentReading?: number;
  missed: boolean;
  range: string;
  tries: number;
  fieldFind: string;
  warning: string;
  status: "pending" | "complete" | "issue";
  lat?: number;
  lng?: number;
}

interface MeterCardProps {
  meter: MeterReading;
}

export function MeterCard({ meter }: MeterCardProps) {
  const getStatusColor = () => {
    switch (meter.status) {
      case "complete":
        return "bg-success/10 text-success border-success/20";
      case "issue":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-status-pending/10 text-status-pending border-status-pending/20";
    }
  };

  const getStatusLabel = () => {
    switch (meter.status) {
      case "complete":
        return "Completed";
      case "issue":
        return "Issue";
      default:
        return "Pending";
    }
  };

  return (
    <Card className="p-4 shadow-soft">
      {/* Header with Status */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              Sequence {meter.sequence}
            </span>
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {meter.meterNumber}
          </h2>
        </div>
        <Badge variant="outline" className={getStatusColor()}>
          {getStatusLabel()}
        </Badge>
      </div>

      {/* Customer Info */}
      <div className="space-y-3 mb-4">
        <div className="flex items-start gap-2">
          <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">
              {meter.customerName}
            </p>
            <p className="text-xs text-muted-foreground">
              {meter.address}
            </p>
          </div>
        </div>

        {meter.lat && meter.lng && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <span className="text-xs text-muted-foreground">
              {meter.lat.toFixed(4)}, {meter.lng.toFixed(4)}
            </span>
          </div>
        )}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Last Reading</span>
          </div>
          <p className="text-lg font-bold text-foreground">
            {meter.lastReading.toLocaleString()}
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Range</span>
          </div>
          <p className="text-sm font-semibold text-foreground">
            {meter.range}
          </p>
        </div>
      </div>

      {/* Status Fields */}
      <div className="space-y-2 border-t border-border pt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Missed:</span>
          <Badge variant={meter.missed ? "destructive" : "outline"} className="text-xs">
            {meter.missed ? "Yes" : "No"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Tries:</span>
          <Badge variant="outline" className="text-xs">
            {meter.tries}
          </Badge>
        </div>

        {meter.fieldFind && (
          <div className="pt-2">
            <span className="text-xs font-medium text-muted-foreground block mb-1">
              Field Find:
            </span>
            <p className="text-xs text-foreground bg-muted/30 rounded p-2">
              {meter.fieldFind}
            </p>
          </div>
        )}

        {meter.warning && (
          <div className="pt-2">
            <div className="flex items-start gap-2 bg-warning/10 border border-warning/20 rounded-lg p-2">
              <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-warning block mb-0.5">
                  Warning
                </span>
                <p className="text-xs text-foreground">
                  {meter.warning}
                </p>
              </div>
            </div>
          </div>
        )}

        {meter.currentReading && (
          <div className="pt-2">
            <span className="text-xs font-medium text-muted-foreground block mb-1">
              Current Reading:
            </span>
            <p className="text-2xl font-bold text-success">
              {meter.currentReading.toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
