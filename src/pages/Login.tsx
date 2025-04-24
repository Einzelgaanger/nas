import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Users, User, Key, LogIn } from "lucide-react";
import { ensureInitialSetup } from "@/services/setupService";
import { cn } from "@/lib/utils";

const Login = () => {
  const [role, setRole] = useState<"admin" | "disburser">("admin");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(true);
  const [setupError, setSetupError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, isAuthenticated } = useAuth();

  // Initial setup to create default users if needed
  useEffect(() => {
    const setupInitialAccounts = async () => {
      setIsSettingUp(true);
      setSetupError(null);
      console.log("Starting initial setup process...");
      
      try {
        const success = await ensureInitialSetup();
        
        if (success) {
          console.log("Initial setup completed successfully or found existing accounts");
          // Pre-fill admin credentials for convenience during development
          setRole("admin");
          setIdentifier("admin");
          setPassword("NGO123");
        } else {
          console.log("Initial setup failed");
          setSetupError("Failed to create initial accounts. This may be due to Row Level Security (RLS) policies in Supabase.");
          toast({
            title: "Setup Error",
            description: "Failed to create initial accounts. Please check logs for details.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.log(`Setup error: ${error instanceof Error ? error.message : "Unknown error"}`);
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
      console.log("User is already authenticated, redirecting...");
      navigate("/index");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (role === "admin") {
        // Admin login
        console.log(`Trying admin login with: ${identifier}`);
        
        // Don't use filters for authentication, fetch all admins and check manually for better security
        const { data: admins, error } = await supabase
          .from("admins")
          .select("*");

        if (error) {
          console.log(`Database error: ${error.message}`);
          throw new Error("Database error: " + error.message);
        }

        console.log(`Found ${admins?.length || 0} admins`);
        
        // Find admin with matching username (case insensitive) and password
        const admin = admins?.find(a => 
          a.username.toLowerCase() === identifier.toLowerCase() && 
          a.password === password
        );

        if (admin) {
          console.log(`Admin found, logging in: ${admin.name}`);
          // Login successful
          login("admin", { 
            name: admin.name, 
            id: admin.id 
          });
          
          navigate("/admin/dashboard");
          toast({
            title: "Login Successful",
            description: `Welcome, ${admin.name}`,
          });
        } else {
          console.log("No matching admin found");
          throw new Error("Invalid username or password");
        }
      } else {
        // Disburser login
        console.log(`Trying disburser login with: ${identifier}`);
        
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
          console.log(`Database error: ${error.message}`);
          throw new Error("Database error: " + error.message);
        }

        console.log(`Found ${disbursers?.length || 0} disbursers`);
        
        // Find disburser with matching phone number and password
        const disburser = disbursers?.find(d => 
          d.phone_number === identifier && 
          d.password === password
        );

        if (disburser) {
          console.log(`Disburser found, logging in: ${disburser.name}`);
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
          console.log("No matching disburser found");
          throw new Error("Invalid phone number or password");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleToggle = (newRole: "admin" | "disburser") => {
    setRole(newRole);
    // Clear fields when switching roles
    setIdentifier("");
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-6 left-6">
        <Shield className="h-8 w-8 text-emerald-600" />
      </div>
      
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800">SecureAid Network</h1>
          <p className="mt-2 text-sm text-slate-600">Secure humanitarian aid distribution platform</p>
        </div>
        
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">Sign In</h2>
            <p className="text-sm text-slate-500 mt-1">Access your account</p>
          </div>
          
          {/* Role Selection Tabs */}
          <div className="flex border-b border-slate-200">
            <button 
              className={cn(
                "flex-1 py-3 px-4 text-center transition-colors font-medium text-sm",
                role === "admin" 
                  ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500" 
                  : "text-slate-600 hover:bg-slate-50"
              )}
              onClick={() => handleRoleToggle("admin")}
            >
              <span className="flex items-center justify-center gap-2">
                <Users className="h-4 w-4" />
                Administrator
              </span>
            </button>
            <button 
              className={cn(
                "flex-1 py-3 px-4 text-center transition-colors font-medium text-sm",
                role === "disburser" 
                  ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500" 
                  : "text-slate-600 hover:bg-slate-50"
              )}
              onClick={() => handleRoleToggle("disburser")}
            >
              <span className="flex items-center justify-center gap-2">
                <User className="h-4 w-4" />
                Aid Worker
              </span>
            </button>
          </div>
          
          {/* Login Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {role === "admin" ? "Username" : "Phone Number"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    className="pl-10 w-full border border-slate-300 rounded-md py-2 px-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder={role === "admin" ? "Enter your username" : "Enter your phone number"}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 w-full border border-slate-300 rounded-md py-2 px-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors",
                    isLoading && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5" />
                      <span>Sign in</span>
                    </>
                  )}
                </button>
              </div>
            </form>
            
            {/* Demo Credentials */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center">Demo Credentials</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-700">
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <p className="font-medium">Admin:</p>
                  <p>Username: admin</p>
                  <p>Password: NGO123</p>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <p className="font-medium">Disburser:</p>
                  <p>Phone: 0711223344</p>
                  <p>Password: worker123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} SecureAid Network. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
