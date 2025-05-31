import React, { useState, useEffect } from "react";
import "./App.css";

// Utility for random unique code
function generateCode(length = 6, alphanumeric = false) {
  const chars = alphanumeric
    ? "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    : "0123456789";
  let code = "";
  for (let i = 0; i < length; ++i)
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

// Brand colors palette
const NAVY = "#001f4d";
const brandAccent = "#06D6A0";
const secondary = "#FFD166";
const funPalette = [
  "#7E9CB2", // blue
  "#FCC2FF", // pink
  "#FFD795", // orange-light
  "#9DF6FF", // cyan
  "#FFD166", // yellow-accent
  "#06D6A0", // green-accent
];

const themeVars = {
  "--main-bg": "#F3F6FE",
  "--main-accent": brandAccent,
  "--main-secondary": secondary,
  "--border-radius": "22px",
  "--large-radius": "36px",
  "--card-radius": "22px",
  "--navy": NAVY,
  "--text-color": NAVY,
  "--primary-blue": "#7E9CB2",
  "--primary-blue-dark": "#4a6485",
  "--white": "#fff",
};

function applyTheme() {
  for (let [k, v] of Object.entries(themeVars)) {
    document.documentElement.style.setProperty(k, v);
  }
}
applyTheme();

/**
 * PUBLIC_INTERFACE
 * Main App with single container design.
 */
function App() {
  // Registration/user state
  const [userCode, setUserCode] = useState(
    localStorage.getItem("userCode") || generateCode(8, true)
  );
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );
  const [registered, setRegistered] = useState(
    !!localStorage.getItem("username")
  );
  const [classrooms, setClassrooms] = useState(
    JSON.parse(localStorage.getItem("myClassrooms") || "[]")
  );

  // Navigation state for classroom detail
  const [selectedClassroom, setSelectedClassroom] = useState(null); // holds classroom object or null
  const [classDetailTab, setClassDetailTab] = useState("chats"); // which main content is open in detail

  useEffect(() => {
    applyTheme();
  }, []);
  useEffect(() => {
    if (userCode) localStorage.setItem("userCode", userCode);
  }, [userCode]);
  useEffect(() => {
    if (username) localStorage.setItem("username", username);
  }, [username]);
  useEffect(() => {
    localStorage.setItem("myClassrooms", JSON.stringify(classrooms));
  }, [classrooms]);

  // Registration step
  const handleRegistration = (e) => {
    e.preventDefault();
    if (username.length < 2 || username.length > 20) return;
    setRegistered(true);
    setUserCode((old) => {
      localStorage.setItem("userCode", old);
      return old;
    });
    localStorage.setItem("username", username);
  };

  // Join code input state for inline join
  const [joinCode, setJoinCode] = useState("");

  const handleJoin = (e) => {
    e.preventDefault();
    if (
      joinCode.length === 6 &&
      !classrooms.find((c) => c.code === joinCode)
    ) {
      const name = `Classroom ${joinCode}`;
      setClassrooms((prev) => [
        ...prev,
        {
          code: joinCode,
          name,
          color: funPalette[(prev.length + 1) % funPalette.length],
          joinedAt: Date.now(),
          members: [],
        },
      ]);
      setJoinCode("");
    }
  };

  // Modal state (for classroom creation)
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);

  // Create classroom with info
  const handleCreateClassroomWithInfo = (name, numMembers) => {
    let newCode = generateCode(6, false);
    while (classrooms.some((c) => c.code === newCode))
      newCode = generateCode(6, false);
    const membersList = [];
    if (username && !membersList.includes(username)) membersList.push(username);
    for (let i = membersList.length; i < Math.max(1, numMembers); ++i) {
      membersList.push("Student" + (i + 1));
    }
    const newClass = {
      code: newCode,
      name: name || `Classroom ${newCode}`,
      color: funPalette[(classrooms.length + 2) % funPalette.length],
      joinedAt: Date.now(),
      members: membersList,
    };
    setClassrooms((prev) => [...prev, newClass]);
    setShowCreateClassModal(false);
  };

  // Handle classroom card click
  function handleClassCardSelect(classroom) {
    setSelectedClassroom(classroom);
    setClassDetailTab("chats");
  }

  // PUBLIC_INTERFACE
  function CreateClassroomModal({ onSubmit, onClose }) {
    const [name, setName] = useState("");
    const [numMembers, setNumMembers] = useState(5);

    return (
      <div className="modal-outer-bg">
        <div className="modal-white-card">
          <button
            type="button"
            aria-label="Close create classroom modal"
            className="modal-close-btn"
            onClick={onClose}
          >✖</button>
          <h2 style={{ color: NAVY, marginTop: 0, marginBottom: 18, fontWeight: 800 }}>Create a Classroom</h2>
          <form
            onSubmit={e => {
              e.preventDefault();
              if (!name || +numMembers < 1) return;
              onSubmit(name, +numMembers);
            }}
          >
            <label style={{ color: NAVY, fontWeight: 500 }}>Classroom Name</label>
            <input
              className="white-input"
              required
              maxLength={36}
              placeholder="Cool Classroom Name"
              style={{ width: "98%", marginBottom: 16 }}
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
            <label style={{ color: NAVY, fontWeight: 500 }}>Number of Members</label>
            <input
              className="white-input"
              type="number"
              required
              min={1}
              max={99}
              style={{ width: 90, marginBottom: 15 }}
              value={numMembers}
              onChange={e => setNumMembers(e.target.value.replace(/\D/g, ""))}
            />
            <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
              <button
                className="main-action-btn main-action-btn-create"
                style={{
                  flex: 1,
                }}
                type="submit"
              >
                Create
              </button>
              <button
                className="main-action-btn"
                style={{
                  background: "#F5F8FA",
                  color: NAVY,
                  border: "2px solid #e6ecf5",
                  fontWeight: 700,
                  flex: 1,
                }}
                type="button"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Handle back from classroom detail
  function handleDetailBack() {
    setSelectedClassroom(null);
  }

  // Render registration if not registered
  if (!registered) {
    return (
      <div className="app-bg-contrast">
        <div className="app-container-centered">
          <div className="main-white-container">
            <header className="app-logo-header" style={{ marginBottom: 32, fontWeight: 800 }}>
              {/* Modern book SVG icon for logo */}
              <span className="app-logo-emoji" aria-label="Book Logo" style={{ marginRight: 10, display: 'flex', alignItems: 'center', fontSize: 28 }}>
                <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                  <rect x="5" y="6" width="22" height="20" rx="4" fill="#FFD166" stroke="#4F8CFF" strokeWidth="2" />
                  <path d="M16 6v20" stroke="#4F8CFF" strokeWidth="2" />
                  <path d="M7 8h18" stroke="#06D6A0" strokeWidth="1.7" />
                  <circle cx="16" cy="26" r="1.1" fill="#4F8CFF" />
                </svg>
              </span>
              Classroom Insider
            </header>
            <form onSubmit={handleRegistration} className="register-form">
              <input
                className="white-input"
                placeholder="Enter your nickname..."
                maxLength={20}
                minLength={2}
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: "100%" }}
                autoFocus
              />
              <div className="ucode-label" style={{ margin: "0 0 17px 0" }}>
                <span>Your unique code: </span>
                <span className="white-ucode">{userCode}</span>
              </div>
              <button className="main-action-btn main-action-btn-create" type="submit">
                Get Started
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // *** Classroom Detail View ***
  if (selectedClassroom) {
    return (
      <div className="app-bg-contrast">
        <div className="app-container-centered">
          <div className="main-white-container" style={{ minHeight: "64vh", display: "flex", flexDirection: "column" }}>
            <header className="app-logo-header" style={{ marginBottom: 18 }}>
              <span className="app-logo-emoji" aria-label="Book Logo" style={{ marginRight: 10, display: 'flex', alignItems: 'center', fontSize: 28 }}>
                <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                  <rect x="5" y="6" width="22" height="20" rx="4" fill="#FFD166" stroke="#4F8CFF" strokeWidth="2" />
                  <path d="M16 6v20" stroke="#4F8CFF" strokeWidth="2" />
                  <path d="M7 8h18" stroke="#06D6A0" strokeWidth="1.7" />
                  <circle cx="16" cy="26" r="1.1" fill="#4F8CFF" />
                </svg>
              </span>
              {selectedClassroom.name} <span style={{ marginLeft: 8, color: "#5275af", fontWeight: 400, fontSize: 15 }}>#{selectedClassroom.code}</span>
            </header>
            {/* Two-pane layout */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 0,
              width: '100%',
              minHeight: "52vh",
              height: "100%",
              position: "relative"
            }}>
              {/* Left: Dynamic content panel */}
              <div style={{
                flex: 1,
                padding: "18px 18px 14px 6px",
                minWidth: 0,
                borderRadius: "18px 0 0 18px",
                background: "var(--main-bg, #f3f6fe)",
                boxShadow: "0 1.5px 14px 0 rgba(120,140,180,0.04)"
              }}>
                <ClassroomDetailPane
                  tab={classDetailTab}
                  classroom={selectedClassroom}
                  loggedInUser={username}
                />
              </div>
              {/* Right vertical nav menu */}
              <div style={{
                width: 163,
                minWidth: 116,
                borderLeft: "2.5px solid var(--primary-blue, #7e9cb2)",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                background: "#f9fbfd",
                padding: "20px 0 10px 0",
                borderRadius: "0 18px 18px 0",
                boxShadow: "0 0 24px 0 rgba(120,140,180,0.05)"
              }}>
                <VerticalDetailMenu
                  currentTab={classDetailTab}
                  setTab={setClassDetailTab}
                  onBack={handleDetailBack}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // **** Default: Main app dashboard view ****
  return (
    <div className="app-bg-contrast">
      <div className="app-container-centered">
        <div className="main-white-container">
          <header className="app-logo-header" style={{ marginBottom: 26 }}>
            <span className="app-logo-emoji" aria-label="Book Logo" style={{ marginRight: 10, display: 'flex', alignItems: 'center', fontSize: 28 }}>
              <svg
                width="30"
                height="30"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: 'block' }}
              >
                <rect x="5" y="6" width="22" height="20" rx="4" fill="#FFD166" stroke="#4F8CFF" strokeWidth="2"/>
                <path d="M16 6v20" stroke="#4F8CFF" strokeWidth="2"/>
                <path d="M7 8h18" stroke="#06D6A0" strokeWidth="1.7"/>
                <circle cx="16" cy="26" r="1.1" fill="#4F8CFF"/>
              </svg>
            </span>
            Classroom Insider
          </header>
          <section className="left-vertical-actions">
            <button
              className="round-action-btn round-btn-create"
              type="button"
              tabIndex={0}
              onClick={() => setShowCreateClassModal(true)}
              aria-label="Create"
              style={{ alignSelf: "flex-start", marginBottom: 19 }}
            >
              <span role="img" aria-label="Plus" style={{ marginRight: 6, fontWeight: 600 }}>➕</span>
              Create
            </button>
            <form
              className="vertical-join-form"
              onSubmit={handleJoin}
              autoComplete="off"
              style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12, width: "100%", maxWidth: 210 }}
            >
              <input
                className="white-input round-input"
                placeholder="Enter Code"
                maxLength={6}
                minLength={6}
                required
                style={{ textAlign: "left", width: "100%", marginBottom: 0 }}
                value={joinCode}
                onChange={(e) =>
                  setJoinCode(e.target.value.replace(/[^0-9]/g, ""))
                }
                aria-label="Enter Code"
              />
              <button
                className="round-action-btn round-btn-join"
                type="submit"
                aria-label="Join"
                style={{ marginTop: 0, alignSelf: "flex-start" }}
              >
                Join
              </button>
            </form>
          </section>
          {/* Section - Classrooms row */}
          <section style={{ width: "100%", marginTop: 14, marginBottom: 8 }}>
            <div className="classrooms-title" style={{ marginBottom: 11, marginRight: 0 }}>
              Your Classrooms
            </div>
            <div className="classcards-row">
              {classrooms.length === 0 ? (
                <div className="empty-class-msg">No classes yet. Join or create one!</div>
              ) : (
                classrooms
                  .sort((a, b) => b.joinedAt - a.joinedAt)
                  .map((c, idx) => (
                    <ClassCard
                      key={c.code}
                      classroom={c}
                      color={c.color || funPalette[idx % funPalette.length]}
                      onSelect={handleClassCardSelect}
                    />
                  ))
              )}
            </div>
          </section>
          {/* Modal for classroom creation */}
          {showCreateClassModal && (
            <CreateClassroomModal
              onSubmit={handleCreateClassroomWithInfo}
              onClose={() => setShowCreateClassModal(false)}
            />
          )}
          {/* Footer inside main container */}
          <footer className="main-footer-bar">
            <div style={{ display: "flex", gap: 8, alignItems: "center", width: "100%", justifyContent: "space-between", fontSize: "1.01em", color: "#475788" }}>
              <span style={{ fontWeight: 600 }}>Classroom Insider</span>
              <span style={{ fontSize: "0.98rem" }}>
                &copy; {new Date().getFullYear()}
              </span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function ClassCard({ classroom, color, onSelect }) {
  return (
    <button
      className="square-classcard"
      tabIndex={0}
      style={{
        background: color || "var(--orange)",
        color: "#233850",
        borderRadius: "20px",
        minWidth: 110,
        minHeight: 110,
        maxWidth: 148,
        maxHeight: 148,
        margin: "0 0px",
        boxShadow: "0 2.5px 9px 0 rgba(180,170,120,0.10)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-main)",
        fontWeight: 800,
        cursor: "pointer",
        border: "none",
        outline: "none",
      }}
      aria-label={"Open " + classroom.name}
      onClick={() => onSelect && onSelect(classroom)}
    >
      <div style={{
        fontWeight: 900,
        fontSize: "1.12rem",
        marginBottom: 6,
        color: "#1a2c45",
        letterSpacing: "0.5px",
        wordBreak: "break-word",
        textAlign: "center"
      }}>
        {classroom.name}
      </div>
      <div style={{
        fontWeight: 700,
        fontSize: "1.01rem",
        color: "#5275af"
      }}>
        #{classroom.code}
      </div>
      <div style={{ fontSize: 13, color: "#548e74", fontWeight: 600 }}>
        Joined {new Date(classroom.joinedAt).toLocaleDateString([], {
          month: "short",
          day: "numeric"
        })}
      </div>
    </button>
  );
}

