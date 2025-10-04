import axios from "axios";
const API = "http://localhost:8080/api/admin";

// Add User
export const addUser = async (adminMobile: string, user: any) => {
  try {
    const res = await axios.post(`${API}/add-user?adminMobile=${adminMobile}`, user);
    return { success: true, data: res.data };
  } catch (error: any) {
    // If backend returns a message, show it; else show generic error
    const message =
      error.response && error.response.data
        ? error.response.data
        : "Failed to add user";
    return { success: false, error: message };
  }
};

// Delete User by ID
export const deleteUser = async (adminMobile: string, id: number) => {
  const res = await axios.delete(`${API}/delete-user/${id}?adminMobile=${adminMobile}`);
  return res.data;
};

// Get All Users
export const getAllUsers = async (adminMobile: string) => {
  const res = await axios.get(`${API}/users?adminMobile=${adminMobile}`);
  return res.data;
};

// Get specific user transactions
export const getUserTransactions = async (adminMobile: string, userId: number) => {
  try {
    const res = await axios.get(`${API}/user/${userId}/transactions?adminMobile=${adminMobile}`);
    return { success: true, data: res.data };
  } catch (error: any) {
    const status = error?.response?.status;
    const payload = error?.response?.data;
    return {
      success: false,
      status,
      error: typeof payload === 'string' ? payload : (payload?.error || payload?.message || 'Failed to fetch user transactions')
    };
  }
};

// Get all transactions
export const getAllTransactions = async (adminMobile: string) => {
  const res = await axios.get(`${API}/transactions?adminMobile=${adminMobile}`);
  return res.data;
};

// Deposit cash
export const depositATM = async (adminMobile: string, amount: number, denominations?: Record<number, number>) => {
  const res = await axios.post(`${API}/deposit?adminMobile=${adminMobile}&amount=${amount}`, { denominations });
  return res.data;
};

// Get ATM balance
export const getATMBalance = async (adminMobile: string) => {
  const res = await axios.get(`${API}/atm-balance?adminMobile=${adminMobile}`);
  return res.data;
};
