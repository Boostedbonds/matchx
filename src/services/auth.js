import { supabase } from "./supabase";

export async function loginWithMagicLink(email) {
  try {
    const { error, data } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      console.error("Magic link error:", error);
      return { 
        success: false, 
        message: error.message || "Failed to send magic link" 
      };
    }

    console.log("Magic link sent to:", email);
    return { 
      success: true, 
      message: "Check your email for the magic link!",
      data 
    };
  } catch (err) {
    console.error("Login error:", err);
    return { 
      success: false, 
      message: err.message || "An error occurred" 
    };
  }
}

export async function createOrUpdatePlayer(userId, email) {
  try {
    // First, check if player already exists
    const { data: existing, error: checkError } = await supabase
      .from("players")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error("Check error:", checkError);
      throw checkError;
    }

    // If player exists, return success
    if (existing) {
      console.log("Player profile already exists");
      return { success: true, message: "Profile already exists" };
    }

    // Create new player profile with minimal data
    const playerName = email.split("@")[0]; // Use part of email as name

    const { data, error } = await supabase
      .from("players")
      .insert([
        {
          user_id: userId,
          email: email,
          name: playerName,
          skill_level: "beginner"
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      
      // Return error but don't throw - user can still access dashboard
      return { 
        success: false, 
        message: `Could not save profile: ${error.message}`,
        data: null
      };
    }

    console.log("Player profile created:", data);
    return { 
      success: true, 
      message: "Profile created successfully",
      data 
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { 
      success: false, 
      message: err.message || "An unexpected error occurred" 
    };
  }
}

export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true, message: "Logged out successfully" };
  } catch (err) {
    console.error("Logout error:", err);
    return { success: false, message: err.message };
  }
}