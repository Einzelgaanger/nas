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
    
    if (filterBy === "recent") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return matchesSearch && new Date(allocation.allocated_at) >= sevenDaysAgo;
    } else if (filterBy === "month") {
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);
      return matchesSearch && new Date(allocation.allocated_at) >= firstDayOfMonth;
    }
    
    return matchesSearch;
  });

  const getGoodsList = (goods: any) => {
    if (!goods) return "No items";
    
    try {
      if (typeof goods === 'string') {
        goods = JSON.parse(goods);
      }
      
      if (Array.isArray(goods)) {
        return `${goods.length} item(s)`;
      } else if (typeof goods === 'object') {
        const itemCount = Object.keys(goods).length;
        return `${itemCount} item(s)`;
      }
    } catch (error) {
      console.error("Error parsing goods data:", error);
    }
    
    return "Invalid goods data";
  };

  const getLocationString = (location: any) => {
    if (!location) return "Not specified";
    
    try {
      if (typeof location === 'string') {
        location = JSON.parse(location);
      }
      
      if (location.latitude && location.longitude) {
        return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
      }
    } catch (error) {
      console.error("Error parsing location data:", error);
    }
    
    return "Invalid location data";
  };

  const formatGoodsDisplay = (goods: any) => {
    try {
      let parsedGoods = Array.isArray(goods) ? goods : JSON.parse(goods);
      return parsedGoods.map((good: any) => {
        // Get the goods type name from the goods_types table
        if (typeof good === 'object' && good.goods_type_id) {
          return good.goods_types?.name || 'Unknown Item';
        }
        return good;
      });
    } catch (error) {
      console.error('Error parsing goods:', error);
      return [];
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <Card className="bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-green-100 p-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              <div>
                <CardTitle className="text-xl font-bold text-gray-800">Allocation Records</CardTitle>
                <CardDescription className="text-gray-600">Track all resource allocations</CardDescription>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Search allocations..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-[250px] border-green-200 focus-visible:ring-green-500"
                />
              </div>
              
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-[150px] border-green-200">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Allocations</SelectItem>
                  <SelectItem value="recent">Last 7 days</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Beneficiary</TableHead>
                <TableHead className="font-semibold">Disburser</TableHead>
                <TableHead className="font-semibold">Resources</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Calendar size={16} className="text-green-600" />
                    <span>Date & Time</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-1">
                    <MapPin size={16} className="text-green-600" />
                    <span>Location</span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAllocations.map((allocation) => (
                <TableRow 
                  key={allocation.id} 
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="py-2">
                    <div className="font-medium text-gray-900">
                      {allocation.beneficiaries?.name || "Unknown"}
                    </div>
                  </TableCell>
                  <TableCell className="py-2 text-gray-600">
                    {allocation.disbursers?.name || "Unknown"}
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex flex-wrap gap-1">
                      {allocation.goods_details?.map((item, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700"
                        >
                          <Package className="h-3 w-3 mr-1" />
                          {item.goods_types.name}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="py-2 whitespace-nowrap text-gray-600">
                    {formatDate(allocation.allocated_at)}
                  </TableCell>
                  <TableCell className="py-2 text-gray-600">
                    {getLocationString(allocation.location)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <CardFooter className="bg-gray-50 flex justify-between py-3 px-4 border-t">
          <p className="text-gray-600 text-sm">
            {filteredAllocations.length} allocation{filteredAllocations.length !== 1 ? 's' : ''} found
          </p>
          
          {filteredAllocations.length > 10 && (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white border-green-200 text-green-700 hover:bg-green-50"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">Page 1</span>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white border-green-200 text-green-700 hover:bg-green-50"
              >
                Next
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

// Component to display allocation goods
const AllocationGoods = ({ goods }: { goods: any }) => {
  let parsedGoods: any[] = [];
  
  try {
    if (typeof goods === 'string') {
      parsedGoods = JSON.parse(goods);
    } else if (Array.isArray(goods)) {
      parsedGoods = goods;
    } else if (goods && typeof goods === 'object') {
      parsedGoods = Object.values(goods);
    }
  } catch (error) {
    console.error("Error parsing goods data:", error);
    return <Badge variant="outline" className="bg-gray-100 text-gray-600">No items</Badge>;
  }
  
  if (!parsedGoods || parsedGoods.length === 0) {
    return <Badge variant="outline" className="bg-gray-100 text-gray-600">No items</Badge>;
  }
  
  return (
    <div className="flex flex-wrap gap-1">
      {parsedGoods.slice(0, 3).map((item, index) => (
        <Badge key={index} variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
          {typeof item === 'object' ? item.name || 'Unknown item' : item}
        </Badge>
      ))}
      {parsedGoods.length > 3 && (
        <Badge variant="outline" className="bg-gray-100 text-gray-600">
          +{parsedGoods.length - 3} more
        </Badge>
      )}
    </div>
  );
};

export default ManageAllocations;
