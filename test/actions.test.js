"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { fallbackPayload } = require("../cli/fallback-data");
const { resolveOpenTarget } = require("../cli/actions");

test("resolveOpenTarget supports base links and project shortcuts", () => {
  const websiteTarget = resolveOpenTarget(fallbackPayload, "website");
  const projectTarget = resolveOpenTarget(fallbackPayload, "quotecloud");
  const caseStudyTarget = resolveOpenTarget(fallbackPayload, "quotecloud-caseStudy");

  assert.equal(websiteTarget.url, "https://coreybaines.com");
  assert.equal(projectTarget.url, "https://quote.cloud");
  assert.equal(caseStudyTarget.url, "https://coreybaines.com/work/quotecloud");
});
