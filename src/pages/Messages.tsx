import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useUserStore } from "../store/UserStore";
import type { Message } from "../models/Message";
import "./Messages.css";

const Messages = () => {
  const { name } = useParams<{ name?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { username, token, isGuest } = useUserStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Detect chat type (Channel or Direct Message)
  const isDM = location.pathname.startsWith("/dm/") || name?.startsWith("dm_");
  const targetName = isDM
    ? name?.replace("dm_", "") || name?.replace("/dm/", "")
    : name ?? "";

  const chatTitle = isDM ? `@${targetName}` : `#${targetName}`;

  // If user is not logged in or guest → redirect to Home page
  useEffect(() => {
    if (!token && !isGuest) navigate("/");
  }, [token, isGuest, navigate]);

  // Fetch messages for the current chat
  useEffect(() => {
    const fetchMessages = async () => {
      if (!targetName) return;
      try {
        setLoading(true);

        const endpoint = isDM
          ? `/api/messages/dm/${username}/${targetName}`
          : `/api/messages/${targetName}`;

        const res = await fetch(endpoint);
        const data = await res.json();

        if (Array.isArray(data)) {
          const sorted = data.sort(
            (a: Message, b: Message) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          setMessages(sorted);
        } else {
          console.error("Invalid message data:", data);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [targetName, isDM, username]);

  // Handle sending a new message
  const handleSend = async () => {
    //  Block empty messages
    if (!newMessage.trim() || !targetName || !username) return;

    // Guests cannot send DMs
    if (isGuest && isDM) {
      alert("Guests cannot send direct messages ");
      return;
    }

    //  Guests can only send messages in public channels
    try {
      const endpoint = isDM
        ? `/api/messages/dm/${targetName}`
        : `/api/messages/${targetName}`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: username,
          receiver: targetName,
          content: newMessage.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [...prev, data.item]);
        setNewMessage("");
      } else {
        console.error("Error sending message:", data.error);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

    {/* Disable input if Guest is in a Direct Message */}
  const inputDisabled = isDM && isGuest;

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>{chatTitle}</h2>
        <button className="logout-btn" onClick={() => navigate("/channels")}>
          ← Back
        </button>
      </div>

      {loading ? (
        <p className="loading">Loading messages...</p>
      ) : (
        <div className="messages-box">
          {messages.length === 0 ? (
            <p className="no-messages">No messages yet...</p>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`message-item ${
                  msg.sender === username ? "own-message" : ""
                }`}
              >
                <strong>{msg.sender}:</strong> {msg.content}
              </div>
            ))
          )}
        </div>
      )}

        {/* Input area - Guests can only type in public channels */}
      <div className="message-input">
        <input
          type="text"
          placeholder={
            isGuest && isDM
              ? "Guests cannot send direct messages  "
              : `Message in ${chatTitle}...`
          }
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={inputDisabled}
        />
        <button onClick={handleSend} disabled={inputDisabled}>
          ➤
        </button>
      </div>
    </div>
  );
};

export default Messages;
