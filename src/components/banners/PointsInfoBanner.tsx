"use client";

import React from "react";
import {Button, Tooltip} from "@nextui-org/react";
import {BsInfoCircle} from "react-icons/bs";


const PointsInfoBanner = () => {
    return (
        <div
            className="border-2 border-solid border-custom-gray shadow-custom bg-custom-gradient rounded-3xl overflow-hidden">
            <div className="grid grid-cols-6 md:grid-cols-12  justify-center">
                <div className="relative col-span-12 md:col-span-3 p-4 pl-10 my-10">
                    <h2 className="bg-text-gradient bg-clip-text text-transparent font-bold text-5xl">Tokenize your Points</h2>
                </div>
                <div className="col-span-10 md:col-span-6 p-2 my-10">
                    <p className="text-custom-blue">Exchange your Pichi Wallet for
                        tokenized ERC-20 versions of your earned points. Tokenized points represent a
                        pro-rata share of the points earned in wallets held by Michi</p>
                    <p className="font-bold text-bold-blue mt-2">Note: You will permanently lose access to your
                        wallet by taking this action. Please withdraw all assets before proceeding</p>
                    <Tooltip showArrow={true} className="tooltip" placement="right"
                             content="Tokenized points are fungible versions of the points you’ve earned. After exchanging your Pichi Wallet, these tokenized points can be sold on UniswapV3. When the underlying points convert to a token, the tokenized points can be redeemed for the proportionate token amount.">
                        <p className="font-bold text-custom-purple mt-5 inline-flex flex-row items-center cursor-pointer">Know
                            More <BsInfoCircle className="ml-2"/></p>
                    </Tooltip>
                </div>
                <div className="col-span-2 md:col-span-3 hidden sm:block">
                    <img src="./assets/misc/pointsInfo.png" alt="Points Info" className="ml-auto h-full"/>
                </div>
            </div>
        </div>

    );
};

export default PointsInfoBanner;
