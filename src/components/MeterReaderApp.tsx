import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  MapPin, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Upload,
} from "lucide-react";
import { SearchDialog } from "./SearchDialog";
import { MeterCard } from "./MeterCard";
import { IssueReportDialog } from "./IssueReportDialog";
import decorpLogo from "@/assets/decorp-logo.jpg";

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
  foundConnected?: boolean;
  remarks?: string;
  lat?: number;
  lng?: number;
  issues: Array<{
    category: string;
    issue: string;
    customerComplaint: boolean;
    remarks?: string;
  }>;
}

const mockMeters: MeterReading[] = [
  {
    id: "1",
    sequence: 1,
    meterNumber: "MTR-001-2024",
    customerName: "John Smith",
    address: "123 Main Street, Springfield",
    lastReadings: {
      generation: 45678,
      export: 12345,
      import: 23456
    },
    missed: false,
    ranges: {
      generation: "45000-50000",
      export: "12000-15000",
      import: "23000-26000"
    },
    tries: 0,
    fieldFind: "Front yard, blue gate",
    warning: "",
    status: "pending",
    lat: 14.5995,
    lng: 120.9842,
    issues: [],
  },
  {
    id: "2",
    sequence: 2,
    meterNumber: "MTR-002-2024",
    customerName: "Maria Garcia",
    address: "456 Oak Avenue, Springfield",
    lastReadings: {
      generation: 32145,
      export: 8765,
      import: 15432
    },
    missed: true,
    ranges: {
      generation: "32000-35000",
      export: "8000-10000",
      import: "15000-18000"
    },
    tries: 2,
    fieldFind: "Side of house, near AC unit",
    warning: "Dog on premises",
    status: "issue",
    lat: 14.6005,
    lng: 120.9852,
    issues: [],
  },
  {
    id: "3",
    sequence: 3,
    meterNumber: "MTR-003-2024",
    customerName: "Robert Johnson",
    address: "789 Pine Road, Springfield",
    lastReadings: {
      generation: 67890,
      export: 19876,
      import: 34567
    },
    currentReadings: {
      generation: 68234,
      export: 20100,
      import: 34890
    },
    missed: false,
    ranges: {
      generation: "67000-72000",
      export: "19000-22000",
      import: "34000-37000"
    },
    tries: 1,
    fieldFind: "Backyard, behind garage",
    warning: "",
    status: "complete",
    lat: 14.6015,
    lng: 120.9862,
    issues: [],
  },
];

interface AuditLogEntry {
  id: string;
  meterNumber: string;
  customerName: string;
  readings: {
    generation: number;
    export: number;
    import: number;
  };
  date: string;
  time: string;
  timestamp: string;
  reader: string;
  latitude: number | null;
  longitude: number | null;
  accuracy?: number;
}

