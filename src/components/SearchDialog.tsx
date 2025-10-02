import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Hash, User } from "lucide-react";

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
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meters: MeterReading[];
  onSelect: (meter: MeterReading) => void;
}

export function SearchDialog({ open, onOpenChange, meters, onSelect }: SearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMeters = meters.filter(
    (meter) =>
      meter.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meter.meterNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meter.sequence.toString().includes(searchTerm)
  );

  const handleSelect = (meter: MeterReading) => {
    onSelect(meter);
    onOpenChange(false);
    setSearchTerm("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "bg-success/10 text-success border-success/20";
      case "issue":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-status-pending/10 text-status-pending border-status-pending/20";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Meters</DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or sequence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {filteredMeters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No meters found</p>
            </div>
          ) : (
            filteredMeters.map((meter) => (
              <button
                key={meter.id}
                onClick={() => handleSelect(meter)}
                className="w-full text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Seq {meter.sequence}
                    </span>
                  </div>
                  <Badge variant="outline" className={`text-xs ${getStatusColor(meter.status)}`}>
                    {meter.status}
                  </Badge>
                </div>

                <h4 className="font-semibold text-foreground text-sm mb-1">
                  {meter.meterNumber}
                </h4>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{meter.customerName}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
