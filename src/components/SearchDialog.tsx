import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Hash, User, Plus } from "lucide-react";

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
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meters: MeterReading[];
  onSelect: (meter: MeterReading) => void;
  onAddNew: (meterData: { meterNumber: string; customerName: string; address: string; remarks: string }) => void;
}

export function SearchDialog({ open, onOpenChange, meters, onSelect, onAddNew }: SearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMeter, setNewMeter] = useState({
    meterNumber: "",
    customerName: "",
    address: "",
    remarks: ""
  });

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
    setShowAddForm(false);
  };

  const handleAddNewMeter = () => {
    if (newMeter.meterNumber && newMeter.customerName && newMeter.address) {
      onAddNew(newMeter);
      onOpenChange(false);
      setSearchTerm("");
      setNewMeter({ meterNumber: "", customerName: "", address: "", remarks: "" });
      setShowAddForm(false);
    }
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
          <DialogTitle>{showAddForm ? "Add New Meter" : "Search Meters"}</DialogTitle>
        </DialogHeader>

        {showAddForm ? (
          <div className="space-y-4">
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-2">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="bg-warning/20 text-warning border-warning/30 text-xs shrink-0">
                  Found Connected
                </Badge>
                <p className="text-xs text-muted-foreground">
                  This meter will be tagged as "Found Connected" - a meter discovered in the field without an assigned account.
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="meterNumber">Meter Number *</Label>
              <Input
                id="meterNumber"
                placeholder="MTR-XXX-XXXX"
                value={newMeter.meterNumber}
                onChange={(e) => setNewMeter(prev => ({ ...prev, meterNumber: e.target.value }))}
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                placeholder="Enter customer name or 'Unknown'"
                value={newMeter.customerName}
                onChange={(e) => setNewMeter(prev => ({ ...prev, customerName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                placeholder="Enter address or location description"
                value={newMeter.address}
                onChange={(e) => setNewMeter(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                placeholder="Additional notes about this found meter (e.g., condition, location details, reasons for connection, etc.)"
                value={newMeter.remarks}
                onChange={(e) => setNewMeter(prev => ({ ...prev, remarks: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleAddNewMeter}
                disabled={!newMeter.meterNumber || !newMeter.customerName || !newMeter.address}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Found Meter
              </Button>
              <Button 
                onClick={() => setShowAddForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or sequence..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
              <Button 
                onClick={() => setShowAddForm(true)}
                variant="outline"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Meter
              </Button>
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
