
import React, { useEffect, useState } from "react";
import { getAllUsers, deleteUser, getAllTransactions, depositATM, addUser, getUserTransactions } from "../service/AdminApi";
import "../Styles/AdminDashBoard.css";

interface User {
  id: string;
  name: string;
  mobile: string;
  balance: number;
  email?: string;
}

interface AdminDashboardProps {
  adminMobile: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminMobile }) => {
  const [atmBalance, setAtmBalance] = useState<number | null>(null);
  // Fetch ATM balance
  const fetchATMBalance = async () => {
    if (!adminMobile) return;
    try {
      const res = await import("../service/AdminApi").then(api => api.getATMBalance(adminMobile));
      setAtmBalance(res);
    } catch {
      setAtmBalance(null);
    }
  };
  const [showDeposit, setShowDeposit] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [depositAmount, setDepositAmount] = useState(0);
  const [atmDenoms, setAtmDenoms] = useState<Record<number, number>>({});
  const [message, setMessage] = useState("");
  const [addUserName, setAddUserName] = useState("");
  const [addUserMobile, setAddUserMobile] = useState("");
  const [addUserEmail, setAddUserEmail] = useState("");
  const [addUserPin, setAddUserPin] = useState("");
  const [deleteUserId, setDeleteUserId] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);
  const [showDeleteUser, setShowDeleteUser] = useState(false);
  const [showSpecificTx, setShowSpecificTx] = useState(false);
  const [specificUserId, setSpecificUserId] = useState("");
  const [specificTransactions, setSpecificTransactions] = useState<any[]>([]);
  const [specificTried, setSpecificTried] = useState(false);
  const [activePanel, setActivePanel] = useState<string>("");

  const fetchUsers = async () => {
    if (!adminMobile) return;
    const res = await getAllUsers(adminMobile);
    setUsers(res);
  };

  const fetchTransactions = async () => {
    if (!adminMobile) return;
    const res = await getAllTransactions(adminMobile);
    setTransactions(res);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!adminMobile) return;
    await deleteUser(adminMobile, Number(userId));
    setMessage(`Deleted user ${userId}`);
    fetchUsers();
  };

  const handleAddUser = async () => {
    if (!adminMobile || !addUserName || !addUserMobile || !addUserEmail || !addUserPin) return;
    // Frontend duplicate checks before hitting backend
    const mobileExists = users.some(u => u.mobile === addUserMobile);
    const emailExists = users.some(u => u.email && u.email.toLowerCase() === addUserEmail.toLowerCase());
    if (mobileExists || emailExists) {
      setMessage("User already exists");
      return;
    }
    
    const user = { name: addUserName, mobile: addUserMobile, email: addUserEmail, pin: addUserPin };
    const result = await addUser(adminMobile, user);
    if (result.success) {
      setMessage("User added successfully");
      setAddUserName("");
      setAddUserMobile("");
      setAddUserEmail("");
      setAddUserPin("");
      fetchUsers();
    } else {
      let errorMsg = result.error;
      if (typeof errorMsg === "object" && errorMsg !== null) {
        // Try to extract a useful string from known keys
        errorMsg = errorMsg.error || errorMsg.message || JSON.stringify(errorMsg);
      }
      // Map generic backend failures to friendly duplicate message when likely caused by existing user
      if (!errorMsg || /internal server error/i.test(errorMsg)) {
        errorMsg = "User already exists";
      }
      if (/mobile.*taken/i.test(errorMsg) || /email.*taken/i.test(errorMsg)) {
        errorMsg = "User already exists";
      }
      setMessage(errorMsg || "User already exists");
    }
  };

  const handleDeleteUserForm = async () => {
    if (!adminMobile || !deleteUserId) return;
    await handleDeleteUser(deleteUserId);
    setDeleteUserId("");
  };

  const handleViewSpecificTransactions = async () => {
    if (!adminMobile || !specificUserId) return;
    const txResult = await getUserTransactions(adminMobile, Number(specificUserId));
    if (txResult && txResult.success) {
      setSpecificTransactions(txResult.data || []);
    } else {
      setSpecificTransactions([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTransactions();
    fetchATMBalance();

    // Real-time fetching every 5 seconds
    const interval = setInterval(() => {
      fetchATMBalance();
      fetchTransactions();
    }, 5000);
    return () => clearInterval(interval);
  }, [adminMobile]);

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2>Admin Options</h2>
        <div className="sidebar-actions">
          <button onClick={() => { setActivePanel("deposit"); setMessage(""); }}>Deposit Cash</button>
          <button onClick={() => { setActivePanel("addUser"); setMessage(""); }}>Add User</button>
          <button onClick={() => { setActivePanel("deleteUser"); setMessage(""); }}>Delete User</button>
          <button onClick={() => { setActivePanel("allUsers"); setMessage(""); }}>All Users</button>
          <button onClick={() => { setActivePanel("specificTx"); setMessage(""); }}>User Transactions</button>
          <button onClick={() => { setActivePanel("allTransactions"); setMessage(""); }}>All Transactions</button>
        </div>
        <button className="logout-btn" onClick={() => window.location.reload()}>Logout</button>
      </div>
      <div className="main-content" style={{display:'flex', gap:'40px'}}>
        <div className="tab-content" style={{flex:'0 0 auto'}}>
          <h2>Admin Dashboard</h2>
          <div className="panel" style={{marginBottom: '20px'}}>
            <h3>Welcome, Admin</h3>
            <p>ATM Balance: ₹{atmBalance !== null ? atmBalance : 'Loading...'}</p>
          </div>

          {activePanel === "deposit" && (
            <div className="panel deposit-cash">
              <h3>Deposit Cash to ATM</h3>
              <p style={{margin:'4px 0 10px', fontSize:'0.85rem'}}>Tap + to build an amount.</p>
              <div style={{display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'12px'}}>
                {[50,100,200,500].map(v => {
                  const cnt = atmDenoms[v] || 0;
                  return (
                    <button
                      key={v}
                      type="button"
                      style={{
                        padding:'8px 14px',
                        borderRadius:6,
                        border: '1px solid #444',
                        background:'#222',
                        color:'#fff',
                        cursor:'pointer',
                        minWidth:70
                      }}
                      onClick={() => {
                        setAtmDenoms(prev => ({...prev, [v]: (prev[v] || 0) + 1 }));
                        setDepositAmount(prev => prev + v);
                      }}
                    >+₹{v}{cnt>0?`(${cnt})`:''}</button>
                  );
                })}
                <button type="button" style={{padding:'8px 14px', borderRadius:6, border:'1px solid #888', background:'#555', color:'#fff'}} onClick={() => { setDepositAmount(0); setAtmDenoms({}); }}>Clear</button>
              </div>
              <div style={{marginBottom:'12px', fontWeight:600}}>Total: ₹{depositAmount}</div>
              <button onClick={() => {
                if (!adminMobile || depositAmount <= 0) return;
                depositATM(adminMobile, depositAmount, atmDenoms).then(res => {
                  setMessage(typeof res === 'string' ? res : 'Deposit successful');
                  setDepositAmount(0);
                  setAtmDenoms({});
                });
              }} disabled={depositAmount <= 0}>Deposit</button>
            </div>
          )}

          {activePanel === "addUser" && (
            <div className="panel">
              <h3>Add User</h3>
              <input type="text" placeholder="Name" value={addUserName} onChange={e => setAddUserName(e.target.value)} maxLength={30} />
              <input
                type="text"
                placeholder="Mobile"
                value={addUserMobile}
                maxLength={10}
                pattern="[6-9]{1}[0-9]{9}"
                onChange={e => {
                  const value = e.target.value;
                  // Only allow numbers, max 10 digits, starts with 6-9
                  if (/^[6-9][0-9]{0,9}$/.test(value) || value === "") {
                    setAddUserMobile(value);
                  }
                }}
              />
              <input type="email" placeholder="Email" value={addUserEmail} onChange={e => setAddUserEmail(e.target.value)} maxLength={30} />
              <input type="password" placeholder="PIN" value={addUserPin} onChange={e => setAddUserPin(e.target.value)} maxLength={6} />
              <button onClick={handleAddUser}>Add User</button>
            </div>
          )}

          {activePanel === "deleteUser" && (
            <div className="panel">
              <h3>Delete User</h3>
              <input
                type="text"
                placeholder="Mobile Number"
                value={deleteUserId}
                maxLength={10}
                pattern="[6-9]{1}[0-9]{9}"
                onChange={e => {
                  const value = e.target.value;
                  if (/^[6-9][0-9]{0,9}$/.test(value) || value === "") {
                    setDeleteUserId(value);
                  }
                }}
              />
              <button onClick={async () => {
                if (!adminMobile || !deleteUserId) return;
                // Find user by mobile number
                const userToDelete = users.find(u => u.mobile === deleteUserId);
                if (userToDelete) {
                  await handleDeleteUser(userToDelete.id);
                  setDeleteUserId("");
                } else {
                  setMessage("User not found with this mobile number");
                }
              }}>Delete User</button>
              <button onClick={() => { setShowDeleteUser(false); setDeleteUserId(""); }}>Cancel</button>
            </div>
          )}

          {activePanel === "allUsers" && (
            <div className="panel users">
              <h3>All Users</h3>
              <ul>
                {users.map(u => (
                  <li key={u.id}>
                    {u.name} - {u.mobile} - {u.email ? u.email + ' - ' : ''}Balance: ₹{u.balance}
                    <button onClick={() => handleDeleteUser(u.id)}>Delete</button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activePanel === "specificTx" && (
            <div className="panel">
              <h3>View Specific User Transactions</h3>
              <input
                type="text"
                placeholder="Mobile Number"
                value={specificUserId}
                maxLength={10}
                pattern="[6-9]{1}[0-9]{9}"
                onChange={e => {
                  const value = e.target.value;
                  if (/^[6-9][0-9]{0,9}$/.test(value) || value === "") {
                    setSpecificUserId(value);
                  }
                }}
              />
              <button onClick={async () => {
                if (!adminMobile || !specificUserId) return;
                // Find user by mobile number
                const user = users.find(u => u.mobile === specificUserId);
                if (user) {
                  try {
                    const txResult: any = await getUserTransactions(adminMobile, Number(user.id));
                    if (txResult.success) {
                      const list = txResult.data || [];
                      setSpecificTransactions(list);
                      setSpecificTried(true);
                      if (list.length === 0) setMessage("No transactions for this user");
                    } else {
                      // Fallback: try filtering all transactions if we already have them
                      if (transactions.length > 0) {
                        const filtered = transactions.filter(t => t.userId === user.id || t.mobile === user.mobile);
                        if (filtered.length > 0) {
                          setSpecificTransactions(filtered);
                          setSpecificTried(true);
                          setMessage("");
                          return;
                        }
                      }
                      setMessage(txResult.error || "Failed to load transactions");
                      setSpecificTransactions([]);
                      setSpecificTried(true);
                    }
                  } catch (err: any) {
                    const status = err?.response?.status;
                    const data = err?.response?.data;
                    if (status === 404) {
                      setMessage("User not found");
                    } else if (status === 500) {
                      // Silently ignore or show neutral note instead of server error message
                      setMessage("");
                    } else {
                      setMessage(typeof data === 'string' ? data : 'Failed to load transactions');
                    }
                    setSpecificTransactions([]);
                    setSpecificTried(true);
                  }
                } else {
                  setMessage("User not found with this mobile number");
                  setSpecificTransactions([]);
                  setSpecificTried(true);
                }
              }}>View Transactions</button>
              {specificTransactions.length > 0 && (
                <ul>
                  {specificTransactions.map((tx, idx) => (
                    <li key={idx}>{tx.type} : ₹{tx.amount}</li>
                  ))}
                </ul>
              )}
              {specificTried && specificTransactions.length === 0 && (
                <p>No transactions for this user.</p>
              )}
            </div>
          )}

          {activePanel === "allTransactions" && (
            <div className="panel transactions">
              <h3>All Transactions</h3>
              {transactions.length > 0 ? (
                <ul>
                  {transactions.map((t, idx) => {
                    let userName = t.user;
                    if (!userName) {
                      const userObj = users.find(u => u.id === t.userId || u.mobile === t.mobile);
                      if (userObj) userName = userObj.name;
                    } else {
                      const userObj = users.find(u => u.id === t.user || u.mobile === t.user);
                      if (userObj) userName = userObj.name;
                    }
                    return (
                      <li key={idx}>
                        {`${t.type} by ${userName || 'Unknown'} Amount: ₹${t.amount}`}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p>No transactions recorded yet.</p>
              )}
            </div>
          )}

          {message && <p className="message">{message}</p>}
        </div>
  <div className="right-panel">
          <h3>Administrator Notes</h3>
          <ul>
            <li>Ensure denomination totals match physical cash inserted.</li>
            <li>Verify user identity before deletion actions.</li>
            <li>Monitor large deposits for compliance.</li>
            <li>Run reconciliation reports daily.</li>
            <li>Keep software & security patches current.</li>
          </ul>
          <p className="disc-footer">Admin actions are audited. Use privileges responsibly.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
