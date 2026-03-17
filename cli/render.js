"use strict";

const boxen = require("boxen");
const { formatDate, rule, sectionLabel, theme } = require("./theme");

function columns() {
  return Math.max(60, Math.min(process.stdout.columns || 88, 92));
}

function panel(lines, options = {}) {
  return boxen(lines.join("\n"), {
    borderColor: options.borderColor || "yellow",
    borderStyle: options.borderStyle || "round",
    margin: options.margin || { top: 0, right: 0, bottom: 0, left: 0 },
    padding: options.padding || { top: 0, right: 1, bottom: 0, left: 1 },
    width: Math.min(columns(), options.width || columns()),
  });
}

function shellPanel(lines, options = {}) {
  return boxen(lines.join("\n"), {
    borderColor: options.borderColor || "cyan",
    borderStyle: options.borderStyle || "round",
    margin: options.margin || { top: 0, right: 0, bottom: 0, left: 0 },
    padding: options.padding || { top: 0, right: 1, bottom: 0, left: 1 },
    width: Math.min(columns(), options.width || columns()),
  });
}

function compactLink(value) {
  return String(value || "")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
}

function detailRow(label, value, labelRenderer = theme.dim, width = 12) {
  const paddedLabel = String(label).padEnd(width, " ");
  return `${labelRenderer(paddedLabel)} ${value}`;
}

function hero(session) {
  const { profile, featuredProjects, links } = session.data;
  const syncLabel =
    session.source === "live"
      ? `${theme.success("Live sync")} from coreybaines.com`
      : `${theme.accent("Bundled fallback")} snapshot`;
  const featuredProof = featuredProjects.map((project) => project.title).join(" / ");

  return panel(
    [
      `${theme.strong(profile.name)}  ${theme.dim("npx coreybaines")}`,
      `${theme.tealStrong(profile.headline)}`,
      "",
      profile.subheadline,
      "",
      detailRow(
        "Best fit",
        "Principal IC / tech lead roles on product-focused teams"
      ),
      detailRow("Availability", profile.availability, theme.accentStrong),
      detailRow("Proof", featuredProof),
      detailRow(
        "Reach",
        `${profile.contactEmail} / ${compactLink(links.linkedin)}`
      ),
      detailRow("Location", profile.location),
      "",
      detailRow("Sync", syncLabel),
      detailRow("Updated", formatDate(session.data.updatedAt)),
    ],
    {
      borderColor: "yellow",
    }
  );
}

function summaryStrip(session) {
  const projectNames = session.data.featuredProjects.map((project) => project.title).join(" / ");

  return [
    sectionLabel("Why This Exists"),
    "A terminal-first portfolio for employers who care about shipped outcomes, technical judgment, and product taste.",
    "",
    `${theme.dim("Featured proof")} ${projectNames}`,
  ].join("\n");
}

function modeHint(mode) {
  return mode === "guided"
    ? `${theme.dim("Tab")} switch to Sandbox   ${theme.dim("Enter")} open   ${theme.dim("Q")} quit`
    : `${theme.dim("Tab")} switch to Guided   ${theme.dim("palette")} browse commands   ${theme.dim("quit")} exit`;
}

function renderLanding(session) {
  return [
    hero(session),
    "",
    summaryStrip(session),
    "",
    sectionLabel("Explore"),
    "Start with outcomes and work, then drop into Sandbox if you want the technical shell.",
    "",
    theme.dim(modeHint("guided")),
  ].join("\n");
}

function renderOverview(session) {
  const { profile, featuredProjects, leadershipHighlights } = session.data;

  return [
    hero(session),
    "",
    sectionLabel("Overview"),
    profile.subheadline,
    "",
    `${theme.accentStrong("Employer snapshot")}`,
    `- ${leadershipHighlights[0]}`,
    `- ${leadershipHighlights[1]}`,
    `- ${featuredProjects[0].title}: ${featuredProjects[0].summary}`,
    "",
    `${theme.dim("Next best clicks")} Work / Leadership / Contact`,
  ].join("\n");
}

function renderProjectList(session) {
  return [
    sectionLabel("Featured Work"),
    "A few curated projects with enough context to understand the product and the role I played.",
    "",
    ...session.data.featuredProjects.map((project, index) => {
      return `${theme.accentStrong(`${index + 1}. ${project.title}`)}  ${theme.dim(
        `${project.role} / ${project.period}`
      )}\n${project.tagline}\n${theme.dim(project.summary)}`;
    }),
    "",
    theme.dim(modeHint("guided")),
  ].join("\n\n");
}

