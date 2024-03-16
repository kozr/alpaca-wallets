import { type NextRequest, NextResponse } from 'next/server';
import { ShyftSdk, Network } from '@shyft-to/js';

const KEYS = [process.env.SHYFT_API_KEY_1, process.env.SHYFT_API_KEY_2, process.env.SHYFT_API_KEY_3, process.env.SHYFT_API_KEY_4, process.env.SHYFT_API_KEY_5];

export async function GET(req: NextRequest) {
    const addresses = req.nextUrl.searchParams.get('addresses');
    if (!addresses) {
        return NextResponse.json({ error: 'No addresses provided' }, { status: 400 });
    }
    
    const sdks = KEYS.map((key) => new ShyftSdk({ network: Network.Mainnet, apiKey: key }));
    const wallets = addresses.split(',');
    
    try {
        const map = {};
        // avoid rate limit by spacing out requests
        let sdkIndex = 0;
        for (const wallet of wallets) {
            const sdk = sdks[sdkIndex];
            const response = await sdk.wallet.getAllTokenBalance({ wallet });
            const tokens = response.map((token) => ({ [token.info.name]: token.balance }));
            const solResponse = await sdk.wallet.getBalance({ wallet });
            tokens.push({ 'Solana': solResponse });
            map[wallet] = tokens;
            
            sdkIndex = (sdkIndex + 1) % 5; // Increment sdkIndex at the start or end, but before the if check

            await new Promise((resolve) => setTimeout(resolve, 200));
        }

        return NextResponse.json(map);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
