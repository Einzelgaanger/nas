
import { supabase } from "@/integrations/supabase/client";

// Function to verify if setup is already complete
export const isSetupComplete = async (): Promise<boolean> => {
  // Check if admin exists
  const { data: admins, error: adminError } = await supabase
    .from("admins")
    .select("id")
    .limit(1);

  if (adminError) {
    console.error("Error checking admins:", adminError);
    return false;
  }

  if (admins && admins.length > 0) {
    return true;
  }

  return false;
};

// Function to perform initial database setup
export const performInitialSetup = async (): Promise<boolean> => {
  console.log("Performing initial setup...");
  
  try {
    // Create default region first
    const { data: regionData, error: regionError } = await supabase
      .from("regions")
      .insert([{ name: "Default Region" }])
      .select();
      
    if (regionError) {
      console.error("Error creating region:", regionError);
      return false;
    }
    
    if (!regionData || regionData.length === 0) {
      console.error("No region created");
      return false;
    }
    
    const regionId = regionData[0].id;
    console.log("Created region with ID:", regionId);
    
    // Create default admin
    const { error: adminError } = await supabase
      .from("admins")
      .insert([
        { 
          username: "admin", 
          password: "NGO123",
          name: "Default Admin"
        }
      ]);
      
    if (adminError) {
      console.error("Error creating admin:", adminError);
      return false;
    }
    
    console.log("Created default admin");
    
    // Create default disburser
    const { error: disburserError } = await supabase
      .from("disbursers")
      .insert([
        { 
          name: "Sample Disburser", 
          phone_number: "1234567890",
          password: "pass123",
          region_id: regionId
        }
      ]);
      
    if (disburserError) {
      console.error("Error creating disburser:", disburserError);
      return false;
    }
    
    console.log("Created default disburser");
    
    return true;
  } catch (error) {
    console.error("Setup error:", error);
    return false;
  }
};

// Helper function to retry the setup a few times
export const ensureInitialSetup = async (): Promise<boolean> => {
  const isComplete = await isSetupComplete();
  
  if (isComplete) {
    console.log("Setup is already complete");
    return true;
  }
  
  // Try setup up to 3 times
  for (let i = 0; i < 3; i++) {
    console.log(`Attempt ${i+1} to complete setup...`);
    const success = await performInitialSetup();
    
    if (success) {
      console.log("Setup completed successfully");
      return true;
    }
    
    // Wait a bit before trying again
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.error("Failed to complete setup after multiple attempts");
  return false;
};
