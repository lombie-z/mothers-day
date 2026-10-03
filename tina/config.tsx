import { defineConfig } from "tinacms";
import { portfolioFields } from "./portfolioFields";
import { artCategories } from "../src/artCategories";

export default defineConfig({
  branch: process.env.TINA_BRANCH || "main",
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || "",
  token: process.env.TINA_TOKEN || "",
  build: {
    publicFolder: "public",
    outputFolder: "admin",
  },
  media: {
    tina: {
      publicFolder: "public",
      mediaRoot: "uploads",
    },
  },
  schema: {
    collections: [
      {
        label: "Site Settings",
        name: "settings",
        path: "content",
        format: "json",
        ui: {
          allowedActions: { create: false, delete: false },
          global: true,
          router: () => "/",
        },
        match: { include: "settings" },
        fields: [
          {
            type: "string",
            label: "Heading",
            name: "heading",
            required: true,
          },
          {
            type: "string",
            label: "Subtitle",
            name: "subtitle",
          },
          {
            type: "string",
            label: "About Text",
            name: "aboutText",
            description: "Press Enter or use [br] for a line break. Use two for a blank line.",
            ui: { component: "textarea" },
          },
          {
            type: "string",
            label: "About CTA",
            name: "aboutCta",
          },
          {
            type: "string",
            label: "Email",
            name: "email",
          },
        ],
      },
      ...artCategories.map(({ slug, label }) => ({
        label,
        name: slug,
        path: `content/${slug}`,
        format: "json" as const,
        ui: {
          allowedActions: { create: false, delete: false },
          global: true,
          router: () => `/${slug}`,
        },
        match: { include: "portfolio" },
        fields: portfolioFields,
      })),
    ],
  },
});
