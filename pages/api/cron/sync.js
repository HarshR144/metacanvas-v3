// import connectDb from '../../../lib/mongodb';
// import { blockchainSyncService } from '../../../lib/blockchainSyncService';
// import { ethers } from 'ethers';

// export default async function handler(req, res) {
//   // Verify cron secret to ensure only authorized calls
//   if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
//     return res.status(401).json({ message: 'Unauthorized' });
//   }

//   try {
//     await connectDb();
    
//     const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
//     const syncService = new blockchainSyncService(provider);
    
//     // Sync last 1000 blocks or adjust as needed
//     const currentBlock = await provider.getBlockNumber();
//     const fromBlock = currentBlock - 1000;
    
//     await syncService.syncPastEvents(fromBlock);
    
//     res.status(200).json({ message: 'Sync completed successfully' });
//   } catch (error) {
//     console.error('Cron sync error:', error);
//     res.status(500).json({ error: 'Error during sync' });
//   }
// }