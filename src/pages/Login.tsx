import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Users, UserCheck, AlertCircle, User, Key, LogIn } from "lucide-react";
import { AnimatedIcons } from "@/components/ui/animated-icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ensureInitialSetup } from "@/services/setupService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const Login = () => {
  const [role, setRole] = useState<"admin" | "disburser">("admin");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isSettingUp, setIsSettingUp] = useState(true);
  const [setupError, setSetupError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, isAuthenticated } = useAuth();

  // Debug logging function
  const logDebug = (message: string) => {
    console.log(message);
    setDebugInfo(prev => [...prev, message]);
  };

  // Initial setup to create default users if needed
  useEffect(() => {
    const setupInitialAccounts = async () => {
      setIsSettingUp(true);
      setSetupError(null);
      logDebug("Starting initial setup process...");
      
      try {
        const success = await ensureInitialSetup();
        
        if (success) {
          logDebug("Initial setup completed successfully or found existing accounts");
          // Pre-fill admin credentials for convenience during development
          setRole("admin");
          setIdentifier("admin");
          setPassword("NGO123");
        } else {
          logDebug("Initial setup failed");
          setSetupError("Failed to create initial accounts. This may be due to Row Level Security (RLS) policies in Supabase. Please check the console logs for details.");
          toast({
            title: "Setup Error",
            description: "Failed to create initial accounts. Please check logs for details.",
            variant: "destructive",
          });
        }
      } catch (error) {
        logDebug(`Setup error: ${error instanceof Error ? error.message : "Unknown error"}`);
        setSetupError(`Error during setup: ${error instanceof Error ? error.message : "Unknown error"}`);
      } finally {
        setIsSettingUp(false);
      }
    };
    
    setupInitialAccounts();
  }, [toast]);

  // Check if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      logDebug("User is already authenticated, redirecting...");
      navigate("/index");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setDebugInfo([]);

    try {
      if (role === "admin") {
        // Admin login
        logDebug(`Trying admin login with: ${identifier}`);
        
        // Don't use filters for authentication, fetch all admins and check manually for better security
        const { data: admins, error } = await supabase
          .from("admins")
          .select("*");

        if (error) {
          logDebug(`Database error: ${error.message}`);
          throw new Error("Database error: " + error.message);
        }

        logDebug(`Found admins: ${admins?.length || 0}`);
        
        if (admins) {
          logDebug(`Admin usernames available: ${admins.map(a => a.username).join(', ')}`);
        }
        
        // Find admin with matching username (case insensitive) and password
        const admin = admins?.find(a => 
          a.username.toLowerCase() === identifier.toLowerCase() && 
          a.password === password
        );

        if (admin) {
          logDebug(`Admin found, logging in: ${admin.name}`);
          // Login successful
          login("admin", { 
            name: admin.name, 
            id: admin.id 
          });
          
          navigate("/admin/disbursers");
          toast({
            title: "Login Successful",
            description: `Welcome, ${admin.name}`,
          });
        } else {
          logDebug("No matching admin found");
          throw new Error("Invalid username or password");
        }
      } else {
        // Disburser login
        logDebug(`Trying disburser login with: ${identifier}`);
        
        // Similar approach for disbursers - fetch all and manually check
        const { data: disbursers, error } = await supabase
          .from("disbursers")
          .select(`
            *,
            regions:region_id (
              name
            )
          `);

        if (error) {
          logDebug(`Database error: ${error.message}`);
          throw new Error("Database error: " + error.message);
        }

        logDebug(`Found disbursers: ${disbursers?.length || 0}`);
        
        if (disbursers) {
          logDebug(`Disburser phone numbers available: ${disbursers.map(d => d.phone_number).join(', ')}`);
        }
        
        // Find disburser with matching phone number and password
        const disburser = disbursers?.find(d => 
          d.phone_number === identifier && 
          d.password === password
        );

        if (disburser) {
          logDebug(`Disburser found, logging in: ${disburser.name}`);
          // Login successful
          login("disburser", { 
            name: disburser.name, 
            id: disburser.id,
            phone: disburser.phone_number,
            region: disburser.regions?.name || "",
            region_id: disburser.region_id
          });
          
          navigate("/disburser/register");
          toast({
            title: "Login Successful",
            description: `Welcome, ${disburser.name}`,
          });
        } else {
          logDebug("No matching disburser found");
          throw new Error("Invalid phone number or password");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      logDebug(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white bg-black rounded-t-md focus:outline-none focus:ring-white focus:border-white focus:z-10 sm:text-sm"
                placeholder="Username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white bg-black rounded-b-md focus:outline-none focus:ring-white focus:border-white focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
