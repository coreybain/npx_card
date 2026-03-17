"use strict";

const clear = require("clear");
const { previewAndOpen, resolveOpenTarget } = require("./actions");
const { parseCommand } = require("./commands");
const { askCorey } = require("./data");
const {
  renderAskAnswer,
  renderShellContact,
  renderShellError,
  renderShellExperiments,
  renderShellIntro,
  renderShellLeadership,
  renderShellNotice,
  renderShellOverview,
  renderShellPosts,
  renderShellProjectDetail,
  renderShellPrompt,
  renderShellWork,
  theme,
} = require("./render");
const { chooseFromMenu, promptLine } = require("./terminal");

function findProject(session, selector) {
  if (!selector) {
    return null;
  }

  const projects = session.data.featuredProjects;
  const numericIndex = Number.parseInt(selector, 10);

  if (Number.isFinite(numericIndex) && projects[numericIndex - 1]) {
    return {
      project: projects[numericIndex - 1],
      index: numericIndex - 1,
    };
  }

  const normalizedSelector = selector.trim().toLowerCase();
  const index = projects.findIndex((project) => project.slug === normalizedSelector);

  if (index === -1) {
    return null;
  }

  return {
    project: projects[index],
    index,
  };
}

async function runPalette(session) {
  const result = await chooseFromMenu({
    header: renderShellIntro(session),
    promptLabel: "Sandbox palette",
    mode: session.mode,
    choices: [
      {
        label: "overview",
        value: "overview",
        hint: "Recruiter summary and current positioning.",
      },
      {
        label: "work",
        value: "work",
        hint: "List featured projects.",
      },
      {
        label: "leadership",
        value: "leadership",
        hint: "Delivery and leadership context.",
      },
      {
        label: "posts",
        value: "posts",
        hint: "Recent writing.",
      },
      {
        label: "experiments",
        value: "experiments",
        hint: "Smaller technical explorations.",
      },
      {
        label: "contact",
        value: "contact",
        hint: "Direct ways to reach out.",
      },
      {
        label: "ask",
        value: "ask",
        hint: "Prompt for a question.",
      },
      {
        label: "mode guided",
        value: "mode guided",
        hint: "Switch back to the guided experience.",
      },
    ],
  });

  if (result.type !== "select") {
    return result;
  }

  return {
    type: "command",
    value: result.value,
  };
}

async function handleAsk(session, rawArgs) {
  const question = rawArgs.trim();
  let finalQuestion = question;

  if (!finalQuestion) {
    const promptResult = await promptLine("ask> ", {
      tabMode: "guided",
    });

    if (promptResult.type !== "input") {
      return promptResult;
    }

    finalQuestion = promptResult.value.trim();
  }

  if (!finalQuestion) {
    return {
      type: "continue",
    };
  }

  if (!session.data.ask.enabled) {
    console.log(`${renderShellError("Ask Corey is offline for the CLI right now.")}\n`);
    return {
      type: "continue",
    };
  }

  console.log(`${renderShellNotice("Thinking...")}\n`);

  try {
    const result = await askCorey(finalQuestion, session.data.ask);

    if (!result.ok) {
      console.log(`${renderShellError(result.error)}\n`);
      return {
        type: "continue",
      };
    }

    console.log(`${renderAskAnswer(finalQuestion, result)}\n`);
    return {
      type: "continue",
    };
  } catch (error) {
    console.log(`${renderShellError(
      error instanceof Error ? error.message : "Ask Corey hit an unexpected error."
    )}\n`);
    return {
      type: "continue",
    };
  }
}

async function runSandbox(session) {
  clear();
  console.log(renderShellIntro(session));

  while (!session.exit && session.mode === "sandbox") {
    const promptResult = await promptLine(renderShellPrompt(), {
      requireShiftTab: true,
      tabMode: "guided",
    });

    if (promptResult.type === "mode") {
      session.mode = promptResult.mode;
      return;
    }

    const command = parseCommand(promptResult.value);

    if (!command.name) {
      console.log(`${renderShellNotice("Type help or palette to explore the shell.")}\n`);
      continue;
    }

    switch (command.name) {
      case "help":
        clear();
        console.log(`${renderShellIntro(session)}\n`);
        break;
      case "palette": {
        const paletteResult = await runPalette(session);

        if (paletteResult.type === "mode") {
          session.mode = paletteResult.mode;
          return;
        }

        if (paletteResult.type === "quit") {
          session.exit = true;
          return;
        }

        if (paletteResult.type === "command") {
          promptResult.value = paletteResult.value;
          command.name = parseCommand(paletteResult.value).name;
          command.rawArgs = parseCommand(paletteResult.value).rawArgs;
          command.args = parseCommand(paletteResult.value).args;
        } else {
          continue;
        }
        break;
      }
      default:
        break;
    }

    switch (command.name) {
      case "help":
        break;
      case "palette":
        break;
      case "overview":
        console.log(`${renderShellOverview(session)}\n`);
        break;
      case "work":
        console.log(`${renderShellWork(session)}\n`);
        break;
      case "project": {
        const match = findProject(session, command.args[0]);

        if (!match) {
          console.log(`${renderShellError(
            `Project not found. Try ${theme.accent("project 1")} or ${theme.accent(
              "project quotecloud"
            )}.`
          )}\n`);
          break;
        }

        console.log(`${renderShellProjectDetail(match.project, match.index)}\n`);
        break;
      }
      case "leadership":
        console.log(`${renderShellLeadership(session)}\n`);
        break;
      case "posts":
        console.log(`${renderShellPosts(session)}\n`);
        break;
      case "experiments":
        console.log(`${renderShellExperiments(session)}\n`);
        break;
      case "contact":
        console.log(`${renderShellContact(session)}\n`);
        break;
      case "ask": {
        const askResult = await handleAsk(session, command.rawArgs);

        if (askResult.type === "mode") {
          session.mode = askResult.mode;
          return;
        }

        break;
      }
      case "open": {
        const target = resolveOpenTarget(session.data, command.rawArgs);

        if (!target) {
          console.log(`${renderShellError(
            `Unknown target. Try ${theme.accent("open website")}, ${theme.accent(
              "open quotecloud"
            )}, or ${theme.accent("open quotecloud-caseStudy")}.`
          )}\n`);
          break;
        }

        const result = await previewAndOpen(session, target);

        if (result.type === "mode") {
          session.mode = result.mode;
          return;
        }

        clear();
        console.log(renderShellIntro(session));
        break;
      }
      case "mode":
        if ((command.args[0] || "").toLowerCase() === "guided") {
          session.mode = "guided";
          return;
        }

        console.log(
          `${renderShellError(
            `Unknown mode. Try ${theme.accent("mode guided")}.`
          )}\n`
        );
        break;
      case "quit":
      case "exit":
        session.exit = true;
        return;
      default:
        console.log(
          `${renderShellError(
            `Unknown command. Try ${theme.accent("help")} or ${theme.accent(
              "palette"
            )}.`
          )}\n`
        );
        break;
    }
  }
}

module.exports = {
  runSandbox,
};
