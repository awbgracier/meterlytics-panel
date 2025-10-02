import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  lastReadings: {
    generation: number;
    export: number;
    import: number;
  };
  currentReadings?: {
    generation?: number;
    export?: number;
    import?: number;
  };
  missed: boolean;
  ranges: {
    generation: string;
    export: string;
    import: string;
  };
  tries: number;
  fieldFind: string;
  warning: string;
  status: "pending" | "complete" | "issue";
  lat?: number;
  lng?: number;
  issues: Array<{
    category: string;
    issue: string;
    customerComplaint: boolean;
    remarks?: string;
  }>;
}

interface MeterCardProps {
  meter: MeterReading;
  onMarkIssue?: () => void;
}

export function MeterCard({ meter, onMarkIssue }: MeterCardProps) {
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

      {/* Last Readings Section */}
      <div className="mb-4 space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5" />
          Last Readings
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-muted/50 rounded-lg p-2">
            <span className="text-[10px] text-muted-foreground block mb-0.5">Generation</span>
            <p className="text-sm font-bold text-foreground">
              {meter.lastReadings.generation.toLocaleString()}
            </p>
            <span className="text-[9px] text-muted-foreground">{meter.ranges.generation}</span>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <span className="text-[10px] text-muted-foreground block mb-0.5">Export</span>
            <p className="text-sm font-bold text-foreground">
              {meter.lastReadings.export.toLocaleString()}
            </p>
            <span className="text-[9px] text-muted-foreground">{meter.ranges.export}</span>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <span className="text-[10px] text-muted-foreground block mb-0.5">Import</span>
            <p className="text-sm font-bold text-foreground">
              {meter.lastReadings.import.toLocaleString()}
            </p>
            <span className="text-[9px] text-muted-foreground">{meter.ranges.import}</span>
          </div>
        </div>
      </div>

      {/* Status Fields */}
      <div className="space-y-2 border-t border-border pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-bold bg-primary/10 text-primary border-primary/20">
              M
            </Badge>
            <span className="text-xs font-medium text-muted-foreground">Missed:</span>
          </div>
          <Badge variant={meter.missed ? "destructive" : "outline"} className="text-xs">
            {meter.missed ? "Yes" : "No"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-bold bg-primary/10 text-primary border-primary/20">
              T
            </Badge>
            <span className="text-xs font-medium text-muted-foreground">Tries:</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {meter.tries}
          </Badge>
        </div>

        {meter.fieldFind && (
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs font-bold bg-primary/10 text-primary border-primary/20">
                L
              </Badge>
              <span className="text-xs font-medium text-muted-foreground">
                Field Find:
              </span>
            </div>
            <p className="text-xs text-foreground bg-muted/30 rounded p-2">
              {meter.fieldFind}
            </p>
          </div>
        )}

        {meter.warning && (
          <div className="pt-2">
            <div className="flex items-start gap-2 bg-warning/10 border border-warning/20 rounded-lg p-2">
              <Badge variant="outline" className="text-xs font-bold bg-warning/20 text-warning border-warning/30 shrink-0">
                W
              </Badge>
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

        {meter.issues && meter.issues.length > 0 && (
          <div className="pt-2 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-xs font-semibold text-destructive">
                Issues Reported ({meter.issues.length})
              </span>
            </div>
            {meter.issues.map((issue, index) => (
              <div key={index} className="bg-destructive/10 border border-destructive/20 rounded-lg p-2">
                <div className="space-y-1">
                  <p className="text-xs text-foreground">
                    <span className="font-medium">Category:</span> {issue.category}
                  </p>
                  <p className="text-xs text-foreground">
                    <span className="font-medium">Issue:</span> {issue.issue}
                  </p>
                  {issue.remarks && (
                    <p className="text-xs text-foreground">
                      <span className="font-medium">Remarks:</span> {issue.remarks}
                    </p>
                  )}
                  {issue.customerComplaint && (
                    <Badge variant="destructive" className="text-[10px] mt-1">
                      Customer Complaint
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {meter.currentReadings && (
          <div className="pt-2 space-y-2">
            <span className="text-xs font-semibold text-success block mb-1">
              Current Readings:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {meter.currentReadings.generation && (
                <div className="bg-success/10 rounded-lg p-2 border border-success/20">
                  <span className="text-[10px] text-success block mb-0.5">Generation</span>
                  <p className="text-sm font-bold text-success">
                    {meter.currentReadings.generation.toLocaleString()}
                  </p>
                </div>
              )}
              {meter.currentReadings.export && (
                <div className="bg-success/10 rounded-lg p-2 border border-success/20">
                  <span className="text-[10px] text-success block mb-0.5">Export</span>
                  <p className="text-sm font-bold text-success">
                    {meter.currentReadings.export.toLocaleString()}
                  </p>
                </div>
              )}
              {meter.currentReadings.import && (
                <div className="bg-success/10 rounded-lg p-2 border border-success/20">
                  <span className="text-[10px] text-success block mb-0.5">Import</span>
                  <p className="text-sm font-bold text-success">
                    {meter.currentReadings.import.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {meter.status !== "complete" && onMarkIssue && (
          <div className="pt-3 border-t border-border mt-3">
            <Button
              variant="outline"
              onClick={onMarkIssue}
              className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Mark Issue
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
