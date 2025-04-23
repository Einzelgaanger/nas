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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <AnimatedIcons className="opacity-10" />
      
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-xl border-blue-200">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            SecureAid Network
          </CardTitle>
          <CardDescription className="text-gray-500">
            Sign in to access the platform
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Tabs defaultValue="admin" onValueChange={(value) => setRole(value as "admin" | "disburser")}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="admin" className="data-[state=active]:bg-green-50">
                Administrator
              </TabsTrigger>
              <TabsTrigger value="disburser" className="data-[state=active]:bg-blue-50">
                Disburser
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="identifier"
                  type="text"
                  placeholder="Enter your username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className={cn(
                "w-full h-11",
                role === "admin" 
                  ? "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                  : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
              )}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </div>
              )}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="justify-center pt-0">
          <p className="text-sm text-gray-500">
            Secure humanitarian aid distribution platform
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
