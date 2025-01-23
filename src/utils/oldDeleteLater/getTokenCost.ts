import {
    getTokenCostDalle,
    getTokenCostMidjourney,
    getTokenCostStableDiffusion
} from "@nexxus-ai/typescript-commons";
import {ImageAi} from "../../types/oldRemoveLater/ai";
import {ControlsType} from "../../types/oldRemoveLater/controls";
import {Text2ImageModel} from "@nexxus-ai/typescript-commons/dist/types";

export const getTokenCost = (currentAi: ImageAi | undefined, settings: ControlsType) => {
    let cost = 0;
    if (currentAi?.id === "DALL_E") {
    } else if (currentAi?.id === "STABLE_DIFFUSION" && settings.steps && settings.size) {
        const _model = settings.subtype || settings.model || Text2ImageModel.STABLE_DIFFUSION_SDXL;
        cost = getTokenCostStableDiffusion(_model, settings.steps, settings.size, settings.n) || 0;
    } else if (currentAi?.id === "MIDJOURNEY" && settings.mode) {
        cost = getTokenCostMidjourney(settings.mode);
    }
    cost = getTokenCostDalle("standard","1");
    return cost;
};