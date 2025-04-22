
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCw, User, MapPin } from "lucide-react";
import { fetchBeneficiariesByRegion } from "@/services/disburserService";
import { fetchRegions } from "@/services/adminService";
import { supabase } from "@/integrations/supabase/client";
import { AnimatedIcons } from "@/components/ui/animated-icons";

const ManageBeneficiaries = () => {
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const fetchedRegions = await fetchRegions();
        setRegions(fetchedRegions);
        
        // If we have regions, select the first one by default
        if (fetchedRegions.length > 0) {
          setSelectedRegion(fetchedRegions[0].id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch regions",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  useEffect(() => {
    const loadBeneficiaries = async () => {
      if (!selectedRegion) return;
      
      setIsLoading(true);
      try {
        const fetchedBeneficiaries = await fetchBeneficiariesByRegion(selectedRegion);
        setBeneficiaries(fetchedBeneficiaries);
      } catch (error) {
        console.error("Error fetching beneficiaries:", error);
        toast({
          title: "Error",
          description: "Failed to fetch beneficiaries for this region",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBeneficiaries();
  }, [selectedRegion, toast]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter is done client-side for now
  };

  const handleRefresh = async () => {
    if (!selectedRegion) return;
    
    setIsLoading(true);
    try {
      const fetchedBeneficiaries = await fetchBeneficiariesByRegion(selectedRegion);
      setBeneficiaries(fetchedBeneficiaries);
      toast({
        title: "Refreshed",
        description: "Beneficiary list has been updated",
      });
    } catch (error) {
      console.error("Error refreshing beneficiaries:", error);
      toast({
        title: "Error",
        description: "Failed to refresh beneficiary data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getDisburserName = async (disburserId: string) => {
    try {
      const { data, error } = await supabase
        .from("disbursers")
        .select("name")
        .eq("id", disburserId)
        .single();
        
      if (error) throw error;
      return data.name;
    } catch (error) {
      console.error("Error fetching disburser name:", error);
      return "Unknown";
    }
  };

  // Filter beneficiaries based on search term
  const filteredBeneficiaries = searchTerm
    ? beneficiaries.filter(b => 
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.unique_identifiers && String(b.unique_identifiers).toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : beneficiaries;

  return (
    <div className="px-4 py-6 space-y-6">
      <AnimatedIcons className="opacity-20" />
      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Beneficiaries</h1>
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-[250px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter beneficiaries by region</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Region</label>
              <Select
                value={selectedRegion || ""}
                onValueChange={setSelectedRegion}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map(region => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <form onSubmit={handleSearch} className="relative">
              <Input
                placeholder="Search beneficiaries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-8"
              />
              <Search className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Beneficiary List</CardTitle>
            <CardDescription>
              Showing {filteredBeneficiaries.length} beneficiaries
              {selectedRegion && regions.find(r => r.id === selectedRegion) && (
                <> in {regions.find(r => r.id === selectedRegion).name}</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredBeneficiaries.length > 0 ? (
              <div className="space-y-4">
                {filteredBeneficiaries.map((beneficiary) => (
                  <BeneficiaryCard 
                    key={beneficiary.id} 
                    beneficiary={beneficiary} 
                    getDisburserName={getDisburserName}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <User className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-center">No beneficiaries found.</p>
                {selectedRegion ? (
                  <p className="text-center text-sm mt-2">No beneficiaries are registered in this region.</p>
                ) : (
                  <p className="text-center text-sm mt-2">Please select a region to view beneficiaries.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const BeneficiaryCard = ({ beneficiary, getDisburserName }: { beneficiary: any, getDisburserName: (id: string) => Promise<string> }) => {
  const [disburserName, setDisburserName] = useState<string | null>(null);
  
  useEffect(() => {
    const loadDisburserName = async () => {
      if (beneficiary.registered_by) {
        const name = await getDisburserName(beneficiary.registered_by);
        setDisburserName(name);
      }
    };
    
    loadDisburserName();
  }, [beneficiary, getDisburserName]);
  
  // Parse unique identifiers
  const identifiers = typeof beneficiary.unique_identifiers === 'string' 
    ? JSON.parse(beneficiary.unique_identifiers)
    : beneficiary.unique_identifiers;

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">{beneficiary.name}</h3>
          <div className="text-sm text-gray-500 mt-1">
            {beneficiary.estimated_age && (
              <span className="mr-3">Age: {beneficiary.estimated_age}</span>
            )}
            {beneficiary.height && (
              <span>Height: {beneficiary.height} cm</span>
            )}
          </div>
          <div className="mt-2 text-sm">
            <p className="font-medium">Unique Identifiers:</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {Array.isArray(identifiers) ? identifiers.map((id: string, index: number) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                  {id}
                </span>
              )) : (
                <span className="text-gray-500">No identifiers</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">
            Registered: {new Date(beneficiary.created_at).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            By: {disburserName || "Loading..."}
          </p>
          <p className="text-xs flex items-center justify-end text-gray-500 mt-1">
            <MapPin className="h-3 w-3 mr-1" /> ID: {beneficiary.id.substring(0, 8)}...
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManageBeneficiaries;
