import { type NextRequest, NextResponse } from 'next/server';
import { ShyftSdk, Network } from '@shyft-to/js';

const KEYS = [process.env.SHYFT_API_KEY_1, process.env.SHYFT_API_KEY_2, process.env.SHYFT_API_KEY_3, process.env.SHYFT_API_KEY_4, process.env.SHYFT_API_KEY_5];

async function handleSdkCalls(wallet, sdk) {
    const response = await sdk.wallet.getAllTokenBalance({ wallet });
    const tokens = response.map((token) => ({ [token.info.name]: token.balance }));
    await new Promise(resolve => setTimeout(resolve, 1000)); // Delay between calls
    const solResponse = await sdk.wallet.getBalance({ wallet });
    tokens.push({ 'Solana': solResponse });
    return { [wallet]: tokens };
}

export async function GET(req: NextRequest) {
    const addresses = req.nextUrl.searchParams.get('addresses');
    if (!addresses) {
        return NextResponse.json({ error: 'No addresses provided' }, { status: 400 });
    }
    
    const sdks = KEYS.map((key) => new ShyftSdk({ network: Network.Mainnet, apiKey: key }));
    const wallets = addresses.split(',');
    
    try {
        let sdkIndex = 0;
        const results = [];
        for (const wallet of wallets) {
            const sdk = sdks[sdkIndex % sdks.length];
            results.push(handleSdkCalls(wallet, sdk));

            if (sdkIndex % sdks.length === sdks.length - 1) {
                // After the last SDK is used, wait 1 second before the next cycle
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            sdkIndex++;
        }

        const map = Object.assign({}, ...(await Promise.all(results)));
        return NextResponse.json(map);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
