import { ChevronLeft, ChevronRight, Settings, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViewTab {
  id: "week" | "month" | "dashboard";
  label: string;
}

const viewTabs: ViewTab[] = [
  { id: "week", label: "MY WEEK" },
  { id: "month", label: "MY MONTH" },
  { id: "dashboard", label: "DASHBOARD" },
];

interface DashboardHeaderProps {
  dateLabel: string;
  activeView: "week" | "month" | "dashboard";
  onViewChange: (view: "week" | "month" | "dashboard") => void;
  onPrev: () => void;
  onNext: () => void;
  signedIn?: boolean;
  onSignIn?: () => void;
  onSignOut?: () => void;
  segmentStyle?: "green" | "black";
  rounded?: boolean;
}

const DashboardHeader = ({
  dateLabel,
  activeView,
  onViewChange,
  onPrev,
  onNext,
  signedIn = false,
  onSignIn,
  onSignOut,
  segmentStyle = "green",
  rounded,
}: DashboardHeaderProps) => {
  const activeClass = segmentStyle === "black" ? "bg-primary text-primary-foreground" : "bg-success text-primary-foreground";
  return (
    <div className={`bg-card shadow-card p-4 space-y-4 border border-border ${rounded ? "rounded-xl" : "rounded-sm"}`}>
      <div className="flex items-center justify-between">
        <button onClick={onPrev} className="p-1 hover:bg-muted rounded-sm transition-colors" aria-label="Previous">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <h2 className="text-sm font-semibold tracking-wider text-foreground uppercase">
          {dateLabel}
        </h2>
        <button onClick={onNext} className="p-1 hover:bg-muted rounded-sm transition-colors" aria-label="Next">
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-sm overflow-hidden border border-border">
          {viewTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`px-3 py-2 text-xs font-medium tracking-wider transition-colors ${
                activeView === tab.id ? activeClass : "bg-card text-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {activeView === "dashboard" && (
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 h-auto text-xs font-medium tracking-wider uppercase">
            <Sparkles className="w-4 h-4 mr-2" />
            This Year Resolutions
          </Button>
        )}
        <div className="ml-auto flex items-center gap-1">
          <button className="p-2 hover:bg-muted rounded-sm transition-colors" aria-label="Search">
            <Search className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-sm transition-colors" aria-label="Settings">
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>
          <Button
            onClick={signedIn ? onSignOut : onSignIn}
            className="bg-success hover:bg-success/90 text-primary-foreground px-4 py-2 h-auto text-xs font-medium tracking-wider"
          >
            {signedIn ? "Sign Out" : "→ Sign In"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
