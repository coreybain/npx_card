"use strict";

const { fallbackPayload } = require("./fallback-data");

const DEFAULT_CARD_DATA_URL =
  process.env.COREYBAINES_CARD_DATA_URL || "https://coreybaines.com/api/cli-card";

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeString(value, fallback) {
  return isNonEmptyString(value) ? value.trim() : fallback;
}

function normalizeArray(value, fallback, mapper) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const mapped = value
    .map((item, index) => mapper(item, index))
    .filter(Boolean);

  return mapped.length > 0 ? mapped : fallback;
}

function normalizeLinkMap(input, fallback) {
  const source = input && typeof input === "object" ? input : {};
  const output = { ...fallback };

  Object.keys(source).forEach((key) => {
    if (isNonEmptyString(source[key])) {
      output[key] = source[key].trim();
    }
  });

  return output;
}

function normalizeProfile(profile, fallback) {
  const source = profile && typeof profile === "object" ? profile : {};

  return {
    name: normalizeString(source.name, fallback.name),
    headline: normalizeString(source.headline, fallback.headline),
    subheadline: normalizeString(source.subheadline, fallback.subheadline),
    availability: normalizeString(source.availability, fallback.availability),
    location: normalizeString(source.location, fallback.location),
    contactEmail: normalizeString(source.contactEmail, fallback.contactEmail),
    socials: normalizeArray(source.socials, fallback.socials, (social) => {
      if (!social || typeof social !== "object") {
        return null;
      }

      return {
        label: normalizeString(social.label, ""),
        href: normalizeString(social.href, ""),
      };
    }).filter((social) => social.label && social.href),
  };
}

function normalizeProject(project, fallback) {
  const source = project && typeof project === "object" ? project : {};

  return {
    slug: normalizeString(source.slug, fallback.slug),
    title: normalizeString(source.title, fallback.title),
    tagline: normalizeString(source.tagline, fallback.tagline),
    summary: normalizeString(source.summary, fallback.summary),
    role: normalizeString(source.role, fallback.role),
    period: normalizeString(source.period, fallback.period),
    stack: normalizeArray(source.stack, fallback.stack, (item) =>
      isNonEmptyString(item) ? item.trim() : null
    ),
    outcomes: normalizeArray(source.outcomes, fallback.outcomes, (item) =>
      isNonEmptyString(item) ? item.trim() : null
    ),
    impactMetrics: normalizeArray(
      source.impactMetrics,
      fallback.impactMetrics,
      (item) => (isNonEmptyString(item) ? item.trim() : null)
    ),
    links: normalizeLinkMap(source.links, fallback.links),
  };
}

function normalizePost(post, fallback) {
  const source = post && typeof post === "object" ? post : {};

  return {
    slug: normalizeString(source.slug, fallback.slug),
    title: normalizeString(source.title, fallback.title),
    excerpt: normalizeString(source.excerpt, fallback.excerpt),
    publishedAt: normalizeString(source.publishedAt, fallback.publishedAt),
    href: normalizeString(source.href, fallback.href),
  };
}

function normalizeExperiment(experiment, fallback) {
  const source = experiment && typeof experiment === "object" ? experiment : {};

  return {
    slug: normalizeString(source.slug, fallback.slug),
    title: normalizeString(source.title, fallback.title),
    summary: normalizeString(source.summary, fallback.summary),
    tags: normalizeArray(source.tags, fallback.tags, (item) =>
      isNonEmptyString(item) ? item.trim() : null
    ),
    links: normalizeLinkMap(source.links, fallback.links),
  };
}

function normalizePayload(payload) {
  const source = payload && typeof payload === "object" ? payload : {};

  return {
    version: Number.isFinite(source.version) ? source.version : fallbackPayload.version,
    updatedAt: normalizeString(source.updatedAt, fallbackPayload.updatedAt),
    profile: normalizeProfile(source.profile, fallbackPayload.profile),
    featuredProjects: normalizeArray(
      source.featuredProjects,
      fallbackPayload.featuredProjects,
      (project, index) => normalizeProject(project, fallbackPayload.featuredProjects[index] || fallbackPayload.featuredProjects[0])
    ),
    leadershipHighlights: normalizeArray(
      source.leadershipHighlights,
      fallbackPayload.leadershipHighlights,
      (item) => (isNonEmptyString(item) ? item.trim() : null)
    ),
    latestPosts: normalizeArray(source.latestPosts, fallbackPayload.latestPosts, (post, index) =>
      normalizePost(post, fallbackPayload.latestPosts[index] || fallbackPayload.latestPosts[0])
    ),
    featuredExperiments: normalizeArray(
      source.featuredExperiments,
      fallbackPayload.featuredExperiments,
      (experiment, index) =>
        normalizeExperiment(
          experiment,
          fallbackPayload.featuredExperiments[index] ||
            fallbackPayload.featuredExperiments[0]
        )
    ),
    links: normalizeLinkMap(source.links, fallbackPayload.links),
    ask: {
      enabled:
        typeof source.ask?.enabled === "boolean"
          ? source.ask.enabled
          : fallbackPayload.ask.enabled,
      url: normalizeString(source.ask?.url, fallbackPayload.ask.url),
    },
  };
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

async function loadPortfolioData() {
  const fallback = normalizePayload(fallbackPayload);

  if (process.env.COREYBAINES_CARD_DISABLE_FETCH === "1") {
    return {
      data: fallback,
      source: "bundled",
      endpoint: DEFAULT_CARD_DATA_URL,
      error: null,
    };
  }

  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timer = controller
    ? setTimeout(() => controller.abort(), 1800)
    : null;

  try {
    const payload = await fetchJson(DEFAULT_CARD_DATA_URL, {
      headers: {
        accept: "application/json",
      },
      signal: controller ? controller.signal : undefined,
    });

    return {
      data: normalizePayload(payload),
      source: "live",
      endpoint: DEFAULT_CARD_DATA_URL,
      error: null,
    };
  } catch (error) {
    return {
      data: fallback,
      source: "bundled",
      endpoint: DEFAULT_CARD_DATA_URL,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

async function askCorey(question, askConfig) {
  if (!askConfig || !askConfig.enabled || !isNonEmptyString(askConfig.url)) {
    return {
      ok: false,
      error: "Ask Corey is not available in this session.",
    };
  }

  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timer = controller
    ? setTimeout(() => controller.abort(), 15000)
    : null;

  let response;

  try {
    response = await fetch(askConfig.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ question }),
      signal: controller ? controller.signal : undefined,
    });
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }

  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    return {
      ok: false,
      error:
        payload && isNonEmptyString(payload.error)
          ? payload.error
          : `Ask Corey request failed with status ${response.status}.`,
    };
  }

  return {
    ok: true,
    answer: normalizeString(
      payload && payload.answer,
      "I could not generate a useful answer right now."
    ),
    citations: normalizeArray(payload && payload.citations, [], (citation) => {
      if (!citation || typeof citation !== "object") {
        return null;
      }

      return {
        title: normalizeString(citation.title, "Reference"),
        url: normalizeString(citation.url, ""),
        sourceType: normalizeString(citation.sourceType, "page"),
      };
    }),
  };
}

module.exports = {
  DEFAULT_CARD_DATA_URL,
  askCorey,
  loadPortfolioData,
  normalizePayload,
};
