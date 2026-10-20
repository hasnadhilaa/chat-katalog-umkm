// Service worker agar katalog bisa dipasang (PWA) dan tetap terbuka saat sinyal lemah.
// Strategi: jaringan lebih dulu, simpan salinan, pakai simpanan saat offline.
const CACHE = "katalog-umkm-v1";

self.addEventListener("install", (event) => {
  // Pastikan halaman awal (start_url) selalu tersedia saat offline.
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(["/", "/manifest.webmanifest"]))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((kunci) =>
        Promise.all(
          kunci.filter((kunciLama) => kunciLama !== CACHE).map((kunciLama) => caches.delete(kunciLama))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Halaman admin tidak boleh disimpan di cache (berisi data sensitif).
  const halamanAdmin = url.pathname.startsWith("/admin");

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && !halamanAdmin) {
          const salinan = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, salinan));
        }
        return response;
      })
      .catch(async () => {
        const tersimpan = await caches.match(request);
        if (tersimpan) return tersimpan;
        if (request.mode === "navigate") {
          const beranda = await caches.match("/");
          if (beranda) return beranda;
        }
        return Response.error();
      })
  );
});
