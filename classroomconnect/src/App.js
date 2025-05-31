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

/**
 * PUBLIC_INTERFACE
 * Two-pane classroom detail right vertical menu (NO Calls/CallsPanel/AudioVideo)
 */
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
      {/* Calls tab REMOVED */}
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
        <ClassNotebook
          classroom={classroom}
          loggedInUser={loggedInUser}
        />
      );
    // 'calls' case and panel REMOVED
    case "services":
      return (
        <ServicesPanel
          classroom={classroom}
          loggedInUser={loggedInUser}
          onLeaveClassroom={(classCode) => {
            // Remove classroom from local storage and "redirect" to dashboard
            let myClassrooms = JSON.parse(localStorage.getItem("myClassrooms") || "[]");
            myClassrooms = myClassrooms.filter(c => c.code !== classCode);
            localStorage.setItem("myClassrooms", JSON.stringify(myClassrooms));
            window.location.reload(); // simple full reload for dashboard landing
          }}
        />
      );
    default:
      return (
        <div style={{ color: "#bbb", padding: 32 }}>
          Select a section from the right menu.
        </div>
      );
  }
}

/**
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

// ... (Rest of BulletinBoard and ClassNotebook remain unchanged)

/**
 * SERVICES PANEL (Leave Classroom & Group Project)
 */
