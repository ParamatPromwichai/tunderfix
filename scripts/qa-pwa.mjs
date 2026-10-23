import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";

const root = new URL("../", import.meta.url);
const source = await readFile(new URL("public/sw.js", root), "utf8");
const handlers = new Map();
const cacheStores = new Map([
  ["thunderfix-pwa-old", new Map()],
  ["unrelated-app-cache", new Map()],
]);
const groups = [];
let claimed = 0,
  skipped = 0,
  cacheWrites = 0;
let network = async () => new Response("Fresh response");
const cacheApi = {
  open: async (name) => {
    if (!cacheStores.has(name)) cacheStores.set(name, new Map());
    const store = cacheStores.get(name);
    return {
      addAll: async (paths) => {
        for (const pathname of paths) {
          assert.ok(
            !pathname.startsWith("/api/") &&
              !pathname.startsWith("/dashboard/"),
          );
          const file = await readFile(new URL(`public${pathname}`, root));
          store.set(pathname, new Response(file));
          cacheWrites++;
        }
      },
    };
  },
  keys: async () => [...cacheStores.keys()],
  delete: async (name) => cacheStores.delete(name),
  match: async (request, options) => {
    const pathname =
      typeof request === "string" ? request : new URL(request.url).pathname;
    return cacheStores.get(options.cacheName)?.get(pathname)?.clone();
  },
};
vm.runInNewContext(source, {
  URL,
  Response,
  caches: cacheApi,
  fetch: (request) => network(request),
  self: {
    location: new URL("https://thunderfix.example/sw.js"),
    clients: { claim: async () => claimed++ },
    skipWaiting: async () => skipped++,
    addEventListener: (name, handler) => handlers.set(name, handler),
  },
});
async function lifecycle(name, data = {}) {
  let work;
  handlers.get(name)({
    ...data,
    waitUntil: (promise) => {
      work = promise;
    },
  });
  await work;
}
async function request(pathname, options = {}) {
  let response;
  const request = {
    url: new URL(pathname, "https://thunderfix.example").href,
    method: "GET",
    mode: "cors",
    headers: new Headers(),
    ...options,
  };
  handlers.get("fetch")({
    request,
    respondWith: (promise) => {
      response = promise;
    },
  });
  return response;
}

await lifecycle("install");
assert.equal(skipped, 0, "Never replace a running app during installation");
assert.equal(cacheWrites, 7);
groups.push("offline shell and app icons are present and precached");
await lifecycle("activate");
assert.equal(claimed, 1);
assert.ok(!cacheStores.has("thunderfix-pwa-old"));
assert.ok(cacheStores.has("unrelated-app-cache"));
groups.push("activation removes only this app's previous caches");

const writesBeforeNavigation = cacheWrites;
let result = await request("/dashboard/customer", { mode: "navigate" });
assert.equal(await result.text(), "Fresh response");
assert.equal(cacheWrites, writesBeforeNavigation);
network = async () => new Response("Server error", { status: 500 });
result = await request("/dashboard/customer", { mode: "navigate" });
assert.equal(result.status, 500, "Do not disguise server errors as offline");
groups.push("navigations always use the network; private HTML is never stored");

network = async () => {
  throw new TypeError("Offline");
};
result = await request("/dashboard/technician/urgent", { mode: "navigate" });
assert.equal(
  await result.text(),
  await readFile(new URL("public/offline.html", root), "utf8"),
);
groups.push("failed full navigations show the branded offline page");

for (const [pathname, options] of [
  ["/api/dispatch", {}],
  ["/api/avatars/1/photo.png", {}],
  ["/api/auth/me", { mode: "navigate" }],
  ["/api/auth/register", { method: "POST" }],
  ["/dashboard/customer/profile", { headers: new Headers({ RSC: "1" }) }],
  ["/dashboard/customer/chat/1", {}],
  ["/uploads/avatars/1.png", {}],
  ["https://tiles.example/map.png", {}],
])
  assert.equal(await request(pathname, options), undefined);
assert.equal(cacheWrites, writesBeforeNavigation);
groups.push(
  "API, private avatars, POST, RSC, chat and external maps bypass the cache",
);
result = await request("/pwa/offline.js");
assert.ok((await result.text()).includes("updateNetworkState"));
assert.equal(await request("/pwa/offline.js?private=anything"), undefined);
groups.push("only exact public-shell assets are available offline");
await lifecycle("message", { data: { type: "UNRELATED" } });
assert.equal(skipped, 0);
await lifecycle("message", { data: { type: "SKIP_WAITING" } });
assert.equal(skipped, 1);
groups.push("an app update activates only after the explicit user message");
cacheStores.get("thunderfix-pwa-v1").delete("/offline.html");
result = await request("/launch", { mode: "navigate" });
assert.equal(result.status, 503);
assert.equal(result.headers.get("content-type"), "text/html; charset=utf-8");
groups.push("cache eviction has an honest offline fallback");

const manifestSource = await readFile(new URL("app/manifest.ts", root), "utf8");
const manifestModule = { exports: {} };
vm.runInNewContext(
  ts.transpileModule(manifestSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
  { module: manifestModule, exports: manifestModule.exports },
);
const manifest = manifestModule.exports.default();
assert.equal(manifest.display, "standalone");
assert.equal(manifest.id, "/");
assert.equal(manifest.start_url, "/launch");
assert.equal(manifest.scope, "/");
assert.ok(manifest.icons.some((icon) => icon.purpose === "maskable"));
for (const icon of [
  ...manifest.icons,
  { src: "/icons/apple-touch-icon.png", sizes: "180x180" },
]) {
  const bytes = await readFile(new URL(`public${icon.src}`, root));
  assert.equal(bytes.subarray(1, 4).toString(), "PNG");
  const [width, height] = icon.sizes.split("x").map(Number);
  assert.equal(bytes.readUInt32BE(16), width);
  assert.equal(bytes.readUInt32BE(20), height);
}
groups.push(
  "install manifest, standalone launch and Android/iOS PNG sizes are valid",
);
console.log(
  `PASS: ${groups.length} PWA regression groups.\n${groups.map((group) => `- ${group}`).join("\n")}`,
);
