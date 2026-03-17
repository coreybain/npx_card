#!/usr/bin/env node

"use strict";

const { run } = require("./cli/app");

run().catch((error) => {
  console.error("\nSomething went wrong while starting npx coreybaines.\n");
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
