
import { supabase } from "@/integrations/supabase/client";
import { Beneficiary, Allocation, FraudAlert } from "@/types/database";
import { Database } from "@/integrations/supabase/types";

export const registerBeneficiary = async (beneficiary: Omit<Database["public"]["Tables"]["beneficiaries"]["Insert"], "id" | "created_at" | "updated_at">): Promise<Beneficiary> => {
  // Ensure region_id is a valid UUID
  if (!beneficiary.region_id || !isValidUUID(beneficiary.region_id)) {
    throw new Error(`Invalid region ID: ${beneficiary.region_id}`);
  }

  const { data, error } = await supabase
    .from("beneficiaries")
    .insert(beneficiary)
    .select()
    .single();

  if (error) {
    console.error("Error registering beneficiary:", error);
    throw new Error(error.message);
  }

  return data as Beneficiary;
};

export const fetchBeneficiariesByRegion = async (regionId: string): Promise<Beneficiary[]> => {
  // Ensure regionId is a valid UUID
  if (!regionId || !isValidUUID(regionId)) {
    console.error("Invalid region ID:", regionId);
    return [];
  }

  const { data, error } = await supabase
    .from("beneficiaries")
    .select("*")
    .eq("region_id", regionId);

  if (error) {
    console.error("Error fetching beneficiaries:", error);
    throw new Error(error.message);
  }

  return data as Beneficiary[];
};

// Helper function to validate UUIDs
const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const fetchBeneficiaryById = async (id: string): Promise<Beneficiary> => {
  const { data, error } = await supabase
    .from("beneficiaries")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching beneficiary:", error);
    throw new Error(error.message);
  }

  return data as Beneficiary;
};

export const fetchRegionalGoods = async (regionId: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from("regional_goods")
    .select(`
      *,
      goods_types:goods_type_id (name, description)
    `)
    .eq("region_id", regionId);

  if (error) {
    console.error("Error fetching regional goods:", error);
    throw new Error(error.message);
  }

  return data || [];
};

export const checkRecentAllocation = async (beneficiaryId: string, timeWindowMinutes = 5): Promise<boolean> => {
  // Calculate time threshold (now - X minutes)
  const threshold = new Date();
  threshold.setMinutes(threshold.getMinutes() - timeWindowMinutes);
  
  const { data, error } = await supabase
    .from("allocations")
    .select("id")
    .eq("beneficiary_id", beneficiaryId)
    .gt("allocated_at", threshold.toISOString())
    .limit(1);

  if (error) {
    console.error("Error checking recent allocations:", error);
    throw new Error(error.message);
  }

  // If data exists and has length > 0, there was a recent allocation
  return data && data.length > 0;
};

export const createAllocation = async (allocation: Omit<Database["public"]["Tables"]["allocations"]["Insert"], "id" | "allocated_at">): Promise<Allocation> => {
  const { data, error } = await supabase
    .from("allocations")
    .insert(allocation)
    .select()
    .single();

  if (error) {
    console.error("Error creating allocation:", error);
    throw new Error(error.message);
  }

  return data as Allocation;
};

export const createFraudAlert = async (alert: Omit<Database["public"]["Tables"]["fraud_alerts"]["Insert"], "id" | "attempted_at">): Promise<FraudAlert> => {
  const { data, error } = await supabase
    .from("fraud_alerts")
    .insert(alert)
    .select()
    .single();

  if (error) {
    console.error("Error creating fraud alert:", error);
    throw new Error(error.message);
  }

  return data as FraudAlert;
};
