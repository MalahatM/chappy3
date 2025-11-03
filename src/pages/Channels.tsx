import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/UserStore";
import { useChannelStore } from "../store/channelStore";
import "./Channels.css";

const Channels = () => {
  const navigate = useNavigate();

  // Access Zustand stores for auth state(username, token,logout)
  const { username, token, logout } = useUserStore();
  // Access Zustand store for channels
  const { channels, setCurrentChannel } = useChannelStore();

  // Redirect if user is not logged in
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  //  Logout handler
  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/");
  };

  // When user clicks a channel
  const handleChannelClick = (name: string) => {
    setCurrentChannel(name);
    navigate(`/chat/${name}`);
  };
// JSX structure
  return (
  <div className="channels-container">
   
    <div className="channels-card">
      <div className="header">
        <h2>Channels</h2>
        {username && <span className="user-info">Hi {username} 👋</span>}
        <button className="logout-btn" onClick={handleLogout}>
          Log out
        </button>
      </div>

      <div className="channels-section">
        {channels.map((ch) => (
          <div
            key={ch.name}
            className="channel-item"
            onClick={() => handleChannelClick(ch.name.replace("#", ""))}
          >
            {ch.name}
            {ch.isPrivate && <span className="lock-icon">🔒</span>}
          </div>
        ))}
      </div>

      <h3 className="dm-title">Direct Messages</h3>

     <div className="dm-section">
  <div className="dm-item">Max Mo</div>
  <div className="dm-item">Saghi Sa</div>
</div>
 </div>
  </div>
);
};

export default Channels;
