import {Text2ImageModel} from "@nexxus-ai/typescript-commons/dist/types";
import {StylePreset} from "./image";

export enum AI {
    stableDiffusion = "STABLE_DIFFUSION",
    dallE = "DALL_E",
    lexica = "LEXICA",
    chatGpt3 = "CHATGPT3",
    chatGpt4 = "CHATGPT4",
    midjourney = "MIDJOURNEY"
}

export type Template = { id: StylePreset, name: string, description: string, img: string, subtitle: string }

export type Subtype = {
    id: Text2ImageModel,
    name: string
}

export type ImageAi = {
    id: AI,
    name: string,
    negativePrompts: boolean,
    model: string,
    image: string,
    description: string,
    href: string,
    subtypes: Subtype[],
    sizes?: string[],
    templates?: Template[],
    steps?: ("high" | "low")[],
    mode?: ("fast" | "relaxed")[]
}

export  type ChatAI = {
    id: AI,
    name: string,
    image: string,
    description: string,
    href: string
}

export type Ai = AI;