const CACHE_NAME = "loadzone-v1";
const STATIC_ASSETS = ["/"];
const TOKEN_STORE = "player-token";

async function getStoredToken() {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(TOKEN_STORE, "readonly");
    const store = tx.objectStore(TOKEN_STORE);
    return new Promise((resolve) => {
      const request = store.get("token");
      request.onsuccess = () => resolve(request.result?.value ?? null);
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SET_TOKEN" && event.data.token) {
    event.waitUntil(
      openIndexedDB().then((db) => {
        const tx = db.transaction(TOKEN_STORE, "readwrite");
        tx.objectStore(TOKEN_STORE).put({
          id: "token",
          value: event.data.token,
        });
      })
    );
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  if (request.url.includes("/_next/")) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) {
          return cached;
        }

        const response = await fetch(request);
        if (response.ok) {
          cache.put(request, response.clone());
        }
        return response;
      })
    );
    return;
  }

  event.respondWith(fetch(request).catch(() => caches.match(request)));
});

self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [100, 50, 100],
    data: { url: data.url || "/" },
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "LoadZone", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const dataUrl = event.notification.data?.url || "/";

  event.waitUntil(
    getStoredToken().then((token) => {
      const url = token && dataUrl === "/" ? `/${token}` : dataUrl;

      return self.clients.matchAll({ type: "window" }).then((clients) => {
        for (const client of clients) {
          if (client.url.includes(url) && "focus" in client) {
            return client.focus();
          }
        }
        return self.clients.openWindow(url);
      });
    })
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-entries") {
    event.waitUntil(syncPendingEntries());
  }
});

async function syncPendingEntries() {
  const db = await openIndexedDB();
  const tx = db.transaction("pending-entries", "readonly");
  const store = tx.objectStore("pending-entries");
  const entries = await getAllFromStore(store);

  for (const entry of entries) {
    try {
      const response = await fetch(entry.url, {
        method: "POST",
        body: entry.body,
        headers: entry.headers,
      });

      if (response.ok) {
        const deleteTx = db.transaction("pending-entries", "readwrite");
        deleteTx.objectStore("pending-entries").delete(entry.id);
      }
    } catch {
      // Will retry on next sync
    }
  }
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("loadzone-offline", 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("pending-entries")) {
        db.createObjectStore("pending-entries", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
      if (!db.objectStoreNames.contains(TOKEN_STORE)) {
        db.createObjectStore(TOKEN_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
