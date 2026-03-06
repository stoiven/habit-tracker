import { ChevronLeft, ChevronRight, ChevronDown, Settings, Search, Sparkles, User, LogOut, CalendarDays, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  onJumpToThisWeek?: () => void;
  showJumpToThisWeek?: boolean;
  signedIn?: boolean;
  userDisplayName?: string;
  onSignIn?: () => void;
  onSignOut?: () => void;
  onProfile?: () => void;
  onSyncNow?: () => void;
  syncEnabled?: boolean;
  segmentStyle?: "green" | "black";
  rounded?: boolean;
}

const DashboardHeader = ({
  dateLabel,
  activeView,
  onViewChange,
  onPrev,
  onNext,
  onJumpToThisWeek,
  showJumpToThisWeek,
  signedIn = false,
  userDisplayName = "Guest",
  onSignIn,
  onSignOut,
  onProfile,
  onSyncNow,
  syncEnabled,
  segmentStyle = "green",
  rounded,
}: DashboardHeaderProps) => {
  const activeClass = segmentStyle === "black" ? "bg-primary text-primary-foreground" : "bg-success text-primary-foreground";
  return (
    <div className={`bg-card shadow-card p-3 sm:p-4 space-y-3 sm:space-y-4 border border-border ${rounded ? "rounded-xl" : "rounded-sm"}`}>
      <div className="flex items-center justify-between gap-2 min-w-0">
        <button onClick={onPrev} className="p-1 hover:bg-muted rounded-sm transition-colors flex-shrink-0" aria-label="Previous">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <h2 className="text-xs sm:text-sm font-semibold tracking-wider text-foreground uppercase truncate min-w-0">
          {dateLabel}
        </h2>
        <button onClick={onNext} className="p-1 hover:bg-muted rounded-sm transition-colors flex-shrink-0" aria-label="Next">
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
      {showJumpToThisWeek && onJumpToThisWeek && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onJumpToThisWeek}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <CalendarDays className="w-4 h-4" />
            Jump to this week
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <div className="flex rounded-sm overflow-hidden border border-border">
          {viewTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium tracking-wider transition-colors ${
                activeView === tab.id ? activeClass : "bg-card text-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {activeView === "dashboard" && (
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-2 sm:px-4 py-1.5 sm:py-2 h-auto text-[10px] sm:text-xs font-medium tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
            Resolutions
          </Button>
        )}
        <div className="ml-auto flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
          <button className="p-1.5 sm:p-2 hover:bg-muted rounded-sm transition-colors" aria-label="Search">
            <Search className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="p-1.5 sm:p-2 hover:bg-muted rounded-sm transition-colors" aria-label="Settings">
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>
          {signedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="bg-success hover:bg-success/90 text-primary-foreground px-2 sm:px-4 py-1.5 sm:py-2 h-auto text-[10px] sm:text-xs font-medium tracking-wider gap-1 sm:gap-1.5 max-w-[140px] sm:max-w-none"
                >
                  <span className="truncate">Welcome, {userDisplayName}</span>
                  <ChevronDown className="h-4 w-4 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="dark min-w-[10rem]">
                {syncEnabled && onSyncNow && (
                  <DropdownMenuItem onClick={onSyncNow}>
                    <Cloud className="h-4 w-4 mr-2" />
                    Sync now
                  </DropdownMenuItem>
                )}
                {onProfile && (
                  <DropdownMenuItem onClick={onProfile}>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={onSignIn}
              className="bg-success hover:bg-success/90 text-primary-foreground px-4 py-2 h-auto text-xs font-medium tracking-wider"
            >
              → Sign In
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
