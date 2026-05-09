import React, { useEffect } from "react";
import { ImageField } from "tinacms";

// Custom component that auto-captures image dimensions on upload
// Based on https://tina.io/docs/extending-tina/custom-field-components#image-component-with-hidden-meta-fields

const loadImage = async (url: string) => {
  const img = new Image();
  img.src = url;
  await img.decode();
  return img;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ImageWithDimensions(props: any) {
  const { form, input } = props;

  useEffect(() => {
    if (!input.value) return;
    loadImage(input.value).then((img) => {
      const leadingField = input.name.replace("image", "");
      form.change(`${leadingField}imageWidth`, img.naturalWidth);
      form.change(`${leadingField}imageHeight`, img.naturalHeight);
    });
  }, [form, input]);

  return <ImageField {...props} />;
}
