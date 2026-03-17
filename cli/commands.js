"use strict";

function parseCommand(input) {
  const trimmed = typeof input === "string" ? input.trim() : "";

  if (!trimmed) {
    return {
      name: "",
      args: [],
      rawArgs: "",
    };
  }

  const firstSpace = trimmed.indexOf(" ");

  if (firstSpace === -1) {
    return {
      name: trimmed.toLowerCase(),
      args: [],
      rawArgs: "",
    };
  }

  const name = trimmed.slice(0, firstSpace).toLowerCase();
  const rawArgs = trimmed.slice(firstSpace + 1).trim();

  return {
    name,
    args: rawArgs.length > 0 ? rawArgs.split(/\s+/) : [],
    rawArgs,
  };
}

module.exports = {
  parseCommand,
};
