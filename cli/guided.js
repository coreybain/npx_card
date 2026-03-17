"use strict";

const clear = require("clear");
const { previewAndOpen, resolveOpenTarget } = require("./actions");
const { askCorey } = require("./data");
const {
  renderAskAnswer,
  renderContact,
  renderExperiments,
  renderLanding,
  renderLeadership,
  renderOverview,
  renderPosts,
  renderProjectDetail,
  renderProjectList,
  theme,
} = require("./render");
const { chooseFromMenu, pause, promptLine } = require("./terminal");

async function waitOnScreen(session) {
  return pause("Press Enter to continue or Tab to switch modes.", session.mode);
}

async function showOverview(session) {
  clear();
  console.log(renderOverview(session));
  return waitOnScreen(session);
}

async function showLeadership(session) {
  clear();
  console.log(renderLeadership(session));
  return waitOnScreen(session);
}

async function showContact(session) {
  while (true) {
    const result = await chooseFromMenu({
      header: renderContact(session),
      promptLabel: "Contact and outbound links",
      mode: session.mode,
      choices: [
        {
          label: "Open email",
          value: "email",
          hint: "Preview mailto before opening.",
        },
        {
          label: "Open website",
          value: "website",
          hint: "Go to the public site.",
        },
        {
          label: "Open LinkedIn",
          value: "linkedin",
          hint: "Professional profile and network.",
        },
        {
          label: "Back",
          value: "back",
          hint: "Return to the guided command palette.",
        },
      ],
    });

    if (result.type !== "select") {
      return result;
    }

    if (result.value === "back") {
      return {
        type: "continue",
      };
    }

    const target = resolveOpenTarget(session.data, result.value);

    if (!target) {
      clear();
      console.log(theme.danger("That link is not available right now."));
      return waitOnScreen(session);
    }

    const openResult = await previewAndOpen(session, target);

    if (openResult.type === "mode" || openResult.type === "quit") {
      return openResult;
    }
  }
}

async function showPosts(session) {
  while (true) {
    const choices = session.data.latestPosts.map((post) => ({
      label: post.title,
      value: `post:${post.slug}`,
      hint: post.excerpt,
    }));

    choices.push({
      label: "Back",
      value: "back",
      hint: "Return to Advanced.",
    });

    const result = await chooseFromMenu({
      header: renderPosts(session),
      promptLabel: "Latest writing",
      mode: session.mode,
      choices,
    });

    if (result.type !== "select") {
      return result;
    }

    if (result.value === "back") {
      return {
        type: "continue",
      };
    }

    const target = resolveOpenTarget(session.data, result.value.replace("post:", ""));

    if (!target) {
      return {
        type: "continue",
      };
    }

    const openResult = await previewAndOpen(session, target);

    if (openResult.type === "mode" || openResult.type === "quit") {
      return openResult;
    }
  }
}

async function showExperiments(session) {
  clear();
  console.log(renderExperiments(session));
  return waitOnScreen(session);
}

async function showAsk(session) {
  clear();

  if (!session.data.ask.enabled) {
    console.log(theme.danger("Ask Corey is offline for the CLI right now."));
    return waitOnScreen(session);
  }

  console.log(theme.accentStrong("Ask Corey"));
  console.log(
    theme.dim("Ask about projects, architecture, leadership, iOS work, or AI product workflows.")
  );
  console.log("");

  const promptResult = await promptLine("Question: ", {
    tabMode: "sandbox",
  });

  if (promptResult.type !== "input") {
    return promptResult;
  }

  const question = promptResult.value.trim();

  if (!question) {
    return {
      type: "continue",
    };
  }

  clear();
  console.log(theme.dim("Thinking...\n"));

  try {
    const result = await askCorey(question, session.data.ask);

    clear();

    if (!result.ok) {
      console.log(theme.danger(result.error));
      return waitOnScreen(session);
    }

    console.log(renderAskAnswer(question, result));
    return waitOnScreen(session);
  } catch (error) {
    clear();
    console.log(
      theme.danger(
        error instanceof Error ? error.message : "Ask Corey hit an unexpected error."
      )
    );
    return waitOnScreen(session);
  }
}

async function showAdvanced(session) {
  while (true) {
    const result = await chooseFromMenu({
      header: renderLanding(session),
      promptLabel: "Advanced",
      mode: session.mode,
      choices: [
        {
          label: "Ask Corey",
          value: "ask",
          hint: "Direct Q&A, grounded in the website knowledge.",
        },
        {
          label: "Latest Writing",
          value: "posts",
          hint: "Recent writing that shows technical judgment.",
        },
        {
          label: "Experiments",
          value: "experiments",
          hint: "Smaller technical artifacts and exploration.",
        },
        {
          label: "Open website",
          value: "website",
          hint: "Jump out to the full public site.",
        },
        {
          label: "Back",
          value: "back",
          hint: "Return to the main guided palette.",
        },
      ],
    });

    if (result.type !== "select") {
      return result;
    }

    if (result.value === "back") {
      return {
        type: "continue",
      };
    }

    if (result.value === "ask") {
      const askResult = await showAsk(session);

      if (askResult.type === "mode" || askResult.type === "quit") {
        return askResult;
      }

      continue;
    }

    if (result.value === "posts") {
      const postsResult = await showPosts(session);

      if (postsResult.type === "mode" || postsResult.type === "quit") {
        return postsResult;
      }

      continue;
    }

    if (result.value === "experiments") {
      const experimentsResult = await showExperiments(session);

      if (experimentsResult.type === "mode" || experimentsResult.type === "quit") {
        return experimentsResult;
      }

      continue;
    }

    if (result.value === "website") {
      const target = resolveOpenTarget(session.data, "website");
      const openResult = await previewAndOpen(session, target);

      if (openResult.type === "mode" || openResult.type === "quit") {
        return openResult;
      }
    }
  }
}

