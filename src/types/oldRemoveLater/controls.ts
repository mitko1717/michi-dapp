import {
    MidjourneyMode,
    StableDiffusionSize,
    StableDiffusionSteps,
    Text2ImageModel
} from "@nexxus-ai/typescript-commons";
import {StylePreset} from "./image";

export type ControlsType = {
    model?: Text2ImageModel,
    negativePrompt?: string,
    n: number,
    aspectRatio?: number ,
    size?: StableDiffusionSize,
    stylePreset?: StylePreset,
    mode?: MidjourneyMode,
    steps?: StableDiffusionSteps,
    subtype?: Text2ImageModel,
}