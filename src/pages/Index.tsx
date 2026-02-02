import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "@/components/AuthCard";
import { isSignedIn } from "@/lib/auth";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="dark min-h-screen bg-background flex items-center justify-center p-4">
      <AuthCard />
    </div>
  );
};

export default Index;
