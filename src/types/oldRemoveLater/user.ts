import {SubscriptionTier} from "@nexxus-ai/typescript-commons";

export type UserApiResponse = {
    id: number,
    email: string,
    username: string,
    redTokens: number,
    blueTokens: number,
    signupDate?: string,
    subscription?: { tier: SubscriptionTier, price: number, expirationDate: string | number | Date},
    images?: string[],
    chats?: string[]
}