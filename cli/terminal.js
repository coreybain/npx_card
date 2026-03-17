"use strict";

const clear = require("clear");
const readline = require("readline");
const { theme } = require("./render");

function canUseRawMode() {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

function question(promptText) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(promptText, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

function waitForKeypress() {
  return new Promise((resolve) => {
    const handler = (str, key) => {
      process.stdin.off("keypress", handler);
      resolve({ str, key });
    };

    process.stdin.on("keypress", handler);
  });
}

function releaseTerminalInput() {
  if (!process.stdin.isTTY) {
    return;
  }

  if (typeof process.stdin.setRawMode === "function") {
    process.stdin.setRawMode(false);
  }

  process.stdin.pause();
}

async function chooseFromMenu({ header, promptLabel, choices, mode }) {
  if (!canUseRawMode()) {
    if (header) {
      console.log(header);
      console.log("");
    }

    choices.forEach((choice, index) => {
      console.log(`${index + 1}. ${choice.label}`);
      if (choice.hint) {
        console.log(`   ${choice.hint}`);
      }
    });

    const answer = await question(`\n${promptLabel || "Choose"} `);
    const numericChoice = Number.parseInt(answer, 10);

    if (Number.isFinite(numericChoice) && choices[numericChoice - 1]) {
      return {
        type: "select",
        value: choices[numericChoice - 1].value,
      };
    }

    return {
      type: "select",
      value: choices[0].value,
    };
  }

  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();

  let index = 0;

  const render = () => {
    clear();

    if (header) {
      console.log(header);
      console.log("");
    }

    if (promptLabel) {
      console.log(theme.accentStrong(promptLabel));
      console.log("");
    }

    choices.forEach((choice, choiceIndex) => {
      const active = choiceIndex === index;
      const prefix = active ? theme.accentStrong("›") : theme.dim(" ");
      const label = active ? theme.strong(choice.label) : choice.label;
      console.log(`${prefix} ${choiceIndex + 1}. ${label}`);
      if (choice.hint) {
        console.log(`   ${theme.dim(choice.hint)}`);
      }
    });

    console.log("");
    console.log(
      theme.dim(
        mode === "sandbox"
          ? "Use arrows, j/k, number keys, Enter, or Tab to switch to Guided."
          : "Use arrows, j/k, number keys, Enter, or Tab to switch to Sandbox."
      )
    );
  };

  render();

  try {
    while (true) {
      const { str, key } = await waitForKeypress();

      if (key && key.ctrl && key.name === "c") {
        return {
          type: "quit",
        };
      }

      if (key && key.name === "tab") {
        return {
          type: "mode",
          mode: mode === "sandbox" ? "guided" : "sandbox",
        };
      }

      if (key && (key.name === "up" || key.name === "k")) {
        index = (index - 1 + choices.length) % choices.length;
        render();
        continue;
      }

      if (key && (key.name === "down" || key.name === "j")) {
        index = (index + 1) % choices.length;
        render();
        continue;
      }

      if (key && key.name === "return") {
        return {
          type: "select",
          value: choices[index].value,
        };
      }

      if (/^[1-9]$/.test(str || "")) {
        const numericChoice = Number.parseInt(str, 10) - 1;

        if (choices[numericChoice]) {
          return {
            type: "select",
            value: choices[numericChoice].value,
          };
        }
      }

      if ((str || "").toLowerCase() === "q") {
        return {
          type: "quit",
        };
      }
    }
  } finally {
    releaseTerminalInput();
  }
}

async function pause(message, mode) {
  if (!canUseRawMode()) {
    await question(`${message} `);
    return {
      type: "continue",
    };
  }

  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();

  console.log("");
  console.log(theme.dim(message));

  try {
    while (true) {
      const { key } = await waitForKeypress();

      if (key && key.name === "return") {
        return {
          type: "continue",
        };
      }

      if (key && key.name === "tab") {
        return {
          type: "mode",
          mode: mode === "sandbox" ? "guided" : "sandbox",
        };
      }

      if (key && key.ctrl && key.name === "c") {
        return {
          type: "quit",
        };
      }
    }
  } finally {
    releaseTerminalInput();
  }
}

async function promptLine(promptText, options = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      historySize: 50,
    });

    let settled = false;
    const input = rl.input;

    readline.emitKeypressEvents(input);

    const keypressHandler = (str, key) => {
      const isShiftTab =
        (key && key.name === "tab" && key.shift) || str === "\u001b[Z";

      if (
        !options.tabMode ||
        rl.line.length > 0 ||
        (options.requireShiftTab ? !isShiftTab : !key || key.name !== "tab")
      ) {
        return;
      }

      settled = true;
      input.off("keypress", keypressHandler);
      rl.close();
      process.stdout.write("\n");
      resolve({
        type: "mode",
        mode: options.tabMode,
      });
    };

    input.on("keypress", keypressHandler);

    rl.question(promptText, (answer) => {
      if (settled) {
        return;
      }

      input.off("keypress", keypressHandler);
      rl.close();
      resolve({
        type: "input",
        value: answer,
      });
    });
  });
}

module.exports = {
  canUseRawMode,
  chooseFromMenu,
  pause,
  promptLine,
  releaseTerminalInput,
};
