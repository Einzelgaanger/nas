import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCw, User, MapPin, Calendar, Ruler, FileText, Pencil } from "lucide-react";
import { fetchBeneficiariesByRegion } from "@/services/disburserService";
import { fetchRegions } from "@/services/adminService";
import { supabase } from "@/integrations/supabase/client";
import { AnimatedIcons } from "@/components/ui/animated-icons";
import { Label } from "@/components/ui/label";
import type { Beneficiary } from '@/types/database';

const ManageBeneficiaries = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);

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

  const handleEdit = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        {/* Sidebar */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Beneficiaries</h2>
            <div className="mt-2">
              <Input 
                placeholder="Search beneficiaries..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <div className="divide-y max-h-[calc(100vh-200px)] overflow-y-auto">
            {filteredBeneficiaries.map((beneficiary) => (
              <div 
                key={beneficiary.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedBeneficiary?.id === beneficiary.id ? 'bg-gray-50' : ''
                }`}
                onClick={() => setSelectedBeneficiary(beneficiary)}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {beneficiary.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {beneficiary.region_name || 'No region'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow">
          {selectedBeneficiary ? (
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedBeneficiary.name}</h2>
                  <p className="text-gray-500">{selectedBeneficiary.region_name}</p>
                </div>
                <Button variant="outline" onClick={() => handleEdit(selectedBeneficiary)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>

              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Allocations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Recent allocations list */}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">ID Number</dt>
                        <dd className="mt-1 text-sm text-gray-900">{selectedBeneficiary.id_number}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Phone</dt>
                        <dd className="mt-1 text-sm text-gray-900">{selectedBeneficiary.phone}</dd>
                      </div>
                      {/* Add more details as needed */}
                    </dl>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a beneficiary to view details
            </div>
          )}
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
