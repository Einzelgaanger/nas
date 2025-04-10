
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, Lock, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  role: z.enum(["admin", "disburser"]),
  identifier: z.string().min(1, "Required"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof formSchema>;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "admin",
      identifier: "",
      password: "",
    },
  });

  const selectedRole = form.watch("role");

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Mock authentication logic - in a real app, this would check against the database
      if (data.role === "admin") {
        if (data.identifier === "admin" && data.password === "NGO123") {
          login("admin", { name: "Administrator" });
          navigate("/dashboard");
          return;
        }
      } else if (data.role === "disburser") {
        // Mock disburser validation - phone number + password
        // This would check against the database in a real app
        
        // For demo purposes, let's consider phone numbers starting with "07" valid
        if (data.identifier.startsWith("07") && data.password === "Pass123") {
          login("disburser", { 
            name: "John Disburser",
            phone: data.identifier,
            region: "Mwale"
          });
          navigate("/disburser/register");
          return;
        }
      }
      
      // If we get here, authentication failed
      setError("Invalid credentials. Please check and try again.");
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Invalid credentials provided.",
      });
    } catch (err) {
      setError("An error occurred during authentication.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-secure-DEFAULT" />
          </div>
          <h1 className="text-2xl font-bold text-secure-dark">SecureAid Network</h1>
          <p className="text-gray-600 mt-2">Secure humanitarian aid distribution system</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Secure Login</CardTitle>
            <CardDescription>
              Access requires authentication. Contact your administrator if you need assistance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Select Role</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="admin" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Administrator
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="disburser" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Disburser
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {selectedRole === "admin" ? "Username" : "Phone Number"}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-gray-500">
                            {selectedRole === "admin" ? (
                              <User size={16} />
                            ) : (
                              <Phone size={16} />
                            )}
                          </span>
                          <Input
                            placeholder={selectedRole === "admin" ? "admin" : "07..."}
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        {selectedRole === "disburser" && 
                          "Enter the phone number registered by your administrator"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-gray-500">
                            <Lock size={16} />
                          </span>
                          <Input
                            type="password"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        {selectedRole === "admin"
                          ? "Default admin password is NGO123"
                          : "Use the password provided by your administrator"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Authentication Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-secure-DEFAULT hover:bg-secure-dark"
                  disabled={loading}
                >
                  {loading ? "Authenticating..." : "Login"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col items-start">
            <p className="text-sm text-gray-500">
              For security reasons, this platform doesn't support self-registration.
            </p>
            <p className="text-sm text-gray-500">
              Contact your administrator for account access.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
