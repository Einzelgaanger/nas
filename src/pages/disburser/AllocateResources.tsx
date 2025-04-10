
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { Check, ChevronsUpDown, Package, Search, AlertTriangle } from "lucide-react";
import { useUserInfo } from "@/hooks/useUserInfo";
import { cn } from "@/lib/utils";

// Define the beneficiary schema
type Beneficiary = {
  id: string;
  name: string;
  estimatedAge: number;
  height: number;
  uniqueIdentifiers: string;
  region: string;
  lastAllocation?: string; // Date string of last allocation if any
};

// Define mockup goods available in the region
type GoodPackage = {
  id: string;
  name: string;
  description: string;
  items: string[];
};

// Mock beneficiaries data
const mockBeneficiaries: Beneficiary[] = [
  {
    id: "b1",
    name: "Ahmed Mohamad",
    estimatedAge: 32,
    height: 175,
    uniqueIdentifiers: "Scar on left cheek, missing front tooth",
    region: "Mwale",
  },
  {
    id: "b2",
    name: "Sarah Nyambura",
    estimatedAge: 45,
    height: 162,
    uniqueIdentifiers: "Burn marks on right arm, traditional tattoo on wrist",
    region: "Mwale",
    lastAllocation: "2023-04-08T14:30:00Z",
  },
  {
    id: "b3",
    name: "Joseph Kamau",
    estimatedAge: 28,
    height: 180,
    uniqueIdentifiers: "Limp in right leg, surgical scar on knee",
    region: "Mwale",
  },
  {
    id: "b4",
    name: "Mary Wanjiku",
    estimatedAge: 56,
    height: 158,
    uniqueIdentifiers: "Partially blind in left eye, walks with a cane",
    region: "Mwale",
    lastAllocation: "2023-04-09T09:15:00Z",
  },
];

// Mock goods packages for the Mwale region
const regionGoods: GoodPackage[] = [
  {
    id: "g1",
    name: "Standard Food Package",
    description: "One week supply of essential food items",
    items: ["10kg Rice", "5kg Flour", "2L Cooking Oil", "2kg Sugar", "1kg Salt"],
  },
  {
    id: "g2",
    name: "Hygiene Kit",
    description: "Basic hygiene supplies",
    items: ["Soap (3 bars)", "Toothbrush", "Toothpaste", "Sanitizer", "Face masks (10)"],
  },
  {
    id: "g3",
    name: "Baby Care Package",
    description: "Supplies for infants and young children",
    items: ["Baby formula", "Diapers", "Baby soap", "Baby clothes"],
  },
  {
    id: "g4",
    name: "Medical Kit",
    description: "Basic medical supplies",
    items: ["Bandages", "Antiseptic", "Pain relievers", "Fever medication"],
  },
];

