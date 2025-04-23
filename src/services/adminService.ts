import { supabase } from "@/integrations/supabase/client";
import { Disburser, Region } from "@/types/database";
import { Database } from "@/integrations/supabase/types";

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

export const createDisburser = async (disburser: Omit<Database["public"]["Tables"]["disbursers"]["Insert"], "id" | "created_at" | "updated_at">): Promise<Disburser> => {
  const { data, error } = await supabase
    .from("disbursers")
    .insert(disburser)
    .select()
    .single();

  if (error) {
    console.error("Error creating disburser:", error);
    throw new Error(error.message);
  }

  return data;
};

export const updateDisburser = async (id: string, disburser: Partial<Database["public"]["Tables"]["disbursers"]["Update"]>): Promise<Disburser> => {
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
  try {
    // First check if disburser has any beneficiaries
    const { data: beneficiaries, error: checkError } = await supabase
      .from('beneficiaries')
      .select('id, name')
      .eq('registered_by', id);

    if (checkError) throw checkError;

    if (beneficiaries && beneficiaries.length > 0) {
      throw new Error(
        `Cannot delete disburser: They have ${beneficiaries.length} registered beneficiaries. ` +
        `Please reassign or remove the beneficiaries first.`
      );
    }

    // If no beneficiaries, proceed with deletion
    const { error: deleteError } = await supabase
      .from('disbursers')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;
  } catch (error) {
    console.error('Error deleting disburser:', error);
    throw error;
  }
};

export const createRegion = async (region: Omit<Database["public"]["Tables"]["regions"]["Insert"], "id" | "created_at">): Promise<Region> => {
  const { data, error } = await supabase
    .from("regions")
    .insert(region)
    .select()
    .single();

  if (error) {
    console.error("Error creating region:", error);
    throw new Error(error.message);
  }

  return data;
};