function renderProjectDetail(project, index) {
  return [
    sectionLabel(`Project ${index + 1}`),
    `${theme.strong(project.title)}  ${theme.dim(`${project.role} / ${project.period}`)}`,
    project.tagline,
    "",
    project.summary,
    "",
    `${theme.accentStrong("Outcomes")}`,
    ...project.outcomes.map((outcome) => `- ${outcome}`),
    "",
    `${theme.accentStrong("Impact")}`,
    ...project.impactMetrics.map((metric) => `- ${metric}`),
    "",
    `${theme.accentStrong("Stack")}`,
    project.stack.join(" / "),
  ].join("\n");
}

function renderLeadership(session) {
  return [
    sectionLabel("Leadership & Outcomes"),
    "The throughline is delivery quality: making the product better while keeping the team confident and moving.",
    "",
    ...session.data.leadershipHighlights.map((item) => `- ${item}`),
  ].join("\n");
}

function renderContact(session) {
  const { profile, links } = session.data;

  return [
    sectionLabel("Contact"),
    `${theme.strong(profile.name)}`,
    `${profile.headline}`,
    "",
    `${theme.dim("Email")}      ${profile.contactEmail}`,
    `${theme.dim("Website")}    ${links.website}`,
    `${theme.dim("Work")}       ${links.work}`,
    `${theme.dim("LinkedIn")}   ${links.linkedin}`,
    `${theme.dim("GitHub")}     ${links.github}`,
  ].join("\n");
}

function renderPosts(session) {
  return [
    sectionLabel("Latest Writing"),
    ...session.data.latestPosts.map((post, index) => {
      return `${theme.accentStrong(`${index + 1}. ${post.title}`)}  ${theme.dim(
        formatDate(post.publishedAt)
      )}\n${post.excerpt}`;
    }),
  ].join("\n\n");
}

function renderExperiments(session) {
  return [
    sectionLabel("Experiments"),
    ...session.data.featuredExperiments.map((experiment, index) => {
      return `${theme.accentStrong(`${index + 1}. ${experiment.title}`)}\n${experiment.summary}\n${theme.dim(
        experiment.tags.join(" / ")
      )}`;
    }),
  ].join("\n\n");
}

function renderAskAnswer(question, result) {
  const lines = [
    sectionLabel("Ask Corey"),
    `${theme.dim("Question")} ${question}`,
    "",
    result.answer,
  ];

  if (result.citations && result.citations.length > 0) {
    lines.push("");
    lines.push(theme.accentStrong("References"));
    result.citations.forEach((citation) => {
      lines.push(`- ${citation.title} (${citation.sourceType})`);
      lines.push(`  ${theme.dim(citation.url)}`);
    });
  }

  return lines.join("\n");
}

function renderExternalPreview(target) {
  return panel(
    [
      sectionLabel("Open Link"),
      `${theme.strong(target.label)}`,
      target.description,
      "",
      theme.dim(target.url),
    ],
    {
      borderColor: "cyan",
    }
  );
}

function renderShellIntro(session) {
  const featuredProof = session.data.featuredProjects
    .map((project) => project.title)
    .join(" / ");
  const syncLabel =
    session.source === "live"
      ? theme.success("Live data ready")
      : theme.accent("Bundled snapshot in use");

  return shellPanel(
    [
      `${theme.tealStrong("Sandbox")}  ${theme.dim("technical view")}`,
      `${session.data.profile.name} / ${session.data.profile.headline}`,
      "",
      `${theme.accentStrong("Start here")}  overview / work / project 1 / ask`,
      `${theme.accentStrong("Examples")}    open website / project quotecloud / mode guided`,
      `${theme.accentStrong("Signals")}     ${featuredProof}`,
      `${theme.accentStrong("Context")}     ${syncLabel}`,
      "",
      theme.dim("Shift + Tab from an empty prompt switches back to Guided."),
    ],
    {
      borderColor: "cyan",
    }
  );
}

function renderShellPrompt() {
  return `${theme.tealStrong("sandbox")} ${theme.dim("::")} `;
}

