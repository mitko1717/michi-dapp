import React, {useEffect} from "react";
import {formatBalance} from "../../utils/formatters";
import {Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@nextui-org/react";
import {getActualBalance} from "../../utils/helpers";
import {useSelector} from "react-redux";
import {AppState} from "../../store";

const WalletBalanceTable = ({ walletSale = false }) => {
   const currentWallet = useSelector((state: AppState) => state.wallet.currentWallet);

    if(currentWallet?.tokensStatus === "loading"){
        return <div className="pichi-card">
            <div className="text-center text-lg my-12"><Spinner color="default" size={"lg"}/></div>
        </div>;
    }

   if (!currentWallet?.tokens || currentWallet?.tokens?.length === 0) {
       return <div className="pichi-card">
              <p className="text-center text-lg my-12">No tokens found</p>
       </div>;
   }

    return (
        <Table removeWrapper aria-label="Tokenized Points"
               className={`border-1 border-solid border-custom-gray shadow-custom bg-custom-gradient rounded-2xl ${walletSale?'max-h-52 overflow-y-auto scrollbar-thin my-2':'overflow-hidden my-4'}`}>
            <TableHeader>
                <TableColumn className={`bg-transparent px-6 py-5 ${walletSale?'hidden':''}`}>Token</TableColumn>
                <TableColumn className={`bg-transparent ${walletSale?'px-6 pt-2':'py-5'}`}>{walletSale?'Asset':'Symbol'}</TableColumn>
                <TableColumn className={`bg-transparent ${walletSale?'px-6 pt-2':'py-5'}`}>{walletSale?'Amount':'Balance'}</TableColumn>
            </TableHeader>
            <TableBody className="">
                {currentWallet?.tokens?.filter(token => Number(token?.balance) > 0)?.sort((a, b) => Number(b.balance) - Number(a.balance))?.map((token, index) =>
                    <TableRow key={index} className="border-t-1 border-solid border-custom-gray">
                        <TableCell className={`flex flex-row items-center px-6 py-4 ${walletSale?'hidden':''}`}>
                            {token.name}
                        </TableCell>
                        <TableCell className={`${walletSale?'px-6 py-5':''}`}>{token.symbol}</TableCell>
                        <TableCell className={`${walletSale?'px-6 py-5':''}`}>{formatBalance(getActualBalance(token))}</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
};

export default WalletBalanceTable;
