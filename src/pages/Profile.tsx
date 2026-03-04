import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, isSignedIn, updateProfile, clearUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Profile = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isSignedIn()) {
      navigate("/", { replace: true });
      return;
    }
    const user = getUser();
    if (user) {
      setDisplayName(user.displayName ?? "");
      setEmail(user.email ?? "");
    } else {
      setDisplayName("Guest");
    }
  }, [navigate]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ displayName: displayName || undefined, email: email || undefined });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSignOut = () => {
    clearUser();
    navigate("/", { replace: true });
  };

  if (!isSignedIn()) return null;

  return (
    <div className="dark min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-lg shadow-card p-8">
        <h1 className="text-xl font-semibold text-foreground mb-2">Personal information</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Update your display name and email. This is stored only on this device.
        </p>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-muted-foreground uppercase tracking-wider text-xs">
              Display name
            </Label>
            <Input
              id="displayName"
              type="text"
              placeholder="e.g. Steven"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-muted-foreground uppercase tracking-wider text-xs">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background border-border"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="bg-success hover:bg-success/90 text-primary-foreground">
              {saved ? "Saved" : "Save"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
              Back to dashboard
            </Button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-border">
          <button
            type="button"
            onClick={handleSignOut}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
