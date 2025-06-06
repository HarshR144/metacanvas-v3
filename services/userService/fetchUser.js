  export const fetchUser = async (walletAddress) => {
    try {
      const response = await fetch('/api/user/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress}),
      });
  
      if (response.ok) {
        const updatedUser = await response.json();
        return updatedUser; // Return updated user data
      } else {
        console.error('Failed to update user profile:', response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  };
  