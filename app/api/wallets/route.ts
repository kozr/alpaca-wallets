import { type NextRequest, NextResponse } from 'next/server';
import { ShyftSdk, Network } from '@shyft-to/js';

export async function GET(req: NextRequest) {
    const addresses = req.nextUrl.searchParams.get('addresses');
    if (!addresses) {
        return NextResponse.json({ error: 'No addresses provided' }, { status: 400 });
    }
    
    const sdk = new ShyftSdk({ network: Network.Mainnet, apiKey: process.env.SHYFT_API_KEY });
    const wallets = addresses.split(',');
    
    try {
        const map = {};
        await Promise.all(wallets.map(async (wallet) => {
            const response = await sdk.wallet.getAllTokenBalance({ wallet });
            const tokens = response.map((token) => ({ [token.info.name]: token.balance }));
            map[wallet] = tokens;
        }))

        return NextResponse.json(map);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
