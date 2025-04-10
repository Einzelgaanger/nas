
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  fetchBeneficiariesByRegion, 
  fetchBeneficiaryById, 
  fetchRegionalGoods,
  checkRecentAllocation,
  createAllocation,
  createFraudAlert 
} from "@/services/disburserService";

const AllocateResources = () => {
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string>("");
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  // Query beneficiaries in disburser's region
  const { 
    data: beneficiaries, 
    isLoading: loadingBeneficiaries 
  } = useQuery({
    queryKey: ['beneficiaries', userInfo?.region],
    queryFn: () => userInfo?.region ? fetchBeneficiariesByRegion(userInfo.region) : Promise.resolve([]),
    enabled: !!userInfo?.region
  });
  
  // Query selected beneficiary details
  const { 
    data: beneficiary,
    isLoading: loadingBeneficiary
  } = useQuery({
    queryKey: ['beneficiary', selectedBeneficiaryId],
    queryFn: () => fetchBeneficiaryById(selectedBeneficiaryId),
    enabled: !!selectedBeneficiaryId
  });
  
  // Query available goods in disburser's region
  const { 
    data: regionalGoods, 
    isLoading: loadingGoods 
  } = useQuery({
    queryKey: ['regionalGoods', userInfo?.region],
    queryFn: () => userInfo?.region ? fetchRegionalGoods(userInfo.region) : Promise.resolve([]),
    enabled: !!userInfo?.region
  });
  
  // Allocation mutation
  const allocationMutation = useMutation({
    mutationFn: async (beneficiaryId: string) => {
      if (!currentLocation) {
        throw new Error("Location is required");
      }
      
      // Check if there was a recent allocation
      const hasRecentAllocation = await checkRecentAllocation(beneficiaryId);
      
      if (hasRecentAllocation) {
        // Create fraud alert
        await createFraudAlert({
          beneficiary_id: beneficiaryId,
          disburser_id: userInfo?.id,
          location: currentLocation,
          details: "Attempted double allocation within short timeframe"
        });
        
        throw new Error("SERVER_SLOW");
      }
      
      // Prepare goods data
      const goodsData = regionalGoods?.map(good => ({
        id: good.id,
        type: good.goods_types.name,
        quantity: 1
      })) || [];
      
      // Create allocation
      return createAllocation({
        beneficiary_id: beneficiaryId,
        disburser_id: userInfo?.id,
        goods: goodsData,
        location: currentLocation
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      toast({
        title: "Success",
        description: "Resources allocated successfully",
      });
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      if (error.message === "SERVER_SLOW") {
        toast({
          title: "Server Issue",
          description: "The servers are responding slowly. Please try again later.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: `Error allocating resources: ${error.message}`,
          variant: "destructive",
        });
      }
    },
  });
  
  const handleGetLocation = () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      setIsGettingLocation(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        toast({
          title: "Error",
          description: "Unable to retrieve your location",
          variant: "destructive",
        });
        setIsGettingLocation(false);
      }
    );
  };
  
  const handleAllocate = () => {
    if (!selectedBeneficiaryId) {
      toast({
        title: "Error", 
        description: "Please select a beneficiary",
        variant: "destructive"
      });
      return;
    }
    
    if (!currentLocation) {
      toast({
        title: "Error",
        description: "Please get your current location first",
        variant: "destructive"
      });
      return;
    }
    
    allocationMutation.mutate(selectedBeneficiaryId);
  };
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Allocate Resources</CardTitle>
          <CardDescription>
            Select a beneficiary and allocate resources to them
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="beneficiary">Select Beneficiary</Label>
            {loadingBeneficiaries ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={selectedBeneficiaryId}
                onValueChange={setSelectedBeneficiaryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a beneficiary" />
                </SelectTrigger>
                <SelectContent>
                  {beneficiaries?.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          {selectedBeneficiaryId && (
            <>
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Beneficiary Details</h3>
                {loadingBeneficiary ? (
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-5 w-3/4" />
                  </div>
                ) : beneficiary ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p>{beneficiary.name}</p>
                    </div>
                    
                    {beneficiary.height && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Height</p>
                        <p>{beneficiary.height} cm</p>
                      </div>
                    )}
                    
                    {beneficiary.estimated_age && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Estimated Age</p>
                        <p>{beneficiary.estimated_age} years</p>
                      </div>
                    )}
                    
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500">Unique Identifiers</p>
                      <p className="text-sm">
                        {beneficiary.unique_identifiers.features || "No specific features recorded"}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Resources to Allocate</h3>
                {loadingGoods ? (
                  <div className="space-y-3">
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : regionalGoods?.length ? (
                  <div className="border rounded-md p-4 bg-gray-50">
                    <h4 className="font-medium mb-2">Package Contents:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {regionalGoods.map(good => (
                        <li key={good.id}>
                          {good.goods_types.name}
                          {good.goods_types.description && (
                            <span className="text-gray-500"> - {good.goods_types.description}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-amber-500">No resources available for your region. Please contact an administrator.</p>
                )}
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Location</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {currentLocation ? (
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Current Coordinates</p>
                      <p>
                        Lat: {currentLocation.latitude.toFixed(6)}, 
                        Lon: {currentLocation.longitude.toFixed(6)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-amber-500 flex-1">
                      Location data is required for allocation
                    </p>
                  )}
                  
                  <Button 
                    type="button" 
                    onClick={handleGetLocation} 
                    disabled={isGettingLocation}
                  >
                    {isGettingLocation ? "Getting Location..." : "Get Current Location"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAllocate}
            disabled={
              !selectedBeneficiaryId || 
              !currentLocation || 
              allocationMutation.isPending ||
              !regionalGoods?.length
            }
          >
            {allocationMutation.isPending ? "Processing..." : "Allocate Resources"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AllocateResources;
