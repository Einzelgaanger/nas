
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Users, UserCheck } from "lucide-react";
import { AnimatedIcons } from "@/components/ui/animated-icons";

const Login = () => {
  const [role, setRole] = useState<"admin" | "disburser">("admin");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (role === "admin") {
        // Admin login
        console.log("Trying admin login with:", identifier);
        // Use lowercase for username to make it case insensitive
        const { data: admins, error } = await supabase
          .from("admins")
          .select()
          .ilike("username", identifier.toLowerCase())
          .eq("password", password);

        if (error) {
          throw new Error("Database error: " + error.message);
        }

        if (admins && admins.length > 0) {
          const admin = admins[0];
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
          throw new Error("Invalid username or password");
        }
      } else {
        // Disburser login
        console.log("Trying disburser login with:", identifier);
        const { data: disbursers, error } = await supabase
          .from("disbursers")
          .select(`
            *,
            regions:region_id (
              name
            )
          `)
          .eq("phone_number", identifier)
          .eq("password", password);

        if (error) {
          throw new Error("Database error: " + error.message);
        }

        if (disbursers && disbursers.length > 0) {
          const disburser = disbursers[0];
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

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4 overflow-hidden">
      <AnimatedIcons />
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: "1s"}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: "2s"}}></div>
      </div>
      
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-2 border-white shadow-xl fade-in">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <Shield size={40} className="text-secure-DEFAULT float" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-secure-DEFAULT to-secure-accent bg-clip-text text-transparent">Secure Aid Distribution System</CardTitle>
          <CardDescription className="text-gray-600">Please sign in to continue</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2 slide-in animation-delay-100">
              <Label htmlFor="role" className="text-gray-700">Select Role</Label>
              <RadioGroup
                id="role"
                defaultValue="admin"
                className="flex justify-around p-2 bg-gray-100 rounded-lg"
                value={role}
                onValueChange={(value) => setRole(value as "admin" | "disburser")}
              >
                <div className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${role === "admin" ? "bg-white shadow-md" : ""}`}>
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin" className="flex items-center gap-2 cursor-pointer">
                    <Users size={18} className={role === "admin" ? "text-secure-DEFAULT" : "text-gray-500"} />
                    Administrator
                  </Label>
                </div>
                <div className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${role === "disburser" ? "bg-white shadow-md" : ""}`}>
                  <RadioGroupItem value="disburser" id="disburser" />
                  <Label htmlFor="disburser" className="flex items-center gap-2 cursor-pointer">
                    <UserCheck size={18} className={role === "disburser" ? "text-secure-DEFAULT" : "text-gray-500"} />
                    Disburser
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2 slide-in animation-delay-200">
              <Label htmlFor="identifier" className="text-gray-700">
                {role === "admin" ? "Username" : "Phone Number"}
              </Label>
              <Input
                id="identifier"
                placeholder={role === "admin" ? "Enter username" : "Enter phone number"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="border-gray-300 focus:border-secure-DEFAULT focus:ring focus:ring-secure-light focus:ring-opacity-50"
              />
            </div>

            <div className="space-y-2 slide-in animation-delay-300">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-gray-300 focus:border-secure-DEFAULT focus:ring focus:ring-secure-light focus:ring-opacity-50"
              />
              {role === "admin" && (
                <p className="text-xs text-gray-500 mt-2">
                  Default admin: username "admin", password "NGO123"
                </p>
              )}
              {role === "disburser" && (
                <p className="text-xs text-gray-500 mt-2">
                  Sample disburser: phone "1234567890", password "pass123"
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex-col">
            <Button type="submit" className="w-full btn-vibrant bg-gradient-to-r from-secure-DEFAULT to-secure-accent text-white hover:shadow-lg" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
