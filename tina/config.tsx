import { defineConfig } from "tinacms";
import { ImageWithDimensions } from "./ImageWithDimensions";

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
      {
        label: "Portfolio",
        name: "portfolio",
        path: "content",
        format: "json",
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
          global: true,
          router: () => "/work",
        },
        match: {
          include: "portfolio",
        },
        fields: [
          {
            type: "object",
            label: "Works",
            name: "works",
            list: true,
            ui: {
              itemProps: (item) => ({
                label: item?.title || "Untitled",
              }),
            },
            fields: [
              {
                type: "string",
                label: "Title",
                name: "title",
                required: true,
              },
              {
                type: "image",
                label: "Image",
                name: "image",
                required: true,
                ui: {
                  component: ImageWithDimensions,
                },
              },
              {
                type: "string",
                label: "Description",
                name: "description",
                ui: { component: "textarea" },
              },
              {
                type: "datetime",
                label: "Date",
                name: "date",
              },
              {
                type: "number",
                name: "imageWidth",
                label: "Image Width",
                ui: { component: () => null },
              },
              {
                type: "number",
                name: "imageHeight",
                label: "Image Height",
                ui: { component: () => null },
              },
              {
                type: "string",
                label: "Background",
                name: "background",
                ui: {
                  component: "color",
                  colorFormat: "hex",
                  colors: ["#8b2a4a", "#1a0408", "#2a1a2e", "#1a1a2e", "#f5e6eb", "#f0ebe3", "#e8ddd3"],
                },
              },
            ],
          },
        ],
      },
    ],
  },
});
