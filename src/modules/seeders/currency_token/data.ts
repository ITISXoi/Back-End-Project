import {IAdmin} from "../../../database/interfaces/IAdmin.interface";
import {ICurrencyTokenInterface} from "../../../database/interfaces/ICurrencyToken.interface";

export const currencyTokenDataSeeds: ICurrencyTokenInterface[] = [
    {
        id: 1,
        tokenName: 'ETH',
        decimal: 18,
        chainId: '5',
        contractAddress: '0x0000000000000000000000000000000000000000',
        status: 1,
        isNativeToken: 1,
        currency: 'ETH',
        icon: 'https://nft150-storage-stg.s3.ap-southeast-1.amazonaws.com/networkToken/3e514d4b16b9694dd3b27bc0fa247daa_1644457863407.png'
    },
    {
        id: 2,
        tokenName: 'XP',
        decimal: 18,
        chainId: '5',
        contractAddress: '0x249f337C98cC7aF490F1D323A5fA672aC4F7129b',
        status: 1,
        isNativeToken: 0,
        currency: 'XP',
        icon: 'https://stg-marketplace-images.polkafantasy.com/networkToken/d4ba5fcdfcd2b39d75ba2a1340a38d08_1654950929827.png'
    },
    {
        id: 3,
        tokenName: 'USDT',
        decimal: 6,
        chainId: '5',
        contractAddress: '0x509ee0d083ddf8ac028f2a56731412edd63223b9',
        status: 1,
        isNativeToken: 0,
        currency: 'USDT',
        icon: 'https://stg-marketplace-images.polkafantasy.com/networkToken/5b07927a7406bee578d1c23853ddf372_1654950929844.png'
    },
    {
        id: 4,
        tokenName: 'WETH',
        decimal: 18,
        chainId: '80001',
        contractAddress: '0xDcf1f7Dd2d11Be84C63cFd452B9d62520855a7F6',
        status: 1,
        isNativeToken: 0,
        currency: 'ETH',
        icon: 'https://nft150-storage-stg.s3.ap-southeast-1.amazonaws.com/networkToken/64a28722b4c62df070461e9dd4dcab99_1644457863411.png'
    },
    {
        id: 5,
        tokenName: 'USDT',
        decimal: 6,
        chainId: '80001',
        contractAddress: '0xc592b11915e3f8F963F3aE2170b530E38319b388',
        status: 1,
        isNativeToken: 0,
        currency: 'USDT',
        icon: 'https://stg-marketplace-images.polkafantasy.com/networkToken/5b07927a7406bee578d1c23853ddf372_1654950929844.png'
    },
    {
        id: 6,
        tokenName: 'XP',
        decimal: 18,
        chainId: '80001',
        contractAddress: '0x722799Da51252CCF9A240BD68A86d247793A84AE',
        status: 1,
        isNativeToken: 0,
        currency: 'XP',
        icon: 'https://stg-marketplace-images.polkafantasy.com/networkToken/d4ba5fcdfcd2b39d75ba2a1340a38d08_1654950929827.png'
    },
    {
        id: 7,
        tokenName: 'BUSD',
        decimal: 18,
        chainId: '97',
        contractAddress: '0x4Af96f000b0Df70E99dd06ea6cE759aFCd331cC1',
        status: 1,
        isNativeToken: 0,
        currency: 'BUSD',
        icon: 'https://nft150-storage-stg.s3.ap-southeast-1.amazonaws.com/networkToken/03a6e43688cf1d5b25eff63e9ed11dae_1638282302104.png'
    },
    {
        id: 8,
        tokenName: 'BNB',
        decimal: 18,
        chainId: '97',
        contractAddress: '0x0000000000000000000000000000000000000000',
        status: 1,
        isNativeToken: 1,
        currency: 'BNB',
        icon: 'https://nft150-storage-stg.s3.ap-southeast-1.amazonaws.com/networkToken/9e5cf89993d88ac744ce8cb3cc17c0dd_1644457863409.png'
    },
    {
        id: 9,
        tokenName: 'XP',
        decimal: 18,
        chainId: '97',
        contractAddress: '0x3f0A9E097d1D1162147A9F722628aF09Eac33bc4',
        status: 1,
        isNativeToken: 0,
        currency: 'XP',
        icon: 'https://stg-marketplace-images.polkafantasy.com/networkToken/d4ba5fcdfcd2b39d75ba2a1340a38d08_1654950929827.png'
    },
    {
        id: 10,
        tokenName: 'MATIC',
        decimal: 18,
        chainId: '80001',
        contractAddress: '0x0000000000000000000000000000000000000000',
        status: 1,
        isNativeToken: 1,
        currency: 'USDT',
        icon: 'https://stg-marketplace-images.polkafantasy.com/network/249ec26426602a154c202bd2c7a8855f_1654950929840.png'
    },
]