
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
    // Create default admin first (bypassing RLS)
    const { error: adminError } = await supabase.auth.signUp({
      email: 'admin@example.com',
      password: 'NGO123',
      options: {
        data: {
          name: "Default Admin",
          role: "admin"
        }
      }
    });
      
    if (adminError) {
      console.error("Error creating admin authentication:", adminError);
      // Continue anyway as we'll create the local admin record
    }
    
    // Create default admin in admins table
    const { error: adminDbError } = await supabase
      .from("admins")
      .insert([
        { 
          username: "admin", 
          password: "NGO123",
          name: "Default Admin"
        }
      ]);
      
    if (adminDbError) {
      console.error("Error creating admin in database:", adminDbError);
      return false;
    }
    
    console.log("Created default admin");
    
    // Create default region
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
    
    // Create default disburser
    const { error: disburserAuthError } = await supabase.auth.signUp({
      email: 'disburser@example.com',
      password: 'pass123',
      options: {
        data: {
          name: "Sample Disburser",
          role: "disburser"
        }
      }
    });
    
    if (disburserAuthError) {
      console.error("Error creating disburser authentication:", disburserAuthError);
      // Continue anyway as we'll create the local disburser record
    }
    
    // Create default disburser in disbursers table
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

// Modified approach to check for any existing data first
export const ensureInitialSetup = async (): Promise<boolean> => {
  try {
    console.log("Checking for initial setup...");
    
    // Check if admin exists
    const { data: admins, error: adminError } = await supabase
      .from("admins")
      .select("id, username, name")
      .limit(1);

    if (adminError) {
      console.error("Error checking admins:", adminError);
    } else {
      console.log(`Found ${admins?.length || 0} existing admin(s)`);
      if (admins && admins.length > 0) {
        return true;
      }
      console.log("No admin found, creating default admin...");
    }
    
    // Check if regions exist
    const { data: regions, error: regionError } = await supabase
      .from("regions")
      .select("id, name")
      .limit(1);

    if (regionError) {
      console.error("Error checking regions:", regionError);
    } else {
      console.log(`Found ${regions?.length || 0} existing region(s)`);
      if (regions && regions.length === 0) {
        console.log("No regions found, creating default region...");
      }
    }
    
    // Check if disbursers exist
    const { data: disbursers, error: disburserError } = await supabase
      .from("disbursers")
      .select("id, name")
      .limit(5);

    if (disburserError) {
      console.error("Error checking disbursers:", disburserError);
    } else {
      console.log(`Found ${disbursers?.length || 0} existing disburser(s)`);
    }
    
    // If we didn't find any admins, try to create them
    if (!admins || admins.length === 0) {
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
    }
    
    return true;
  } catch (error) {
    console.error("Setup error:", error);
    return false;
  }
};
