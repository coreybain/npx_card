"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { parseCommand } = require("../cli/commands");

test("parseCommand splits shell-like commands", () => {
  const result = parseCommand("project quotecloud");

  assert.equal(result.name, "project");
  assert.deepEqual(result.args, ["quotecloud"]);
  assert.equal(result.rawArgs, "quotecloud");
});

test("parseCommand preserves multi-word ask input", () => {
  const result = parseCommand("ask What kind of team would Corey be strongest on?");

  assert.equal(result.name, "ask");
  assert.equal(
    result.rawArgs,
    "What kind of team would Corey be strongest on?"
  );
});
