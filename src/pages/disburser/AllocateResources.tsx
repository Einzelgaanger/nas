
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
import { AnimatedIcons } from "@/components/ui/animated-icons";
import { useIsMobile } from "@/hooks/use-mobile";

const AllocateResources = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [goodsTypes, setGoodsTypes] = useState<Database["public"]["Tables"]["goods_types"]["Row"][]>([]);
  const [selectedGoods, setSelectedGoods] = useState<string[]>([]);
  const [location, setLocation] = useState<{ latitude: number | null; longitude: number | null } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUserInfo();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchBeneficiaries();
    fetchGoodsTypes();
    getLocation();
  }, []);

  const fetchBeneficiaries = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
    <div className="relative flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-6 min-h-screen">
      <AnimatedIcons className="opacity-20" />
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">Allocate Resources</CardTitle>
          <CardDescription className="text-white/90">Select a beneficiary and allocate resources</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <Label htmlFor="beneficiary" className="text-lg font-medium">Select Beneficiary</Label>
                  <Select onValueChange={(value) => {
                    const beneficiary = beneficiaries.find((b) => b.id === value);
                    setSelectedBeneficiary(beneficiary || null);
                  }}>
                    <SelectTrigger className="w-full bg-white border-blue-200">
                      <SelectValue placeholder="Select a beneficiary" />
                    </SelectTrigger>
                    <SelectContent>
                      {beneficiaries.map((beneficiary) => (
                        <SelectItem key={beneficiary.id} value={beneficiary.id} className="hover:bg-blue-50">
                          {beneficiary.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-lg font-medium">Select Goods</Label>
                  <div className="grid gap-3 p-4 bg-blue-50 rounded-lg">
                    {goodsTypes.map((goods) => (
                      <div key={goods.id} className="flex items-center space-x-3 bg-white p-3 rounded-md hover:bg-blue-50 transition-colors">
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

                <div className="space-y-3">
                  <Label htmlFor="location" className="text-lg font-medium">Location</Label>
                  {location ? (
                    <Textarea
                      id="location"
                      value={`Latitude: ${location.latitude}, Longitude: ${location.longitude}`}
                      readOnly
                      className="bg-gray-50 border-blue-200"
                    />
                  ) : (
                    <div className="flex flex-col items-center space-y-2">
                      <Textarea
                        id="location"
                        value="Location not available"
                        readOnly
                        className="bg-gray-50 border-blue-200"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={getLocation}
                        className="text-sm"
                      >
                        Retry Getting Location
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-end pt-2 pb-6">
            <Button 
              type="submit" 
              className={cn(
                "w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all",
                "font-bold py-3 text-lg shadow-md hover:shadow-lg"
              )} 
              disabled={isSubmitting || !selectedBeneficiary || selectedGoods.length === 0}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Allocating...
                </span>
              ) : "Allocate Resources"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AllocateResources;
