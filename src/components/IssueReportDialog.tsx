import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Eye,
  Shield,
  Move,
  AlertCircle,
  MapPin,
  FileEdit,
  Camera,
  ChevronLeft,
  AlertTriangle,
} from "lucide-react";

interface Issue {
  id: string;
  label: string;
  photoRequired: boolean;
  photoOptional: boolean;
  priority?: boolean;
}

interface Category {
  id: string;
  label: string;
  icon: typeof Eye;
  issues: Issue[];
}

const CATEGORIES: Category[] = [
  {
    id: "not-clear",
    label: "Not clear",
    icon: Eye,
    issues: [
      { id: "blurred", label: "Blurred / Unreadable", photoRequired: true, photoOptional: false },
      { id: "glass-broken", label: "Glass broken", photoRequired: true, photoOptional: false },
      { id: "dial-misaligned", label: "Dial pointer misaligned", photoRequired: true, photoOptional: false },
    ],
  },
  {
    id: "tamper-safety",
    label: "Tamper/Safety",
    icon: Shield,
    issues: [
      { id: "seal-broken", label: "Seal broken", photoRequired: true, photoOptional: false },
      { id: "suspected-tamper", label: "Suspected jumper / tampered", photoRequired: true, photoOptional: false, priority: true },
    ],
  },
  {
    id: "mounting-position",
    label: "Mounting/Position",
    icon: Move,
    issues: [
      { id: "too-high", label: "Too high / tilted", photoRequired: true, photoOptional: false },
      { id: "hanging", label: "Hanging / inverted (upside down)", photoRequired: true, photoOptional: false },
      { id: "needs-relocation", label: "Needs relocation", photoRequired: true, photoOptional: false },
    ],
  },
  {
    id: "not-working",
    label: "Not working / Accuracy",
    icon: AlertCircle,
    issues: [
      { id: "meter-stopped", label: "Meter stopped", photoRequired: true, photoOptional: false },
      { id: "dial-faulty", label: "Dial faulty", photoRequired: true, photoOptional: false },
      { id: "wrong-meter", label: "Wrong meter (interchanged)", photoRequired: true, photoOptional: false },
      { id: "check-multiplier", label: "Check multiplier", photoRequired: true, photoOptional: false },
      { id: "accuracy-test", label: "Accuracy test requested", photoRequired: false, photoOptional: true },
    ],
  },
  {
    id: "site-problem",
    label: "Site problem",
    icon: MapPin,
    issues: [
      { id: "burned", label: "Premises burned/demolished", photoRequired: true, photoOptional: false },
      { id: "sagging-wire", label: "Sagging/idle service wire", photoRequired: true, photoOptional: false },
      { id: "damaged-pole", label: "Damaged/leaning pole", photoRequired: true, photoOptional: false },
      { id: "still-disconnected", label: "Still disconnected (meter present)", photoRequired: true, photoOptional: false },
    ],
  },
  {
    id: "account-data",
    label: "Account/Data fix",
    icon: FileEdit,
    issues: [
      { id: "fix-name", label: "Fix name", photoRequired: false, photoOptional: false },
      { id: "fix-address", label: "Fix address", photoRequired: false, photoOptional: true },
      { id: "fix-meter-type", label: "Fix meter type/No.", photoRequired: true, photoOptional: false },
      { id: "fix-previous-reading", label: "Fix previous reading", photoRequired: false, photoOptional: false },
      { id: "check-rate", label: "Check rate schedule", photoRequired: false, photoOptional: false },
    ],
  },
];

interface IssueReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (issue: { category: string; issue: string; customerComplaint: boolean; remarks?: string }) => void;
}

export function IssueReportDialog({ open, onOpenChange, onSubmit }: IssueReportDialogProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [customerComplaint, setCustomerComplaint] = useState(false);
  const [remarks, setRemarks] = useState("");

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setStep(2);
  };

  const handleIssueSelect = (issue: Issue) => {
    setSelectedIssue(issue);
    setStep(3);
  };

  const handleSubmit = () => {
    if (selectedIssue && selectedCategory) {
      onSubmit({
        category: selectedCategory.label,
        issue: selectedIssue.label,
        customerComplaint,
        remarks: remarks.trim() || undefined,
      });
      handleClose();
    }
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
      setSelectedIssue(null);
      setRemarks("");
    } else if (step === 2) {
      setStep(1);
      setSelectedCategory(null);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedCategory(null);
    setSelectedIssue(null);
    setCustomerComplaint(false);
    setRemarks("");
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            {(step === 2 || step === 3) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-8 w-8 -ml-2"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            {step === 1 && "Select Issue Category"}
            {step === 2 && selectedCategory?.label}
            {step === 3 && "Add Remarks"}
          </DrawerTitle>
          <DrawerDescription>
            {step === 1 && "Choose the type of issue"}
            {step === 2 && "Select the specific issue"}
            {step === 3 && "Add optional remarks about the issue"}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4 max-h-[60vh] overflow-y-auto">
          {step === 1 ? (
            <>
              {/* Customer Complaint Toggle */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg mb-4">
                <Label htmlFor="customer-complaint" className="text-sm font-medium cursor-pointer">
                  Customer Complaint
                </Label>
                <Switch
                  id="customer-complaint"
                  checked={customerComplaint}
                  onCheckedChange={setCustomerComplaint}
                />
              </div>

              {/* Category Grid */}
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.id}
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary/10 hover:border-primary hover:text-primary transition-all"
                      onClick={() => handleCategorySelect(category)}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-xs font-medium text-center leading-tight">
                        {category.label}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </>
          ) : step === 2 ? (
            <div className="space-y-2">
              {selectedCategory?.issues.map((issue) => (
                <Button
                  key={issue.id}
                  variant="outline"
                  className="w-full h-auto p-4 flex items-start justify-between hover:bg-primary/5 hover:border-primary transition-all"
                  onClick={() => handleIssueSelect(issue)}
                >
                  <span className="text-left text-sm font-medium flex-1">
                    {issue.label}
                  </span>
                  <div className="flex flex-col gap-1 ml-3">
                    {issue.priority && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                        PRIORITY
                      </Badge>
                    )}
                    {issue.photoRequired && (
                      <Badge variant="default" className="text-[10px] px-1.5 py-0 gap-1">
                        <Camera className="h-2.5 w-2.5" />
                        Required
                      </Badge>
                    )}
                    {issue.photoOptional && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1">
                        <Camera className="h-2.5 w-2.5" />
                        Optional
                      </Badge>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Issue Summary */}
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Category:</span> {selectedCategory?.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Issue:</span> {selectedIssue?.label}
                  </p>
                  {customerComplaint && (
                    <Badge variant="destructive" className="text-[10px] mt-1">
                      Customer Complaint
                    </Badge>
                  )}
                </div>
              </div>

              {/* Remarks Field */}
              <div className="space-y-2">
                <Label htmlFor="remarks" className="text-sm font-medium">
                  Remarks (Optional)
                </Label>
                <Textarea
                  id="remarks"
                  placeholder="Add any additional notes or observations..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
              </div>
            </div>
          )}
        </div>

        <DrawerFooter>
          {step === 3 ? (
            <>
              <Button onClick={handleSubmit} className="w-full">
                Submit Issue
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
              </DrawerClose>
            </>
          ) : (
            <DrawerClose asChild>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </DrawerClose>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
