import React from "react";
import WalletSidebar from "./walletSidebar";
import {NextPage} from "next";
import {useAppSelector} from "../../hooks/hooks";
import {selectUser} from "../../features/user/userSlice";
import {useRouter} from "next/router";
import {useSelector} from "react-redux";
import {AppState} from "../../store";
import {HOME} from "../../routes/routes";
import NullWalletsPlaceholder from "../placeholders/NullWalletsPlaceholder";
import WalletNotSelectedPlaceholder from "../placeholders/WalletNotSelectedPlaceholder";
import {Spinner} from "@nextui-org/react";
import WalletSelector from "../widgets/WalletSelector";

const Wallets: NextPage = () => {
    const user = useAppSelector(selectUser);
    const router = useRouter();
    const michiWallets = useSelector((state: AppState) => state.wallet.michiNfts);
    const loading = useSelector((state: AppState) => state.wallet.status === "loading");

    if (user?.data?.id) {
        router.push(HOME);
    }

    return (
        <div className="grid grid-cols-6">
            <WalletSidebar/>
            <WalletSelector/>
            {loading ? <div className="m-4"><Spinner color="default" size={"lg"}/></div> : !michiWallets || michiWallets?.length === 0 ?
                <NullWalletsPlaceholder/> : <WalletNotSelectedPlaceholder/>}
        </div>
    );
};


export default Wallets;