function renderShellOverview(session) {
  const { profile, featuredProjects } = session.data;

  return shellPanel([
    `${theme.accentStrong("Overview")}`,
    profile.subheadline,
    "",
    detailRow(
      "Best fit",
      "Principal IC / tech lead roles on product-focused teams"
    ),
    detailRow("Availability", profile.availability, theme.accentStrong),
    detailRow("Reach", `${profile.contactEmail} / ${compactLink(session.data.links.linkedin)}`),
    "",
    `${theme.accentStrong("Featured proof")}`,
    ...featuredProjects.map(
      (project, index) =>
        `${index + 1}. ${theme.strong(project.title)}  ${theme.dim(
          `${project.role} / ${project.period}`
        )}\n   ${project.tagline}`
    ),
  ]);
}

function renderShellWork(session) {
  return shellPanel([
    `${theme.accentStrong("Featured Work")}`,
    "Project snapshots optimized for quick scanning.",
    "",
    ...session.data.featuredProjects.map(
      (project, index) =>
        `${index + 1}. ${theme.strong(project.title)}  ${theme.dim(
          `${project.role} / ${project.period}`
        )}\n   ${project.summary}\n   ${theme.dim(project.stack.join(" / "))}`
    ),
  ]);
}

function renderShellProjectDetail(project, index) {
  const linkEntries = Object.entries(project.links).filter(([, url]) => Boolean(url));

  return shellPanel([
    `${theme.accentStrong(`Project ${index + 1}`)}  ${theme.strong(project.title)}`,
    `${project.role} / ${project.period}`,
    project.tagline,
    "",
    project.summary,
    "",
    `${theme.accentStrong("Outcomes")}`,
    ...project.outcomes.map((outcome) => `- ${outcome}`),
    "",
    `${theme.accentStrong("Impact")}`,
    ...project.impactMetrics.map((metric) => `- ${metric}`),
    "",
    `${theme.accentStrong("Links")}`,
    ...linkEntries.map(([key, url]) => `- ${key}: ${theme.dim(url)}`),
  ]);
}

function renderShellLeadership(session) {
  return shellPanel([
    `${theme.accentStrong("Leadership & Outcomes")}`,
    "How the work gets shipped, stabilized, and scaled.",
    "",
    ...session.data.leadershipHighlights.map((item) => `- ${item}`),
  ]);
}

function renderShellPosts(session) {
  return shellPanel([
    `${theme.accentStrong("Latest Writing")}`,
    ...session.data.latestPosts.map(
      (post, index) =>
        `${index + 1}. ${theme.strong(post.title)}  ${theme.dim(
          formatDate(post.publishedAt)
        )}\n   ${post.excerpt}`
    ),
  ]);
}

function renderShellExperiments(session) {
  return shellPanel([
    `${theme.accentStrong("Experiments")}`,
    ...session.data.featuredExperiments.map(
      (experiment, index) =>
        `${index + 1}. ${theme.strong(experiment.title)}\n   ${experiment.summary}\n   ${theme.dim(
          experiment.tags.join(" / ")
        )}`
    ),
  ]);
}

function renderShellContact(session) {
  const { profile, links } = session.data;

  return shellPanel([
    `${theme.accentStrong("Contact")}`,
    `${theme.strong(profile.name)} / ${profile.headline}`,
    "",
    detailRow("Email", profile.contactEmail),
    detailRow("Website", links.website),
    detailRow("Work", links.work),
    detailRow("LinkedIn", links.linkedin),
    detailRow("GitHub", links.github),
  ]);
}

function renderShellError(message) {
  return shellPanel([theme.danger(message)], {
    borderColor: "red",
  });
}

function renderShellNotice(message) {
  return [
    theme.dim("•"),
    message,
  ].join(" ");
}

function renderCompactOverview(session) {
  const { profile, featuredProjects, links } = session.data;

  return [
    `${profile.name} - ${profile.headline}`,
    profile.subheadline,
    "Best fit: Principal IC / tech lead roles on product-focused teams",
    `${profile.availability} / ${profile.location}`,
    "",
    "Featured work:",
    ...featuredProjects.map((project) => `- ${project.title}: ${project.tagline}`),
    "",
    `Website: ${session.data.links.website}`,
    `Work: ${session.data.links.work}`,
    `Email: ${profile.contactEmail}`,
    `LinkedIn: ${links.linkedin}`,
  ].join("\n");
}

module.exports = {
  renderAskAnswer,
  renderCompactOverview,
  renderContact,
  renderExperiments,
  renderExternalPreview,
  renderLanding,
  renderLeadership,
  renderOverview,
  renderPosts,
  renderProjectDetail,
  renderProjectList,
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
  rule,
  sectionLabel,
  theme,
};
