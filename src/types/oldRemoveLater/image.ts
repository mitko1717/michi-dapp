import {StableDiffusionStylePreset, Text2ImageModel} from "@nexxus-ai/typescript-commons";
import {MidjourneyStylePreset} from "@nexxus-ai/typescript-commons/dist/types";
import {AI} from "./ai";
import {VariationType} from "../../features/generation/variationAPI";

export type StylePreset = StableDiffusionStylePreset | MidjourneyStylePreset;

export type Image = {
    generationId?: number;
    url: string;
    markedForSave?: boolean;
    id?: number;
    S3Key?: string;
    title?: string;
    index?: MidjourneyIndex;
}

export type MidjourneyIndex = 0 | 1 | 2 | 3;

export enum GENERATION {
    generation = "GENERATION",
    variation = "VARIATION"
}

export type Histories = History[];

export type History = {}

export enum MidjourneyDirection {
    left = "pan_left",
    right = "pan_right",
    up = "pan_up",
    down = "pan_down"
}

export type VariationPayload = {
    generationId: number,
    ai: AI,
    type: GENERATION.variation,
    n: number,
    prompt: string,
    variationType: VariationType | MidjourneyDirection,
    index?: MidjourneyIndex,
    multiplier?: 1.5 | 2, // applicable for zoom_out
}


export type GenerationPayload = {
    prompt: string, // required
    type: GENERATION.generation,
    model: Text2ImageModel, // requred
    ai: AI,
    negativePrompt?: string,
    n: number, // default is 1, max is 4
    width?: number, // default is 512
    height?: number // default is 512
    stylePreset?: StylePreset,
}


export type ImageResponse = Image[]