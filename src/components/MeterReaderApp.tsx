import { useState } from "react";
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
  Home
} from "lucide-react";
import { SearchDialog } from "./SearchDialog";
import { MeterCard } from "./MeterCard";
import { IssueReportDialog } from "./IssueReportDialog";

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
    lastReading: 45678,
    missed: false,
    range: "45000-50000",
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
    lastReading: 32145,
    missed: true,
    range: "32000-35000",
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
    lastReading: 67890,
    currentReading: 68234,
    missed: false,
    range: "67000-72000",
    tries: 1,
    fieldFind: "Backyard, behind garage",
    warning: "",
    status: "complete",
    lat: 14.6015,
    lng: 120.9862,
    issues: [],
  },
];

export function MeterReaderApp() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [meters, setMeters] = useState<MeterReading[]>(mockMeters);
  const [searchOpen, setSearchOpen] = useState(false);
  const [issueReportOpen, setIssueReportOpen] = useState(false);
  const [readingValue, setReadingValue] = useState("");

  const currentMeter = meters[currentIndex];
  const completedCount = meters.filter(m => m.status === "complete").length;
  const issueCount = meters.filter(m => m.status === "issue").length;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setReadingValue("");
    }
  };

  const handleNext = () => {
    if (currentIndex < meters.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setReadingValue("");
    }
  };

  const handleSearch = (meter: MeterReading) => {
    const index = meters.findIndex(m => m.id === meter.id);
    if (index !== -1) {
      setCurrentIndex(index);
      setReadingValue("");
    }
  };

  const isReadingInRange = (reading: string): boolean => {
    if (!reading || !currentMeter) return true;
    const readingNum = parseInt(reading);
    const [min, max] = currentMeter.range.split('-').map(num => parseInt(num.trim()));
    return readingNum >= min && readingNum <= max;
  };

  const handleSubmitReading = () => {
    if (readingValue && currentMeter) {
      const updatedMeters = [...meters];
      updatedMeters[currentIndex] = {
        ...currentMeter,
        currentReading: parseInt(readingValue),
        status: "complete",
        tries: currentMeter.tries + 1,
      };
      setMeters(updatedMeters);
      setReadingValue("");
    }
  };

  const handleEditReading = () => {
    if (currentMeter?.currentReading) {
      setReadingValue(currentMeter.currentReading.toString());
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold text-foreground">Meter Reader</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchOpen(true)}
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
          
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2">
              <Badge variant="outline" className="gap-1.5 bg-status-complete/10 text-status-complete border-status-complete/20">
                <CheckCircle2 className="h-3 w-3" />
                {completedCount}
              </Badge>
              <Badge variant="outline" className="gap-1.5 bg-status-issue/10 text-status-issue border-status-issue/20">
                <AlertTriangle className="h-3 w-3" />
                {issueCount}
              </Badge>
              <Badge variant="outline" className="gap-1.5 bg-status-pending/10 text-status-pending border-status-pending/20">
                <Clock className="h-3 w-3" />
                {meters.length - completedCount - issueCount}
              </Badge>
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              {currentIndex + 1} / {meters.length}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4 pb-24">
        {currentMeter && (
          <>
            <MeterCard meter={currentMeter} />

            {/* Reading Input Section */}
            <Card className="p-4 mt-4 shadow-soft">
              <h3 className="text-sm font-semibold text-foreground mb-3">Enter Reading</h3>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="reading" className="text-xs text-muted-foreground mb-1.5 block">
                    Current Reading
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        id="reading"
                        type="number"
                        placeholder="Enter meter reading"
                        value={readingValue}
                        onChange={(e) => setReadingValue(e.target.value)}
                        className={`text-lg font-semibold ${
                          readingValue && !isReadingInRange(readingValue)
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }`}
                        disabled={currentMeter.status === "complete"}
                      />
                      {readingValue && !isReadingInRange(readingValue) && (
                        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Reading out of range ({currentMeter.range})
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      disabled={currentMeter.status === "complete"}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {currentMeter.status === "complete" ? (
                  <Button
                    onClick={handleEditReading}
                    variant="outline"
                    className="w-full"
                  >
                    Edit Reading
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => setIssueReportOpen(true)}
                      className="flex-1"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Mark Issue
                    </Button>
                    <Button
                      onClick={handleSubmitReading}
                      className="flex-1"
                      disabled={!readingValue}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Submit Reading
                    </Button>
                  </div>
                )}
              </div>
            </Card>
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
