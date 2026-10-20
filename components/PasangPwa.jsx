"use client";

import { useEffect } from "react";

// Mendaftarkan service worker supaya katalog bisa di-install ke layar HP (PWA).
export default function PasangPwa() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const daftarkan = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Pemasangan service worker gagal tidak mengganggu katalog.
      });
    };

    if (document.readyState === "complete") {
      daftarkan();
    } else {
      window.addEventListener("load", daftarkan);
      return () => window.removeEventListener("load", daftarkan);
    }
  }, []);

  return null;
}
