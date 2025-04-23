import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as adminService from "@/services/adminService";
import { Disburser, Region } from "@/types/database";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Database } from "@/integrations/supabase/types";

const ManageDisbursers = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentDisburser, setCurrentDisburser] = useState<Disburser | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [disburserToDelete, setDisburserToDelete] = useState<
    Disburser | null
  >(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: disbursers,
    isLoading,
    isError,
    refetch: fetchDisbursers,
  } = useQuery({
    queryKey: ["disbursers"],
    queryFn: adminService.fetchDisbursers,
  });

  const { data: regions, isLoading: isRegionsLoading } = useQuery({
    queryKey: ["regions"],
    queryFn: adminService.fetchRegions,
  });

  const { mutate: createDisburserMutation } = useMutation({
    mutationFn: (newDisburser: Omit<Database["public"]["Tables"]["disbursers"]["Insert"], "id" | "created_at" | "updated_at">) => 
      adminService.createDisburser(newDisburser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursers"] });
      toast({
        title: "Disburser Created",
        description: "New disburser has been created successfully.",
      });
      setIsCreating(false);
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create disburser",
        variant: "destructive",
      });
    },
  });

  const { mutate: deleteDisburserMutation } = useMutation({
    mutationFn: (id: string) => adminService.deleteDisburser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursers"] });
      toast({
        title: "Disburser Deleted",
        description: "Disburser has been deleted successfully.",
      });
      setIsDeleting(false);
      setDisburserToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Deletion Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete disburser",
        variant: "destructive",
      });
      setIsDeleting(false);
      setDisburserToDelete(null);
    },
  });

  const updateDisburser = async (id: string, data: Disburser) => {
    setIsUpdating(true);
    try {
      // Ensure password is included when updating a disburser
      const updatedData = {
        name: data.name,
        phone_number: data.phone_number,
        region_id: data.region_id,
        password: data.password || '' // Ensure password is always provided
      };
      
      await adminService.updateDisburser(id, updatedData);
      fetchDisbursers();
      toast({
        title: "Disburser Updated",
        description: `Disburser ${data.name} has been updated successfully.`,
      });
      setIsEditing(false);
      setCurrentDisburser(null);
    } catch (error) {
      console.error("Error updating disburser:", error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update disburser",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteConfirmation = (disburser: Disburser) => {
    setDisburserToDelete(disburser);
    setIsDeleting(true);
  };

  const handleConfirmDelete = () => {
    if (disburserToDelete) {
      deleteDisburserMutation(disburserToDelete.id);
    }
  };

  if (isLoading || isRegionsLoading) {
    return <div>Loading disbursers and regions...</div>;
  }

  if (isError) {
    return <div>Error fetching data. Please try again.</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Disbursers</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Disburser
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Disburser</DialogTitle>
              <DialogDescription>
                Create a new disburser account.
              </DialogDescription>
            </DialogHeader>
            <CreateDisburserForm
              regions={regions || []}
              onCreate={createDisburserMutation}
              onClose={() => setIsCreating(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Disbursers List</CardTitle>
          <CardDescription>
            Manage and update disburser accounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disbursers?.map((disburser) => (
                  <TableRow key={disburser.id}>
                    <TableCell className="font-medium">{disburser.id}</TableCell>
                    <TableCell>{disburser.name}</TableCell>
                    <TableCell>{disburser.phone_number}</TableCell>
                    <TableCell>{disburser.regions?.name}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setIsEditing(true);
                              setCurrentDisburser(disburser);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteConfirmation(disburser)}
                            className="text-red-500 focus:text-red-500"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Edit Disburser Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Disburser</DialogTitle>
            <DialogDescription>
              Make changes to the selected disburser's account.
            </DialogDescription>
          </DialogHeader>
          {currentDisburser && (
            <EditDisburserForm
              disburser={currentDisburser}
              regions={regions || []}
              onUpdate={updateDisburser}
              onClose={() => {
                setIsEditing(false);
                setCurrentDisburser(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Disburser</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this disburser? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface CreateDisburserFormProps {
  regions: Region[];
  onCreate: (
    disburser: Omit<
      Database["public"]["Tables"]["disbursers"]["Insert"],
      "id" | "created_at" | "updated_at"
    >
  ) => void;
  onClose: () => void;
}

const CreateDisburserForm: React.FC<CreateDisburserFormProps> = ({
  regions,
  onCreate,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [regionId, setRegionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newDisburser = {
        name,
        phone_number: phoneNumber,
        password,
        region_id: regionId,
      };
      onCreate(newDisburser);
    } catch (error: any) {
      console.error("Error creating disburser:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          placeholder="Enter phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="region">Region</Label>
        <Select onValueChange={setRegionId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a region" />
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem key={region.id} value={region.id}>
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create"}
        </Button>
      </DialogFooter>
    </form>
  );
};

interface EditDisburserFormProps {
  disburser: Disburser;
  regions: Region[];
  onUpdate: (id: string, disburser: Disburser) => Promise<void>;
  onClose: () => void;
}

const EditDisburserForm: React.FC<EditDisburserFormProps> = ({
  disburser,
  regions,
  onUpdate,
  onClose,
}) => {
  const [name, setName] = useState(disburser.name);
  const [phoneNumber, setPhoneNumber] = useState(disburser.phone_number);
  const [password, setPassword] = useState(disburser.password);
  const [regionId, setRegionId] = useState(disburser.region_id);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedDisburser = {
        ...disburser,
        name,
        phone_number: phoneNumber,
        password,
        region_id: regionId,
      };
      await onUpdate(disburser.id, updatedDisburser);
      onClose();
    } catch (error: any) {
      console.error("Error updating disburser:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          placeholder="Enter phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="region">Region</Label>
        <Select value={regionId} onValueChange={setRegionId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a region" />
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem key={region.id} value={region.id}>
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default ManageDisbursers;
