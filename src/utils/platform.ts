import {Platform, platformIcons} from "../types/platform";

export const getIconFromPlatform = (platform: Platform): string => {
    const _platform = platform?.toString().toLowerCase();
    return platformIcons[_platform as Platform];
};