import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";
import { toast } from "sonner";
import { setUser, setGuest, isValidEmail } from "@/lib/auth";

const AuthCard = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const canSignIn = isValidEmail(email);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSignIn) {
      toast.error("Enter a valid email to sign in.");
      return;
    }
    setUser(email.trim(), displayName || undefined);
    toast.success("Signed in. Your session is saved on this device.");
    navigate("/dashboard");
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSignIn) {
      toast.error("Enter a valid email to sign up.");
      return;
    }
    setUser(email.trim(), displayName || undefined);
    toast.success("Signed up. Your session is saved on this device.");
    navigate("/dashboard");
  };

  const handleGuest = () => {
    setGuest();
    navigate("/dashboard");
  };

  return (
    <div className="w-full max-w-md bg-card border border-border rounded-lg shadow-card p-10">
      {/* Logo */}
      <h1 className="font-display text-3xl font-semibold tracking-[0.2em] text-center text-foreground mb-3">
        HABICARD
      </h1>
      
      {/* Subtitle */}
      <p className="text-muted-foreground text-sm text-center mb-8">
        Sign in to sync your progress across devices.
      </p>

      {/* Form */}
      <form onSubmit={handleSignIn} className="space-y-5">
        {/* Display name (optional) */}
        <div className="space-y-2">
          <label 
            htmlFor="displayName" 
            className="block text-xs font-medium tracking-wider text-muted-foreground uppercase"
          >
            Display name <span className="text-muted-foreground/70">(optional)</span>
          </label>
          <Input
            id="displayName"
            type="text"
            placeholder="e.g. Steven"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="h-11 bg-background border-border placeholder:text-muted-foreground/50"
          />
        </div>
        {/* Email Field */}
        <div className="space-y-2">
          <label 
            htmlFor="email" 
            className="block text-xs font-medium tracking-wider text-muted-foreground uppercase"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 bg-background border-border placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label 
            htmlFor="password" 
            className="block text-xs font-medium tracking-wider text-muted-foreground uppercase"
          >
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 bg-background border-border placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={!canSignIn}
            className="flex-1 h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium tracking-wide uppercase text-sm disabled:opacity-50"
          >
            Sign In
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!canSignIn}
            onClick={handleSignUp}
            className="flex-1 h-11 border-foreground text-foreground hover:bg-foreground hover:text-primary-foreground font-medium tracking-wide uppercase text-sm disabled:opacity-50"
          >
            Sign Up
          </Button>
        </div>
      </form>

      {/* Forgot Password */}
      <div className="text-center mt-4">
        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Forgot your password?
        </button>
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-4 text-muted-foreground tracking-wider">or</span>
        </div>
      </div>

      {/* Continue as Guest */}
      <button 
        type="button"
        onClick={handleGuest}
        className="w-full h-11 border-2 border-dashed border-border rounded-md flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors uppercase text-sm font-medium tracking-wide"
      >
        <User className="w-4 h-4" />
        Continue as Guest
      </button>
    </div>
  );
};

export default AuthCard;
