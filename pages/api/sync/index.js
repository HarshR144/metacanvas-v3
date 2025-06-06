// import connectDb from '../../../lib/mongodb';
// import { blockchainSyncService } from '../../../lib/blockchainSyncService';
// import { ethers } from 'ethers';

// export default async function handler(req, res) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method not allowed' });
//   }

//   try {
//     await connectDb();
    
//     const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
//     const syncService = new blockchainSyncService(provider);
    
//     // Start syncing from a specific block
//     const fromBlock = parseInt(req.body.fromBlock) || 0;
//     await syncService.syncPastEvents(fromBlock);
    
//     // Start listening to new events
//     syncService.startSync();

//     res.status(200).json({ message: 'Sync started successfully' });
//   } catch (error) {
//     console.error('Sync error:', error);
//     res.status(500).json({ error: 'Error starting sync' });
//   }
// }