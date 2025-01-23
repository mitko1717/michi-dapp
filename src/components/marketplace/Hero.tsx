import React from "react";

const Hero = () => {
    return (
        <div className="grid grid-cols-6">
            <div className="p-6 w-full ml-auto col-span-6 sm:col-span-3 my-auto">
                <h1 className="text-6xl">Explore the Pichi Ecosystem</h1>
                <p>Trading points is as easy as trading an NFT</p>
            </div>
            <div className="col-span-6 sm:col-span-3 ml-auto hidden sm:block mr-6">
                <img src="/assets/marketplace/banner.svg" alt="Pichi Solar System" className="h-full"/>
            </div>
        </div>
    );
};

export default Hero;
