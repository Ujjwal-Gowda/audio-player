import { useContext } from "react";
import { AuthContext } from "../context/authcontext";

const Dashboard = () => {
  const auth = useContext(AuthContext);

  return (
    <div>
      <h2>Welcome to Dashboard 🎶</h2>
      <button onClick={auth?.logout}>Logout</button>
    </div>
  );
};

export default Dashboard;
