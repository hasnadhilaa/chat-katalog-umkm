"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

export async function gantiPassword(prevStateOrFormData, maybeFormData) {
  const formData =
    maybeFormData instanceof FormData ? maybeFormData : prevStateOrFormData;

  const passwordBaru = formData?.get("password_baru")?.toString();
  const konfirmasiPassword = formData?.get("konfirmasi_password")?.toString();

  if (!passwordBaru || !konfirmasiPassword) {
    return { error: "Password baru dan konfirmasi password wajib diisi." };
  }

  if (passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Konfirmasi password tidak sama dengan password baru." };
  }

  const supabase = await createSessionClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Sesi admin tidak ditemukan. Silakan login terlebih dahulu." };
  }

  const { error } = await supabase.auth.updateUser({
    password: passwordBaru,
  });

  if (error) {
    return { error: `Gagal mengganti password: ${error.message}` };
  }

  return { success: "Password berhasil diganti." };
}

export async function tambahProduk(prevStateOrFormData, maybeFormData) {
  const formData =
    maybeFormData instanceof FormData ? maybeFormData : prevStateOrFormData;

  const supabase = await createSessionClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Tidak diizinkan: Anda harus login sebagai admin." };
  }

  const nama = formData?.get("nama")?.toString().trim();
  const hargaRaw = formData?.get("harga");
  const harga = parseInt(hargaRaw, 10);
  const kategori = formData?.get("kategori")?.toString().trim();
  const foto_url = formData?.get("foto_url")?.toString().trim();
  const deskripsi = formData?.get("deskripsi")?.toString().trim();

  if (!nama) {
    return { error: "Nama produk wajib diisi." };
  }

  if (isNaN(harga) || harga < 0) {
    return { error: "Harga harus berupa angka dan tidak boleh negatif." };
  }

  const { error: insertError } = await supabase.from("produk").insert({
    nama,
    harga,
    kategori: kategori || null,
    foto_url: foto_url || null,
    deskripsi: deskripsi || null,
  });

  if (insertError) {
    return { error: `Gagal menyimpan produk: ${insertError.message}` };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}
