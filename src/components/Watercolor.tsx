"use client";

import { forwardRef, useMemo } from "react";
import { KuwaharaEffect } from "./KuwaharaEffect";

type WatercolorProps = {
  kernelSize?: number;
};

export const Watercolor = forwardRef<KuwaharaEffect, WatercolorProps>(
  ({ kernelSize = 4 }, ref) => {
    const effect = useMemo(() => new KuwaharaEffect({ kernelSize }), [kernelSize]);
    return <primitive ref={ref} object={effect} dispose={null} />;
  }
);

Watercolor.displayName = "Watercolor";
