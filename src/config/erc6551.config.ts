import {ethers} from "ethers";

// ERC6551 contract addresses
export const Erc6551Proxy = "0x55266d75D1a14E4572138116aF39863Ed6596E7F";
export const Erc6551Implementation = "0x41C8f39463A868d3A88af00cd0fe7102F30E44eC";
export const Erc6551RegistryAddress = "0x000000006551c19487814612e58FE06813775758";
// ERC6551 createAccount params
export const Salt = ethers.utils.hexZeroPad("0x0", 32);
