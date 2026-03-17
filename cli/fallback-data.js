"use strict";

const fallbackPayload = {
  version: 1,
  updatedAt: "2026-03-18T00:00:00.000Z",
  profile: {
    name: "Corey Baines",
    headline: "Principal / Lead Full-Stack Engineer",
    subheadline:
      "Product-focused software across web, backend, Apple platforms, and practical AI workflows.",
    availability: "Open to exploring new product and engineering opportunities.",
    location: "Sydney, Australia",
    contactEmail: "corey@spiritdevs.com",
    socials: [
      {
        label: "GitHub",
        href: "https://github.com/coreybain",
      },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/coreybaines/",
      },
      {
        label: "X",
        href: "https://x.com/coreybaines",
      },
    ],
  },
  featuredProjects: [
    {
      slug: "quotecloud",
      title: "QuoteCloud",
      tagline: "Sales quote and proposal workflows built for speed.",
      summary:
        "A focused B2B workflow product designed to reduce friction in quote generation and proposal delivery.",
      role: "Product Engineering Lead",
      period: "2023 - Present",
      stack: ["Next.js", "TypeScript", "React", "Node.js"],
      outcomes: [
        "Reduced operational friction in quote preparation",
        "Improved confidence in proposal quality and consistency",
      ],
      impactMetrics: [
        "Faster quote turnaround for sales workflows",
        "Higher consistency across proposal outputs",
      ],
      links: {
        live: "https://quote.cloud",
        caseStudy: "https://coreybaines.com/work/quotecloud",
        video: "https://www.youtube.com/@quotecloud",
      },
    },
    {
      slug: "traveldocs",
      title: "TravelDocs",
      tagline: "Smart itinerary and document management for travel.",
      summary:
        "An iOS-first product to organize itineraries and critical travel documents with offline access.",
      role: "Product Engineer",
      period: "2024 - Present",
      stack: ["Swift", "SwiftUI", "iOS"],
      outcomes: [
        "Improved trip-day readiness through centralized information",
        "Stronger confidence with offline access to important documents",
      ],
      impactMetrics: [
        "Offline-first access to essential travel information",
        "Clearer trip-day workflow for confirmations, notes, and tickets",
      ],
      links: {
        store: "https://apps.apple.com/us/app/traveldocs/id6477499212",
        caseStudy: "https://coreybaines.com/work/traveldocs",
      },
    },
    {
      slug: "npx-card",
      title: "npx coreybaines",
      tagline: "A lightweight CLI profile card for quick technical introductions.",
      summary:
        "A developer-facing artifact that turns a portfolio link into a terminal experience with real personality.",
      role: "Creator",
      period: "2022 - Present",
      stack: ["Node.js", "JavaScript"],
      outcomes: [
        "Created a memorable call-to-action for technical audiences",
        "Added a portfolio touchpoint that feels native to developer culture",
      ],
      impactMetrics: [
        "Faster path from curiosity to context for technical recruiters",
        "More distinctive personal brand than a standard static profile page",
      ],
      links: {
        repo: "https://github.com/coreybain/npx_card",
        caseStudy: "https://coreybaines.com/work/npx-card",
      },
    },
  ],
  leadershipHighlights: [
    "Led full-stack delivery from discovery through release across multiple product initiatives.",
    "Owned architecture and delivery standards while balancing customer value, quality, and speed.",
    "Mentored engineers and supported cross-team execution in product-focused environments.",
    "Built AI-assisted workflows aimed at better operator decisions instead of novelty demos.",
  ],
  latestPosts: [
    {
      slug: "designing-for-reliability-in-small-teams",
      title: "Designing for Reliability in Small Teams",
      excerpt:
        "How to keep momentum while still building systems that hold up under pressure.",
      publishedAt: "2026-02-10",
      href: "https://coreybaines.com/blog/designing-for-reliability-in-small-teams",
    },
    {
      slug: "building-ai-features-that-actually-help",
      title: "Building AI Features That Actually Help",
      excerpt:
        "A pragmatic framework for AI features that improve workflows instead of adding noise.",
      publishedAt: "2026-01-21",
      href: "https://coreybaines.com/blog/building-ai-features-that-actually-help",
    },
    {
      slug: "swiftui-lessons-from-real-product-work",
      title: "SwiftUI Lessons from Real Product Work",
      excerpt:
        "Patterns that held up in production across offline state, sync, and long-lived views.",
      publishedAt: "2025-12-18",
      href: "https://coreybaines.com/blog/swiftui-lessons-from-real-product-work",
    },
  ],
  featuredExperiments: [
    {
      slug: "ask-corey-rag-prototype",
      title: "Ask Corey RAG Prototype",
      summary:
        "A grounded Q&A flow over project and writing content with citation-first responses.",
      tags: ["AI", "RAG", "Vercel AI SDK"],
      links: {
        live: "https://coreybaines.com/ask",
      },
    },
  ],
  links: {
    website: "https://coreybaines.com",
    work: "https://coreybaines.com/work",
    about: "https://coreybaines.com/about",
    contact: "https://coreybaines.com/contact",
    ask: "https://coreybaines.com/ask",
    github: "https://github.com/coreybain",
    linkedin: "https://www.linkedin.com/in/coreybaines/",
    x: "https://x.com/coreybaines",
    email: "mailto:corey@spiritdevs.com",
  },
  ask: {
    enabled: true,
    url: "https://coreybaines.com/api/cli-card/ask",
  },
};

module.exports = {
  fallbackPayload,
};
