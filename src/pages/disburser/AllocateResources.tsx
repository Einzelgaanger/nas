import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Beneficiary } from "@/types/database";
import { useUserInfo } from "@/hooks/useUserInfo";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Database } from "@/integrations/supabase/types";

const AllocateResources = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [goodsTypes, setGoodsTypes] = useState<Database["public"]["Tables"]["goods_types"]["Row"][]>([]);
  const [selectedGoods, setSelectedGoods] = useState<string[]>([]);
  const [location, setLocation] = useState<{ latitude: number | null; longitude: number | null } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUserInfo();

  useEffect(() => {
    fetchBeneficiaries();
    fetchGoodsTypes();
    getLocation();
  }, []);

  const fetchBeneficiaries = async () => {
    try {
      const { data, error } = await supabase
        .from("beneficiaries")
        .select("*")
        .eq("region_id", user?.region);

      if (error) {
        throw new Error(error.message);
      }

      setBeneficiaries(data || []);
    } catch (error) {
      console.error("Error fetching beneficiaries:", error);
      toast({
        title: "Fetch Failed",
        description: error instanceof Error ? error.message : "Failed to fetch beneficiaries",
        variant: "destructive",
      });
    }
  };

  const fetchGoodsTypes = async () => {
    try {
      const { data, error } = await supabase
        .from("goods_types")
        .select("*");

      if (error) {
        throw new Error(error.message);
      }

      setGoodsTypes(data || []);
    } catch (error) {
      console.error("Error fetching goods types:", error);
      toast({
        title: "Fetch Failed",
        description: error instanceof Error ? error.message : "Failed to fetch goods types",
        variant: "destructive",
      });
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Failed to retrieve location. Please ensure location services are enabled.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Geolocation Not Supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Check if beneficiary exists and has not already received allocation
      const { data: existingBeneficiary } = await supabase
        .from("beneficiaries")
        .select()
        .eq("id", selectedBeneficiary?.id)
        .single();

      if (!existingBeneficiary) {
        toast({
          title: "Beneficiary Not Found",
          description: "The selected beneficiary could not be found.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Check for previous allocations to detect fraud
      const { data: previousAllocations } = await supabase
        .from("allocations")
        .select()
        .eq("beneficiary_id", selectedBeneficiary?.id);

      if (previousAllocations && previousAllocations.length > 0) {
        // Record fraud attempt
        await supabase.from("fraud_alerts").insert({
          beneficiary_id: selectedBeneficiary?.id,
          disburser_id: user?.id,
          location: location ? { 
            latitude: location.latitude, 
            longitude: location.longitude
          } : null,
          details: "Attempted duplicate allocation",
          attempted_at: new Date().toISOString(),
        });

        toast({
          title: "Fraud Alert",
          description: "This beneficiary has already received an allocation.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Process allocation
      await supabase.from("allocations").insert({
        beneficiary_id: selectedBeneficiary?.id,
        disburser_id: user?.id,
        goods: JSON.stringify(selectedGoods),
        location: location ? {
          latitude: location.latitude,
          longitude: location.longitude
        } : null,
        allocated_at: new Date().toISOString(),
      });

      // Update stock levels here if needed

      toast({
        title: "Resources Allocated",
        description: `Resources have been successfully allocated to ${selectedBeneficiary?.name}.`,
      });
      
      // Reset form
      setSelectedBeneficiary(null);
      setSelectedGoods([]);
      
    } catch (error) {
      console.error("Error allocating resources:", error);
      toast({
        title: "Allocation Failed",
        description: error instanceof Error ? error.message : "An error occurred while allocating resources.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Allocate Resources</CardTitle>
          <CardDescription>Select a beneficiary and allocate resources</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="beneficiary">Select Beneficiary</Label>
              <Select onValueChange={(value) => {
                const beneficiary = beneficiaries.find((b) => b.id === value);
                setSelectedBeneficiary(beneficiary || null);
              }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a beneficiary" />
                </SelectTrigger>
                <SelectContent>
                  {beneficiaries.map((beneficiary) => (
                    <SelectItem key={beneficiary.id} value={beneficiary.id}>
                      {beneficiary.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Goods</Label>
              <div className="grid gap-2">
                {goodsTypes.map((goods) => (
                  <div key={goods.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={goods.id}
                      checked={selectedGoods.includes(goods.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedGoods([...selectedGoods, goods.id]);
                        } else {
                          setSelectedGoods(selectedGoods.filter((id) => id !== goods.id));
                        }
                      }}
                    />
                    <Label htmlFor={goods.id} className="cursor-pointer">
                      {goods.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              {location ? (
                <Textarea
                  id="location"
                  value={`Latitude: ${location.latitude}, Longitude: ${location.longitude}`}
                  readOnly
                  className="bg-gray-100"
                />
              ) : (
                <Textarea
                  id="location"
                  value="Location not available"
                  readOnly
                  className="bg-gray-100"
                />
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting || !selectedBeneficiary || selectedGoods.length === 0}>
              {isSubmitting ? "Allocating..." : "Allocate Resources"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AllocateResources;
