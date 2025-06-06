// utils/api.js
export const fetchUserDetails = async (walletAddress) => {
    try {
      const response = await fetch(`/api/user/userDetails?walletAddress=${walletAddress}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error('Failed to fetch user details');
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  };
  
  export const updateUserDetails = async (walletAddress, userData) => {
    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...userData, walletAddress }),
      });
  
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.error };
      }
    } catch (error) {
      console.error(error);
      return { success: false, message: "Internal Server Error" };
    }
  };
  