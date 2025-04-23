import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from '@/lib/auth';
import type { Beneficiary } from '@/types/database';
import { 
  fetchBeneficiaries, 
  fetchRegionalGoods,
  checkRecentAllocation,
  createAllocation,
  createFraudAlert,
  updateRegionalGoodsQuantity
} from "@/services/disburserService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Location {
  latitude: number;
  longitude: number;
}

interface DisburserUser {
  id: string;
  region_id: string;
  name: string;
}

const AllocateResources = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [regionalGoods, setRegionalGoods] = useState<any[]>([]);
  const [selectedGoods, setSelectedGoods] = useState<string[]>([]);
  const [location, setLocation] = useState<Location | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFraudDetected, setIsFraudDetected] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      const data = await fetchBeneficiaries();
      setBeneficiaries(data || []);
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const disburserUser = user as DisburserUser;
        if (disburserUser?.region_id) {
          const [fetchedBeneficiaries, fetchedGoods] = await Promise.all([
            fetchData(),
            fetchRegionalGoods(disburserUser.region_id)
          ]);
          
          setRegionalGoods(fetchedGoods);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load required data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    getLocation();
  }, [user, toast]);

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
            description: "Failed to retrieve location. Ensure location services are enabled.",
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
    setIsSuccess(false);
    setIsFraudDetected(false);

    try {
      if (!selectedBeneficiary) {
        throw new Error("Please select a beneficiary");
      }
      
      if (selectedGoods.length === 0) {
        throw new Error("Please select at least one aid item");
      }
      
      const disburserUser = user as DisburserUser;
      if (!disburserUser?.id) {
        throw new Error("User ID not available");
      }
      
      // Check for previous allocations to detect fraud
      const hasPreviousAllocation = await checkRecentAllocation(selectedBeneficiary.id);
      
      if (hasPreviousAllocation) {
        // Record fraud attempt
        await createFraudAlert({
          beneficiary_id: selectedBeneficiary.id,
          disburser_id: disburserUser.id,
          location: location ? { 
            latitude: location.latitude, 
            longitude: location.longitude
          } : null,
          details: "Attempted duplicate allocation",
        });
        
        setIsFraudDetected(true);
        toast({
          title: "Fraud Alert",
          description: "This beneficiary has recently received an allocation. Duplicate prevented.",
          variant: "destructive",
        });
        return;
      }
      
      // Process allocation
      await createAllocation({
        beneficiary_id: selectedBeneficiary.id,
        disburser_id: disburserUser.id,
        goods: selectedGoods,
        location: location ? {
          latitude: location.latitude,
          longitude: location.longitude
        } : null,
      });
      
      // Update stock levels for each allocated item
      for (const goodsId of selectedGoods) {
        const goodsItem = regionalGoods.find((g: any) => g.id === goodsId);
        if (goodsItem) {
          const newQuantity = Math.max(0, goodsItem.quantity - 1);
          await updateRegionalGoodsQuantity(goodsId, newQuantity);
        }
      }
      
      setIsSuccess(true);
      toast({
        title: "Resources Allocated",
        description: `Resources have been successfully allocated to ${selectedBeneficiary?.name}.`,
      });
      
      // Reset form after success
      setTimeout(() => {
        setSelectedBeneficiary(null);
        setSelectedGoods([]);
      }, 2000);
      
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

  const handleBeneficiarySelect = (value: string) => {
    const selected = beneficiaries.find((b: Beneficiary) => b.id === value);
    if (selected) {
      setSelectedBeneficiary(selected);
    }
  };

  useEffect(() => {
    const loadGoods = async () => {
      if (selectedBeneficiary?.region_id) {
        try {
          const goods = await fetchRegionalGoods(selectedBeneficiary.region_id);
          setRegionalGoods(goods);
        } catch (error) {
          console.error('Error fetching regional goods:', error);
        }
      }
    };
    
    loadGoods();
  }, [selectedBeneficiary]);

  return (
    <div className="container mx-auto py-6">
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <div>
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Beneficiary</Label>
                    <Select
                      value={selectedBeneficiary?.id || ""}
                      onValueChange={handleBeneficiarySelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a beneficiary" />
                      </SelectTrigger>
                      <SelectContent>
                        {beneficiaries.map((beneficiary: Beneficiary) => (
                          <SelectItem key={beneficiary.id} value={beneficiary.id}>
                            {beneficiary.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedBeneficiary && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Selected Beneficiary Details:</h3>
                      <div className="text-sm text-gray-600">
                        <p>Name: {selectedBeneficiary.name}</p>
                        <p>ID: {selectedBeneficiary.id_number || 'Not provided'}</p>
                        <p>Phone: {selectedBeneficiary.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Select Resources</Label>
                    <div className="space-y-2">
                      {regionalGoods.map((good: any) => (
                        <div key={good.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={good.id}
                            checked={selectedGoods.includes(good.id)}
                            onCheckedChange={(checked: boolean) => {
                              if (checked) {
                                setSelectedGoods([...selectedGoods, good.id]);
                              } else {
                                setSelectedGoods(selectedGoods.filter((id: string) => id !== good.id));
                              }
                            }}
                          />
                          <label
                            htmlFor={good.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {good.goods_types?.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Location</Label>
                    <div className="text-sm text-gray-600">
                      {location && (
                        <span>
                          Latitude: {location.latitude.toFixed(6)},
                          Longitude: {location.longitude.toFixed(6)}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={!selectedBeneficiary || selectedGoods.length === 0 || !location}
                    className="w-full"
                  >
                    Allocate Resources
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AllocateResources;