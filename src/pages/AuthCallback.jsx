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
      return { 
        success: false, 
        message: error.message || "Failed to send magic link" 
      };
    }

    return { 
      success: true, 
      message: "Magic link sent! Check your email",
      data 
    };
  } catch (err) {
    return { 
      success: false, 
      message: err.message || "An error occurred" 
    };
  }
}

export async function createPlayerProfile(userId, email, playerName = null) {
  try {
    // Check if player already exists
    const { data: existing } = await supabase
      .from("players")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existing) {
      return { success: true, message: "Profile already exists" };
    }

    // Create new player profile
    const { data, error } = await supabase
      .from("players")
      .insert([
        {
          user_id: userId,
          email: email,
          name: playerName || email.split("@")[0], // Use part of email as default name
          skill_level: "beginner",
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error("Profile creation error:", error);
      return { 
        success: false, 
        message: error.message || "Failed to create profile" 
      };
    }

    return { 
      success: true, 
      message: "Profile created successfully",
      data: data?.[0]
    };
  } catch (err) {
    console.error("Error creating profile:", err);
    return { 
      success: false, 
      message: err.message || "An error occurred" 
    };
  }
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Logout error:", error);
    return { success: false, message: error.message };
  }
  return { success: true, message: "Logged out successfully" };
}