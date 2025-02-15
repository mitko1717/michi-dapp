import React from "react";
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenu,
    NavbarMenuItem,
    NavbarMenuToggle
} from "@nextui-org/react";
import {ConnectButton} from "@rainbow-me/rainbowkit";
import {CLAIM, HOME, LEADERBOARD, MARKET, PROFILE, STAKE, WALLETS} from "../../routes/routes";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useSelector} from "react-redux";
import {AppState} from "../../store";
import {formatBalance} from "../../utils/formatters";
import {useAccount, useChainId} from "wagmi";
import {ChainId} from "../../types/chain";
import {track} from "@vercel/analytics";

export default function nav() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const pathname = usePathname();
    const michiPoints = useSelector((state: AppState) => state.user.points);
    const chainId = useChainId();

    const {address} = useAccount();

    return (
        <Navbar onMenuOpenChange={setIsMenuOpen} maxWidth="full" className="navbar" isBlurred={false}>
            <NavbarContent className="sm:hidden">
                <NavbarMenuToggle
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    className="sm:hidden"
                />
                <NavbarBrand>
                    <Link color="foreground" href={HOME}>
                        <img src="/logo.png" className="h-6 mb-1.5" alt="logo"/>
                    </Link>
                </NavbarBrand>
            </NavbarContent>
            <NavbarContent className="hidden sm:flex gap-4 mr-10">
                <NavbarItem isActive={HOME === pathname}>
                    <Link color="foreground" href={HOME}>
                        <img src="/logo.svg" className="h-8 mb-1.5" alt="logo"/>
                    </Link>
                </NavbarItem>
                {/* <NavbarItem isActive={WALLETS === pathname}>
                    <Link color="foreground" href={WALLETS}>
                        My Wallets
                    </Link>
                </NavbarItem> */}
                {/* <NavbarItem isActive={MARKET === pathname}>
                    <Link href={MARKET} aria-current="page">
                        Marketplace
                    </Link>
                </NavbarItem> */}
                {/* {chainId != ChainId.MANTLE &&
                    <NavbarItem isActive={PROFILE === pathname}>
                        <Link href={PROFILE} aria-current="page">
                            Profile
                        </Link>
                    </NavbarItem>
                } */}
                <NavbarItem isActive={STAKE === pathname}>
                    <Link href={STAKE} aria-current="page">
                        Stake
                    </Link>
                </NavbarItem>
                {/* <NavbarItem isActive={CLAIM === pathname}>
                    <Link href={CLAIM} aria-current="page">
                        Claim
                    </Link>
                </NavbarItem> */}
                {/* <NavbarItem isActive={LEADERBOARD === pathname}>
                    <Link href={LEADERBOARD} aria-current="page">
                        Pichi Points
                    </Link>
                </NavbarItem> */}
                {address && <NavbarItem>
                    <div
                        className="flex flex-row justify-center items-center mr-4 border-2 border-primary bg-black-100 bg-opacity-50 rounded-lg pr-4 pl-2">
                        <img src="/logo.png" alt="logo" className="w-4 h-4 mr-2"/>
                        <span>{formatBalance(michiPoints)}</span>
                    </div>
                </NavbarItem>}
            </NavbarContent>
            <NavbarContent justify="end">
                <NavbarItem onClick={() => track("Wallet Connection Initiated")}>
                    <ConnectButton/>
                </NavbarItem>
            </NavbarContent>
            <NavbarMenu>
                <NavbarMenuItem isActive={WALLETS === pathname}>
                    <Link color="foreground" href={WALLETS}>
                        My Wallets
                    </Link>
                </NavbarMenuItem>
                <NavbarMenuItem isActive={MARKET === pathname}>
                    <Link href={MARKET} aria-current="page">
                        Marketplace
                    </Link>
                </NavbarMenuItem>
                <NavbarMenuItem isActive={PROFILE === pathname}>
                    <Link href={PROFILE} aria-current="page">
                        Profile
                    </Link>
                </NavbarMenuItem>
                <NavbarMenuItem isActive={STAKE === pathname}>
                    <Link href={STAKE} aria-current="page">
                        Stake
                    </Link>
                </NavbarMenuItem>
                <NavbarMenuItem isActive={CLAIM === pathname}>
                    <Link href={CLAIM} aria-current="page">
                        Claim
                    </Link>
                </NavbarMenuItem>
                <NavbarMenuItem isActive={MARKET === pathname}>
                    <Link href={MARKET} aria-current="page">
                        Pichi Points
                    </Link>
                </NavbarMenuItem>
                <NavbarMenuItem>
                    <div
                        className="flex flex-row justify-center items-center mr-4 border-2 border-primary bg-black-100 bg-opacity-50 rounded-lg pr-4 pl-2">
                        <img src="/logo.png" alt="logo" className="w-4 h-4 mr-2"/>
                        <span>{formatBalance(michiPoints)}</span>
                    </div>
                </NavbarMenuItem>
            </NavbarMenu>
        </Navbar>
    );
}