async function showFeaturedWork(session) {
  while (true) {
    const projectChoices = session.data.featuredProjects.map((project, index) => ({
      label: project.title,
      value: String(index),
      hint: `${project.role} / ${project.period}`,
    }));

    projectChoices.push({
      label: "Back",
      value: "back",
      hint: "Return to the guided command palette.",
    });

    const result = await chooseFromMenu({
      header: renderProjectList(session),
      promptLabel: "Featured work",
      mode: session.mode,
      choices: projectChoices,
    });

    if (result.type !== "select") {
      return result;
    }

    if (result.value === "back") {
      return {
        type: "continue",
      };
    }

    const project = session.data.featuredProjects[Number.parseInt(result.value, 10)];

    if (!project) {
      continue;
    }

    const detailResult = await chooseFromMenu({
      header: renderProjectDetail(project, Number.parseInt(result.value, 10)),
      promptLabel: "Project actions",
      mode: session.mode,
      choices: [
        {
          label: "Open best destination",
          value: "default",
          hint: "Live product, store, repo, or case study.",
        },
        {
          label: "Open case study",
          value: "caseStudy",
          hint: "Website context for this project.",
        },
        {
          label: "Back",
          value: "back",
          hint: "Return to the project list.",
        },
      ],
    });

    if (detailResult.type !== "select") {
      return detailResult;
    }

    if (detailResult.value === "back") {
      continue;
    }

    const targetKey =
      detailResult.value === "default"
        ? project.slug
        : `${project.slug}-${detailResult.value}`;
    const target = resolveOpenTarget(session.data, targetKey);

    if (!target) {
      clear();
      console.log(theme.danger("No link is available for that action yet."));
      const waitResult = await waitOnScreen(session);

      if (waitResult.type === "mode" || waitResult.type === "quit") {
        return waitResult;
      }

      continue;
    }

    const openResult = await previewAndOpen(session, target);

    if (openResult.type === "mode" || openResult.type === "quit") {
      return openResult;
    }
  }
}

async function runGuided(session) {
  while (!session.exit && session.mode === "guided") {
    const result = await chooseFromMenu({
      header: renderLanding(session),
      promptLabel: "Guided command palette",
      mode: session.mode,
      choices: [
        {
          label: "Overview",
          value: "overview",
          hint: "Fast recruiter summary and strongest signal.",
        },
        {
          label: "Featured Work",
          value: "work",
          hint: "Curated project proof with role and outcomes.",
        },
        {
          label: "Leadership & Outcomes",
          value: "leadership",
          hint: "How the work gets shipped and scaled.",
        },
        {
          label: "Contact",
          value: "contact",
          hint: "Email, site, and outbound profile links.",
        },
        {
          label: "Advanced",
          value: "advanced",
          hint: "Ask Corey, writing, experiments, and more.",
        },
        {
          label: "Switch to Sandbox",
          value: "sandbox",
          hint: "Full shell mode for technical users.",
        },
        {
          label: "Quit",
          value: "quit",
          hint: "Leave the session.",
        },
      ],
    });

    if (result.type === "mode") {
      session.mode = result.mode;
      return;
    }

    if (result.type === "quit") {
      session.exit = true;
      return;
    }

    switch (result.value) {
      case "overview": {
        const next = await showOverview(session);
        if (next.type === "mode") {
          session.mode = next.mode;
          return;
        }
        if (next.type === "quit") {
          session.exit = true;
          return;
        }
        break;
      }
      case "work": {
        const next = await showFeaturedWork(session);
        if (next.type === "mode") {
          session.mode = next.mode;
          return;
        }
        if (next.type === "quit") {
          session.exit = true;
          return;
        }
        break;
      }
      case "leadership": {
        const next = await showLeadership(session);
        if (next.type === "mode") {
          session.mode = next.mode;
          return;
        }
        if (next.type === "quit") {
          session.exit = true;
          return;
        }
        break;
      }
      case "contact": {
        const next = await showContact(session);
        if (next.type === "mode") {
          session.mode = next.mode;
          return;
        }
        if (next.type === "quit") {
          session.exit = true;
          return;
        }
        break;
      }
      case "advanced": {
        const next = await showAdvanced(session);
        if (next.type === "mode") {
          session.mode = next.mode;
          return;
        }
        if (next.type === "quit") {
          session.exit = true;
          return;
        }
        break;
      }
      case "sandbox":
        session.mode = "sandbox";
        return;
      default:
        session.exit = true;
        return;
    }
  }
}

module.exports = {
  runGuided,
};
