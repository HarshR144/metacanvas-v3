
import { connectDb } from '../../../lib/mongodb';
import User from '../../../lib/models/user';

export default async function handler(req, res) {
  await connectDb();

  const { method } = req;

  switch (method) {
    case 'POST': // Create or fetch user by wallet address
      try {
        const { walletAddress } = req.body;

        if (!walletAddress) {
          return res.status(400).json({ message: 'Wallet address is required' });
        }

        // Check if user exists
        let user = await User.findOne({ walletAddress });

        if (!user) {
          // Use DiceBear API to generate avatars with the "adventurer" style
          const seed = Math.random().toString(36).substr(2, 9); // Generate a random seed for unique avatars
          const avatarURL = `https://api.dicebear.com/6.x/adventurer/svg?seed=${seed}`;
        
          // If user doesn't exist, create a new one
          user = new User({
            walletAddress,
            userName:'Unnamed', // Default to 'Unnamed' if username is not provided
            profileImage: avatarURL || '', // Default to empty string if profileImage is not provided
          });
          await user.save();
          console.log('New user created:', user);
        } else {
          console.log('User already exists:', user);
        }

        // Return walletAddress, userName, and profileImage
        res.status(200).json({
          walletAddress: user.walletAddress,
          userName: user.userName,
          profileImage: user.profileImage,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
