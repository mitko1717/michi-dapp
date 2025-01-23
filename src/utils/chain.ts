import {ChainId} from "../types/chain";

const arbitrumLogo = "/assets/logos/arbitrum.svg";
const ethereumLogo = "/assets/logos/eth.png";
const optimismLogo = "/assets/logos/optimism.png";
const sepoliaLogo = "/assets/logos/sepolia.png";
const mantleLogo = "/assets/logos/mantle.svg";
const sonicLogo = "/assets/logos/sonic.png";

const chainLogos = {
    [ChainId.ARBITRUM]: arbitrumLogo,
    [ChainId.ETHEREUM]: ethereumLogo,
    [ChainId.OPTIMISM]: optimismLogo,
    [ChainId.SEPOLIA]: sepoliaLogo,
    [ChainId.MANTLE]: mantleLogo,
    [ChainId.SONIC_TESTNET]: sonicLogo
};



export const getIconFromChain = (chainId: ChainId) => {
    return chainLogos[chainId];
};