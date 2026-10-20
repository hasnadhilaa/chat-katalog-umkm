"use server";

import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";

export async function masukAdmin(prevStateOrFormData, maybeFormData) {
  const formData =
    maybeFormData instanceof FormData ? maybeFormData : prevStateOrFormData;

  const email = formData?.get("email")?.toString().trim();
  const password = formData?.get("password")?.toString();

  if (!email || !password) {
    const errorMsg = "Email dan password wajib diisi.";
    if (maybeFormData instanceof FormData) {
      return { error: errorMsg };
    }
    redirect(`/admin/login?error=${encodeURIComponent(errorMsg)}`);
  }

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const errorMsg = "Email atau password salah. Silakan coba lagi.";
    if (maybeFormData instanceof FormData) {
      return { error: errorMsg };
    }
    redirect(`/admin/login?error=${encodeURIComponent(errorMsg)}`);
  }

  redirect("/admin");
}

export async function keluarAdmin() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

