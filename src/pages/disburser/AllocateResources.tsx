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
  fetchBeneficiariesByRegion, 
  fetchRegionalGoods,
  checkRecentAllocation,
  createAllocation,
  createFraudAlert,
  updateRegionalGoodsQuantity
} from "@/services/disburserService";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext";

interface Beneficiary {
  id: string;
  name: string;
  estimated_age: number;
  unique_identifiers: {
    national_id?: string;
    passport?: string;
    birth_certificate?: string;
  };
  region_id: string;
}

interface LocalBeneficiary extends Beneficiary {
  unique_identifiers: {
    national_id?: string;
    passport?: string;
    birth_certificate?: string;
  };
}

const AllocateResources = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [regionalGoods, setRegionalGoods] = useState<any[]>([]);
  const [selectedGoods, setSelectedGoods] = useState<string[]>([]);
  const [location, setLocation] = useState<{ latitude: number | null; longitude: number | null } | null>(null);
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
    <div className="relative min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {(isSuccess || isFraudDetected) && <StatusCard />}
          
          <Card className="bg-white border-gray-200 shadow-lg">
            <CardHeader className="text-center bg-gray-900 text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold">Allocate Resources</CardTitle>
              <CardDescription className="text-gray-300">Select a beneficiary and allocate resources</CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 space-y-8">
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Beneficiary Selection */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-gray-900">Select Beneficiary</Label>
                    <Select 
                      onValueChange={(value) => {
                        const beneficiary = beneficiaries.find((b) => b.id === value);
                        setSelectedBeneficiary(beneficiary || null);
                      }}
                      value={selectedBeneficiary?.id || ""}
                    >
                      <SelectTrigger className="w-full border-gray-200 bg-white">
                        <SelectValue placeholder="Choose a beneficiary" />
                      </SelectTrigger>
                      <SelectContent>
                        {beneficiaries.map((beneficiary) => (
                          <SelectItem 
                            key={beneficiary.id} 
                            value={beneficiary.id}
                            className="py-2 hover:bg-gray-50"
                          >
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-blue-500" />
                              <div>
                                <div className="font-medium">{beneficiary.name}</div>
                                <div className="text-xs text-gray-500">
                                  ID: {beneficiary.unique_identifiers.national_id || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Goods Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-semibold text-gray-900">Select Goods</Label>
                      <span className="text-sm text-blue-600 font-medium">
                        Selected: {selectedGoods.length} item(s)
                      </span>
                    </div>
                    
                    <div className="grid gap-3 bg-gray-50 rounded-lg p-4">
                      {regionalGoods.map((goods) => (
                        <div
                          key={goods.id}
                          className={cn(
                            "flex items-center justify-between bg-white p-4 rounded-lg border transition-all",
                            "hover:border-blue-300 hover:shadow-sm",
                            goods.quantity <= 0 && "opacity-50"
                          )}
                        >
                          <div className="flex items-center space-x-3">
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
                              disabled={isSubmitting || isSuccess || goods.quantity <= 0}
                            />
                            <div>
                              <Label
                                htmlFor={goods.id}
                                className="text-base font-medium text-gray-900 cursor-pointer"
                              >
                                {goods.goods_types?.name}
                              </Label>
                              <p className="text-sm text-gray-500 mt-1">
                                {goods.goods_types?.description}
                              </p>
                            </div>
                          </div>
                          
                          <span className={cn(
                            "text-sm font-medium px-3 py-1 rounded-full",
                            goods.quantity <= 0 
                              ? "bg-red-50 text-red-600" 
                              : "bg-green-50 text-green-600"
                          )}>
                            {goods.quantity > 0 ? `Stock: ${goods.quantity}` : "Out of stock"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-gray-700">Location</Label>
                    {location ? (
                      <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-blue-500 mt-1" />
                          <div>
                            <p className="font-medium text-gray-700">Current Location</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Latitude: {location.latitude?.toFixed(6)}
                              <br />
                              Longitude: {location.longitude?.toFixed(6)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={getLocation}
                        className="w-full border-blue-200 hover:bg-blue-50"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Get Location
                      </Button>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 text-lg shadow-md hover:shadow-lg"
                    disabled={
                      isLoading ||
                      isSubmitting ||
                      !selectedBeneficiary ||
                      selectedGoods.length === 0 ||
                      isSuccess
                    }
                  >
                    {isSubmitting ? (
                      <LoadingSpinner />
                    ) : isSuccess ? (
                      "Allocation Complete ✓"
                    ) : (
                      "Allocate Resources"
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
  </div>
);

export default AllocateResources;
