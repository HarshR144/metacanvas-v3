// pages/api/user/index.js


import { connectDb } from '../../../lib/mongodb';
import User from '../../../lib/models/user';

export default async function handler(req, res) {
  await connectDb();

  const { method } = req;

  switch (method) {
    case 'GET':
      const { walletAddress } = req.query;
      console.log(walletAddress);
      if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address is required' });
      }

      try {
        const user = await User.findOne({ walletAddress });

        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json(user);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

    case 'POST':
      const { walletAddress: postWalletAddress, userName, profileImage, email, description, socialLinks } = req.body;

      if (!postWalletAddress) {
        return res.status(400).json({ error: 'Wallet address is required' });
      }
      console.log(userName);
      try {
        const user = await User.findOneAndUpdate(
          { walletAddress: postWalletAddress },
          {
            $set: {
              userName: userName || 'Unnamed',
              profileImage: profileImage,
              description: description || '',
              email: email || '',
              socialLinks: socialLinks || {},
            },
          },
          { new: true, upsert: true } // Create new if not exists
        );

        return res.status(200).json({ message: 'Profile updated successfully', user });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

    default:
      return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