function ServicesPanel({ classroom, loggedInUser, onLeaveClassroom }) {
  // Local state for modals, group project setup, and data
  const [showLeaveModal, setShowLeaveModal] = React.useState(false);
  const [gpStep, setGpStep] = React.useState(0); // 0: not started, 1: size, 2: method, 3: grouping, 4: pick group, 5: manage tasks
  const [groupSize, setGroupSize] = React.useState("");
  const [groupMode, setGroupMode] = React.useState(""); // 'manual' or 'random'
  const [manualGroups, setManualGroups] = React.useState({}); // {groupNum: array of members}
  const [randomGroups, setRandomGroups] = React.useState({}); // same as manualGroups
  const [assignedGroups, setAssignedGroups] = React.useState({});
  const [allGroups, setAllGroups] = React.useState({}); // current group mapping, set after grouping
  const [gpError, setGpError] = React.useState("");
  const [pickedGroup, setPickedGroup] = React.useState(null); // groupNum
  const [groupTasks, setGroupTasks] = React.useState({}); // groupNum: [{taskName, assignedTo, status}]
  const [showAddTaskModal, setShowAddTaskModal] = React.useState(false);
  const [newTaskName, setNewTaskName] = React.useState("");
  const [newTaskAssignee, setNewTaskAssignee] = React.useState("");
  const [taskGroup, setTaskGroup] = React.useState(null);

  // Utility: get unique classroom members list
  const classMembers = React.useMemo(() => {
    return Array.isArray(classroom.members)
      ? classroom.members.filter((m, i, arr) => m && arr.indexOf(m) === i)
      : [];
  }, [classroom]);

  const groupCount = React.useMemo(() => {
    const n = parseInt(groupSize, 10);
    if (!n || n < 1) return 1;
    return Math.ceil(classMembers.length / n);
  }, [groupSize, classMembers]);

  // Utility: shuffle array
  const shuffleArr = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // LEAVE CLASSROOM FLOW
  function LeaveClassroomModal() {
    return (
      <div className="modal-outer-bg">
        <div className="modal-white-card" style={{maxWidth:360, minWidth:268}}>
          <button className="modal-close-btn" aria-label="Close" type="button"
            onClick={() => setShowLeaveModal(false)}
          >✖</button>
          <h2 style={{color:NAVY,marginTop:0,marginBottom:18,fontWeight:800}}>Leave Classroom</h2>
          <p style={{color:NAVY,fontWeight:500,marginBottom:19}}>
            Are you sure you want to leave <b>{classroom.name}</b>?
          </p>
          <div style={{display:"flex",gap:13,marginTop:24}}>
            <button
              className="main-action-btn"
              style={{
                background:"#F5F8FA",color:NAVY,border:"2px solid #e6ecf5",fontWeight:700,flex:1,
              }}
              onClick={() => setShowLeaveModal(false)}
              type="button"
            >Cancel</button>
            <button
              className="main-action-btn main-action-btn-create"
              type="button"
              style={{flex:1}}
              onClick={() => onLeaveClassroom(classroom.code)}
            >Yes, Leave</button>
          </div>
        </div>
      </div>
    );
  }

  // GROUP PROJECT SETUP FLOW
  // Step 1: Group size
  function GroupProjectSetup() {
    // ---- HOOKS must be called UNCONDITIONALLY ----

    // For Step 3 (manual), ensure manualGroups initialized with correct groupCount
    React.useEffect(() => {
      if (
        gpStep === 3 &&
        groupMode === "manual" &&
        Object.keys(manualGroups).length !== groupCount
      ) {
        let groups = {};
        for (let i = 0; i < groupCount; ++i) groups[i + 1] = [];
        setManualGroups(groups);
      }
      // eslint-disable-next-line
    }, [gpStep, groupMode, groupCount]);

    // For Step 5 (task mgmt), ensure groupTasks entry exists
    React.useEffect(() => {
      if (gpStep === 5 && pickedGroup && !groupTasks[pickedGroup]) {
        setGroupTasks(prev => ({ ...prev, [pickedGroup]: [] }));
      }
      // eslint-disable-next-line
    }, [gpStep, pickedGroup]);

    // -------------------------------------

    if (gpStep === 0) {
      // Not started, show entry
      return (
        <div style={{margin:"26px 0"}}>
          <h2 style={{marginTop:0,marginBottom:13,color:"#21786c",fontWeight:800}}>Group Project</h2>
          <div style={{fontSize:16.5,fontWeight:500,marginBottom:22,color:"#054"}}>
            Create and manage group projects, assign tasks, and track team's progress!
          </div>
          <button
            className="main-action-btn main-action-btn-create"
            onClick={() => setGpStep(1)}
            style={{minWidth:120,fontSize:17,padding:"11px 26px"}}
          >Start Group Project Setup</button>
        </div>
      );
    }
    // Step 1: prompt for group size
    if (gpStep === 1) {
      return (
        <div style={{margin:"26px 0"}}>
          <h3 style={{color:"#197ca0",marginTop:0,marginBottom:14}}>Step 1: Group Size</h3>
          <div style={{fontSize:15.5,fontWeight:500,marginBottom:13}}>How many members per group?</div>
          <input
            className="white-input"
            type="number"
            min={1}
            max={Math.max(1,classMembers.length)}
            value={groupSize}
            onChange={e => setGroupSize(e.target.value.replace(/\D/,""))}
            placeholder="e.g. 3"
            style={{width:90,marginBottom:14,fontSize:15.5,fontWeight:700}}
          />
          <div style={{fontSize:13.7,color:"#685"}}>
            Number of members in class: <b>{classMembers.length}</b> <br/>
            {groupSize && groupCount > 1 &&
              <>→ Will form <b>{groupCount}</b> groups</>}
          </div>
          <div style={{marginTop:20,display:"flex",gap:15}}>
            <button
              className="main-action-btn main-action-btn-create"
              disabled={!groupSize || !parseInt(groupSize)}
              onClick={() => setGpStep(2)}
              style={{flex:1}}
            >Next</button>
            <button
              className="main-action-btn"
              style={{flex:1,background:"#F5F8FA",color:NAVY,border:"2px solid #e6ecf5"}}
              onClick={() => {setGpStep(0);setGroupSize("");setGroupMode("");setManualGroups({});setRandomGroups({});setAssignedGroups({});setAllGroups({});setGpError("");setPickedGroup(null);setGroupTasks({});}}
              type="button"
            >Cancel</button>
          </div>
        </div>
      );
    }
    // Step 2: Group method
    if (gpStep === 2) {
      return (
        <div style={{margin:"26px 0"}}>
          <h3 style={{color:"#229f5a",marginTop:0,marginBottom:14}}>Step 2: Grouping Method</h3>
          <div style={{fontSize:15.5,fontWeight:500,marginBottom:13}}>How would you like to assign members?</div>
          <div style={{display:"flex",gap:18,marginBottom:12}}>
            <button
              className="main-action-btn main-action-btn-create"
              onClick={() => {setGroupMode("manual");setGpStep(3);}}
              style={{flex:1}}
            >Manual</button>
            <button
              className="main-action-btn"
              style={{flex:1,background:brandAccent,color:NAVY,border:"2px solid #06D6A0",fontWeight:800}}
              onClick={() => {
                setGroupMode("random");
                // Shuffle members and assign to groups
                let shuffled = shuffleArr(classMembers);
                let groups = {};
                for (let i = 0; i < groupCount; ++i) groups[i+1] = [];
                shuffled.forEach((name, idx) => {
                  groups[(idx%groupCount)+1].push(name);
                });
                setRandomGroups(groups);
                setAllGroups(groups);
                setGpStep(4);
              }}
            >Random</button>
          </div>
          <div style={{fontSize:13.6,color:"#528"}}>Manual lets you choose group members.<br/>Random assigns all at random.</div>
        </div>
      );
    }
    // Step 3: Manual group assignment
    if (gpStep === 3 && groupMode === "manual") {
      // Unassigned members (remove all currently assigned)
      const assignedMembers = Object.values(manualGroups).flat();
      const unassigned = classMembers.filter(m=>!assignedMembers.includes(m));
      function handleAssign(member, groupNum) {
        // Add member to group
        let newGroups = {...manualGroups};
        Object.keys(newGroups).forEach(k=>{
          newGroups[k] = newGroups[k].filter(x=>x!==member);
        });
        newGroups[groupNum].push(member);
        setManualGroups(newGroups);
      }
      function handleRemove(member) {
        let newGroups = {...manualGroups};
        Object.keys(newGroups).forEach(k=>{
          newGroups[k] = newGroups[k].filter(x=>x!==member);
        });
        setManualGroups(newGroups);
      }
      function validAssignment() {
        // All assigned and no group exceeds groupSize
        if (unassigned.length > 0) return false;
        for (let k in manualGroups)
          if (manualGroups[k].length>parseInt(groupSize)) return false;
        return true;
      }
      return (
        <div style={{margin:"24px 0"}}>
          <h3 style={{color:"#d45d1d",marginTop:0,marginBottom:12}}>Step 3: Assign Members</h3>
          <div style={{fontSize:14.7,fontWeight:600,marginBottom:8}}>Assign {classMembers.length} members to {groupCount} groups</div>
          <div style={{display:"flex",gap:19,flexWrap:"wrap"}}>
            {Object.keys(manualGroups).map(k=>
              <div key={k} style={{background:"#f9fff6",borderRadius:12,border:"2px solid #06D6A0",padding:"9px 12px",minWidth:127,marginBottom:13,boxShadow:"0 2.5px 8px 0 #c0f2e7"}}>
                <div style={{fontSize:15.3,fontWeight:800,color:brandAccent,marginBottom:4}}>
                  Group {k} ({manualGroups[k].length}/{groupSize})
                </div>
                <ul style={{paddingLeft:16}}>
                  {manualGroups[k].map(m=>(
                    <li key={m} style={{fontWeight:600,color:"#094",display:"flex",alignItems:"center"}}>
                      {m}
                      <button style={{
                        marginLeft:7,background:"#ffeaea",color:"#b23",fontWeight:900,border:"none",borderRadius:8,
                        fontSize:12.7,cursor:"pointer",padding:"1px 8px",boxShadow:"0 2px 8px 0 #fbb"
                      }}
                        onClick={()=>handleRemove(m)} title="Remove from group"
                        aria-label="Remove from group"
                        >Remove</button>
                    </li>
                  ))}
                </ul>
                {unassigned.length > 0 &&
                <div>
                  <select value="-"
                    onChange={e =>{if(e.target.value!=="-")handleAssign(e.target.value,k)}}
                    style={{width:105,marginTop:7,borderRadius:8,border:"1.5px solid #8f9",fontWeight:700}}
                  >
                    <option value="-">Add member…</option>
                    {unassigned.map(m=>(
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>}
              </div>
            )}
          </div>
          {unassigned.length > 0 && (
            <div style={{color:"#003C35",fontWeight:600,background:"#edfdf8",borderRadius:7,padding:"8px 13px",marginBottom:9}}>
              Unassigned: {unassigned.join(", ")}
            </div>
          )}
          <div style={{marginTop:9,display:"flex",gap:13}}>
            <button
              className="main-action-btn main-action-btn-create"
              disabled={!validAssignment()}
              onClick={() => {
                setAllGroups(manualGroups);
                setGpStep(4);
              }}
              style={{flex:1}}
            >Confirm Groups</button>
            <button
              className="main-action-btn"
              style={{flex:1,background:"#F5F8FA",color:NAVY,border:"2px solid #e6ecf5"}}
              onClick={() => {setGpStep(2);setManualGroups({});}}
              type="button"
            >Back</button>
          </div>
        </div>
      );
    }
    // Step 4: View Groups (auto for random, manual for manual), pick group if not picked
    if (gpStep === 4) {
      const groups = groupMode==="manual"?manualGroups:randomGroups;
      return (
        <div style={{margin:"24px 0"}}>
          <h3 style={{color:"#0a7dab",marginTop:0,marginBottom:14}}>
            Step 4: {pickedGroup?"Your Group":"Pick Your Group"}
          </h3>
          <div style={{display:"flex",gap:17,flexWrap:"wrap"}}>
            {Object.keys(groups).map(k=>(
              <div key={k} style={{
                background:"#fffbe7",borderRadius:14,
                border:`3px solid ${pickedGroup===k?"#FFD166":"#e7ddad"}`,
                minWidth:143,
                padding:"11px 17px",marginBottom:12,boxShadow:"0 2.5px 8px 0 #ffe7af",
                cursor: pickedGroup? "default":"pointer",
                outline: pickedGroup===k?"2px solid #06D6A0":"none"
              }}
                onClick={()=>!pickedGroup&&setPickedGroup(k)}
                tabIndex={pickedGroup? -1:0}
                aria-label={pickedGroup?`Group ${k} (selected)`:`Select Group ${k}`}
              >
                <div style={{fontWeight:800,fontSize:16.2,color:"#b87907",marginBottom:5}}>
                  Group {k}
                </div>
                <ul style={{margin:0,paddingLeft:16}}>
                  {groups[k].map(m=>
                    <li key={m} style={{fontWeight:650,color:"#260"}}>
                      {m}
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
          {!pickedGroup && (
            <div style={{marginTop:9,color:"#689",fontWeight:600}}>
              Click your group to proceed. You're <b>{loggedInUser}</b>.
            </div>
          )}
          <div style={{marginTop:15,display:"flex",gap:13}}>
            {pickedGroup && (
            <button
              className="main-action-btn main-action-btn-create"
              style={{flex:1}}
              onClick={()=>setGpStep(5)}
            >Start Managing Tasks</button>
            )}
            <button
              className="main-action-btn"
              style={{flex:1,background:"#F5F8FA",color:NAVY,border:"2px solid #e6ecf5"}}
              onClick={() => {
                setGpStep(groupMode==="manual"?3:2);
                setPickedGroup(null);
              }}
              type="button"
            >Back</button>
          </div>
        </div>
      );
    }
    // Step 5: Group Task Management UI
    if (gpStep === 5 && pickedGroup) {
      function handleAddTask(e){
        e.preventDefault();
        if(!newTaskName) return;
        setGroupTasks(prev=>{
          let arr = prev[pickedGroup]||[];
          return {...prev,[pickedGroup]:[...arr,{
            taskName: newTaskName,
            assignedTo: newTaskAssignee||"",
            status:"todo"
          }]};
        });
        setShowAddTaskModal(false);setNewTaskName("");setNewTaskAssignee("");
      }
      function handleTaskStatus(idx, status){
        setGroupTasks(prev=>{
          let arr = prev[pickedGroup]||[];
          let updated = [...arr];
          updated[idx] = {...updated[idx], status};
          return {...prev,[pickedGroup]:updated};
        });
      }
      // Compute group progress
      const tasks = groupTasks[pickedGroup]||[];
      const doneCount = tasks.filter(t=>t.status==="done").length;
      const progress = tasks.length? Math.round(doneCount*100/tasks.length):0;
      const currMembers = (allGroups[pickedGroup]||[]);
      return (
        <div style={{margin:"23px 0"}}>
          <h3 style={{color:brandAccent,marginTop:0,marginBottom:13}}>Tasks for Group {pickedGroup}</h3>
          <div style={{marginBottom:9,fontWeight:800,color:"#259c4d",fontSize:15.2}}>
            Members: {currMembers.join(", ")}
          </div>
          <div style={{marginBottom:19,background:"#f5feef",padding:"9px 12px",borderRadius:8,
          border:"2px solid #b9eccb",color:"#217937",fontWeight:700}}>Progress:
            <span style={{marginLeft:6}}>{progress}%</span>
            <span style={{
              display:"inline-block",width:110,height:13,background:"#e1f7e6",borderRadius:7,verticalAlign:"middle",marginLeft:10
              }}>
              <span style={{
                display:"inline-block",background:"#06D6A0",height:"100%",borderRadius:7,width:progress+"%",transition:"width 0.18s"
              }}/>
            </span>
          </div>
          {/* Task table */}
          <table style={{
            width:"100%",borderCollapse:"collapse",fontSize:"15px",marginBottom:13
          }}>
            <thead>
              <tr style={{color:"#21786c",background:"#f5feff",fontWeight:800}}>
                <th style={{padding:"7px 8px 7px 8px"}}>Task</th>
                <th style={{padding:"7px 8px"}}>Assigned To</th>
                <th style={{padding:"7px 8px"}}>Status</th>
                <th style={{padding:"7px 8px"}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{textAlign:"center",color:"#beb",fontWeight:700,padding:17}}>
                    No tasks yet. Add a task!
                  </td>
                </tr>
              ) : (
                tasks.map((task,idx)=>(
                  <tr key={idx} style={{background:"#fff",borderBottom:"1.2px solid #f1ffe5"}}>
                    <td style={{padding:"9px 7px",fontWeight:700,color:"#175880"}}>{task.taskName}</td>
                    <td style={{padding:"9px 7px",color:"#b37909"}}>{task.assignedTo||"–"}</td>
                    <td style={{padding:"7px 6px",fontWeight:800,color:task.status==="done"?"#12b755":"#d86"}}>
                      {task.status==="todo"?"TODO":"✅ Done"}
                    </td>
                    <td style={{padding:"7px 6px"}}>
                      {task.status==="todo"&&(
                        <button
                          className="main-action-btn"
                          style={{background:"#FFD166",color:NAVY,fontWeight:700,padding:"4px 13px",fontSize:14,borderRadius:7}}
                          onClick={()=>handleTaskStatus(idx,"done")}
                        >Mark Done</button>
                      )}
                      {task.status==="done"&&(
                        <button
                          className="main-action-btn"
                          style={{background:"#e8f9e6",color:"#1f7",fontWeight:900,padding:"4px 13px",fontSize:14,borderRadius:7}}
                          onClick={()=>handleTaskStatus(idx,"todo")}
                        >Undo</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <button
            className="main-action-btn main-action-btn-create"
            style={{marginBottom:17,minWidth:120}}
            onClick={()=>{
              setTaskGroup(pickedGroup);
              setShowAddTaskModal(true);
            }}
          >Add Task</button>
          <div style={{display:"flex",gap:19,marginTop:5}}>
            <button
              className="main-action-btn"
              style={{background:"#F5F8FA",color:NAVY,border:"2px solid #e6ecf5",flex:1}}
              onClick={()=>{
                // Reset GP flow
                setGpStep(0);
                setGroupSize("");
                setGroupMode("");
                setManualGroups({});
                setRandomGroups({});
                setAllGroups({});
                setGpError("");
                setPickedGroup(null);
                setGroupTasks({});
              }}
            >Finish/Exit Group Project</button>
          </div>
          {/* Add Task Modal */}
          {showAddTaskModal && (
            <div className="modal-outer-bg">
              <div className="modal-white-card" style={{maxWidth:388,minWidth:258}}>
                <button className="modal-close-btn" aria-label="Close"
                  onClick={()=>{setShowAddTaskModal(false);setNewTaskName("");setNewTaskAssignee("");}}
                  type="button"
                >✖</button>
                <h2 style={{color:"#127851",marginTop:0,fontWeight:800,marginBottom:11}}>Add Task</h2>
                <form onSubmit={handleAddTask}>
                  <label style={{fontWeight:700,marginBottom:8,display:"block",color:"#237"}}>
                    Task Name
                  </label>
                  <input
                    className="white-input"
                    style={{width:"98%",marginBottom:15}}
                    placeholder="Describe the task..."
                    required
                    value={newTaskName}
                    onChange={e=>setNewTaskName(e.target.value)}
                    autoFocus
                  />
                  <label style={{fontWeight:700,marginBottom:6,display:"block",color:"#278"}}>Assigned To</label>
                  <select
                    className="white-input"
                    style={{width:"97%",marginBottom:18}}
                    value={newTaskAssignee}
                    onChange={e=>setNewTaskAssignee(e.target.value)}
                  >
                    <option value="">No one (anyone in group)</option>
                    {currMembers.map(m=>
                      <option key={m} value={m}>{m}</option>
                    )}
                  </select>
                  <div style={{display:"flex",gap:12,marginTop:10}}>
                    <button className="main-action-btn main-action-btn-create" type="submit" style={{flex:1}}>Add</button>
                    <button className="main-action-btn" type="button" style={{flex:1,background:"#F5F8FA",color:NAVY,border:"2px solid #e6ecf5"}}
                      onClick={()=>{setShowAddTaskModal(false);setNewTaskName("");setNewTaskAssignee("");}}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      );
    }
    // If something goes wrong, show error
    return <div style={{color:"#c33",fontWeight:700,padding:22}}>Something went wrong with Group Project flow.<br/>{gpError}</div>
  }

  return (
    <div>
      <h2 style={{marginTop:0,color:"#19649e"}}>Classroom Services</h2>
      {/* Card-row for main options */}
      <div style={{display:"flex",gap:32,marginBottom:33,marginTop:21,flexWrap:"wrap"}}>
        {/* Leave Classroom Card */}
        <div style={{
          background:"#ffeaea",borderRadius:16,padding:"21px 28px 17px 22px",
          boxShadow:"0 3px 24px 0 rgba(250,196,180,0.10)",minWidth:188,maxWidth:230,
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",border:"2px solid #FFD166"
        }}>
          <div style={{fontSize:23,marginBottom:9,lineHeight:"41px"}}>🚪</div>
          <div style={{fontWeight:800,fontSize:17.6,color:"#ac320c",marginBottom:7}}>Leave Classroom</div>
          <button className="main-action-btn"
            style={{
              background:"#FFD166",color:"#1a333d",
              fontWeight:800,marginTop:9,marginBottom:2,padding:"7px 15px",borderRadius:16
            }}
            onClick={()=>setShowLeaveModal(true)}
          >
            Leave
          </button>
        </div>
        {/* Group Project Card */}
        <div style={{
          background:"#e9fff5",borderRadius:16,padding:"21px 28px 17px 22px",
          boxShadow:"0 3px 21px 0 rgba(110,220,180,0.10)",minWidth:188,maxWidth:260,
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",border:"2px solid #06D6A0"
        }}>
          <div style={{fontSize:23,marginBottom:9,lineHeight:"41px"}}>🤝</div>
          <div style={{fontWeight:800,fontSize:17.6,color:"#197c4c",marginBottom:7}}>Group Project</div>
          <button className="main-action-btn main-action-btn-create"
            style={{
              background:"#06D6A0",color:"#01260e",
              fontWeight:800,marginTop:9,marginBottom:2,padding:"7px 19px",borderRadius:16
            }}
            onClick={()=>setGpStep(1)}
          >
            Setup
          </button>
        </div>
      </div>
      {/* Leave Modal */}
      {showLeaveModal && <LeaveClassroomModal />}
      {/* GroupProject dialog */}
      {gpStep > 0 && <GroupProjectSetup />}
    </div>
  );
}

function BulletinBoard({ classroom, loggedInUser, userCode }) {
  // ... (Unchanged: see template)
}

function ClassNotebook({ classroom, loggedInUser }) {
  // ... (Unchanged: see template)
}

// For export
export default App;
