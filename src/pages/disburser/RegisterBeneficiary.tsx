
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { registerBeneficiary } from "@/services/disburserService";
import { Beneficiary } from "@/types/database";

const RegisterBeneficiary = () => {
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    height: "",
    estimatedAge: "",
    uniqueFeatures: "",
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const registerMutation = useMutation({
    mutationFn: (data: Partial<Beneficiary>) => registerBeneficiary(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Beneficiary registered successfully",
      });
      setFormData({
        name: "",
        height: "",
        estimatedAge: "",
        uniqueFeatures: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error registering beneficiary: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }
    
    // Create unique identifiers object
    const uniqueIdentifiers = {
      features: formData.uniqueFeatures,
      registrationDate: new Date().toISOString(),
    };
    
    const beneficiaryData: Partial<Beneficiary> = {
      name: formData.name,
      height: formData.height ? parseFloat(formData.height) : undefined,
      estimated_age: formData.estimatedAge ? parseInt(formData.estimatedAge, 10) : undefined,
      unique_identifiers: uniqueIdentifiers,
      registered_by: userInfo?.id,
      region_id: userInfo?.region,
    };
    
    registerMutation.mutate(beneficiaryData);
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Register New Beneficiary</CardTitle>
          <CardDescription>
            Enter the beneficiary's details to register them in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter beneficiary's full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  name="height"
                  type="number"
                  step="0.1"
                  placeholder="Enter height in cm"
                  value={formData.height}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estimatedAge">Estimated Age</Label>
                <Input
                  id="estimatedAge"
                  name="estimatedAge"
                  type="number"
                  placeholder="Enter estimated age"
                  value={formData.estimatedAge}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="uniqueFeatures">Unique Identifiers</Label>
              <Textarea
                id="uniqueFeatures"
                name="uniqueFeatures"
                placeholder="Enter any distinguishing features, marks, or other identification information"
                rows={4}
                value={formData.uniqueFeatures}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500">
                Include any notable features that can help identify this person (scars, birthmarks, etc.)
              </p>
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Registering..." : "Register Beneficiary"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterBeneficiary;
