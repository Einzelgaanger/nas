import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCw, User, MapPin, Calendar, Ruler, FileText } from "lucide-react";
import { fetchBeneficiariesByRegion } from "@/services/disburserService";
import { fetchRegions } from "@/services/adminService";
import { supabase } from "@/integrations/supabase/client";
import { AnimatedIcons } from "@/components/ui/animated-icons";
import { Label } from "@/components/ui/label";

interface Beneficiary {
  id: string;
  name: string;
  estimated_age: number;
  height: number;
  unique_identifiers: {
    national_id?: string;
    passport?: string;
    birth_certificate?: string;
  };
  region_id: string;
  registered_by: string;
  created_at: string;
}

const ManageBeneficiaries = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Enhanced search functionality
  const filteredBeneficiaries = useMemo(() => {
    if (!searchTerm) return beneficiaries;
    
    const searchLower = searchTerm.toLowerCase();
    return beneficiaries.filter(b => {
      // Search in name
      if (b.name.toLowerCase().includes(searchLower)) return true;
      
      // Search in identifiers
      const identifiers = b.unique_identifiers;
      return Object.values(identifiers).some(value => 
        value?.toLowerCase().includes(searchLower)
      );
    });
  }, [beneficiaries, searchTerm]);

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

  const createDisburser = async (disburser: TablesInsert<"disbursers">) => {
    try {
      const { data, error } = await supabase
        .from("disbursers")
        .insert(disburser)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating disburser:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to create disburser"
      );
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Beneficiaries</h1>
        <p className="text-gray-500 mt-1">View and manage registered beneficiaries</p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Left side - Filters */}
        <div className="md:col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Region</Label>
                <Select value={selectedRegion || ""} onValueChange={setSelectedRegion}>
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

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search beneficiaries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
                className="w-full"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Beneficiaries List */}
        <div className="md:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Beneficiary List</CardTitle>
              <CardDescription>
                {filteredBeneficiaries.length} beneficiaries found
                {selectedRegion && regions.find(r => r.id === selectedRegion) && (
                  <> in {regions.find(r => r.id === selectedRegion)?.name}</>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                  </div>
                ) : filteredBeneficiaries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No beneficiaries found
                  </div>
                ) : (
                  filteredBeneficiaries.map((beneficiary) => (
                    <BeneficiaryCard
                      key={beneficiary.id}
                      beneficiary={beneficiary}
                      getDisburserName={getDisburserName}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const BeneficiaryCard = ({ beneficiary, getDisburserName }: { 
  beneficiary: Beneficiary;
  getDisburserName: (id: string) => Promise<string>;
}) => {
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

  // Parse unique identifiers properly
  const identifiers = useMemo(() => {
    try {
      if (typeof beneficiary.unique_identifiers === 'string') {
        return JSON.parse(beneficiary.unique_identifiers);
      }
      return beneficiary.unique_identifiers;
    } catch (error) {
      console.error('Error parsing identifiers:', error);
      return {};
    }
  }, [beneficiary.unique_identifiers]);

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {beneficiary.name}
              </h3>
              <div className="mt-1 space-y-1">
                {beneficiary.estimated_age && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    Age: {beneficiary.estimated_age}
                  </div>
                )}
                {beneficiary.height && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Ruler className="h-4 w-4 mr-2" />
                    Height: {beneficiary.height} cm
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Identifiers</h4>
            <div className="space-y-1">
              {Object.entries(identifiers).map(([key, value]) => (
                value && (
                  <div key={key} className="inline-flex items-center bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-sm mr-2 mb-2">
                    <FileText className="h-4 w-4 mr-2" />
                    {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}: {value}
                  </div>
                )
              ))}
            </div>
          </div>

          {disburserName && (
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500">
                Registered by: {disburserName}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(beneficiary.created_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ManageBeneficiaries;
