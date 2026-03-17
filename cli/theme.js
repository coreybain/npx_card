"use strict";

const chalk = require("chalk");

const theme = {
  accent: chalk.hex("#c18a45"),
  accentStrong: chalk.hex("#c18a45").bold,
  ink: chalk.hex("#f2ede3"),
  muted: chalk.hex("#b3a79a"),
  teal: chalk.hex("#5d8790"),
  tealStrong: chalk.hex("#5d8790").bold,
  success: chalk.hex("#7aa36f"),
  danger: chalk.hex("#b56a55"),
  dim: chalk.dim,
  strong: chalk.bold,
};

function rule(width) {
  return theme.dim("".padEnd(Math.max(24, width || 48), "─"));
}

function sectionLabel(value) {
  return theme.accentStrong(value.toUpperCase());
}

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

module.exports = {
  formatDate,
  rule,
  sectionLabel,
  theme,
};
