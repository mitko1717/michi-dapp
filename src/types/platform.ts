export enum Platform {
    KELPDAO = "kelpdao",
    ETHERFI = "etherfi",
    RENZO = "renzo",
    PUFFER = "puffer",
    BEDROCK = "bedrock",
    SWELL = "swell",
    ETHENA = "ethena",
    EIGENLAYER = "eigenlayer"
}

export const platformIcons = {
    [Platform.KELPDAO]: "/assets/platforms/icons/kelp.svg",
    [Platform.ETHERFI]: "/assets/platforms/icons/etherfi.svg",
    [Platform.RENZO]: "/assets/platforms/icons/renzo.svg",
    [Platform.BEDROCK]: "/assets/platforms/icons/bedrock.png",
    [Platform.SWELL]: "/assets/platforms/icons/swell.png",
    [Platform.ETHENA]: "/assets/platforms/icons/ethena.svg",
    [Platform.EIGENLAYER]: "/assets/platforms/icons/eigenlayer.svg",
    [Platform.PUFFER]: "/assets/platforms/icons/puffer.svg"
};

export interface PlatformApiResponse  {
    points: string,
    platform: Platform
}