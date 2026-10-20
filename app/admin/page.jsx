import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { createSessionClient, createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanAdmin() {
  let daftarProduk = [];
  let pesanError = null;

  try {
    const supabase = await createSessionClient();
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      const fallbackClient = createServerClient();
      const { data: fallbackData, error: fallbackError } = await fallbackClient
        .from("produk")
        .select("*")
        .order("id", { ascending: true });

      if (fallbackError) {
        pesanError = `Gagal memuat produk: ${fallbackError.message}`;
      } else {
        daftarProduk = fallbackData || [];
      }
    } else {
      daftarProduk = data || [];
    }
  } catch (err) {
    try {
      const fallbackClient = createServerClient();
      const { data: fallbackData, error: fallbackError } = await fallbackClient
        .from("produk")
        .select("*")
        .order("id", { ascending: true });

      if (fallbackError) {
        pesanError = `Gagal memuat produk: ${err.message || fallbackError.message}`;
      } else {
        daftarProduk = fallbackData || [];
      }
    } catch (e) {
      pesanError = `Gagal memuat produk: ${err.message || e.message}`;
    }
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>

      {pesanError ? (
        <div className="rounded-xl border border-garis bg-permukaan p-6 text-center text-bahaya">
          <p className="font-semibold">{pesanError}</p>
        </div>
      ) : daftarProduk.length === 0 ? (
        <p className="rounded-xl border border-dashed border-garis bg-permukaan p-8 text-center text-teks-lembut">
          Belum ada produk
        </p>
      ) : (
        <TabelProduk daftarProduk={daftarProduk} />
      )}
    </div>
  );
}
