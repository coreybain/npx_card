"use strict";

const clear = require("clear");
const open = require("open");
const { renderExternalPreview, theme } = require("./render");
const { chooseFromMenu, pause } = require("./terminal");

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function buildOpenTargets(data) {
  const targets = {};

  Object.entries(data.links).forEach(([key, url]) => {
    if (!url) {
      return;
    }

    targets[normalizeKey(key)] = {
      key: normalizeKey(key),
      label: key[0].toUpperCase() + key.slice(1),
      description: `Open ${key} for more context.`,
      url,
    };
  });

  data.featuredProjects.forEach((project, index) => {
    const defaultUrl =
      project.links.live ||
      project.links.store ||
      project.links.repo ||
      project.links.caseStudy;

    if (defaultUrl) {
      targets[normalizeKey(project.slug)] = {
        key: normalizeKey(project.slug),
        label: project.title,
        description: `${project.tagline} (${project.role})`,
        url: defaultUrl,
      };
    }

    targets[String(index + 1)] = targets[normalizeKey(project.slug)];

    Object.entries(project.links).forEach(([key, url]) => {
      if (!url) {
        return;
      }

      targets[normalizeKey(`${project.slug}-${key}`)] = {
        key: normalizeKey(`${project.slug}-${key}`),
        label: `${project.title} / ${key}`,
        description: `${project.tagline} (${key})`,
        url,
      };
    });
  });

  data.latestPosts.forEach((post) => {
    targets[normalizeKey(post.slug)] = {
      key: normalizeKey(post.slug),
      label: post.title,
      description: post.excerpt,
      url: post.href,
    };
  });

  return targets;
}

function resolveOpenTarget(data, rawTarget) {
  const targets = buildOpenTargets(data);
  const normalized = normalizeKey(rawTarget);

  return targets[normalized] || null;
}

async function previewAndOpen(session, target) {
  clear();
  console.log(renderExternalPreview(target));
  console.log("");

  const result = await chooseFromMenu({
    mode: session.mode,
    promptLabel: "Open this destination?",
    choices: [
      {
        label: "Open now",
        value: "open",
        hint: "Launch the browser or mail client.",
      },
      {
        label: "Back",
        value: "back",
        hint: "Return without leaving the terminal.",
      },
    ],
  });

  if (result.type === "mode") {
    return result;
  }

  if (result.type !== "select" || result.value !== "open") {
    return {
      type: "back",
    };
  }

  try {
    await open(target.url);
    console.log(`\n${theme.success("Opened")} ${target.url}\n`);
  } catch (error) {
    console.log(`\n${theme.danger("Could not open automatically.")} ${target.url}\n`);
    console.log(error instanceof Error ? `${error.message}\n` : `${String(error)}\n`);
  }

  const pauseResult = await pause(
    "Press Enter to continue or Tab to switch modes.",
    session.mode
  );

  if (pauseResult.type === "mode" || pauseResult.type === "quit") {
    return pauseResult;
  }

  return {
    type: "opened",
  };
}

module.exports = {
  previewAndOpen,
  resolveOpenTarget,
};
