import React, { useState } from "react";
import Login from "./Pages/Login";
import Dashboard from "./Pages/DashBoard";
import AdminDashboard from "./Pages/AdminDashBoard";

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<any | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleAdminLogin = (adminObj: any) => {
    setAdmin(adminObj);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAdmin(null);
  };

  return (
    <div>
      {!currentUser && !admin ? (
        <Login onLogin={handleLogin} onAdminLogin={handleAdminLogin} />
      ) : admin ? (
        <AdminDashboard adminMobile={admin.mobile} />
      ) : (
        <Dashboard user={currentUser!} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;
