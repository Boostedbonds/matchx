import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase env variables are missing");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// ── Avatar pool (15 emoji avatars assigned at random to new players) ────────
const AVATAR_EMOJIS = [
  "🦅","🐯","🦁","🐉","🦊","🐺","🦈","🐻","🦋","🎯","⚡","🔥","💎","🏆","🌟"
];

export function getRandomDefaultAvatar() {
  return `emoji:${AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)]}`;
}


// ==============================
// 🔑 MASTER ACCESS CODE
// ==============================
const MASTER_CODE = "2011";
const ADMIN_CODE  = "ADMIN2011"; // Admin-specific code — gives isAdmin flag


// ==============================
// 🔐 EMAIL LOGIN (magic link)
// ==============================
export async function loginWithMagicLink(email) {
  try {
    const { error, data } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
    });
    if (error) return { success: false, message: error.message || "Failed to send magic link" };
    return { success: true, message: "Check your email for the magic link!", data };
  } catch (err) {
    return { success: false, message: err.message || "An error occurred" };
  }
}


// ==============================
// 🚀 ACCESS CODE LOGIN
// ==============================
export async function loginOrRegister(name, code) {
  try {
    const cleanName = name.trim();
    const cleanCode = code.trim();

    if (!cleanName) throw new Error("Name is required");
    if (!cleanCode) throw new Error("Access code is required");

    // Check for admin code first
    const isAdmin = cleanCode === ADMIN_CODE;

    // Validate master access code
    if (!isAdmin && cleanCode !== MASTER_CODE) {
      throw new Error("Invalid access code. Please try again.");
    }

    // Check if player exists
    const { data: existingPlayer, error: fetchError } = await supabase
      .from("players")
      .select("*")
      .eq("name", cleanName)
      .maybeSingle();

    if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

    // Existing player → LOGIN
    if (existingPlayer) {
      localStorage.setItem("player_id", existingPlayer.id);
      localStorage.setItem("player_name", existingPlayer.name);
      if (isAdmin) localStorage.setItem("is_admin", "true");
      else localStorage.removeItem("is_admin");

      return {
        player: { ...existingPlayer, isAdmin },
        isNew: false
      };
    }

    // New player → CREATE with random avatar
    const { data: newPlayer, error: insertError } = await supabase
      .from("players")
      .insert([{
        name: cleanName,
        access_code: cleanCode,
        skill_level: "beginner",
        elo: 1500,
        wins: 0,
        losses: 0,
        avatar_url: getRandomDefaultAvatar(),  // ← random avatar on creation
      }])
      .select()
      .single();

    if (insertError) throw new Error(insertError.message);

    localStorage.setItem("player_id", newPlayer.id);
    localStorage.setItem("player_name", newPlayer.name);
    if (isAdmin) localStorage.setItem("is_admin", "true");
    else localStorage.removeItem("is_admin");

    return {
      player: { ...newPlayer, isAdmin },
      isNew: true
    };

  } catch (err) {
    throw new Error(err.message || "Login failed");
  }
}


// ==============================
// 👤 EMAIL PLAYER PROFILE
// ==============================
export async function createOrUpdatePlayer(userId, email) {
  try {
    const { data: existing, error: checkError } = await supabase
      .from("players")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;
    if (existing) return { success: true, message: "Profile already exists" };

    const playerName = email.split("@")[0];

    const { data, error } = await supabase
      .from("players")
      .insert([{
        user_id: userId,
        email: email,
        name: playerName,
        skill_level: "beginner",
        elo: 1500,
        wins: 0,
        losses: 0,
        avatar_url: getRandomDefaultAvatar(),  // ← random avatar on creation
      }])
      .select()
      .single();

    if (error) return { success: false, message: error.message, data: null };
    return { success: true, message: "Profile created successfully", data };

  } catch (err) {
    return { success: false, message: err.message || "Unexpected error" };
  }
}


// ==============================
// 🚪 LOGOUT
// ==============================
export async function logout() {
  try {
    localStorage.removeItem("player_id");
    localStorage.removeItem("player_name");
    localStorage.removeItem("is_admin");

    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    return { success: true, message: "Logged out successfully" };
  } catch (err) {
    return { success: false, message: err.message };
  }
}


// ==============================
// 🔍 CHECK ADMIN STATUS
// ==============================
export function checkIsAdmin() {
  return localStorage.getItem("is_admin") === "true";
}