// PUBLIC_INTERFACE
/* Removed duplicate old CreateClassroomModal definition (see updated version above) */

// Two-pane classroom detail right vertical menu
// PUBLIC_INTERFACE
function VerticalDetailMenu({ currentTab, setTab, onBack }) {
  const btnStyle = isActive => ({
    fontWeight: 800,
    border: "none",
    background: isActive ? "var(--accent,#06D6A0)" : "transparent",
    color: isActive ? "#fff" : "#235770",
    width: 128,
    borderRadius: "99px",
    padding: "12px 0",
    margin: "10px 16px",
    cursor: "pointer",
    fontSize: "1.08em",
    boxShadow: isActive ? "0 3px 14px 0 rgba(36,210,154,0.13)" : "none",
    transition: "background .14s, color .14s"
  });
  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
      <button
        style={btnStyle(false)}
        aria-label="Back to dashboard"
        onClick={onBack}
      >
        ← Back
      </button>
      <button
        style={btnStyle(currentTab === "chats")}
        onClick={() => setTab("chats")}
        aria-label="Classroom Chat"
      >
        💬 Chats
      </button>
      <button
        style={btnStyle(currentTab === "board")}
        onClick={() => setTab("board")}
        aria-label="Bulletin Board"
      >
        📌 Bulletin Board
      </button>
      <button
        style={btnStyle(currentTab === "notebook")}
        onClick={() => setTab("notebook")}
        aria-label="Notebook"
      >
        📚 Notebook
      </button>
      <button
        style={btnStyle(currentTab === "calls")}
        onClick={() => setTab("calls")}
        aria-label="Calls"
      >
        📞 Calls
      </button>
      <button
        style={btnStyle(currentTab === "services")}
        onClick={() => setTab("services")}
        aria-label="Classroom Services"
      >
        🛠️ Services
      </button>
    </nav>
  );
}

