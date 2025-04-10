
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { Disburser, Region } from "@/types/database";
import { fetchDisbursers, fetchRegions, createDisburser, updateDisburser, deleteDisburser, createRegion } from "@/services/adminService";

const ManageDisbursers = () => {
  const [isNewDisburserOpen, setIsNewDisburserOpen] = useState(false);
  const [isEditDisburserOpen, setIsEditDisburserOpen] = useState(false);
  const [isNewRegionOpen, setIsNewRegionOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  
  const [currentDisburser, setCurrentDisburser] = useState<Partial<Disburser>>({});
  const [selectedDisburserForDelete, setSelectedDisburserForDelete] = useState<string>("");
  const [newRegion, setNewRegion] = useState<string>("");

  const queryClient = useQueryClient();

  // Query disbursers
  const { 
    data: disbursers, 
    isLoading: loadingDisbursers 
  } = useQuery({
    queryKey: ['disbursers'],
    queryFn: fetchDisbursers
  });

  // Query regions
  const { 
    data: regions, 
    isLoading: loadingRegions 
  } = useQuery({
    queryKey: ['regions'],
    queryFn: fetchRegions
  });

  // Mutations
  const createDisburserMutation = useMutation({
    mutationFn: createDisburser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disbursers'] });
      toast({
        title: "Success",
        description: "Disburser created successfully",
      });
      setIsNewDisburserOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error creating disburser: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  const updateDisburserMutation = useMutation({
    mutationFn: ({ id, disburser }: { id: string; disburser: Partial<Disburser> }) => updateDisburser(id, disburser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disbursers'] });
      toast({
        title: "Success",
        description: "Disburser updated successfully",
      });
      setIsEditDisburserOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error updating disburser: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  const deleteDisburserMutation = useMutation({
    mutationFn: deleteDisburser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disbursers'] });
      toast({
        title: "Success",
        description: "Disburser deleted successfully",
      });
      setIsConfirmDeleteOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error deleting disburser: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  const createRegionMutation = useMutation({
    mutationFn: createRegion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      toast({
        title: "Success",
        description: "Region created successfully",
      });
      setIsNewRegionOpen(false);
      setNewRegion("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error creating region: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  const handleOpenNewDisburser = () => {
    setCurrentDisburser({
      name: '',
      phone_number: '',
      password: 'defaultpass123', // Default password
      region_id: '',
    });
    setIsNewDisburserOpen(true);
  };

  const handleOpenEditDisburser = (disburser: Disburser) => {
    setCurrentDisburser({...disburser});
    setIsEditDisburserOpen(true);
  };

  const handleConfirmDelete = (id: string) => {
    setSelectedDisburserForDelete(id);
    setIsConfirmDeleteOpen(true);
  };

  const handleCreateDisburser = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentDisburser.name && currentDisburser.phone_number && currentDisburser.region_id) {
      createDisburserMutation.mutate(currentDisburser);
    } else {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
    }
  };

  const handleUpdateDisburser = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentDisburser.id && currentDisburser.name && currentDisburser.phone_number && currentDisburser.region_id) {
      updateDisburserMutation.mutate({
        id: currentDisburser.id,
        disburser: {
          name: currentDisburser.name,
          phone_number: currentDisburser.phone_number,
          region_id: currentDisburser.region_id,
          password: currentDisburser.password
        }
      });
    } else {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDisburser = () => {
    if (selectedDisburserForDelete) {
      deleteDisburserMutation.mutate(selectedDisburserForDelete);
    }
  };

  const handleCreateRegion = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRegion.trim()) {
      createRegionMutation.mutate({ name: newRegion.trim() });
    } else {
      toast({
        title: "Error",
        description: "Please enter a region name",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Manage Disbursers</h2>
          <p className="text-gray-600">Add, edit, or remove disbursers from the system</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
          <Button onClick={() => setIsNewRegionOpen(true)}>
            Add New Region
          </Button>
          <Button onClick={handleOpenNewDisburser}>
            Add New Disburser
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      {loadingDisbursers ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="p-4">
                <Skeleton className="h-7 w-2/3" />
                <Skeleton className="h-5 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {disbursers?.map((disburser) => (
            <Card key={disburser.id}>
              <CardHeader>
                <CardTitle>{disburser.name}</CardTitle>
                <CardDescription>
                  {(disburser as any).regions?.name || "Unknown Region"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Phone Number</p>
                    <p className="text-sm text-gray-500">{disburser.phone_number}</p>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => handleOpenEditDisburser(disburser)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => handleConfirmDelete(disburser.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {disbursers?.length === 0 && (
            <Card className="col-span-1 md:col-span-2">
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500">No disbursers found. Add your first disburser to get started.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* New Disburser Dialog */}
      <Dialog open={isNewDisburserOpen} onOpenChange={setIsNewDisburserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Disburser</DialogTitle>
            <DialogDescription>
              Add a new disburser to the system. They will be able to register beneficiaries and allocate resources.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateDisburser}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Enter disburser name"
                  value={currentDisburser.name || ''}
                  onChange={(e) => setCurrentDisburser({...currentDisburser, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="Enter phone number"
                  value={currentDisburser.phone_number || ''}
                  onChange={(e) => setCurrentDisburser({...currentDisburser, phone_number: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Default Password</Label>
                <Input
                  id="password"
                  type="text"
                  value={currentDisburser.password || 'defaultpass123'}
                  onChange={(e) => setCurrentDisburser({...currentDisburser, password: e.target.value})}
                  required
                />
                <p className="text-xs text-gray-500">
                  This is the password the disburser will use to log in.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                {loadingRegions ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select 
                    value={currentDisburser.region_id || ''} 
                    onValueChange={(value) => setCurrentDisburser({...currentDisburser, region_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions?.map((region) => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {regions?.length === 0 && (
                  <p className="text-xs text-amber-500 mt-2">
                    No regions available. Please add a region first.
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsNewDisburserOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createDisburserMutation.isPending || !regions?.length}
              >
                {createDisburserMutation.isPending ? "Creating..." : "Create Disburser"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Disburser Dialog */}
      <Dialog open={isEditDisburserOpen} onOpenChange={setIsEditDisburserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Disburser</DialogTitle>
            <DialogDescription>
              Update disburser information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateDisburser}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  placeholder="Enter disburser name"
                  value={currentDisburser.name || ''}
                  onChange={(e) => setCurrentDisburser({...currentDisburser, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  placeholder="Enter phone number"
                  value={currentDisburser.phone_number || ''}
                  onChange={(e) => setCurrentDisburser({...currentDisburser, phone_number: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">Password</Label>
                <Input
                  id="edit-password"
                  type="text"
                  value={currentDisburser.password || ''}
                  onChange={(e) => setCurrentDisburser({...currentDisburser, password: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-region">Region</Label>
                <Select 
                  value={currentDisburser.region_id || ''} 
                  onValueChange={(value) => setCurrentDisburser({...currentDisburser, region_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions?.map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDisburserOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={updateDisburserMutation.isPending}
              >
                {updateDisburserMutation.isPending ? "Updating..." : "Update Disburser"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Region Dialog */}
      <Dialog open={isNewRegionOpen} onOpenChange={setIsNewRegionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Region</DialogTitle>
            <DialogDescription>
              Add a new operational region to the system.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateRegion}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="region-name">Region Name</Label>
                <Input
                  id="region-name"
                  placeholder="Enter region name (e.g., Mwale Region)"
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsNewRegionOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createRegionMutation.isPending || !newRegion.trim()}
              >
                {createRegionMutation.isPending ? "Creating..." : "Create Region"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this disburser? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteDisburser}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageDisbursers;
