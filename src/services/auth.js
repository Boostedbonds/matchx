import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase env variables are missing");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// ==============================
// 🔑 MASTER ACCESS CODE
// ==============================
const MASTER_CODE = "2011";


// ==============================
// 🔐 EMAIL LOGIN (UNCHANGED)
// ==============================
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


// ==============================
// 🚀 ACCESS CODE LOGIN
// ==============================
export async function loginOrRegister(name, code) {
  try {
    const cleanName = name.trim();
    const cleanCode = code.trim();

    if (!cleanName) {
      throw new Error("Name is required");
    }

    if (!cleanCode) {
      throw new Error("Access code is required");
    }

    // 🔒 Validate master access code first
    if (cleanCode !== MASTER_CODE) {
      throw new Error("Invalid access code. Please try again.");
    }

    // 🔍 Check if player already exists with this name
    const { data: existingPlayer, error: fetchError } = await supabase
      .from("players")
      .select("*")
      .eq("name", cleanName)
      .maybeSingle();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Fetch error:", fetchError);
      throw fetchError;
    }

    // ✅ Existing user → LOGIN
    if (existingPlayer) {
      localStorage.setItem("player_id", existingPlayer.id);
      localStorage.setItem("player_name", existingPlayer.name);

      return {
        player: existingPlayer,
        isNew: false
      };
    }

    // 🆕 New user → CREATE
    const { data: newPlayer, error: insertError } = await supabase
      .from("players")
      .insert([
        {
          name: cleanName,
          access_code: cleanCode,
          skill_level: "beginner"
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error(insertError.message);
    }

    localStorage.setItem("player_id", newPlayer.id);
    localStorage.setItem("player_name", newPlayer.name);

    return {
      player: newPlayer,
      isNew: true
    };

  } catch (err) {
    console.error("Login/Register error:", err);
    throw new Error(err.message || "Login failed");
  }
}


// ==============================
// 👤 EMAIL PLAYER PROFILE (UNCHANGED)
// ==============================
export async function createOrUpdatePlayer(userId, email) {
  try {
    const { data: existing, error: checkError } = await supabase
      .from("players")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existing) {
      return { success: true, message: "Profile already exists" };
    }

    const playerName = email.split("@")[0];

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
      return { 
        success: false, 
        message: error.message,
        data: null
      };
    }

    return { 
      success: true, 
      message: "Profile created successfully",
      data 
    };

  } catch (err) {
    return { 
      success: false, 
      message: err.message || "Unexpected error"
    };
  }
}


// ==============================
// 🚪 LOGOUT
// ==============================
export async function logout() {
  try {
    localStorage.removeItem("player_id");
    localStorage.removeItem("player_name");

    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    return { success: true, message: "Logged out successfully" };
  } catch (err) {
    return { success: false, message: err.message };
  }
}