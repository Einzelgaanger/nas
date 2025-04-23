import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

const RegionManager = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [newRegionName, setNewRegionName] = useState('');
  const { toast } = useToast();

  const createRegion = async () => {
    if (!newRegionName.trim()) {
      toast({
        title: "Error",
        description: "Region name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('regions')
        .insert({ name: newRegionName.trim() });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Region created successfully"
      });
      setNewRegionName('');
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating region:', error);
      toast({
        title: "Error",
        description: "Failed to create region",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Regions</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      {isCreating && (
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={newRegionName}
              onChange={(e) => setNewRegionName(e.target.value)}
              placeholder="Region name"
            />
            <Button onClick={createRegion}>Create</Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default RegionManager; 