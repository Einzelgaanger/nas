
import { supabase } from "@/integrations/supabase/client";
import { Disburser, Region } from "@/types/database";

export const fetchDisbursers = async (): Promise<Disburser[]> => {
  const { data, error } = await supabase
    .from("disbursers")
    .select(`
      *,
      regions:region_id (name)
    `);

  if (error) {
    console.error("Error fetching disbursers:", error);
    throw new Error(error.message);
  }

  return data || [];
};

export const fetchRegions = async (): Promise<Region[]> => {
  const { data, error } = await supabase
    .from("regions")
    .select("*");

  if (error) {
    console.error("Error fetching regions:", error);
    throw new Error(error.message);
  }

  return data || [];
};

export const createDisburser = async (disburser: Partial<Disburser>): Promise<Disburser> => {
  const { data, error } = await supabase
    .from("disbursers")
    .insert([disburser])
    .select()
    .single();

  if (error) {
    console.error("Error creating disburser:", error);
    throw new Error(error.message);
  }

  return data;
};

export const updateDisburser = async (id: string, disburser: Partial<Disburser>): Promise<Disburser> => {
  const { data, error } = await supabase
    .from("disbursers")
    .update(disburser)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating disburser:", error);
    throw new Error(error.message);
  }

  return data;
};

export const deleteDisburser = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("disbursers")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting disburser:", error);
    throw new Error(error.message);
  }
};

export const createRegion = async (region: Partial<Region>): Promise<Region> => {
  const { data, error } = await supabase
    .from("regions")
    .insert([region])
    .select()
    .single();

  if (error) {
    console.error("Error creating region:", error);
    throw new Error(error.message);
  }

  return data;
};
