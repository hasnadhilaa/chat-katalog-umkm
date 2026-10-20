import Link from "next/link";
import KartuProduk from "@/components/KartuProduk";
import { toko } from "@/lib/toko";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanKatalog({ searchParams }) {
  const params = await searchParams;
  const query = (params?.q || params?.cari || "").trim();
  const kategoriAktif = (params?.kategori || "").trim();

  let daftarProduk = [];
  let daftarKategori = [];
  let pesanError = null;

  try {
    const supabase = createServerClient();

    // Ambil semua kategori unik dari database
    const { data: dataKategori } = await supabase
      .from("produk")
      .select("kategori");

    if (dataKategori) {
      daftarKategori = [
        ...new Set(dataKategori.map((p) => p.kategori).filter(Boolean)),
      ].sort();
    }

    // Bangun query produk dengan filter kategori dan pencarian nama
    let dbQuery = supabase
      .from("produk")
      .select("*")
      .order("id", { ascending: true });

    if (kategoriAktif) {
      dbQuery = dbQuery.eq("kategori", kategoriAktif);
    }

    if (query) {
      dbQuery = dbQuery.ilike("nama", `%${query}%`);
    }

    const { data, error } = await dbQuery;

    if (error) {
      pesanError = `Gagal memuat produk: ${error.message}`;
    } else {
      daftarProduk = data || [];
    }
  } catch (err) {
    pesanError = `Gagal memuat produk: ${err.message || "Terjadi kesalahan pada server."}`;
  }

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="judul-produk" className="text-xl font-bold">
            Produk kami
          </h2>

          {/* Form Pencarian */}
          <form method="GET" action="/" className="flex items-center gap-2">
            {kategoriAktif && (
              <input type="hidden" name="kategori" value={kategoriAktif} />
            )}
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Cari nama produk..."
              className="w-full sm:w-64 rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-utama px-4 py-2 text-sm font-semibold text-white hover:bg-utama-gelap transition-colors cursor-pointer"
            >
              Cari
            </button>
            {query && (
              <Link
                href={kategoriAktif ? `/?kategori=${encodeURIComponent(kategoriAktif)}` : "/"}
                className="text-xs text-teks-lembut underline hover:text-utama whitespace-nowrap"
              >
                Reset
              </Link>
            )}
          </form>
        </div>

        {/* Filter Kategori */}
        {daftarKategori.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={query ? `/?q=${encodeURIComponent(query)}` : "/"}
              className={`rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                !kategoriAktif
                  ? "bg-utama text-white"
                  : "border border-garis bg-latar text-teks hover:border-utama hover:text-utama"
              }`}
            >
              Semua
            </Link>
            {daftarKategori.map((kat) => {
              const isAktif = kategoriAktif === kat;
              const url = isAktif
                ? query
                  ? `/?q=${encodeURIComponent(query)}`
                  : "/"
                : `/?kategori=${encodeURIComponent(kat)}${query ? `&q=${encodeURIComponent(query)}` : ""}`;

              return (
                <Link
                  key={kat}
                  href={url}
                  className={`rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                    isAktif
                      ? "bg-utama text-white"
                      : "border border-garis bg-latar text-teks hover:border-utama hover:text-utama"
                  }`}
                >
                  {kat}
                </Link>
              );
            })}
          </div>
        )}

        {/* Daftar Produk / Pesan Error / Kosong */}
        {pesanError ? (
          <div className="rounded-xl border border-garis bg-permukaan p-6 text-center text-bahaya">
            <p className="font-semibold">{pesanError}</p>
          </div>
        ) : daftarProduk.length === 0 ? (
          <p className="rounded-xl border border-dashed border-garis bg-permukaan p-8 text-center text-teks-lembut">
            Belum ada produk yang sesuai.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {daftarProduk.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