const formSchema = z.object({
  beneficiaryId: z.string({
    required_error: "Please select a beneficiary",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const AllocateResources = () => {
  const [isAllocating, setIsAllocating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState(mockBeneficiaries);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [open, setOpen] = useState(false);
  const { user } = useUserInfo();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      beneficiaryId: "",
    },
  });

  // Filter beneficiaries based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredBeneficiaries(mockBeneficiaries);
      return;
    }

    const filtered = mockBeneficiaries.filter((b) => 
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.uniqueIdentifiers.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredBeneficiaries(filtered);
  }, [searchTerm]);

  const onSubmit = async (data: FormValues) => {
    setIsAllocating(true);
    
    try {
      // Find the selected beneficiary
      const beneficiary = mockBeneficiaries.find(b => b.id === data.beneficiaryId);
      if (!beneficiary) {
        throw new Error("Beneficiary not found");
      }
      
      setSelectedBeneficiary(beneficiary);
      
      // Check for recent allocation (fraud detection)
      if (beneficiary.lastAllocation) {
        const lastAllocationDate = new Date(beneficiary.lastAllocation);
        const now = new Date();
        const timeDiff = now.getTime() - lastAllocationDate.getTime();
        const daysDiff = timeDiff / (1000 * 3600 * 24);
        
        // If less than 1 day since last allocation, show error
        if (daysDiff < 1) {
          setShowError(true);
          setShowSuccess(false);
          
          // Log fraud attempt (visible to admin only)
          console.log("FRAUD ATTEMPT:", {
            beneficiaryId: beneficiary.id,
            beneficiaryName: beneficiary.name,
            disburserName: user?.name,
            disburserRegion: user?.region,
            timestamp: new Date().toISOString(),
            location: "GPS would be captured here",
            previousAllocation: beneficiary.lastAllocation
          });
          
          // For disburser, show "server error" message
          toast({
            title: "Server Error",
            description: "The system is temporarily unavailable. Please try again later.",
            variant: "destructive",
          });
          
          return;
        }
      }
      
      // Success path - simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setShowSuccess(true);
      setShowError(false);
      
      toast({
        title: "Resources Allocated",
        description: `Aid package has been successfully allocated to ${beneficiary.name}.`,
      });
      
      // Reset form
      form.reset();
      
    } catch (error) {
      console.error("Allocation error:", error);
      toast({
        title: "Allocation Failed",
        description: "There was an error allocating resources. Please try again.",
        variant: "destructive",
      });
      setShowSuccess(false);
      setShowError(false);
    } finally {
      setIsAllocating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Allocate Resources</h2>
        <p className="text-gray-600">Distribute aid packages to registered beneficiaries</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" /> Find Beneficiary
            </CardTitle>
            <CardDescription>
              Search and select a registered beneficiary to allocate resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="beneficiaryId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Beneficiary Selection</FormLabel>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? mockBeneficiaries.find(
                                    (b) => b.id === field.value
                                  )?.name
                                : "Select a beneficiary"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" align="start">
                          <Command>
                            <CommandInput 
                              placeholder="Search beneficiaries..." 
                              onValueChange={setSearchTerm}
                            />
                            <CommandList>
                              <CommandEmpty>No beneficiaries found.</CommandEmpty>
                              <CommandGroup>
                                {filteredBeneficiaries.map((beneficiary) => (
                                  <CommandItem
                                    value={beneficiary.name}
                                    key={beneficiary.id}
                                    onSelect={() => {
                                      form.setValue("beneficiaryId", beneficiary.id);
                                      setOpen(false);
                                    }}
                                    className="flex flex-col items-start py-2"
                                  >
                                    <div className="flex w-full justify-between items-center">
                                      <span className="font-medium">{beneficiary.name}</span>
                                      {field.value === beneficiary.id && (
                                        <Check className="h-4 w-4" />
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Age: ~{beneficiary.estimatedAge}, 
                                      Height: {beneficiary.height}cm
                                    </div>
                                    <div className="text-xs text-gray-500 truncate max-w-full">
                                      {beneficiary.uniqueIdentifiers}
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Only registered beneficiaries will appear in this list
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("beneficiaryId") && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h4 className="font-medium mb-2">Selected Beneficiary Details:</h4>
                    {(() => {
                      const selected = mockBeneficiaries.find(
                        (b) => b.id === form.getValues("beneficiaryId")
                      );
                      if (!selected) return null;
                      
                      return (
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">Name:</span> {selected.name}</p>
                          <p><span className="font-medium">Est. Age:</span> {selected.estimatedAge}</p>
                          <p><span className="font-medium">Height:</span> {selected.height}cm</p>
                          <p><span className="font-medium">Unique Identifiers:</span> {selected.uniqueIdentifiers}</p>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-secure-DEFAULT hover:bg-secure-dark"
                  disabled={isAllocating || !form.watch("beneficiaryId")}
                >
                  {isAllocating ? "Processing..." : "Allocate Resources"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {showSuccess && selectedBeneficiary && (
          <Card className="bg-green-50 border-green-100">
            <CardHeader>
              <CardTitle className="text-green-700">
                Resource Allocation Successful
              </CardTitle>
              <CardDescription>
                Aid packages have been allocated to {selectedBeneficiary.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center py-2">
                <div className="bg-green-100 p-3 rounded-full mb-3">
                  <Package className="h-8 w-8 text-green-600" />
                </div>
                <p className="font-medium text-center">
                  The following packages have been allocated:
                </p>
              </div>
              
              <div className="space-y-3">
                {regionGoods.slice(0, 2).map((goods) => (
                  <div 
                    key={goods.id} 
                    className="bg-white p-3 rounded-md border border-green-100"
                  >
                    <p className="font-medium">{goods.name}</p>
                    <p className="text-sm text-gray-600">{goods.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {goods.items.map((item, idx) => (
                        <span 
                          key={idx}
                          className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-secure-light"
                onClick={() => {
                  setShowSuccess(false);
                  setSelectedBeneficiary(null);
                }}
              >
                Allocate to Another Beneficiary
              </Button>
            </CardFooter>
          </Card>
        )}

        {showError && (
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-gray-800">Server Connection Issue</CardTitle>
              <CardDescription>
                The system is currently unavailable
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6 space-y-4">
                <div className="bg-gray-100 p-3 rounded-full">
                  <AlertTriangle className="h-12 w-12 text-gray-400" />
                </div>
                <p className="font-medium text-center">
                  We're experiencing technical difficulties
                </p>
                <p className="text-sm text-gray-600 text-center">
                  The server is currently slow or unresponsive. Please try again later or contact technical support if the problem persists.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                variant="outline"
                onClick={() => setShowError(false)}
              >
                Try Again Later
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AllocateResources;