export function MeterReaderApp() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [meters, setMeters] = useState<MeterReading[]>(() => {
    // Try to load from sessionStorage first
    const stored = sessionStorage.getItem("meterReadings");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.map((m: any, idx: number) => ({
          id: m.id || `${Date.now()}-${idx}`,
          sequence: m.sequence || idx + 1,
          meterNumber: m.meterNumber,
          customerName: m.customerName,
          address: m.address,
          lastReadings: m.lastReadings || { generation: 0, export: 0, import: 0 },
          currentReadings: m.currentReadings,
          missed: m.missed || false,
          ranges: m.ranges || { generation: "0-100000", export: "0-100000", import: "0-100000" },
          tries: m.tries || 0,
          fieldFind: m.fieldFind || "",
          warning: m.warning || "",
          status: m.status || "pending",
          foundConnected: m.foundConnected,
          remarks: m.remarks,
          lat: m.lat,
          lng: m.lng,
          issues: m.issues || [],
        }));
      } catch (e) {
        console.error("Failed to load meters from storage", e);
      }
    }
    return mockMeters;
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [issueReportOpen, setIssueReportOpen] = useState(false);
  const [readingValues, setReadingValues] = useState({
    generation: "",
    export: "",
    import: ""
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);

  // Update time every minute
  useState(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  });

  // Mock reader info - in production this would come from auth/API
  const readerInfo = {
    name: "Juan Dela Cruz",
    franchiseArea: "Metro Manila North",
    route: "Route 42-A",
    group: "Group 5"
  };

  const currentMeter = meters[currentIndex];
  const completedCount = meters.filter(m => m.status === "complete").length;
  const issueCount = meters.filter(m => m.status === "issue").length;
  const pendingCount = meters.filter(m => m.status === "pending").length;
  const totalProcessed = completedCount + issueCount;
  const allProcessed = pendingCount === 0;

  const handleUpload = () => {
    // TODO: Implement upload functionality
    alert(`Uploading ${totalProcessed} meter readings...`);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setReadingValues({ generation: "", export: "", import: "" });
    }
  };

  const handleNext = () => {
    if (currentIndex < meters.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setReadingValues({ generation: "", export: "", import: "" });
    }
  };

  const handleSearch = (meter: MeterReading) => {
    const index = meters.findIndex(m => m.id === meter.id);
    if (index !== -1) {
      setCurrentIndex(index);
      setReadingValues({ generation: "", export: "", import: "" });
    }
  };

  const handleAddNewMeter = (meterData: { meterNumber: string; customerName: string; address: string; remarks: string }) => {
    const newMeter: MeterReading = {
      id: `${Date.now()}`,
      sequence: meters.length + 1,
      meterNumber: meterData.meterNumber,
      customerName: meterData.customerName,
      address: meterData.address,
      lastReadings: {
        generation: 0,
        export: 0,
        import: 0
      },
      missed: false,
      ranges: {
        generation: "0-100000",
        export: "0-100000",
        import: "0-100000"
      },
      tries: 0,
      fieldFind: "",
      warning: "",
      status: "pending",
      foundConnected: true,
      remarks: meterData.remarks,
      issues: [],
    };
    const updatedMeters = [...meters, newMeter];
    setMeters(updatedMeters);
    setCurrentIndex(updatedMeters.length - 1);
    setReadingValues({ generation: "", export: "", import: "" });
  };

  const isReadingInRange = (reading: string, type: 'generation' | 'export' | 'import'): boolean => {
    if (!reading || !currentMeter) return true;
    const readingNum = parseInt(reading);
    const [min, max] = currentMeter.ranges[type].split('-').map(num => parseInt(num.trim()));
    return readingNum >= min && readingNum <= max;
  };

  const handleSubmitReading = () => {
    const hasAllReadings = readingValues.generation && readingValues.export && readingValues.import;
    if (hasAllReadings && currentMeter) {
      // Get current position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const submissionData = {
            // Reading data
            meterNumber: currentMeter.meterNumber,
            customerName: currentMeter.customerName,
            address: currentMeter.address,
            readings: {
              generation: parseInt(readingValues.generation),
              export: parseInt(readingValues.export),
              import: parseInt(readingValues.import)
            },
            lastReadings: currentMeter.lastReadings,
            
            // Timestamp
            date: new Date().toLocaleDateString('en-US'),
            time: new Date().toLocaleTimeString('en-US'),
            timestamp: new Date().toISOString(),
            
            // Reader info
            reader: readerInfo.name,
            route: readerInfo.route,
            franchiseArea: readerInfo.franchiseArea,
            
            // GPS coordinates
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };

          // Log to console (simulating what would be sent to Odoo)
          console.log('📊 READING SUBMISSION DATA:', submissionData);
          console.log('🌐 Would send to Odoo API:', JSON.stringify(submissionData, null, 2));

          // Add to audit log
          const auditEntry: AuditLogEntry = {
            id: `log-${Date.now()}`,
            meterNumber: currentMeter.meterNumber,
            customerName: currentMeter.customerName,
            readings: {
              generation: parseInt(readingValues.generation),
              export: parseInt(readingValues.export),
              import: parseInt(readingValues.import)
            },
            date: submissionData.date,
            time: submissionData.time,
            timestamp: submissionData.timestamp,
            reader: readerInfo.name,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setAuditLog(prev => [auditEntry, ...prev]);

          // Update meter status
          const updatedMeters = [...meters];
          updatedMeters[currentIndex] = {
            ...currentMeter,
            currentReadings: {
              generation: parseInt(readingValues.generation),
              export: parseInt(readingValues.export),
              import: parseInt(readingValues.import)
            },
            status: "complete",
            tries: currentMeter.tries + 1,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMeters(updatedMeters);
          setReadingValues({ generation: "", export: "", import: "" });
        },
        (error) => {
          console.error('GPS Error:', error);
          
          // If GPS fails, still submit with basic data
          const submissionData = {
            meterNumber: currentMeter.meterNumber,
            customerName: currentMeter.customerName,
            readings: {
              generation: parseInt(readingValues.generation),
              export: parseInt(readingValues.export),
              import: parseInt(readingValues.import)
            },
            date: new Date().toLocaleDateString('en-US'),
            time: new Date().toLocaleTimeString('en-US'),
            reader: readerInfo.name,
            latitude: null,
            longitude: null,
            gpsError: error.message,
          };

          console.log('📊 READING SUBMISSION (No GPS):', submissionData);

          // Add to audit log
          const auditEntry: AuditLogEntry = {
            id: `log-${Date.now()}`,
            meterNumber: currentMeter.meterNumber,
            customerName: currentMeter.customerName,
            readings: {
              generation: parseInt(readingValues.generation),
              export: parseInt(readingValues.export),
              import: parseInt(readingValues.import)
            },
            date: submissionData.date,
            time: submissionData.time,
            timestamp: new Date().toISOString(),
            reader: readerInfo.name,
            latitude: null,
            longitude: null,
          };
          setAuditLog(prev => [auditEntry, ...prev]);

          const updatedMeters = [...meters];
          updatedMeters[currentIndex] = {
            ...currentMeter,
            currentReadings: {
              generation: parseInt(readingValues.generation),
              export: parseInt(readingValues.export),
              import: parseInt(readingValues.import)
            },
            status: "complete",
            tries: currentMeter.tries + 1,
          };
          setMeters(updatedMeters);
          setReadingValues({ generation: "", export: "", import: "" });
        }
      );
    }
  };

  const handleEditReading = () => {
    if (currentMeter?.currentReadings) {
      setReadingValues({
        generation: currentMeter.currentReadings.generation?.toString() || "",
        export: currentMeter.currentReadings.export?.toString() || "",
        import: currentMeter.currentReadings.import?.toString() || ""
      });
      const updatedMeters = [...meters];
      updatedMeters[currentIndex] = {
        ...currentMeter,
        status: "pending",
      };
      setMeters(updatedMeters);
    }
  };

  const handleMarkIssue = (issueData: { category: string; issue: string; customerComplaint: boolean; remarks?: string }) => {
    const updatedMeters = [...meters];
    updatedMeters[currentIndex] = {
      ...currentMeter,
      status: "issue",
      missed: true,
      tries: currentMeter.tries + 1,
      issues: [...currentMeter.issues, issueData],
    };
    setMeters(updatedMeters);
    // Keep dialog open so user can add more issues if needed
  };

  const handleBackToDashboard = () => {
    navigate("/");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <img 
                src={decorpLogo} 
                alt="DECORP Logo" 
                className="h-10 w-10 rounded-full object-cover" 
              />
              <div>
                <h1 className="text-lg font-bold text-foreground">Meter Reader</h1>
                <p className="text-xs text-muted-foreground">{readerInfo.name} • {readerInfo.route}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToDashboard}
              >
                Back to Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchOpen(true)}
                className="gap-2"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </div>
          </div>

          {/* Progress Stats Row */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            <div className="text-center p-2 bg-muted/50 rounded-md">
              <div className="text-lg sm:text-xl font-bold text-foreground">{currentIndex + 1}/{meters.length}</div>
              <div className="text-xs text-muted-foreground">Current</div>
            </div>
            <div className="text-center p-2 bg-green-500/10 rounded-md">
              <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">{completedCount}</div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
            <div className="text-center p-2 bg-yellow-500/10 rounded-md">
              <div className="text-lg sm:text-xl font-bold text-yellow-600 dark:text-yellow-400">{issueCount}</div>
              <div className="text-xs text-muted-foreground">Issues</div>
            </div>
            <div className="text-center p-2 bg-blue-500/10 rounded-md">
              <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">{pendingCount}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4 pb-24">
        {currentMeter && (
          <>
            <MeterCard 
              meter={currentMeter} 
              onMarkIssue={() => setIssueReportOpen(true)}
            />

            {/* Reading Input Section */}
            <Card className="p-4 mt-4 shadow-soft">
              <h3 className="text-sm font-semibold text-foreground mb-3">Enter Readings</h3>
              
              <div className="space-y-3">
                {/* Generation Reading */}
                <div>
                  <Label htmlFor="generation" className="text-xs text-muted-foreground mb-1.5 block">
                    Generation Reading
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        id="generation"
                        type="number"
                        placeholder="Enter generation"
                        value={readingValues.generation}
                        onChange={(e) => setReadingValues(prev => ({ ...prev, generation: e.target.value }))}
                        className={`text-base font-semibold ${
                          readingValues.generation && !isReadingInRange(readingValues.generation, 'generation')
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }`}
                        disabled={currentMeter.status === "complete"}
                      />
                      {readingValues.generation && !isReadingInRange(readingValues.generation, 'generation') && (
                        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Out of range ({currentMeter.ranges.generation})
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Export Reading */}
                <div>
                  <Label htmlFor="export" className="text-xs text-muted-foreground mb-1.5 block">
                    Export Reading
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        id="export"
                        type="number"
                        placeholder="Enter export"
                        value={readingValues.export}
                        onChange={(e) => setReadingValues(prev => ({ ...prev, export: e.target.value }))}
                        className={`text-base font-semibold ${
                          readingValues.export && !isReadingInRange(readingValues.export, 'export')
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }`}
                        disabled={currentMeter.status === "complete"}
                      />
                      {readingValues.export && !isReadingInRange(readingValues.export, 'export') && (
                        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Out of range ({currentMeter.ranges.export})
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Import Reading */}
                <div>
                  <Label htmlFor="import" className="text-xs text-muted-foreground mb-1.5 block">
                    Import Reading
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        id="import"
                        type="number"
                        placeholder="Enter import"
                        value={readingValues.import}
                        onChange={(e) => setReadingValues(prev => ({ ...prev, import: e.target.value }))}
                        className={`text-base font-semibold ${
                          readingValues.import && !isReadingInRange(readingValues.import, 'import')
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }`}
                        disabled={currentMeter.status === "complete"}
                      />
                      {readingValues.import && !isReadingInRange(readingValues.import, 'import') && (
                        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Out of range ({currentMeter.ranges.import})
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {currentMeter.status === "complete" ? (
                  <Button
                    onClick={handleEditReading}
                    variant="outline"
                    className="w-full"
                  >
                    Edit Readings
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmitReading}
                    className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
                    disabled={!readingValues.generation || !readingValues.export || !readingValues.import}
                    size="lg"
                  >
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Submit All Readings
                  </Button>
                )}
              </div>
            </Card>

            {/* Audit Log Section */}
            {auditLog.length > 0 && (
              <Card className="p-4 mt-4 shadow-soft">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Submission Audit Log ({auditLog.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {auditLog.map((entry) => (
                    <div 
                      key={entry.id} 
                      className="bg-muted/30 rounded-lg p-3 space-y-1 text-xs border border-border"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-foreground truncate">
                            {entry.meterNumber} - {entry.customerName}
                          </div>
                          <div className="space-y-0.5 mt-1">
                            <div className="text-muted-foreground">
                              Generation: <span className="font-semibold text-foreground">{entry.readings.generation.toLocaleString()}</span>
                            </div>
                            <div className="text-muted-foreground">
                              Export: <span className="font-semibold text-foreground">{entry.readings.export.toLocaleString()}</span>
                            </div>
                            <div className="text-muted-foreground">
                              Import: <span className="font-semibold text-foreground">{entry.readings.import.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="shrink-0 bg-success/10 text-success border-success/20">
                          Logged
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground pt-1 border-t border-border/50">
                        <div>
                          <span className="opacity-70">Date:</span> {entry.date}
                        </div>
                        <div>
                          <span className="opacity-70">Time:</span> {entry.time}
                        </div>
                        <div>
                          <span className="opacity-70">Reader:</span> {entry.reader}
                        </div>
                        {entry.latitude && entry.longitude ? (
                          <>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="opacity-70">GPS:</span> {entry.latitude.toFixed(6)}, {entry.longitude.toFixed(6)}
                            </div>
                          </>
                        ) : (
                          <div className="text-destructive flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            No GPS
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground/70 pt-1">
                        📤 Ready for Odoo sync
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </main>

      {/* Navigation Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
        <div className="px-4 py-3 flex gap-2">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex-1"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentIndex === meters.length - 1}
            className="flex-1"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </footer>

      {/* Search Dialog */}
            <SearchDialog
              open={searchOpen}
              onOpenChange={setSearchOpen}
              meters={meters}
              onSelect={handleSearch}
              onAddNew={handleAddNewMeter}
            />

      {/* Issue Report Dialog */}
      <IssueReportDialog
        open={issueReportOpen}
        onOpenChange={setIssueReportOpen}
        onSubmit={handleMarkIssue}
      />

    </div>
  );
}
