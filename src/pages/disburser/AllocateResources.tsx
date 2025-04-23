import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useUserInfo } from "@/hooks/useUserInfo";
import { AnimatedIcons } from "@/components/ui/animated-icons";
import { CheckCircle, AlertCircle, Package, MapPin, Search, User } from "lucide-react";
import { 
  fetchBeneficiaries, 
  fetchRegionalGoods,
  checkRecentAllocation,
  createAllocation,
  createFraudAlert,
  updateRegionalGoodsQuantity
} from "@/services/disburserService";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from '@/lib/auth';
import type { Beneficiary } from '@/types/database';

interface LocalBeneficiary extends Beneficiary {
  unique_identifiers: {
    national_id?: string;
    passport?: string;
    birth_certificate?: string;
  };
}

interface Location {
  latitude: number;
  longitude: number;
}

const AllocateResources = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
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
  const [open, setOpen] = useState(false);

  const filteredBeneficiaries = useMemo(() => {
    return beneficiaries.filter((beneficiary) =>
      beneficiary.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      Object.values(beneficiary.unique_identifiers)
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [beneficiaries, searchQuery]);

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
        if (user?.region_id) {
          const [fetchedBeneficiaries, fetchedGoods] = await Promise.all([
            fetchData(),
            fetchRegionalGoods(user.region_id)
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
      
      if (!user?.id) {
        throw new Error("User ID not available");
      }
      
      // Check for previous allocations to detect fraud
      const hasPreviousAllocation = await checkRecentAllocation(selectedBeneficiary.id);
      
      if (hasPreviousAllocation) {
        // Record fraud attempt
        await createFraudAlert({
          beneficiary_id: selectedBeneficiary.id,
          disburser_id: user.id,
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
        disburser_id: user.id,
        goods: selectedGoods,
        location: location ? {
          latitude: location.latitude,
          longitude: location.longitude
        } : null,
      });
      
      // Update stock levels for each allocated item
      for (const goodsId of selectedGoods) {
        const goodsItem = regionalGoods.find(g => g.id === goodsId);
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
    const selected = beneficiaries.find(b => b.id === value);
    if (selected) {
      setSelectedBeneficiary(selected);
    }
  };

  useEffect(() => {
    if (selectedBeneficiary?.region_id) {
      const fetchGoods = async () => {
        const goods = await fetchRegionalGoods(selectedBeneficiary.region_id);
        setRegionalGoods(goods);
      };
      fetchGoods();
    }
  }, [selectedBeneficiary]);

  const StatusCard = () => {
    if (isSuccess) {
      return (
        <Card className="border-green-300 bg-green-50 mb-6">
          <CardContent className="p-6 flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600 mr-4" />
            <div>
              <h3 className="font-semibold text-green-800">Allocation Successful</h3>
              <p className="text-sm text-green-700">Resources successfully allocated to {selectedBeneficiary?.name}</p>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    if (isFraudDetected) {
      return (
        <Card className="border-red-300 bg-red-50 mb-6">
          <CardContent className="p-6 flex items-center">
            <AlertCircle className="h-8 w-8 text-red-600 mr-4" />
            <div>
              <h3 className="font-semibold text-red-800">Fraud Alert</h3>
              <p className="text-sm text-red-700">This beneficiary has already received an allocation recently.</p>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return null;
  };

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
                        {beneficiaries.map((beneficiary) => (
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
                      {regionalGoods.map((good) => (
                        <div key={good.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={good.id}
                            checked={selectedGoods.includes(good.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedGoods([...selectedGoods, good.id]);
                              } else {
                                setSelectedGoods(selectedGoods.filter((id) => id !== good.id));
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