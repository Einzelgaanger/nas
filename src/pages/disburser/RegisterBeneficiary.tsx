
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { User, UserPlus, Camera } from "lucide-react";
import { useUserInfo } from "@/hooks/useUserInfo";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  estimatedAge: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Age must be a positive number",
  }),
  height: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Height must be a positive number (in cm)",
  }),
  uniqueIdentifiers: z.string().min(10, "Please provide detailed unique identifiers"),
});

type BeneficiaryFormValues = z.infer<typeof formSchema>;

const RegisterBeneficiary = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useUserInfo();
  const { toast } = useToast();

  const form = useForm<BeneficiaryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      estimatedAge: "",
      height: "",
      uniqueIdentifiers: "",
    },
  });

  const onSubmit = async (data: BeneficiaryFormValues) => {
    setIsRegistering(true);
    
    try {
      // Simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // In a real app, this would send data to the database
      console.log("Registered beneficiary:", {
        ...data,
        disburserRegion: user?.region,
        registeredBy: user?.name,
        registeredAt: new Date().toISOString(),
        height: Number(data.height),
        estimatedAge: Number(data.estimatedAge),
      });
      
      // Show success message
      setShowSuccess(true);
      toast({
        title: "Beneficiary Registered",
        description: `${data.name} has been successfully registered in the system.`,
        variant: "default",
      });
      
      // Reset form
      form.reset();
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: "There was an error registering the beneficiary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Register Beneficiary</h2>
        <p className="text-gray-600">Add new beneficiaries to the secure aid system</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" /> New Beneficiary
            </CardTitle>
            <CardDescription>
              Enter the beneficiary's details accurately for proper identification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name of beneficiary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="estimatedAge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Age</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Years" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Height in cm" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="uniqueIdentifiers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unique Identifiers</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe any unique physical characteristics, scars, marks, etc." 
                          {...field} 
                          rows={4}
                        />
                      </FormControl>
                      <FormDescription>
                        Include any distinguishing features that will help with positive identification
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Registration Location:</span>{" "}
                    {user?.region || "Unknown Region"}
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-secure-DEFAULT hover:bg-secure-dark"
                  disabled={isRegistering}
                >
                  {isRegistering ? "Registering..." : "Register Beneficiary"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {showSuccess ? (
          <Card className="bg-green-50 border-green-100">
            <CardHeader>
              <CardTitle className="text-green-700">Registration Complete</CardTitle>
              <CardDescription>
                The beneficiary has been successfully registered in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6 space-y-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <User className="h-12 w-12 text-green-600" />
                </div>
                <p className="font-medium text-center">
                  Beneficiary information has been securely stored
                </p>
                <p className="text-sm text-gray-600 text-center">
                  The beneficiary is now eligible for aid distribution
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-secure-light"
                onClick={() => setShowSuccess(false)}
              >
                Register Another Beneficiary
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="border border-dashed flex flex-col items-center justify-center bg-gray-50">
            <div className="py-8 flex flex-col items-center space-y-4">
              <div className="bg-gray-100 p-3 rounded-full">
                <Camera className="h-12 w-12 text-gray-400" />
              </div>
              <div className="text-center px-8">
                <h3 className="font-medium text-gray-700 mb-1">Photo Identification</h3>
                <p className="text-sm text-gray-500">
                  In a production version, you would be able to capture a photo of the beneficiary for more accurate identification.
                </p>
              </div>
              <Button variant="outline" disabled className="mt-2">
                Take Photo (Coming Soon)
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RegisterBeneficiary;
