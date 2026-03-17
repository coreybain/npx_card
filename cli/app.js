"use strict";

const clear = require("clear");
const { loadPortfolioData } = require("./data");
const { runGuided } = require("./guided");
const { renderCompactOverview, theme } = require("./render");
const { runSandbox } = require("./sandbox");
const { canUseRawMode, releaseTerminalInput } = require("./terminal");

async function run() {
  const interactive = canUseRawMode();

  if (interactive) {
    clear();
  }

  const sync = await loadPortfolioData();
  const session = {
    data: sync.data,
    endpoint: sync.endpoint,
    exit: false,
    mode: "guided",
    source: sync.source,
    syncError: sync.error,
  };

  if (!interactive) {
    console.log(renderCompactOverview(session));
    return;
  }

  if (session.source === "bundled" && session.syncError) {
    console.log(theme.dim(`Live sync unavailable. Using bundled snapshot (${session.syncError}).`));
    console.log("");
  }

  while (!session.exit) {
    if (session.mode === "guided") {
      await runGuided(session);
      continue;
    }

    await runSandbox(session);
  }

  releaseTerminalInput();
  clear();
  console.log("See you around.\n");
}

module.exports = {
  run,
};
