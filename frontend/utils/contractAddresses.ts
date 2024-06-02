import contractAddressesJSON from "@/utils/contract-address.json";
export const contractAddresses = contractAddressesJSON;

export type SupportedChainIds = keyof typeof contractAddressesJSON;
