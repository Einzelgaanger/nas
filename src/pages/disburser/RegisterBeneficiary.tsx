import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { createBeneficiary, fetchBeneficiaries as getBeneficiaries } from "@/services/disburserService";
import { Beneficiary } from "@/types/database";
import { List } from 'lucide-react';

const RegisterBeneficiary = () => {
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [age, setAge] = useState<number | undefined>(undefined);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [uniqueIdentifiers, setUniqueIdentifiers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);

  const fetchBeneficiaries = async () => {
    try {
      const fetchedBeneficiaries = await getBeneficiaries();
      setBeneficiaries(fetchedBeneficiaries);
    } catch (error) {
      console.error("Error fetching beneficiaries:", error);
      toast({
        title: "Failed to Fetch Beneficiaries",
        description: error instanceof Error ? error.message : "Failed to retrieve beneficiaries.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create the beneficiary with required fields
      const newBeneficiary = {
        name: beneficiaryName, // Ensure name is provided
        unique_identifiers: JSON.stringify(uniqueIdentifiers),
        region_id: user?.region || '',
        registered_by: user?.id || '',
        height: height || undefined,
        estimated_age: age || undefined
      };
      
      await createBeneficiary(newBeneficiary);
      
      toast({
        title: "Registration Successful",
        description: `Beneficiary ${beneficiaryName} has been registered successfully.`,
      });
      
      // Reset form
      setBeneficiaryName("");
      setAge(undefined);
      setHeight(undefined);
      setUniqueIdentifiers([]);
      
      // Refresh beneficiary list
      fetchBeneficiaries();
    } catch (error) {
      console.error("Error registering beneficiary:", error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred during registration.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full p-4 gap-4">
      {/* Registration Form */}
      <Card className="w-full md:w-1/2 bg-white shadow-md rounded-md p-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Register Beneficiary</CardTitle>
          <CardDescription>Fill in the details to register a new beneficiary.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="beneficiaryName">Beneficiary Name</Label>
              <Input
                type="text"
                id="beneficiaryName"
                placeholder="Enter beneficiary name"
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="age">Age (Estimated)</Label>
              <Input
                type="number"
                id="age"
                placeholder="Enter estimated age"
                value={age || ""}
                onChange={(e) => setAge(e.target.value ? parseInt(e.target.value, 10) : undefined)}
              />
            </div>
            <div>
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                type="number"
                id="height"
                placeholder="Enter height in cm"
                value={height || ""}
                onChange={(e) => setHeight(e.target.value ? parseInt(e.target.value, 10) : undefined)}
              />
            </div>
            <div>
              <Label htmlFor="uniqueIdentifiers">Unique Identifiers (e.g., ID, Passport)</Label>
              <Input
                type="text"
                id="uniqueIdentifiers"
                placeholder="Enter unique identifiers, comma separated"
                value={uniqueIdentifiers.join(", ")}
                onChange={(e) => setUniqueIdentifiers(e.target.value.split(",").map((item) => item.trim()))}
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Beneficiary List */}
      <Card className="w-full md:w-1/2 bg-gray-50 shadow-md rounded-md p-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <List size={20} className="mr-1" />
            Registered Beneficiaries
          </CardTitle>
          <CardDescription>List of all registered beneficiaries.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto">
          {beneficiaries.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {beneficiaries.map((beneficiary) => (
                <li key={beneficiary.id} className="py-2">
                  <p className="text-sm font-medium text-gray-800">{beneficiary.name}</p>
                  <p className="text-xs text-gray-500">
                    ID: {beneficiary.id}, Registered on: {new Date(beneficiary.created_at).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No beneficiaries registered yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterBeneficiary;
