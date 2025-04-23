
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Search, Calendar, MapPin, Filter, Download } from "lucide-react";
import { fetchAllocations } from "@/services/disburserService";
import { Allocation } from "@/types/database";

const ManageAllocations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");

  const { data: allocations = [], isLoading, error } = useQuery({
    queryKey: ['allocations'],
    queryFn: async () => {
      const data = await fetchAllocations();
      return data;
    },
  });

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter allocations based on search term and filter option
  const filteredAllocations = allocations.filter((allocation: Allocation) => {
    const matchesSearch = 
      (allocation.beneficiaries?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (allocation.disbursers?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply additional filtering if needed
    if (filterBy !== "all") {
      // This could be extended to filter by date range, region, etc.
      return matchesSearch;
    }
    
    return matchesSearch;
  });

  const getGoodsList = (goods: any) => {
    if (Array.isArray(goods)) {
      return `${goods.length} item(s)`;
    }
    return "No items";
  };

  const getLocationString = (location: any) => {
    if (!location) return "Not specified";
    
    if (location.latitude && location.longitude) {
      return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
    }
    
    return "Invalid location data";
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resource Allocations</h1>
          <p className="text-gray-500 mt-1">
            Monitor and manage all resource allocations across regions
          </p>
        </div>
        
        <div className="flex gap-2 mt-4 lg:mt-0">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter size={16} />
            <span>Advanced Filters</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download size={16} />
            <span>Export</span>
          </Button>
        </div>
      </div>

      <Card className="shadow-md border-green-100">
        <CardHeader className="bg-white border-b border-green-100">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div className="flex items-center gap-2 text-gray-900">
              <Package className="h-5 w-5 text-green-600" />
              <CardTitle>Allocation Records</CardTitle>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Search allocations..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-blue-100 focus:border-blue-300"
                />
              </div>
              
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-full md:w-40 border-blue-100">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Allocations</SelectItem>
                  <SelectItem value="recent">Recent (7 days)</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : error ? (
            <div className="text-center p-12 text-red-500">
              An error occurred while fetching allocations
            </div>
          ) : filteredAllocations.length === 0 ? (
            <div className="text-center p-12 text-gray-500">
              {searchTerm || filterBy !== "all" 
                ? "No allocations match your search criteria" 
                : "No allocations have been recorded yet"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Beneficiary</TableHead>
                    <TableHead>Disburser</TableHead>
                    <TableHead>Resources</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <Calendar size={16} className="text-blue-500" />
                        <span>Date & Time</span>
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <MapPin size={16} className="text-blue-500" />
                        <span>Location</span>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAllocations.map((allocation: Allocation) => (
                    <TableRow key={allocation.id} className="hover:bg-green-50">
                      <TableCell className="font-medium">
                        {allocation.beneficiaries?.name || "Unknown Beneficiary"}
                      </TableCell>
                      <TableCell>
                        {allocation.disbursers?.name || "Unknown Disburser"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                          {getGoodsList(allocation.goods)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatDate(allocation.allocated_at)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {getLocationString(allocation.location)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="bg-gray-50 flex justify-between py-3 px-6">
          <p className="text-gray-500 text-sm">
            {filteredAllocations.length} allocation{filteredAllocations.length !== 1 ? 's' : ''} found
          </p>
          
          <div className="flex gap-2">
            {/* Pagination could be added here if needed */}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ManageAllocations;
