#!/usr/bin/env node

"use strict";

const boxen = require("boxen");
const chalk = require("chalk");
const clear = require("clear");
const inquirer = require("inquirer");
const open = require("open");

clear();

const prompt = inquirer.createPromptModule();

const profile = {
  name: chalk.bold.green("Corey Baines"),
  handle: chalk.white("@coreybaines"),
  role: `${chalk.white("Principal / Lead")} ${chalk.hex("#2b82b2").bold(
    "Full-Stack Engineer"
  )}`,
  focus: chalk.white(
    "Product-focused software across web, backend, Apple platforms, and AI workflows"
  ),
  location: chalk.white("Sydney, Australia"),
  availability: chalk.green("Open to exploring new product and engineering opportunities"),
  email: chalk.cyan("corey@spiritdevs.com"),
  github: chalk.gray("https://github.com/") + chalk.green("coreybain"),
  linkedin:
    chalk.gray("https://linkedin.com/in/") + chalk.blue("coreybaines"),
  x: chalk.gray("https://x.com/") + chalk.cyan("coreybaines"),
  web: chalk.cyan("https://coreybaines.com"),
  ask: chalk.cyan("https://coreybaines.com/ask"),
  card: chalk.red("npx") + " " + chalk.white("coreybaines"),
  labelRole: chalk.white.bold("        Role:"),
  labelFocus: chalk.white.bold("       Focus:"),
  labelLocation: chalk.white.bold("    Location:"),
  labelStatus: chalk.white.bold("Availability:"),
  labelEmail: chalk.white.bold("       Email:"),
  labelGitHub: chalk.white.bold("      GitHub:"),
  labelLinkedIn: chalk.white.bold("    LinkedIn:"),
  labelX: chalk.white.bold("           X:"),
  labelWeb: chalk.white.bold("         Web:"),
  labelAsk: chalk.white.bold("         Ask:"),
  labelCard: chalk.white.bold("        Card:"),
};

const questions = [
  {
    type: "list",
    name: "action",
    message: "What would you like to do?",
    choices: [
      {
        name: `Send an ${chalk.green.bold("email")}`,
        value: "email",
      },
      {
        name: `Open ${chalk.cyan.bold("coreybaines.com")}`,
        value: "website",
      },
      {
        name: `View ${chalk.blue.bold("selected work")}`,
        value: "work",
      },
      {
        name: `Launch ${chalk.magentaBright.bold("Ask Corey")}`,
        value: "ask",
      },
      {
        name: "Just quit",
        value: "quit",
      },
    ],
  },
];

async function handleAction(action) {
  switch (action) {
    case "email":
      await open("mailto:corey@spiritdevs.com");
      console.log("\nOpening your email client.\n");
      break;
    case "website":
      await open("https://coreybaines.com");
      console.log("\nOpening coreybaines.com.\n");
      break;
    case "work":
      await open("https://coreybaines.com/work");
      console.log("\nOpening selected work.\n");
      break;
    case "ask":
      await open("https://coreybaines.com/ask");
      console.log("\nOpening Ask Corey.\n");
      break;
    default:
      console.log("See you around.\n");
  }
}

const me = boxen(
  [
    `${profile.name} ${chalk.dim(profile.handle)}`,
    ``,
    `${profile.labelRole}  ${profile.role}`,
    `${profile.labelFocus}  ${profile.focus}`,
    `${profile.labelLocation}  ${profile.location}`,
    `${profile.labelStatus}  ${profile.availability}`,
    `${profile.labelEmail}  ${profile.email}`,
    `${profile.labelGitHub}  ${profile.github}`,
    `${profile.labelLinkedIn}  ${profile.linkedin}`,
    `${profile.labelX}  ${profile.x}`,
    `${profile.labelWeb}  ${profile.web}`,
    `${profile.labelAsk}  ${profile.ask}`,
    `${profile.labelCard}  ${profile.card}`,
    ``,
    `${chalk.italic("Building thoughtful software across web, backend,")}`,
    `${chalk.italic("and Apple platforms, with a focus on delivery,")}`,
    `${chalk.italic("architecture, and real product outcomes.")}`,
  ].join("\n"),
  {
    margin: 1,
    float: "center",
    padding: 1,
    borderStyle: "single",
    borderColor: "green",
  }
);

console.log(me);
console.log(
  [
    `Tip: Try ${chalk.cyanBright.bold("cmd/ctrl + click")} on the links above`,
    ``,
  ].join("\n")
);

prompt(questions).then(({ action }) => handleAction(action));
