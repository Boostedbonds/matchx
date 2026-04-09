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

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Logout error:", error);
    return { success: false, message: error.message };
  }
  return { success: true, message: "Logged out successfully" };
}