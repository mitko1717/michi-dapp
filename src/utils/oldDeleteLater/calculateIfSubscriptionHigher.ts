import {SubscriptionTier} from "@nexxus-ai/typescript-commons";

export const calculateIfSubscriptionHigher = (current: SubscriptionTier, target: SubscriptionTier) => {

    if (current === SubscriptionTier.LITE) {
        if (target === SubscriptionTier.ELITE || target === SubscriptionTier.PREMIUM) {
            return true;
        }
    } else if (current === SubscriptionTier.PREMIUM) {
        return target === SubscriptionTier.ELITE;
    } else if (current === SubscriptionTier.ELITE) {
        return false;
    }
    return false;
};