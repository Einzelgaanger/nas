
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
        const { data: admins, error } = await supabase
          .from("admins")
          .select("*")
          .eq("username", identifier)
          .eq("password", password)
          .single();

        if (error) {
          throw new Error("Invalid username or password");
        }

        if (admins) {
          // Login successful
          login("admin", { name: admins.name, id: admins.id });
          navigate("/dashboard");
          toast({
            title: "Login Successful",
            description: `Welcome, ${admins.name}`,
          });
        }
      } else {
        // Disburser login
        const { data: disbursers, error } = await supabase
          .from("disbursers")
          .select("*")
          .eq("phone_number", identifier)
          .eq("password", password)
          .single();

        if (error) {
          throw new Error("Invalid phone number or password");
        }

        if (disbursers) {
          // Login successful
          login("disburser", { 
            name: disbursers.name, 
            id: disbursers.id,
            phone: disbursers.phone_number,
            region: disbursers.region_id
          });
          navigate("/dashboard");
          toast({
            title: "Login Successful",
            description: `Welcome, ${disbursers.name}`,
          });
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
    <div className="h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Secure Aid Distribution System</CardTitle>
          <CardDescription>Please sign in to continue</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Select Role</Label>
              <RadioGroup
                id="role"
                defaultValue="admin"
                className="flex space-x-4"
                value={role}
                onValueChange={(value) => setRole(value as "admin" | "disburser")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin">Administrator</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="disburser" id="disburser" />
                  <Label htmlFor="disburser">Disburser</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="identifier">
                {role === "admin" ? "Username" : "Phone Number"}
              </Label>
              <Input
                id="identifier"
                placeholder={role === "admin" ? "Enter username" : "Enter phone number"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {role === "admin" && (
                <p className="text-xs text-gray-500">
                  Default admin password: NGO123
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
