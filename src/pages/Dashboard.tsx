import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, ShieldAlert, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ImportDialog } from "@/components/ImportDialog";
import decorpLogo from "@/assets/decorp-logo.jpg";

export default function Dashboard() {
  const navigate = useNavigate();
  const [importOpen, setImportOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleImportMeters = (importedMeters: any[]) => {
    // Store in sessionStorage to pass to the reader
    sessionStorage.setItem("meterReadings", JSON.stringify(importedMeters));
    navigate("/reader");
  };

  // Mock reader info - would come from backend
  const readerInfo = {
    name: "Juan Dela Cruz",
    franchiseArea: "Metro Manila North",
    route: "Route 42-A",
    group: "Group 5",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={decorpLogo} 
                alt="DECORP Logo" 
                className="h-12 w-12 rounded-full object-cover" 
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">Meter Reader Dashboard</h1>
                <p className="text-sm text-muted-foreground">{readerInfo.name}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* PII Warning */}
          <Alert className="border-warning bg-warning/10">
            <ShieldAlert className="h-5 w-5 text-warning" />
            <AlertDescription className="ml-2">
              <strong>Privacy Notice:</strong> Handle all customer information with care. 
              This data contains Personally Identifiable Information (PII) including names, 
              addresses, and meter readings. Do not share or discuss customer details with 
              unauthorized persons.
            </AlertDescription>
          </Alert>

          {/* Reader Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your Assignment</CardTitle>
              <CardDescription>Current reading route details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Franchise Area</p>
                  <p className="font-medium">{readerInfo.franchiseArea}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Route</p>
                  <p className="font-medium">{readerInfo.route}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Group</p>
                  <p className="font-medium">{readerInfo.group}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <Alert className="mt-4">
                <AlertDescription className="text-sm">
                  If the displayed route and group is incorrect, please contact your supervisor immediately before proceeding.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

        </div>
      </main>

      <ImportDialog 
        open={importOpen} 
        onOpenChange={setImportOpen}
        onImport={handleImportMeters}
      />
    </div>
  );
}
