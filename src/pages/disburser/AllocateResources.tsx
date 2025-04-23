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
  const { user } = useUserInfo();
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

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (user?.region_id) {
          const [fetchedBeneficiaries, fetchedGoods] = await Promise.all([
            fetchBeneficiariesByRegion(user.region_id),
            fetchRegionalGoods(user.region_id)
          ]);
          
          setBeneficiaries(fetchedBeneficiaries);
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
    <div className="relative flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-6 min-h-screen">
      <AnimatedIcons className="opacity-20" />
      
      <div className="w-full max-w-lg">
        {(isSuccess || isFraudDetected) && <StatusCard />}
        
        <Card className="bg-white/90 backdrop-blur-sm border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
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
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full justify-between"
                        >
                          {selectedBeneficiary ? selectedBeneficiary.name : "Select beneficiary..."}
                          <User className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search beneficiaries..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                          />
                          <CommandEmpty>No beneficiary found.</CommandEmpty>
                          <CommandGroup className="max-h-60 overflow-y-auto">
                            {filteredBeneficiaries.map((beneficiary) => (
                              <CommandItem
                                key={beneficiary.id}
                                onSelect={() => {
                                  setSelectedBeneficiary(beneficiary);
                                  setOpen(false);
                                }}
                              >
                                <div className="flex flex-col">
                                  <span>{beneficiary.name}</span>
                                  <span className="text-sm text-muted-foreground">
                                    ID: {Object.values(beneficiary.unique_identifiers)[0]}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-medium">Select Goods</Label>
                      <span className="text-xs text-blue-600">
                        Selected: {selectedGoods.length} item(s)
                      </span>
                    </div>
                    
                    <div className="grid gap-3 p-4 bg-blue-50 rounded-lg max-h-60 overflow-y-auto">
                      {regionalGoods.length > 0 ? (
                        regionalGoods.map((goods) => (
                          <div key={goods.id} className="flex items-center justify-between bg-white p-3 rounded-md hover:bg-blue-50 transition-colors">
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
                              <Label htmlFor={goods.id} className="cursor-pointer flex flex-col">
                                <span>{goods.goods_types?.name}</span>
                                <span className="text-xs text-gray-500">{goods.goods_types?.description}</span>
                              </Label>
                            </div>
                            <span className={cn(
                              "text-sm font-medium",
                              goods.quantity <= 0 ? "text-red-500" : "text-green-600"
                            )}>
                              {goods.quantity > 0 ? `Stock: ${goods.quantity}` : "Out of stock"}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <Package className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p>No goods available in your region.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="location" className="text-lg font-medium">Location</Label>
                    {location ? (
                      <div className="bg-gray-50 p-4 rounded-md border border-blue-200 flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">Current Location</p>
                          <p className="text-xs text-gray-500">
                            Latitude: {location.latitude?.toFixed(6)}, Longitude: {location.longitude?.toFixed(6)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-2 bg-gray-50 p-4 rounded-md border border-blue-200">
                        <p className="text-sm text-gray-500">Location not available</p>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={getLocation}
                          className="text-sm"
                        >
                          Get Location
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
                disabled={
                  isLoading ||
                  isSubmitting || 
                  !selectedBeneficiary || 
                  selectedGoods.length === 0 ||
                  isSuccess
                }
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Allocating...
                  </span>
                ) : isSuccess ? (
                  "Allocation Complete ✓"
                ) : (
                  "Allocate Resources"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AllocateResources;
