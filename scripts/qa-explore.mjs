import assert from "node:assert/strict";
import {
  decodeExplorePin,
  explorePinKey,
  exploreUrl,
  parseExplorePin,
  saveExplorePin,
} from "../lib/explore-location.ts";

let passed = 0;
function check(name, test) {
  test();
  passed++;
  console.log(`PASS ${name}`);
}
check("valid coordinate pair and zero coordinates", () => {
  assert.deepEqual(parseExplorePin("12.34", "56.78"), {
    latitude: 12.34,
    longitude: 56.78,
  });
  assert.deepEqual(parseExplorePin("0", "0"), { latitude: 0, longitude: 0 });
});
check("malformed or incomplete URL does not become a confirmed pin", () => {
  for (const pair of [
    [undefined, 12],
    [12, undefined],
    ["", "12"],
    [" ", "12"],
    [null, 12],
    [true, 12],
    [[], 12],
    ["NaN", "12"],
    [12, Infinity],
    [91, 0],
    [0, -181],
  ])
    assert.equal(parseExplorePin(...pair), null);
});
check("pin survives a fresh read from persistent storage", () => {
  const values = new Map();
  const storage = { setItem: (key, value) => values.set(key, value) };
  const pin = { latitude: 12.3456789, longitude: 56.7890123 };
  assert.equal(saveExplorePin(storage, explorePinKey("100"), pin), true);
  assert.deepEqual(decodeExplorePin(values.get(explorePinKey("100"))), pin);
});
check("accounts do not share saved pins", () => {
  const values = new Map();
  const storage = { setItem: (key, value) => values.set(key, value) };
  saveExplorePin(storage, explorePinKey("100"), {
    latitude: 12,
    longitude: 34,
  });
  assert.equal(
    decodeExplorePin(values.get(explorePinKey("101")) ?? null),
    null,
  );
});
check("latest deliberate pin replaces the previous pin", () => {
  const values = new Map();
  const storage = { setItem: (key, value) => values.set(key, value) };
  const key = explorePinKey("100");
  saveExplorePin(storage, key, { latitude: 10, longitude: 20 });
  saveExplorePin(storage, key, { latitude: 30, longitude: 40 });
  assert.deepEqual(decodeExplorePin(values.get(key)), {
    latitude: 30,
    longitude: 40,
  });
});
check("broken, obsolete, or out-of-range saved data is ignored", () => {
  for (const value of [
    null,
    "broken",
    "null",
    "[]",
    '{"latitude":1,"longitude":2}',
    '{"version":2,"latitude":1,"longitude":2}',
    '{"version":1,"latitude":100,"longitude":2}',
    '{"version":1,"latitude":"1","longitude":2}',
  ])
    assert.equal(decodeExplorePin(value), null);
});
check(
  "storage restrictions do not throw or claim successful persistence",
  () => {
    assert.equal(
      saveExplorePin(
        {
          setItem: () => {
            throw new Error("quota or storage access denied");
          },
        },
        "test",
        { latitude: 12, longitude: 34 },
      ),
      false,
    );
  },
);
check(
  "changing category preserves the exact pin and clears an old keyword",
  () => {
    const url = new URL(
      exploreUrl("7", { latitude: 12.3456789, longitude: 56.7890123 }),
      "https://example.test",
    );
    assert.equal(url.searchParams.get("category"), "7");
    assert.equal(url.searchParams.get("lat"), "12.3456789");
    assert.equal(url.searchParams.get("lng"), "56.7890123");
    assert.equal(url.searchParams.has("q"), false);
  },
);
check("all categories removes only the category filter", () => {
  const url = new URL(
    exploreUrl("", { latitude: 0, longitude: 0 }),
    "https://example.test",
  );
  assert.equal(url.searchParams.has("category"), false);
  assert.equal(url.searchParams.get("lat"), "0");
});
check(
  "category selection cannot accidentally save the default map centre",
  () => {
    assert.equal(exploreUrl("7"), "/dashboard/customer/explore?category=7");
    assert.equal(exploreUrl(""), "/dashboard/customer/explore");
  },
);
check(
  "restoring location can preserve a keyword from the public home page",
  () => {
    const url = new URL(
      exploreUrl("", { latitude: 12, longitude: 34 }, "service & repair"),
      "https://example.test",
    );
    assert.equal(url.searchParams.get("q"), "service & repair");
  },
);
console.log(
  `${passed} explore checks passed; no API calls or database writes.`,
);
