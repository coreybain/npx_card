"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { askCorey, loadPortfolioData, normalizePayload } = require("../cli/data");

test("normalizePayload preserves fallback fields when the payload is partial", () => {
  const result = normalizePayload({
    profile: {
      name: "Corey Baines",
    },
    featuredProjects: [
      {
        title: "Only title set",
      },
    ],
    ask: {
      enabled: false,
    },
  });

  assert.equal(result.profile.name, "Corey Baines");
  assert.equal(result.profile.headline, "Principal / Lead Full-Stack Engineer");
  assert.equal(result.featuredProjects[0].title, "Only title set");
  assert.equal(result.featuredProjects[0].slug, "quotecloud");
  assert.equal(result.ask.enabled, false);
});

test("askCorey surfaces API errors cleanly", async () => {
  const originalFetch = global.fetch;

  global.fetch = async () => {
    return {
      ok: false,
      status: 429,
      async json() {
        return {
          error: "Too many requests right now.",
        };
      },
    };
  };

  try {
    const result = await askCorey("What should we hire Corey for?", {
      enabled: true,
      url: "https://example.com/api/ask",
    });

    assert.equal(result.ok, false);
    assert.equal(result.error, "Too many requests right now.");
  } finally {
    global.fetch = originalFetch;
  }
});

test("loadPortfolioData falls back when live fetch fails", async () => {
  const originalFetch = global.fetch;

  global.fetch = async () => {
    throw new Error("network down");
  };

  try {
    const result = await loadPortfolioData();

    assert.equal(result.source, "bundled");
    assert.equal(result.data.profile.name, "Corey Baines");
    assert.match(result.error, /network down/);
  } finally {
    global.fetch = originalFetch;
  }
});
