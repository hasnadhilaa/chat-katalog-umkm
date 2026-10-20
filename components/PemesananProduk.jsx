"use client";

import { useState } from "react";
import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";

export default function PemesananProduk({ produk }) {
  const [jumlah, setJumlah] = useState(1);

  const hargaTotal = produk.harga * jumlah;
  const pesan = jumlah > 1
    ? `Halo, saya ingin memesan ${jumlah}x ${produk.nama} seharga ${formatRupiah(hargaTotal)}.`
    : `Halo, saya ingin memesan ${produk.nama} seharga ${formatRupiah(produk.harga)}.`;

  const url = `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(pesan)}`;

  return (
    <div className="flex flex-col gap-4">
      {/* Pilih jumlah */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="jumlah" className="text-sm font-semibold">
          Jumlah
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setJumlah((j) => Math.max(1, j - 1))}
            aria-label="Kurangi jumlah"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-garis bg-latar text-lg font-bold hover:border-utama hover:text-utama transition-colors"
          >
            −
          </button>
          <input
            id="jumlah"
            type="number"
            min={1}
            value={jumlah}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val >= 1) setJumlah(val);
            }}
            className="w-16 rounded-lg border border-garis bg-latar px-3 py-1.5 text-center text-base font-semibold text-teks focus:border-utama focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setJumlah((j) => j + 1)}
            aria-label="Tambah jumlah"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-garis bg-latar text-lg font-bold hover:border-utama hover:text-utama transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Total harga (jika jumlah > 1) */}
      {jumlah > 1 && (
        <p className="text-sm text-teks-lembut">
          Total:{" "}
          <span className="font-bold text-harga">{formatRupiah(hargaTotal)}</span>
        </p>
      )}

      {/* Tombol WhatsApp */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap transition-colors sm:w-auto"
      >
        Pesan via WhatsApp
      </a>
    </div>
  );
}

