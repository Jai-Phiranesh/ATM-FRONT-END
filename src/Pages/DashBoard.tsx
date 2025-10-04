import React, { useEffect, useState } from "react";
import "../Styles/DashBoard.css";
import { getBalance, deposit, withdraw, getTransactions, changePin } from "../service/api";

const ALLOWED_AMOUNTS = [50, 100, 200, 500];

interface User {
  name: string;
  mobile: string;
}

interface Props {
  user: User;
  onLogout: () => void;
}

interface Transaction {
  type: string;
  amount: number;
}

const Dashboard: React.FC<Props> = ({ user, onLogout }) => {
  // Prevent rendering if user is missing or is an admin object
  if (!user || user.mobile === undefined || user.name === undefined) {
    return null;
  }
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState<number | "">("");
  const [denoms, setDenoms] = useState<Record<number, number>>({});
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<string>("balance");

  // Clear input fields when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  setAmount("");
  setDenoms({});
    setOldPin("");
    setNewPin("");
  };
  const [animClass, setAnimClass] = useState<string>("");

  const fetchData = async () => {
    try {
      const bal = await getBalance(user.mobile);
      const tx = await getTransactions(user.mobile);
      setBalance(bal);
      setTransactions(tx);
    } catch {
      setMessage("Failed to fetch data from server.");
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const showMessage = (msg: string) => {
    if (!msg || /internal server error/i.test(msg)) {
      setMessage("");
      return;
    }
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  const handleDeposit = async () => {
    if (!amount || amount <= 0) return showMessage("Enter a valid amount.");
    setAnimClass("animate-deposit");
    try {
  const bal = await deposit(user.mobile, Number(amount), denoms);
      setBalance(bal);
      showMessage("Deposit successful!");
      fetchData();
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "An unexpected error occurred.";
      showMessage(errMsg);
    }
  setTimeout(() => setAnimClass(""), 1000);
  };

  const handleWithdraw = async () => {
    if (!amount || amount <= 0) return showMessage("Enter a valid amount.");
    setAnimClass("animate-withdraw");
    try {
  const bal = await withdraw(user.mobile, Number(amount));
      setBalance(bal);
      showMessage("Withdrawal successful!");
      fetchData();
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "An unexpected error occurred.";
      showMessage(errMsg);
    }
  setTimeout(() => setAnimClass(""), 1000);
  };

  const handleChangePin = async () => {
    if (!oldPin || !newPin) return showMessage("Enter both old and new PIN.");
    try {
      const res = await changePin(user.mobile, oldPin, newPin);
      showMessage(res);
      setOldPin("");
      setNewPin("");
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "An unexpected error occurred.";
      showMessage(errMsg);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2>ATM Dashboard</h2>
  <button onClick={() => { handleTabChange("balance"); setMessage(""); }}>Balance</button>
  <button onClick={() => { handleTabChange("deposit"); setMessage(""); }}>Deposit</button>
  <button onClick={() => { handleTabChange("withdraw"); setMessage(""); }}>Withdraw</button>
  <button onClick={() => { handleTabChange("pin"); setMessage(""); }}>Change PIN</button>
  <button onClick={() => { handleTabChange("transactions"); setMessage(""); }}>Transactions</button>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>
      <div className="main-content">
        <div style={{display: 'flex', width: '100%'}}>
          <div style={{flex: '0 0 auto'}}>
            {activeTab === "balance" && (
              <div className="tab-content">
                <h2>Welcome, {user.name}</h2>
                <p>Mobile: {user.mobile}</p>
                <p>Balance: <span style={{color:'#1b1b2f', fontWeight:'bold'}}>₹{balance}</span></p>
              </div>
            )}
            {activeTab === "deposit" && (
              <div className={`tab-content ${animClass}`}>
                <h3>Deposit</h3>
                <p style={{margin:'4px 0 10px', fontSize:'0.85rem'}}>Tap a + amount to add to the total.</p>
                <div style={{display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'12px'}}>
                  {ALLOWED_AMOUNTS.map(v => {
                    const cnt = denoms[v] || 0;
                    return (
                      <button
                        key={v}
                        type="button"
                        className="amt-btn"
                        onClick={() => {
                          setDenoms(prev => ({...prev, [v]: (prev[v] || 0) + 1 }));
                          setAmount(prev => (Number(prev) + v));
                        }}
                      >+₹{v}{cnt>0?`(${cnt})`:''}</button>
                    );
                  })}
                  <button type="button" className="amt-clear-btn" onClick={() => { setAmount(0); setDenoms({}); }}>Clear</button>
                </div>
                <div style={{marginBottom:'12px', fontWeight:600}}>Total: ₹{amount || 0}</div>
                <button onClick={handleDeposit} disabled={Number(amount) <= 0}>Deposit</button>
              </div>
            )}
            {activeTab === "withdraw" && (
              <div className={`tab-content ${animClass}`}>
                <h3>Withdraw</h3>
                <p style={{margin:'4px 0 10px', fontSize:'0.85rem'}}>Tap a + amount to add to the total.</p>
                <div style={{display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'12px'}}>
                  {ALLOWED_AMOUNTS.map(v => {
                    const cnt = denoms[v] || 0;
                    return (
                      <button
                        key={v}
                        type="button"
                        className="amt-btn"
                        onClick={() => {
                          setDenoms(prev => ({...prev, [v]: (prev[v] || 0) + 1 }));
                          setAmount(prev => (Number(prev) + v));
                        }}
                      >+₹{v}{cnt>0?`(${cnt})`:''}</button>
                    );
                  })}
                  <button type="button" className="amt-clear-btn" onClick={() => { setAmount(0); setDenoms({}); }}>Clear</button>
                </div>
                <div style={{marginBottom:'12px', fontWeight:600}}>Total: ₹{amount || 0}</div>
                <button onClick={handleWithdraw} disabled={Number(amount) <= 0}>Withdraw</button>
              </div>
            )}
            {activeTab === "pin" && (
              <div className="tab-content">
                <h3>Change PIN</h3>
                <input
                  type="password"
                  placeholder="Old PIN"
                  value={oldPin}
                  onChange={e => setOldPin(e.target.value)}
                  maxLength={6}
                />
                <input
                  type="password"
                  placeholder="New PIN"
                  value={newPin}
                  onChange={e => setNewPin(e.target.value)}
                  maxLength={6}
                />
                <button onClick={handleChangePin} disabled={!oldPin || !newPin}>Change PIN</button>
              </div>
            )}
            {activeTab === "transactions" && (
              <div className="tab-content">
                <h3>Transaction History</h3>
                {transactions.length > 0 ? (
                  <ul>
                    {transactions.map((tx, idx) => (
                      <li key={idx}>
                        {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} : ₹{tx.amount}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No transactions yet.</p>
                )}
              </div>
            )}
            {message && <p className="message">{message}</p>}
          </div>
          <div className="right-panel">
            <h3>Disclaimer</h3>
            <ul>
              <li>Your transactions are encrypted and secure.</li>
              <li>Never share your PIN or account details.</li>
              <li>Review your history frequently.</li>
              <li>Report suspicious activity immediately.</li>
              <li>Shield the keypad while entering PIN.</li>
            </ul>
            <p className="disc-footer">Services subject to regulatory compliance. Use responsibly.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
