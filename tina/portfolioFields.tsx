import type { TinaField } from "tinacms";
import { ImageWithDimensions } from "./ImageWithDimensions";

export const portfolioFields: TinaField[] = [
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
];
