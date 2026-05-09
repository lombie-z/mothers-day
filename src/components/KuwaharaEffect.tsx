"use client";

import { Effect } from "postprocessing";
import { Uniform } from "three";

const kuwaharaFragmentShader = /* glsl */ `
uniform int u_kernelSize;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 texelSize = 1.0 / resolution;
  int radius = u_kernelSize;

  // Sector 0: top-right
  // Sector 1: top-left
  // Sector 2: bottom-left
  // Sector 3: bottom-right

  vec3 sectorSum[4];
  vec3 sectorSumSq[4];
  int sectorCount[4];

  for (int i = 0; i < 4; i++) {
    sectorSum[i] = vec3(0.0);
    sectorSumSq[i] = vec3(0.0);
    sectorCount[i] = 0;
  }

  for (int x = -radius; x <= radius; x++) {
    for (int y = -radius; y <= radius; y++) {
      vec2 offset = vec2(float(x), float(y)) * texelSize;
      vec3 sample_color = texture2D(inputBuffer, uv + offset).rgb;

      // Determine which sector this pixel belongs to
      if (x >= 0 && y >= 0) {
        sectorSum[0] += sample_color;
        sectorSumSq[0] += sample_color * sample_color;
        sectorCount[0]++;
      }
      if (x <= 0 && y >= 0) {
        sectorSum[1] += sample_color;
        sectorSumSq[1] += sample_color * sample_color;
        sectorCount[1]++;
      }
      if (x <= 0 && y <= 0) {
        sectorSum[2] += sample_color;
        sectorSumSq[2] += sample_color * sample_color;
        sectorCount[2]++;
      }
      if (x >= 0 && y <= 0) {
        sectorSum[3] += sample_color;
        sectorSumSq[3] += sample_color * sample_color;
        sectorCount[3]++;
      }
    }
  }

  // Find sector with lowest variance
  float minVariance = 1e10;
  vec3 result = inputColor.rgb;

  for (int i = 0; i < 4; i++) {
    float count = float(sectorCount[i]);
    vec3 mean = sectorSum[i] / count;
    vec3 variance = (sectorSumSq[i] / count) - (mean * mean);
    float totalVariance = variance.r + variance.g + variance.b;

    if (totalVariance < minVariance) {
      minVariance = totalVariance;
      result = mean;
    }
  }

  outputColor = vec4(result, inputColor.a);
}
`;

export class KuwaharaEffect extends Effect {
  constructor({ kernelSize = 4 }: { kernelSize?: number } = {}) {
    super("KuwaharaEffect", kuwaharaFragmentShader, {
      uniforms: new Map([["u_kernelSize", new Uniform(kernelSize)]]),
    });
  }

  get kernelSize() {
    return this.uniforms.get("u_kernelSize")!.value;
  }

  set kernelSize(value: number) {
    this.uniforms.get("u_kernelSize")!.value = value;
  }
}
