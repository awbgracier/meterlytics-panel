import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload } from "lucide-react";

interface MeterReading {
  meterNumber: string;
  customerName: string;
  address: string;
  lastReading: { generation: number; export: number; import: number };
  currentReading: { generation: number; export: number; import: number };
  minRange: number;
  maxRange: number;
  status: "pending" | "completed" | "issue";
  foundConnected?: boolean;
  remarks?: string;
}

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (meters: MeterReading[]) => void;
}

export const ImportDialog = ({ open, onOpenChange, onImport }: ImportDialogProps) => {
  const [jsonData, setJsonData] = useState("");
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setJsonData(content);
      };
      reader.readAsText(file);
    }
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(jsonData);
      const meters = Array.isArray(parsed) ? parsed : [parsed];
      
      // Validate basic structure
      if (meters.length === 0) {
        throw new Error("No meter data found");
      }

      onImport(meters);
      toast({
        title: "Import successful",
        description: `Imported ${meters.length} meter(s)`,
      });
      onOpenChange(false);
      setJsonData("");
    } catch (error) {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Invalid JSON format",
        variant: "destructive",
      });
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        meterNumber: "MTR001",
        customerName: "Sample Customer",
        address: "123 Sample St",
        lastReading: { generation: 1000, export: 500, import: 300 },
        currentReading: { generation: 1000, export: 500, import: 300 },
        minRange: 0,
        maxRange: 100000,
        status: "pending"
      }
    ];
    
    const dataStr = JSON.stringify(template, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'meter_template.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Meter Accounts</DialogTitle>
          <DialogDescription>
            Upload a JSON file or paste meter data to load today's accounts
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Upload JSON File</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="json-data">Or Paste JSON Data</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
            <Textarea
              id="json-data"
              placeholder='[{"meterNumber": "MTR001", "customerName": "John Doe", ...}]'
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          <Button onClick={handleImport} className="w-full">
            <Upload className="h-4 w-4 mr-2" />
            Import Meters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
