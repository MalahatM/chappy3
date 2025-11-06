import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/UserStore";
import { useChannelStore } from "../store/channelStore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Channels.css";

// Type definitions
interface ChannelData {
  pk: string;
  channelName?: string;
  isPrivate?: boolean;
}

interface DM {
  sender: string;
  receiver: string;
  content: string;
  createdAt: string;
}

interface User {
  username: string;
}

const Channels = () => {
  const navigate = useNavigate();
  const { username, token, logout, isGuest, hydrated } = useUserStore();
  const { channels, setChannels, setCurrentChannel } = useChannelStore();

  const [dms, setDMs] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Fetch data once the store is hydrated and user is authenticated or guest
  useEffect(() => {
    if (!hydrated) return;

    // 🔒 Redirect unauthenticated users (not logged in & not guests)
    if (!token && !isGuest) {
      navigate("/");
      return;
    }

    // 🟣 Fetch channels, DMs, and user list
    const fetchAllData = async () => {
      try {
        // --- Fetch all channels ---
        const chRes = await fetch("/api/channels");
        const chData = await chRes.json();

        if (chRes.ok) {
          setChannels(
            chData.map((c: ChannelData) => ({
              name: c.channelName || c.pk.replace("CHANNEL#", "#"),
              isPrivate: c.isPrivate ?? false,
            }))
          );
        }

        // --- Fetch direct messages (only for logged-in users) ---
        if (username && !isGuest) {
          const dmRes = await fetch(`/api/messages/dm/${username}`);
          const dmData = await dmRes.json();

          if (dmRes.ok && Array.isArray(dmData)) {
            const uniqueDMs = Array.from(
              new Set(
                dmData
                  .map((dm: DM) =>
                    dm.sender === username ? dm.receiver : dm.sender
                  )
                  // Filter out empty, undefined, or blank names
                  .filter((name): name is string => Boolean(name && name.trim()))
              )
            );
            setDMs(uniqueDMs);
          }
        }

        // --- Fetch all users ---
        const userRes = await fetch("/api/users");
        const userData = await userRes.json();

        if (userRes.ok && Array.isArray(userData)) {
          setUsers(userData);
        }
      } catch (err) {
        console.error(" Error fetching data:", err);
        toast.error("Failed to load data.");
      }
    };

    fetchAllData();
  }, [token, isGuest, hydrated, username, setChannels, navigate]);

  // Handle logout (clears localStorage and store)
  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/");
  };

  //  Handle channel click (restrict guest access to private channels)
  const handleChannelClick = (name: string, isPrivate: boolean) => {
    if (isGuest && isPrivate) {
      toast.warning("🔒 This channel is locked for guests!");
      return;
    }

    setCurrentChannel(name);
    navigate(`/chat/${name.replace("#", "")}`);
  };

  //  Handle direct message click (guests cannot send DMs)
  const handleDMClick = (targetUser: string) => {
    if (isGuest) {
      toast.info("Guests cannot send direct messages.");
      return;
    }
    navigate(`/chat/dm_${targetUser}`);
  };

  return (
    <div className="channels-container">
      <div className="channels-card">
        {/* 🟣 Header Section */}
        <div className="header">
          <h2>Channels</h2>
          {isGuest ? (
            <span className="user-info">Welcome Guest 👋</span>
          ) : (
            username && <span className="user-info">Hi {username} 👋</span>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            {isGuest ? "Exit guest mode" : "Log out"}
          </button>
        </div>

        //Channel List 
        <div className="channels-section">
          {channels.map((ch) => (
            <div
              key={ch.name}
              className="channel-item"
              onClick={() => handleChannelClick(ch.name, ch.isPrivate)}
            >
              {ch.name}
              {ch.isPrivate && <span className="lock-icon">🔒</span>}
            </div>
          ))}
        </div>

        // Direct Messages Section (hidden for guests) 
        {!isGuest && (
          <>
            <h3 className="dm-title">Direct Messages</h3>
            <div className="dm-section">
              {dms.length > 0 ? (
                dms.map((dm, i) => (
                  <div
                    key={i}
                    className="dm-item"
                    onClick={() => handleDMClick(dm)}
                  >
                    {dm}
                  </div>
                ))
              ) : (
                <p>No direct messages</p>
              )}
            </div>
          </>
        )}

        // All Users Section 
        <h3 className="dm-title">All Users</h3>
        <div className="dm-section">
          {users.length > 0 ? (
            users
              .filter((u) => u.username !== username)
              .map((user, i) => (
                <div
                  key={i}
                  className="dm-item"
                  onClick={() => handleDMClick(user.username)}
                >
                  {user.username}
                </div>
              ))
          ) : (
            <p>No users found</p>
          )}
        </div>
      </div>

      <ToastContainer position="bottom-center" autoClose={3000} theme="colored" />
    </div>
  );
};

export default Channels;
