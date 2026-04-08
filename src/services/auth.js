import { supabase } from "./supabase";

export async function loginWithMagicLink(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin
    }
  });

  if (error) {
    alert(error.message);
  } else {
    alert("Check your email for login link");
  }
}