/**
 * PUBLIC_INTERFACE
 * Classroom Chat component: Handles message list, sending, delete, reactively for current classroom.
 */
function ClassroomChat({
  classroom,
  loggedInUser,
  userCode,
  chatData,
  setChatData,
}) {
  // Get or initialize chat message array for this classroom
  const classChatId = classroom.code;
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = React.useRef(null);

  // Scroll to newest message on send/new msg
  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chatData[classChatId]]);

  // Used as a pseudo-incrementing ID per classroom chat (in real app, backend assigns IDs)
  const createMsgId = () =>
    "m-" +
    Math.random().toString(36).slice(2, 9) +
    Date.now().toString().slice(-5);

  // Handles sending a new message
  function handleSend(e) {
    e.preventDefault();
    const trimmed = messageInput.trim();
    if (!trimmed) return;
    const msgObj = {
      id: createMsgId(),
      user: loggedInUser,
      userCode,
      text: trimmed,
      ts: Date.now(),
    };
    setChatData(prev => {
      const prevArr = Array.isArray(prev[classChatId]) ? prev[classChatId] : [];
      return {
        ...prev,
        [classChatId]: [...prevArr, msgObj].slice(-150), // Cap to last 150
      };
    });
    setMessageInput("");
  }

  // Delete a message by id (current user only)
  function deleteMsg(msgId) {
    setChatData(prev => ({
      ...prev,
      [classChatId]: prev[classChatId].filter(m => m.id !== msgId),
    }));
  }

  // Sort messages oldest-to-newest for display
  const messages = Array.isArray(chatData[classChatId])
    ? [...chatData[classChatId]].sort((a, b) => a.ts - b.ts)
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 370 }}>
      <h2 style={{ marginTop: 0, color: "#175880", marginBottom: 9, fontWeight: 800, fontSize: 22 }}>
        Public Chat
      </h2>
      {/* Message list area */}
      <div
        className="chat-messages-panel"
        style={{
          flex: 1,
          minHeight: 180,
          maxHeight: 345,
          overflowY: "auto",
          padding: "13px 2px 4px 1px",
          background: "#F6F8FF",
          borderRadius: 13,
          border: "1.5px solid #dde3ef",
          marginBottom: 13,
          boxShadow: "0 1.5px 8px 0 rgba(90,140,210,0.05)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.length === 0 && (
          <div style={{ color: "#8bb", fontWeight: 500, opacity: 0.74, textAlign: "center", marginTop: 25, fontSize: 16 }}>
            No messages yet. Say hello! 👋
          </div>
        )}
        {messages.map(msg => {
          const mine = msg.userCode === userCode;
          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                flexDirection: mine ? "row-reverse" : "row",
                alignItems: "flex-end",
                margin: "5px 0",
                gap: 9,
              }}
            >
              {/* Message bubble */}
              <div
                style={{
                  maxWidth: "82%",
                  background: mine ? "linear-gradient(96deg,#FFD166 80%,#FAF8EA 100%)" : "#e6f3ff",
                  color: mine ? "#013" : "#1a2944",
                  borderRadius: mine ? "18px 18px 4px 19px" : "18px 18px 19px 4px",
                  padding: "10px 15px 9px 15px",
                  boxShadow: mine
                    ? "0 1.5px 8px 0 rgba(220,190,80,0.08)"
                    : "0 1.5px 8px 0 rgba(70,155,210,0.09)",
                  fontWeight: mine ? 800 : 600,
                  fontSize: 16.5,
                  minWidth: 58,
                  wordBreak: "break-word",
                  position: "relative",
                  marginLeft: mine ? 0 : 2,
                  marginRight: mine ? 2 : 0,
                }}
              >
                <span style={{ fontSize: 14.4, fontWeight: 700, color: mine ? "#b37a10" : "#1762ab", opacity: 0.82 }}>
                  {msg.user}
                </span>
                <div style={{ fontWeight: 600, margin: "4px 0 0 0" }}>{msg.text}</div>
                <div style={{ fontSize: 12.2, color: "#44689b", marginTop: 3, opacity: 0.7, fontWeight: 500 }}>
                  {new Date(msg.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
                {/* Delete icon for own msg */}
                {mine && (
                  <button
                    aria-label="Delete"
                    title="Delete message"
                    onClick={() => deleteMsg(msg.id)}
                    style={{
                      position: "absolute",
                      right: 5,
                      top: 4,
                      background: "none",
                      border: "none",
                      fontSize: 13,
                      color: "#a43",
                      opacity: 0.65,
                      cursor: "pointer",
                      fontWeight: 800,
                      padding: 0,
                    }}
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      {/* Message typing form - stays at bottom */}
      <form
        onSubmit={handleSend}
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
          background: "#fffced",
          padding: "8px 10px 9px 10px",
          borderTop: "1.5px solid #e5e3bf",
          borderRadius: 11,
          position: "relative",
          boxShadow: "0 0.5px 4px 0 rgba(170,160,89,0.07)",
        }}
      >
        <input
          type="text"
          value={messageInput}
          onChange={e => setMessageInput(e.target.value)}
          placeholder="Type a message..."
          maxLength={240}
          required
          style={{
            flex: 1,
            borderRadius: 16,
            border: "2px solid #FFD166",
            padding: "10px 15px",
            fontWeight: 700,
            fontSize: 16,
            fontFamily: "var(--font-main)",
            background: "#fffef8",
            color: "#071133",
            outline: "none",
            marginRight: 2,
            boxShadow: "0 1px 3px 0 rgba(255,220,90,0.05)",
          }}
          autoFocus
        />
        <button
          type="submit"
          className="main-action-btn main-action-btn-create"
          style={{
            minWidth: 55,
            padding: "7px 19px",
            fontWeight: 900,
            fontSize: 17,
          }}
          aria-label="Send"
        >
          Send
        </button>
      </form>
    </div>
  );
}
// Left main panel: content by selected detail section
// PUBLIC_INTERFACE
function ClassroomDetailPane({ tab, classroom, loggedInUser }) {
  // Chat state is lifted up in App to persist while in classroom
  const [chatData, setChatData] = React.useState(() => {
    // Try sessionStorage for demo persistence (not backend, cleared per browser tab)
    try {
      return (
        JSON.parse(window.sessionStorage.getItem("classChat") || "{}") || {}
      );
    } catch {
      return {};
    }
  });
  const userCode =
    localStorage.getItem("userCode") || Math.random().toString(36).slice(2, 10);
  // On chatData change, sync to sessionStorage (simulates backend persistence per session)
  useEffect(() => {
    try {
      window.sessionStorage.setItem("classChat", JSON.stringify(chatData));
    } catch {}
  }, [chatData]);
  switch (tab) {
    case "chats":
      return (
        <ClassroomChat
          classroom={classroom}
          loggedInUser={loggedInUser}
          userCode={userCode}
          chatData={chatData}
          setChatData={setChatData}
        />
      );
    case "board":
      return (
        <BulletinBoard
          classroom={classroom}
          loggedInUser={loggedInUser}
          userCode={userCode}
        />
      );
    case "notebook":
      return (
        <div>
          <h2 style={{ marginTop: 0, color: "#245296" }}>Notebook</h2>
          <div style={{ background: "#f6f7fb", borderRadius: 12, padding: 18, color: "#26335a" }}>
            Notes and uploads for <b>{classroom.name}</b> go here.
            <div style={{ fontSize: 13, color: "#4965ab", marginTop: 12, opacity: 0.67 }}>(Document upload/organize stub)</div>
          </div>
        </div>
      );
    case "calls":
      return (
        <div>
          <h2 style={{ marginTop: 0, color: "#234492" }}>Audio / Video Calls</h2>
          <div style={{ background: "#eaf7ff", borderRadius: 12, padding: 18, color: "#235a73" }}>
            Initiate group calls for <b>{classroom.name}</b> here.
            <div style={{ fontSize: 13, color: "#548ead", marginTop: 12, opacity: 0.68 }}>(AV call functionality stub)</div>
          </div>
        </div>
      );
    case "services":
      return (
        <div>
          <h2 style={{ marginTop: 0, color: "#19649e" }}>Classroom Services</h2>
          <div style={{ background: "#EFFFEC", borderRadius: 12, padding: 18, color: "#1c6f46" }}>
            Services and collaborative tools for <b>{classroom.name}</b> go here.
            <div style={{ fontSize: 13, color: "#137b3b", marginTop: 12, opacity: 0.65 }}>(Extensions & project management stub)</div>
          </div>
        </div>
      );
    default:
      return (
        <div style={{ color: "#bbb", padding: 32 }}>
          Select a section from the right menu.
        </div>
      );
  }
}


/* Removed duplicate old ClassCard definition (see updated version above with onSelect prop) */

/* Removed duplicate old CreateClassroomModal definition (see updated version above) */

// PUBLIC_INTERFACE
/** Bulletin Board Component */
function BulletinBoard({ classroom, loggedInUser, userCode }) {
  // One bulletin post state object per classroom (persist per session only for this app)
  const classKey = 'bulletin-' + classroom.code;
  const [posts, setPosts] = React.useState(() => {
    try {
      return (
        JSON.parse(window.sessionStorage.getItem(classKey) || "[]") || []
      );
    } catch {
      return [];
    }
  });

  // Form and filter UI state
  const [form, setForm] = React.useState({
    title: "",
    content: "",
    importance: "Normal",
    reminder: "",
    editingId: null,
  });
  const [showForm, setShowForm] = React.useState(false);
  const [onlyHighPriority, setOnlyHighPriority] = React.useState(false);
  const [onlyReminders, setOnlyReminders] = React.useState(false);

  // Persist posts per session
  React.useEffect(() => {
    try {
      window.sessionStorage.setItem(classKey, JSON.stringify(posts));
    } catch {}
  }, [posts, classKey]);

  // Priority tag color
  function importanceColor(level) {
    switch (level) {
      case "High":
        return "#f34242";
      case "Normal":
        return "#FFD166";
      case "Low":
        return "#06D6A0";
      default:
        return "#e9ecef";
    }
  }

  // Sort and filter
  const filteredPosts = posts
    .filter(
      p =>
        (!onlyHighPriority || p.importance === "High") &&
        (!onlyReminders || !!p.reminder)
    )
    .sort((a, b) => {
      // Show posts with reminders/high priority first, then by time desc
      const aImportant = (a.importance === "High" ? 2 : 0) + (!!a.reminder ? 1 : 0);
      const bImportant = (b.importance === "High" ? 2 : 0) + (!!b.reminder ? 1 : 0);
      if (bImportant !== aImportant) return bImportant - aImportant;
      return b.createdAt - a.createdAt;
    });

  // --- Handlers ---
  function handleChangeForm(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }
  function resetForm() {
    setForm({
      title: "",
      content: "",
      importance: "Normal",
      reminder: "",
      editingId: null,
    });
    setShowForm(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    if (form.editingId) {
      // Edit mode
      setPosts(prev =>
        prev.map(p =>
          p.id === form.editingId
            ? {
                ...p,
                title: form.title,
                content: form.content,
                importance: form.importance,
                reminder: form.reminder,
              }
            : p
        )
      );
    } else {
      setPosts(prev => [
        {
          id: "post-" + Math.random().toString(36).slice(2, 9) + Date.now(),
          title: form.title,
          content: form.content,
          importance: form.importance,
          reminder: form.reminder,
          user: loggedInUser,
          userCode,
          createdAt: Date.now(),
        },
        ...prev,
      ]);
    }
    resetForm();
  }

  function handleEdit(post) {
    setForm({
      title: post.title,
      content: post.content,
      importance: post.importance,
      reminder: post.reminder || "",
      editingId: post.id,
    });
    setShowForm(true);
  }
  function handleDelete(postId) {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    setPosts(prev => prev.filter(p => p.id !== postId));
    if (form.editingId && form.editingId === postId) resetForm();
  }

  // --- Render ---
  return (
    <div style={{ width: "100%", padding: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 0 }}>
        <h2 style={{ margin: "0 9px 0 0", color: "#16612a", fontWeight: 800, fontSize: 23 }}>
          Bulletin Board
        </h2>
        <button
          className="main-action-btn main-action-btn-create"
          style={{ fontSize: 15, padding: "7px 15px", minWidth: 45 }}
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          aria-label="Create post"
        >
          New Post
        </button>
        <div style={{ marginLeft: 12, display: "flex", gap: 5 }}>
          <label style={{ fontSize: 14, color: "#245", fontWeight: 600, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={onlyHighPriority}
              style={{ marginRight: 5 }}
              onChange={e => setOnlyHighPriority(e.target.checked)}
            />
            High Priority
          </label>
          <label style={{ fontSize: 14, color: "#245", fontWeight: 600, cursor: "pointer", marginLeft: 7 }}>
            <input
              type="checkbox"
              checked={onlyReminders}
              style={{ marginRight: 5 }}
              onChange={e => setOnlyReminders(e.target.checked)}
            />
            Has Reminder
          </label>
        </div>
      </div>
      {showForm && (
        <div
          style={{
            background: "#f5fff0",
            borderRadius: 13,
            border: "1.5px solid #b3e495",
            padding: 19,
            margin: "20px 0 18px 0",
            maxWidth: 525,
            boxShadow: "0 1.5px 14px 0 #e2f7d4",
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            <div style={{ display: "flex", flexDirection: "row", gap: 17 }}>
              <input
                name="title"
                className="white-input"
                placeholder="Title"
                maxLength={60}
                required
                value={form.title}
                onChange={handleChangeForm}
                style={{ flex: 1, fontWeight: "700", fontSize: 15 }}
                autoFocus
              />
              <select
                name="importance"
                value={form.importance}
                onChange={handleChangeForm}
                className="white-input"
                style={{ maxWidth: 133, fontWeight: 700, color: importanceColor(form.importance) }}
                required
              >
                <option style={{ color: "#FFD166", fontWeight: "bold" }}>Normal</option>
                <option style={{ color: "#f34242", fontWeight: "bold" }}>High</option>
                <option style={{ color: "#06D6A0", fontWeight: "bold" }}>Low</option>
              </select>
            </div>
            <textarea
              name="content"
              placeholder="Write your announcement or important info..."
              rows={3}
              required
              maxLength={350}
              value={form.content}
              onChange={handleChangeForm}
              className="white-input"
              style={{
                resize: "vertical",
                minHeight: 40,
                fontWeight: 600,
                fontSize: 15,
                color: "#35522d",
              }}
            />
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10 }}>
              <label style={{ fontWeight: 600, color: "#445a2b", fontSize: 15 }}>
                Reminder (optional):
              </label>
              <input
                name="reminder"
                type="datetime-local"
                value={form.reminder}
                onChange={handleChangeForm}
                className="white-input"
                style={{ maxWidth: 210, fontSize: 14 }}
              />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button
                className="main-action-btn main-action-btn-create"
                style={{ flex: 1 }}
                type="submit"
              >
                {form.editingId ? "Save Changes" : "Post"}
              </button>
              <button
                className="main-action-btn"
                style={{
                  background: "#F5F8FA",
                  color: "#31518a",
                  border: "2px solid #e6ecf5",
                  fontWeight: 700,
                  flex: 1,
                }}
                type="button"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Post List */}
      <div style={{ marginTop: showForm ? 0 : 13 }}>
        {filteredPosts.length === 0 ? (
          <div style={{ color: "#87af88", opacity: 0.84, fontWeight: 500, padding: 25, textAlign: "center" }}>
            No posts yet for <b>{classroom.name}</b>.
          </div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, maxWidth: 650 }}>
            {filteredPosts.map(post => {
              // Highlight if high priority or has reminder or editing
              const highlight =
                post.importance === "High" || !!post.reminder;
              const isMine = post.userCode === userCode;
              let reminderBadge = null;
              let reminderPassed = false;
              if (post.reminder) {
                // Computes future vs past
                const dt = new Date(post.reminder);
                reminderPassed = dt < new Date();
                reminderBadge = (
                  <span
                    style={{
                      background: reminderPassed ? "#c2e0d4" : "#48e7b3",
                      color: "#096b36",
                      borderRadius: 11,
                      padding: "3.2px 9.5px",
                      fontSize: 13,
                      fontWeight: 800,
                      letterSpacing: 0.1,
                      marginLeft: 10,
                      marginRight: 7,
                    }}
                    title={
                      reminderPassed
                        ? "Reminder date/time (already passed)"
                        : "Reminder"
                    }
                  >
                    {dt.toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                );
              }
              return (
                <li
                  key={post.id}
                  style={{
                    background:
                      highlight
                        ? "linear-gradient(98deg, #fff9e0 80%, #f4ffe6 100%)"
                        : "#f5f7fa",
                    border: highlight
                      ? "2px solid #FFD166"
                      : "1.5px solid #d7ebdd",
                    borderLeft: highlight
                      ? "6px solid " +
                        (post.importance === "High" ? "#f34242" : "#06D6A0")
                      : "3px solid #aee7be",
                    borderRadius: 13,
                    boxShadow: highlight
                      ? "0 5px 17px 0 rgba(244,110,66,0.08)"
                      : "0 1.5px 8px 0 #ccdbe4",
                    margin: "0 0 17px 0",
                    padding: "14px 18px 12px 15px",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 11,
                    }}
                  >
                    <span style={{ fontWeight: 800, fontSize: 15.7, color: "#47599a" }}>
                      {post.title}
                    </span>
                    <span
                      style={{
                        background: importanceColor(post.importance),
                        color: post.importance === "High" ? "#fff" : (post.importance === "Low" ? "#074e2e" : "#ab8505"),
                        borderRadius: 9,
                        padding: "2.3px 11px",
                        fontWeight: 900,
                        fontSize: 13.5,
                        marginLeft: 7,
                        marginRight: 1,
                        letterSpacing: "0.07em",
                        boxShadow: "0 0 4px #F6FBF2",
                      }}
                      title={"Importance: " + post.importance}
                    >
                      {post.importance}
                    </span>
                    {reminderBadge}
                  </div>
                  <div style={{ margin: "7px 0", color: "#1c464c", fontWeight: 600, fontSize: 15.1 }}>
                    {post.content}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <span>
                      <span style={{ fontWeight: 700, color: "#357146" }}>
                        {post.user}
                      </span>
                      <span style={{ fontSize: 13, color: "#888", marginLeft: 6 }}>
                        {new Date(post.createdAt).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </span>
                    {isMine && (
                      <span>
                        <button
                          aria-label="Edit post"
                          onClick={() => handleEdit(post)}
                          style={{
                            background: "#fcfbf0",
                            color: "#2e4c7b",
                            fontWeight: 700,
                            border: "1.2px solid #daccb3",
                            borderRadius: 8,
                            fontSize: 13.5,
                            marginRight: 8,
                            padding: "3px 10px",
                            cursor: "pointer",
                          }}
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          aria-label="Delete post"
                          onClick={() => handleDelete(post.id)}
                          style={{
                            background: "#ffe2e2",
                            color: "#9b2d2d",
                            fontWeight: 900,
                            border: "1.3px solid #facdcd",
                            borderRadius: 8,
                            fontSize: 13.5,
                            padding: "3px 10px",
                            cursor: "pointer",
                          }}
                          title="Delete"
                        >
                          Delete
                        </button>
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
