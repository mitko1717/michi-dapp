import {NextRequest, NextResponse} from "next/server";

const blockedCountries = [
    "AF", "BY", "MM", "AL", "BA", "ME", "MK", "RS", "XK", "CF", "CN", "CU",
    "CD", "KP", "ET", "HK", "IR", "IQ", "LB", "LY", "ML", "NI", "RU",
    "SY", "SO", "SS", "SD", "UA", "VE", "YE", "US"
];

export function middleware(req: NextRequest) {
    const {geo} = req;
    console.log(geo);

    if (geo && geo.country && blockedCountries.includes(geo.country)) {
        return NextResponse.redirect(new URL("/blocked", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/claim/:path*"
};