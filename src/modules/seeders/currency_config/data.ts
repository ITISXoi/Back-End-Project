import {ICurrencyConfigInterface} from "../../../database/interfaces/ICurrencyConfig.interface";

export const currencyConfigDataSeeds: ICurrencyConfigInterface[] = [
    {
        swapId: 1,
        network: 'polygon',
        chainName: 'mumbai',
        chainId: '80001',
        tokenAddresses: '{"collectionController": "0x4E8BdD329e08efB3CcB7e57479a0947d4BEf5f6f"}',
        averageBlockTime: 12000,
        requiredConfirmations: 12,
        tempRequiredConfirmations: 0,
        scanApi: 'https://mumbai.polygonscan.com/',
        rpcEndpoint: 'https://rpc.ankr.com/polygon_mumbai',
        explorerEndpoint: 'https://mumbai.polygonscan.com/',
    },
]