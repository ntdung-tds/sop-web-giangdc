const LEGACY_CACHE_PREFIX = "sop-ui-";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(LEGACY_CACHE_PREFIX))
          .map((key) => caches.delete(key)),
      );

      await self.clients.claim();
      const clients = await self.clients.matchAll({ type: "window" });
      await self.registration.unregister();

      await Promise.all(
        clients.map((client) => {
          if ("navigate" in client) {
            return client.navigate(client.url);
          }
          return Promise.resolve();
        }),
      );
    })(),
  );
});
