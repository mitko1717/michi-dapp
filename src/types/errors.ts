export const UNKNOWN_ERROR = "An unknown error occurred";

export interface ApiError {
    response?: {
        status: number;
        data: {
            message: string;
        };
    };
}

export interface WalletClientError extends Error {
    shortMessage?: string;
}

export interface ErrorPayload {
    message: string;
}