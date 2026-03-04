import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  ALLOWED_EMAIL,
  isAllowedEmail,
  setUser,
  checkPassword,
  setPassword,
  isPasswordSet,
} from "@/lib/auth";

const AuthCard = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordSet = isPasswordSet();
  const isOwner = isAllowedEmail(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || trimmedEmail.toLowerCase() !== ALLOWED_EMAIL.toLowerCase()) {
      toast.error("Only the owner can access this app.");
      return;
    }

    setLoading(true);
    try {
      if (!passwordSet) {
        // First time: set password
        if (password.length < 6) {
          toast.error("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          toast.error("Passwords don't match.");
          setLoading(false);
          return;
        }
        await setPassword(password);
        setUser(trimmedEmail, displayName || undefined);
        toast.success("Password set. You're signed in.");
        navigate("/dashboard");
      } else {
        // Returning: check password
        const ok = await checkPassword(password);
        if (!ok) {
          toast.error("Wrong password.");
          setLoading(false);
          return;
        }
        setUser(trimmedEmail, displayName || undefined);
        toast.success("Signed in.");
        navigate("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-card border border-border rounded-lg shadow-card p-10">
      <h1 className="font-display text-3xl font-semibold tracking-[0.2em] text-center text-foreground mb-3">
        HABICARD
      </h1>
      <p className="text-muted-foreground text-sm text-center mb-8">
        Sign in with your account.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
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
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-xs font-medium tracking-wider text-muted-foreground uppercase"
          >
            {passwordSet ? "Password" : "Set password (min 6 characters)"}
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPasswordValue(e.target.value)}
            className="h-11 bg-background border-border placeholder:text-muted-foreground/50"
            required
            minLength={passwordSet ? undefined : 6}
          />
        </div>

        {!passwordSet && (
          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-medium tracking-wider text-muted-foreground uppercase"
            >
              Confirm password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-11 bg-background border-border placeholder:text-muted-foreground/50"
              required
              minLength={6}
            />
          </div>
        )}

        {!isOwner && email.trim().length > 0 && (
          <p className="text-sm text-destructive">
            Only the owner can access this app.
          </p>
        )}

        <Button
          type="submit"
          disabled={
            loading ||
            !email.trim() ||
            !password ||
            (!passwordSet && (password.length < 6 || password !== confirmPassword))
          }
          className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium tracking-wide uppercase text-sm disabled:opacity-50"
        >
          {loading ? "..." : passwordSet ? "Sign in" : "Set password & sign in"}
        </Button>
      </form>
    </div>
  );
};

export default AuthCard;
