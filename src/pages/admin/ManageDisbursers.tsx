
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Pencil, Trash2, Plus } from "lucide-react";

// Define the form schema with validation
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  region: z.string().min(2, "Region must be at least 2 characters"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .refine((val) => /^0\d+$/.test(val), {
      message: "Phone number must start with 0",
    }),
});

type DisburserFormValues = z.infer<typeof formSchema>;

type Disburser = DisburserFormValues & {
  id: string;
  password: string;
};

const ManageDisbursers = () => {
  const [disbursers, setDisbursers] = useState<Disburser[]>([
    { 
      id: "1", 
      name: "John Disburser", 
      region: "Mwale", 
      phone: "0712345678", 
      password: "Pass123" 
    },
    { 
      id: "2", 
      name: "Anna Helper", 
      region: "Mwale", 
      phone: "0723456789", 
      password: "Pass123" 
    },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentDisburser, setCurrentDisburser] = useState<Disburser | null>(null);
  const { toast } = useToast();

  const form = useForm<DisburserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      region: "",
      phone: "",
    },
  });

  const openAddDialog = () => {
    form.reset();
    setIsEditMode(false);
    setCurrentDisburser(null);
    setIsOpen(true);
  };

  const openEditDialog = (disburser: Disburser) => {
    form.reset({
      name: disburser.name,
      region: disburser.region,
      phone: disburser.phone,
    });
    setIsEditMode(true);
    setCurrentDisburser(disburser);
    setIsOpen(true);
  };

  const onSubmit = (data: DisburserFormValues) => {
    if (isEditMode && currentDisburser) {
      // Update existing disburser
      setDisbursers(
        disbursers.map((d) =>
          d.id === currentDisburser.id
            ? { ...d, ...data }
            : d
        )
      );
      toast({
        title: "Disburser Updated",
        description: `${data.name} has been updated successfully.`,
      });
    } else {
      // Add new disburser
      const newDisburser: Disburser = {
        id: Date.now().toString(),
        ...data,
        password: "Pass123", // Default password
      };
      setDisbursers([...disbursers, newDisburser]);
      toast({
        title: "Disburser Added",
        description: `${data.name} has been added successfully with default password: Pass123`,
      });
    }
    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    const disburserToDelete = disbursers.find(d => d.id === id);
    if (disburserToDelete) {
      setDisbursers(disbursers.filter((d) => d.id !== id));
      toast({
        title: "Disburser Removed",
        description: `${disburserToDelete.name} has been removed from the system.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Manage Disbursers</h2>
          <p className="text-gray-600">Add, edit or remove disbursers from the system</p>
        </div>
        <Button onClick={openAddDialog} className="bg-secure-DEFAULT hover:bg-secure-dark">
          <Plus className="mr-2 h-4 w-4" /> Add Disburser
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Default Password</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {disbursers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No disbursers found. Add your first disburser to get started.
                </TableCell>
              </TableRow>
            ) : (
              disbursers.map((disburser) => (
                <TableRow key={disburser.id}>
                  <TableCell className="font-medium">{disburser.name}</TableCell>
                  <TableCell>{disburser.region}</TableCell>
                  <TableCell>{disburser.phone}</TableCell>
                  <TableCell>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      {disburser.password}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(disburser)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(disburser.id)}
                      className="text-red-500 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Disburser" : "Add New Disburser"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Update the disburser's details below."
                : "Add a new disburser who can register beneficiaries and allocate resources."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Disburser Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormDescription>
                      Full name of the disburser
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <FormControl>
                      <Input placeholder="Mwale" {...field} />
                    </FormControl>
                    <FormDescription>
                      The region where this disburser will operate
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="0712345678" {...field} />
                    </FormControl>
                    <FormDescription>
                      Phone number used for login (must start with 0)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isEditMode && (
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  <p className="font-medium">Default Password</p>
                  <p className="text-gray-500">
                    The default password "Pass123" will be assigned to this disburser.
                    They will not be able to change it.
                  </p>
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-secure-DEFAULT hover:bg-secure-dark">
                  {isEditMode ? "Update Disburser" : "Add Disburser"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageDisbursers;
