import React, { useState, useEffect, useRef } from "react";
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

// PUBLIC_INTERFACE
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
            <header className="app-logo-header" style={{ marginBottom: 10, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
                <span className="app-logo-emoji" aria-label="Book Logo" style={{ marginRight: 10, display: 'flex', alignItems: 'center', fontSize: 28 }}>
                  <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                    <rect x="5" y="6" width="22" height="20" rx="4" fill="#FFD166" stroke="#4F8CFF" strokeWidth="2" />
                    <path d="M16 6v20" stroke="#4F8CFF" strokeWidth="2" />
                    <path d="M7 8h18" stroke="#06D6A0" strokeWidth="1.7" />
                    <circle cx="16" cy="26" r="1.1" fill="#4F8CFF" />
                  </svg>
                </span>
                <span style={{ fontWeight: 800 }}>{selectedClassroom.name}</span>
              </div>
              {/* Classroom ID + copy functionality */}
              <div style={{ display: "flex", alignItems: "center", marginTop: 6, gap: 7, marginLeft: 46 }}>
                <span className="white-ucode" title="Classroom ID" style={{ fontSize: 15.4, fontWeight: 900, letterSpacing: "0.03em" }}>
                  ID: {selectedClassroom.code}
                </span>
                <CopyIDButton code={selectedClassroom.code} />
              </div>
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
          <header className="app-logo-header" style={{ marginBottom: 26, position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
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
              <span style={{flex:1, fontWeight: 800}}>Classroom Insider</span>
              <span className="user-info-topright" style={{
                marginLeft: "auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                fontWeight: 700,
                fontSize: 15.5,
                color: "#115577",
                background: "#f8fbff",
                padding: "6.5px 15px 6.5px 16px",
                borderRadius: 16,
                boxShadow: "0 1.5px 7px 0 rgba(30,80,120,0.09)",
                border: "1px solid #e3e9f4",
                minWidth: 144
              }}>
                <span style={{fontWeight: 850, fontSize: 15.8, color: "#224e81"}} title="Your nickname">{username}</span>
                <span style={{
                  fontWeight: 700,
                  fontSize: 13.5,
                  marginTop: 2,
                  color: "#599093",
                  background: "#e4fbd8",
                  padding: "2.8px 9px",
                  borderRadius: 13,
                  fontFamily: "monospace",
                  letterSpacing: 0.5
                }} title="Your user code">ID: {userCode}</span>
              </span>
            </div>
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

/* 
 * PUBLIC_INTERFACE
 * Updated: Show both classroom name and ID together inside card, styled for clarity.
 */
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          width: "100%",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontWeight: 900,
            fontSize: "1.10rem",
            color: "#1a2c45",
            letterSpacing: "0.6px",
            wordBreak: "break-word",
            textAlign: "center",
            lineHeight: 1.2
          }}
        >
          {classroom.name}
        </span>
        <span
          style={{
            fontWeight: 750,
            fontSize: "0.98rem",
            color: "#2558A1",
            background: "#fff8e6",
            borderRadius: "14px",
            padding: "2.2px 10px",
            letterSpacing: "0.25px",
            display: "inline-block",
            marginTop: 2
          }}
          title="Classroom ID"
        >
          ID: {classroom.code}
        </span>
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
 * CopyIDButton - Copies the given code to clipboard, shows confirmation.
 * PUBLIC_INTERFACE
 */
function CopyIDButton({ code }) {
  const [copied, setCopied] = React.useState(false);
  function handleCopy() {
    if (navigator.clipboard && code) {
      navigator.clipboard.writeText(code + "").then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1700);
      });
    }
  }
  return (
    <button
      className="round-action-btn"
      style={{
        padding: "3.5px 13px",
        fontWeight: 900,
        fontSize: 16,
        background: "#FFF6D7",
        color: "#595B0A",
        border: "1.3px solid #FFD166",
        borderRadius: 15,
        outline: copied ? "2px solid #06D6A0" : undefined,
        transition: "outline .14s",
        marginLeft: 0,
        marginBottom: 1,
        boxShadow: "0 2px 7px 0 rgba(170,130,44,0.06)"
      }}
      type="button"
      aria-label={copied ? "Copied!" : "Copy Classroom ID"}
      onClick={handleCopy}
      tabIndex={0}
    >
      {copied ? "✓" : <span role="img" aria-label="Copy">📋</span>}
    </button>
  );
}

// ... (Chat, Bulletin Board, Notebook unchanged) ...

// (Previous code omitted for brevity -- keep unchanged until end, e.g. BulletinBoard, ClassNotebook ...)

// --- NEW SERVICES PANEL BEGIN ---
/** 
 * SERVICES PANEL (Leave Classroom & Group Project setup)
 * Includes: Leave confirmation modal and interactive multi-step Group Project manager (with groups, assignments, tasks in state).
 */
// PUBLIC_INTERFACE
function ServicesPanel({ classroom, loggedInUser, onLeaveClassroom }) {
  const [activeSection, setActiveSection] = React.useState(null); // "leave", "group", or null
  const [leaveModalOpen, setLeaveModalOpen] = React.useState(false);
  // GROUP PROJECT local state
  const [gpStep, setGpStep] = React.useState(0); // 0: Choose group, 1: Assign students, 2: Tasks
  const [groupSize, setGroupSize] = React.useState(2);
  const [assignmentMode, setAssignmentMode] = React.useState("random"); // "random" or "manual"
  const classroomMembers = (classroom && classroom.members) ? [...classroom.members] : [];
  // --- Multi-step Group Project state ---
  const [groups, setGroups] = React.useState(null); // [{name:...,members:[...]}]
  // For manual assign: Select map student->groupIndex
  const [manualAssignments, setManualAssignments] = React.useState({});
  // For per-group task assignments
  const [groupTasks, setGroupTasks] = React.useState({});
  // Helper: Reset all GP state
  function resetGroupProject() {
    setGpStep(0);
    setGroupSize(2);
    setAssignmentMode("random");
    setGroups(null);
    setManualAssignments({});
    setGroupTasks({});
  }
  // BACK: If switching away, reset GP state
  React.useEffect(() => {
    if (activeSection !== "group") resetGroupProject();
  }, [activeSection]);

  // === Handlers for group project steps ===

  // Step 1: Set group size
  function handleGpSizeSubmit(e) {
    e.preventDefault();
    const minMembers = Math.max(2, Math.min(classroomMembers.length, groupSize));
    setGroupSize(minMembers);
    setGpStep(1);
  }
  // Step 2: Decide group assignments (manual or random)
  function handleAssignmentModeSelect(mode) {
    setAssignmentMode(mode);
    if (mode === "random") {
      // Assign members randomly into groups in-memory:
      const shuffled = classroomMembers.slice().sort(() => Math.random() - 0.5);
      const gCount = Math.ceil(shuffled.length / groupSize);
      let idx = 0;
      const grps = [...Array(gCount)].map((_, j) => ({
        name: `Group ${j + 1}`,
        members: [],
      }));
      for (const s of shuffled) {
        grps[idx % gCount].members.push(s);
        idx++;
      }
      setGroups(grps);
      setGpStep(2);
    } else {
      // Manual: initialize empty groups
      const gCount = Math.ceil(classroomMembers.length / groupSize);
      setGroups([...Array(gCount)].map((_, j) => ({
        name: `Group ${j + 1}`,
        members: [],
      })));
      setManualAssignments({});
    }
  }
  // Step 2b: In manual, assign student to group
  function handleManualAssign(student, groupIdx) {
    setManualAssignments(assignments => ({
      ...assignments,
      [student]: groupIdx
    }));
  }
  // Step 2c: Submit manual assignments (students→groups)
  function handleManualSubmit(e) {
    e.preventDefault();
    // Build group arrays out of manualAssignments
    const assignments = manualAssignments;
    const gCount = groups.length;
    const grps = [...Array(gCount)].map((_, j) => ({
      name: `Group ${j + 1}`,
      members: [],
    }));
    for (const s of classroomMembers) {
      const idx = assignments[s];
      if (typeof idx === "number" && idx >= 0 && idx < gCount) {
        grps[idx].members.push(s);
      }
    }
    setGroups(grps);
    setGpStep(2);
  }
  // Step 3: Manage and assign tasks
  function handleTaskAdd(groupIdx, taskData) {
    setGroupTasks(prev => {
      const oldTasks = prev[groupIdx] || [];
      return {
        ...prev,
        [groupIdx]: [...oldTasks, { ...taskData, id: "t"+Math.random().toString(36).slice(2,9)+Date.now().toString(36), status: "todo", assignee: "", progress: 0 }]
      };
    });
  }
  function handleTaskChange(groupIdx, taskId, updates) {
    setGroupTasks(prev => ({
      ...prev,
      [groupIdx]: (prev[groupIdx]||[]).map(t => t.id === taskId ? { ...t, ...updates } : t)
    }));
  }
  function handleTaskDelete(groupIdx, taskId) {
    setGroupTasks(prev => ({
      ...prev,
      [groupIdx]: (prev[groupIdx]||[]).filter(t => t.id !== taskId)
    }));
  }

  // --- UI Rendering for GP steps ---
  // Step 1: Choose group size, assignment mode
  function renderStepGroupSize() {
    return (
      <div style={{maxWidth:420,padding:"10px 2px"}}>
        <h3 style={{color:"#186b8a",fontWeight:800,fontSize:20}}>Setup Group Project</h3>
        <form onSubmit={handleGpSizeSubmit} style={{marginBottom:14}}>
          <label style={{fontWeight:600}}>How many students per group?</label>
          <input
            className="white-input"
            type="number"
            min={2}
            max={Math.max(2, classroomMembers.length)}
            value={groupSize}
            style={{width:70,marginLeft:11,marginRight:7}}
            onChange={e=>setGroupSize(Math.max(2,Math.min(classroomMembers.length,parseInt(e.target.value)||2)))}
            required
          />
          <button className="main-action-btn main-action-btn-create" type="submit" style={{marginLeft:17,minWidth:76}}>Next</button>
        </form>
        <div style={{fontSize:15.2,color:"#888",marginTop:9}}>Members in classroom: {classroomMembers.length}</div>
      </div>
    );
  }
  // Step 2: Assignment mode (manual/random) and UI for manual
  function renderStepGroupAssign() {
    const gCount = Math.ceil(classroomMembers.length / groupSize);
    return (
      <div style={{maxWidth:540,padding:"16px 3px 7px 3px"}}>
        <h3 style={{color:"#186b8a",fontWeight:800,fontSize:19,marginBottom:10}}>Select Assignment Mode</h3>
        <div style={{display:"flex",gap:17,marginBottom:13}}>
          <button
            className="main-action-btn main-action-btn-create"
            style={{
              background: assignmentMode==="random" ? "#FFD166":"#faf9ee",
              color: "#234",
              fontWeight: 800,
              border: assignmentMode==="random"?"2.4px solid #FFD166":"1.5px solid #d0d0cf"
            }}
            type="button"
            onClick={()=>handleAssignmentModeSelect("random")}
            autoFocus
          >
            🎲 Random Assign
          </button>
          <button
            className="main-action-btn"
            style={{
              background: assignmentMode==="manual"?"#06D6A0":"#f3fff9",
              color: assignmentMode==="manual"?"#fff":"#115",
              fontWeight:800,
              border: assignmentMode==="manual"?"2.4px solid #06D6A0":"1.5px solid #c8eee7"
            }}
            type="button"
            onClick={()=>handleAssignmentModeSelect("manual")}
          >
            🖐️ Manual Assign
          </button>
        </div>
        {assignmentMode==="manual" &&
          <form onSubmit={handleManualSubmit} style={{marginTop:13}}>
            <div style={{border:"1.8px solid #7E9CB2",borderRadius:13,padding:"13px 12px 6px 12px",marginBottom:11}}>
              <div style={{fontWeight:700,fontSize:15.5,marginBottom:8}}>Assign students to groups:</div>
              {classroomMembers.map(s => (
                <div key={s} style={{display:"flex",alignItems:"center",marginBottom:5,gap:7}}>
                  <span style={{fontWeight:700,color:"#186b8a",minWidth:85,fontSize:15}}>{s}</span>
                  <select
                    className="white-input"
                    value={manualAssignments[s] ?? ""}
                    onChange={e=>handleManualAssign(s,parseInt(e.target.value)||0)}
                    style={{width:86}}
                  >
                    {[...Array(gCount)].map((_,j)=>
                      <option key={j} value={j}>Group {j+1}</option>
                    )}
                  </select>
                </div>
              ))}
            </div>
            <button className="main-action-btn main-action-btn-create" type="submit" style={{minWidth:74,fontWeight:700}}>Assign & Next</button>
          </form>
        }
        <button className="main-action-btn" type="button" style={{marginTop:17,minWidth:83,fontWeight:700,color:"#289"}}
          onClick={()=>{resetGroupProject(); setActiveSection(null);}}
        >Cancel</button>
      </div>
    );
  }
  // Step 3: Task assignment/management per group
  function renderStepTaskAssign() {
    const gCount = groups ? groups.length : 0;
    return (
      <div style={{padding:"12px 2px",maxWidth:680}}>
        <h3 style={{color:"#186b8a",fontWeight:800,fontSize:20,marginBottom:13}}>Assign & Track Group Tasks</h3>
        <div style={{display:"flex",flexWrap:"wrap",gap:23,alignItems:"stretch",marginBottom:17}}>
          {groups.map((group, idx) => (
            <div key={group.name} style={{
              background:"#f7fafc",border:"2px solid #FFD166",borderRadius:17,padding:"15px 12px 12px 12px",
              minWidth:200,maxWidth:255,flex:"1 1 230px",display:"flex",flexDirection:"column",gap:7,boxShadow:"0 2.5px 8px 0 rgba(255,193,80,0.06)"
            }}>
              <div style={{fontWeight:800,color:"#bc8419",fontSize:17,marginBottom:6}}>{group.name}</div>
              <div style={{fontWeight:700,fontSize:13.9,color:"#2767a8",marginBottom:7}}>Members: {group.members.join(", ")}</div>
              <div>
                <TaskManagerCard
                  groupIdx={idx}
                  group={group}
                  groupTasks={groupTasks[idx]||[]}
                  members={group.members}
                  onTaskAdd={handleTaskAdd}
                  onTaskChange={handleTaskChange}
                  onTaskDelete={handleTaskDelete}
                />
              </div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:17,marginTop:7}}>
          <button className="main-action-btn main-action-btn-create" type="button"
            style={{background:"#06D6A0",color:"#fff",fontWeight:900,minWidth:90}}
            onClick={()=>{resetGroupProject(); setActiveSection(null);}}
          >Finish</button>
          <button className="main-action-btn" type="button"
            style={{color:"#289",fontWeight:800,minWidth:85}}
            onClick={()=>{resetGroupProject(); setActiveSection(null);}}
          >Back to Services</button>
        </div>
      </div>
    );
  }

  // MAIN RENDER
  return (
    <div>
      <h2 style={{marginTop:0,color:"#19649e",fontWeight:800,marginBottom:23}}>Classroom Services</h2>
      <div style={{display:"flex",gap:23,marginBottom:26}}>
        <ServiceCard
          icon="🚪"
          title="Leave Classroom"
          description="Remove yourself from this class."
          onClick={()=>setLeaveModalOpen(true)}
        />
        <ServiceCard
          icon="👨‍👩‍👧‍👦"
          title="Group Project Setup"
          description="Start and manage group projects"
          onClick={()=>setActiveSection("group")}
        />
      </div>
      {leaveModalOpen &&
        <LeaveClassroomModal
          classroom={classroom}
          onCancel={()=>setLeaveModalOpen(false)}
          onConfirm={()=>{setLeaveModalOpen(false);onLeaveClassroom(classroom.code);}}
        />
      }
      {/* GROUP PROJECT Multi-Step Wizard */}
      {activeSection==="group" && (
        <div style={{background:"#f8fbff",border:"2.2px solid #06D6A0",borderRadius:21,boxShadow:"0 4px 20px 0 rgba(120,226,180,0.08)",padding:"18px 27px 21px 27px",marginTop:14}}>
          {[renderStepGroupSize, renderStepGroupAssign, renderStepTaskAssign][gpStep]()}
        </div>
      )}
    </div>
  );
}

// Helpers -- ServiceCard, Leave modal, Task Manager

function ServiceCard({icon,title,description,onClick}) {
  return (
    <button onClick={onClick} type="button"
      style={{
        background:"#fdf6ea",
        border:"2.2px solid #FFD166",
        boxShadow:"0 2.5px 11px 0 rgba(220,202,99,0.09)",
        borderRadius:19,
        display:"flex",flexDirection:"column",alignItems:"center",
        minWidth:157,padding:"18px 17px",cursor:"pointer",marginBottom:0,fontWeight:800,
        transition:"box-shadow .15s,background .12s"
      }}>
      <div style={{fontSize:40,lineHeight:1.14,marginBottom:7}}>{icon}</div>
      <div style={{fontWeight:900,fontSize:18.1,marginBottom:2}}>{title}</div>
      <div style={{color:"#b1962b",fontWeight:800,fontSize:13.7}}>{description}</div>
    </button>
  );
}

function LeaveClassroomModal({ classroom, onCancel, onConfirm }) {
  return (
    <div className="modal-outer-bg" aria-modal="true" style={{zIndex:1000}}>
      <div className="modal-white-card" style={{minWidth:320,maxWidth:390}}>
        <button
          type="button"
          aria-label="Close leave modal"
          className="modal-close-btn"
          onClick={onCancel}
        >✖</button>
        <h2 style={{ color: "#b31526", marginTop: 0, marginBottom: 20, fontWeight: 900 }}>Leave Classroom?</h2>
        <div style={{fontWeight:600,fontSize:16.6,marginBottom:25}}>
          Are you sure you want to leave <span style={{color:"#bc8419"}}>{classroom.name}</span>?
        </div>
        <div style={{display:"flex",gap:13,marginTop:12}}>
          <button className="main-action-btn main-action-btn-create"
            style={{background:"#FFD166",color:"#b31526",fontWeight:900,flex:1}}
            type="button"
            onClick={onConfirm}
          >Leave</button>
          <button className="main-action-btn"
            style={{background:"#F5F8FA",color:"#224e81",border:"2px solid #e6ecf5",fontWeight:700,flex:1}}
            type="button"
            onClick={onCancel}
          >Cancel</button>
        </div>
      </div>
    </div>
  );
}

// Card for tasks for each group
function TaskManagerCard({groupIdx, group, groupTasks, members, onTaskAdd, onTaskChange, onTaskDelete }) {
  const [adding, setAdding] = React.useState(false);
  const [taskName, setTaskName] = React.useState("");
  const [taskAssignee, setTaskAssignee] = React.useState("");
  function handleTaskCreate(e) {
    e.preventDefault();
    if (!taskName.trim()) return;
    onTaskAdd(groupIdx, { name: taskName.trim(), assignee: taskAssignee || members[0], progress: 0, status: "todo" });
    setTaskName("");
    setTaskAssignee("");
    setAdding(false);
  }
  return (
    <div>
      <div style={{marginBottom:7}}>
        {groupTasks.length === 0 &&
          <span style={{fontWeight:500,fontSize:13.7,color:"#aaa"}}>No tasks yet for this group.</span>
        }
        <ul style={{padding:0,margin:0,listStyle:"none"}}>
          {groupTasks.map((task, idx) => (
            <li key={task.id||idx} style={{marginBottom:9,background:"#fffbe6",borderRadius:10,padding:"7px 8px",boxShadow:"0 0.5px 3px 0 rgba(255,225,110,0.05)"}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <span style={{fontWeight:900,fontSize:14.5,color:"#bc8419"}}>{task.name}</span>
                <span style={{fontSize:13.5,color:"#326",fontWeight:600,marginLeft:11}}>Assignee:</span>
                <select
                  value={task.assignee}
                  style={{marginRight:7,fontWeight:700,fontSize:13.5,background:"#ececff",borderRadius:7}}
                  onChange={e=>onTaskChange(groupIdx, task.id, {assignee:e.target.value})}
                >
                  {members.map(s=><option value={s} key={s}>{s}</option>)}
                </select>
                <span style={{
                  marginLeft:13,
                  fontSize:13.2,fontWeight:700,color: task.status==="done"?"#06D6A0":task.status==="doing"?"#297":"#bc8419"
                }}>
                  {task.status==="done"? "✅ Done" : task.status==="doing"? "⌛ Doing" : "📝 To Do"}
                </span>
                <button onClick={()=>onTaskDelete(groupIdx, task.id)} title="Delete task" style={{
                  background:"none",border:"none",fontSize:15,color:"#b31526",marginLeft:6,cursor:"pointer",fontWeight:900
                }}>🗑️</button>
              </div>
              <div style={{marginLeft:7,marginTop:4,marginBottom:4}}>
                <label style={{fontSize:12.8,fontWeight:700,marginRight:5}}>Progress:</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={task.progress||0}
                  style={{verticalAlign:"middle",width:95,margin:"0 8px",accentColor:"#06D6A0"}}
                  onChange={e=>onTaskChange(groupIdx, task.id, {progress:parseInt(e.target.value)||0})}
                />
                <span style={{fontWeight:700,fontSize:13.2,color:"#06D6A0"}}>{task.progress||0}%</span>
              </div>
              <div style={{marginLeft:7}}>
                <select
                  value={task.status}
                  onChange={e=>onTaskChange(groupIdx, task.id, {status:e.target.value})}
                  style={{marginRight:7,padding:"2px 6px",fontWeight:700,fontSize:13.2,borderRadius:7,background:"#e4fbd8",color:"#113d13"}}
                >
                  <option value="todo">To Do</option>
                  <option value="doing">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {adding ?
        <form onSubmit={handleTaskCreate} style={{display:"flex",gap:6,alignItems:"center",marginTop:6}}>
          <input
            value={taskName}
            required
            onChange={e=>setTaskName(e.target.value)}
            maxLength={38}
            placeholder="Task Name"
            className="white-input"
            style={{width:97}}
            autoFocus
          />
          <select
            value={taskAssignee}
            onChange={e=>setTaskAssignee(e.target.value)}
            className="white-input"
            style={{width:86}}
          >
            <option value="">(Assign)</option>
            {members.map(s=><option value={s} key={s}>{s}</option>)}
          </select>
          <button className="main-action-btn main-action-btn-create" type="submit" style={{fontWeight:800,padding:"2px 11px",fontSize:14.1}}>Add</button>
          <button className="main-action-btn" type="button" onClick={()=>setAdding(false)} style={{fontWeight:600,fontSize:13.1}}>Cancel</button>
        </form>
        :
        <button className="main-action-btn main-action-btn-create" type="button" onClick={()=>setAdding(true)} style={{fontWeight:800,padding:"3px 13px",fontSize:14.1,marginTop:5}}>+ Task</button>
      }
    </div>
  );
}

// --- NEW SERVICES PANEL END ---

// CLASSROOM CHAT (unchanged, reinserted for build)
function ClassroomChat({
  classroom,
  loggedInUser,
  userCode,
  chatData,
  setChatData,
}) {
  const classChatId = classroom.code;
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef(null);
  const [incomingNotif, setIncomingNotif] = useState(null);
  const chatChannelRef = useRef(null);

  useEffect(() => {
    let channelName = "classroom-chat-" + classChatId;
    let channel = null;
    if ("BroadcastChannel" in window) {
      channel = new window.BroadcastChannel(channelName);
      channel.onmessage = (ev) => {
        const { type, msgObj } = ev.data || {};
        if (type === "chat-message" && msgObj && msgObj.userCode !== userCode) {
          setChatData(prev => {
            const prevArr = Array.isArray(prev[classChatId]) ? prev[classChatId] : [];
            if (prevArr.some(m => m.id === msgObj.id)) return prev;
            setIncomingNotif({
              user: msgObj.user,
              text: msgObj.text,
              ts: msgObj.ts,
            });
            return {
              ...prev,
              [classChatId]: [...prevArr, msgObj].slice(-150)
            };
          });
        }
      };
    }
    chatChannelRef.current = channel;
    return () => {
      if (channel) channel.close();
    };
    // eslint-disable-next-line
  }, [classChatId, userCode]);

  useEffect(() => {
    if (incomingNotif) {
      const timeout = setTimeout(() => setIncomingNotif(null), 4500);
      return () => clearTimeout(timeout);
    }
  }, [incomingNotif]);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chatData[classChatId]]);

  const createMsgId = () =>
    "m-" +
    Math.random().toString(36).slice(2, 9) +
    Date.now().toString().slice(-5);

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
        [classChatId]: [...prevArr, msgObj].slice(-150),
      };
    });
    if (chatChannelRef.current) {
      chatChannelRef.current.postMessage({
        type: "chat-message",
        msgObj,
      });
    }
    setMessageInput("");
  }

  function deleteMsg(msgId) {
    setChatData(prev => ({
      ...prev,
      [classChatId]: prev[classChatId].filter(m => m.id !== msgId),
    }));
  }

  const messages = Array.isArray(chatData[classChatId])
    ? [...chatData[classChatId]].sort((a, b) => a.ts - b.ts)
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 370 }}>
      <h2 style={{ marginTop: 0, color: "#175880", marginBottom: 9, fontWeight: 800, fontSize: 22 }}>
        Public Chat
      </h2>
      {incomingNotif && (
        <div
          style={{
            background: "#ffd166",
            color: "#06436b",
            padding: "8px 18px",
            borderRadius: 10,
            marginBottom: 7,
            fontWeight: 800,
            fontSize: 15.5,
            boxShadow: "0 2.5px 8px 0 rgba(255,193,80,0.07)"
          }}
          aria-live="polite"
        >
          💬 Message from <span style={{ color: "#b57918" }}>{incomingNotif.user}</span>:{" "}
          <span>{incomingNotif.text}</span>
        </div>
      )}
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


// BULLETIN BOARD (unchanged, reinserted for build)
function BulletinBoard({ classroom, loggedInUser, userCode }) {
  const boardSessionKey = "bulletinBoardPosts";
  const [posts, setPosts] = React.useState(() => {
    try {
      const all = JSON.parse(window.sessionStorage.getItem(boardSessionKey) || "{}");
      return all[classroom.code] || [];
    } catch {
      return [];
    }
  });

  const syncFromSession = () => {
    try {
      const all = JSON.parse(window.sessionStorage.getItem(boardSessionKey) || "{}");
      setPosts(all[classroom.code] || []);
    } catch {
      setPosts([]);
    }
  };

  React.useEffect(() => {
    try {
      let all = {};
      try { all = JSON.parse(window.sessionStorage.getItem(boardSessionKey) || "{}"); } catch {}
      all[classroom.code] = posts;
      window.sessionStorage.setItem(boardSessionKey, JSON.stringify(all));
    } catch {}
  }, [posts, classroom.code]);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingPostId, setEditingPostId] = React.useState(null);
  const [formTitle, setFormTitle] = React.useState("");
  const [formContent, setFormContent] = React.useState("");
  const [formImportance, setFormImportance] = React.useState("average");
  const [formReminder, setFormReminder] = React.useState(""); // date-time string
  const [showHighOnly, setShowHighOnly] = React.useState(false);
  const [showRemindersOnly, setShowRemindersOnly] = React.useState(false);

  const sortedPosts = [...posts]
    .sort((a, b) => b.timestamp - a.timestamp)
    .filter(p => {
      let ok = true;
      if (showHighOnly) ok = ok && p.importance === "high";
      if (showRemindersOnly) ok = ok && !!p.reminder;
      return ok;
    });

  function resetForm() {
    setFormTitle("");
    setFormContent("");
    setFormImportance("average");
    setFormReminder("");
    setEditingPostId(null);
  }

  function handlePostSubmit(e) {
    e.preventDefault();
    const trimmedTitle = formTitle.trim();
    const trimmedContent = formContent.trim();
    if (!trimmedTitle || !trimmedContent) return;

    if (editingPostId) {
      setPosts(prev =>
        prev.map(p =>
          p.id === editingPostId
            ? { ...p, title: trimmedTitle, content: trimmedContent, importance: formImportance, reminder: formReminder }
            : p
        )
      );
    } else {
      const newPost = {
        id: "b" + Math.random().toString(36).slice(2, 12) + Date.now().toString().slice(-6),
        author: loggedInUser,
        authorCode: userCode,
        title: trimmedTitle,
        content: trimmedContent,
        importance: formImportance,
        reminder: formReminder || "",
        timestamp: Date.now(),
      };
      setPosts(prev => [newPost, ...prev].slice(0, 60)); // cap to 60 most recent
    }
    setFormOpen(false);
    resetForm();
  }

  function handleEditPost(post) {
    setEditingPostId(post.id);
    setFormTitle(post.title);
    setFormContent(post.content);
    setFormImportance(post.importance);
    setFormReminder(post.reminder || "");
    setFormOpen(true);
  }

  function handleDeletePost(postId) {
    setPosts(prev => prev.filter(p => p.id !== postId));
  }

  React.useEffect(() => {
    if (editingPostId) setFormOpen(true);
  }, [editingPostId]);

  const importanceColors = {
    high: { bg: "#ffe5e5", color: "#c8352a", border: "#ec5555" },
    average: { bg: "#f6f2fa", color: "#684580", border: "#b2a0ce" },
    low: { bg: "#f4fcf8", color: "#178e53", border: "#74e0b2" },
  };
  const importanceLabels = {
    high: "High",
    average: "Average",
    low: "Low",
  };
  const importanceIcons = {
    high: "‼️",
    average: "🔔",
    low: "📝",
  };
  function getImportanceStyle(importance) {
    return importanceColors[importance] || importanceColors.average;
  }
  function shouldHighlight(post) {
    if (post.importance === "high") return true;
    if (post.reminder) {
      try {
        if (new Date(post.reminder).getTime() > Date.now() - 900000) return true;
      } catch {}
    }
    return false;
  }
  function formatTs(ts) {
    const d = new Date(ts);
    return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  function formatReminder(rem) {
    if (!rem) return "";
    try {
      const d = new Date(rem);
      return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return rem;
    }
  }

  return (
    <div style={{ minHeight: 365, paddingBottom: 17 }}>
      <h2 style={{
        color: "#19649e", fontWeight: 800, marginTop: 1, marginBottom: 12, fontSize: 23,
        display: "flex", alignItems: "center"
      }}>
        <span role="img" aria-label="Bulletin Board" style={{ marginRight: 7 }}>📌</span>
        Bulletin Board
        <button
          className="main-action-btn main-action-btn-create"
          tabIndex={0}
          aria-label="Add post"
          style={{
            marginLeft: 14,
            fontSize: 15.5,
            padding: "7px 18px",
            background: "#FFD166",
            color: "#234",
            fontWeight: 800,
            minWidth: 72,
          }}
          onClick={() => {
            setFormOpen(true);
            setEditingPostId(null);
            resetForm();
          }}
        >
          + Post
        </button>
      </h2>
      <div style={{ display: "flex", gap: 14, marginBottom: 9, alignItems: "center" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 5, fontWeight: 600 }}>
          <input
            type="checkbox"
            checked={showHighOnly}
            onChange={e => setShowHighOnly(e.target.checked)}
            style={{marginRight:5}}
          />
          High Importance Only
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 5, fontWeight: 600 }}>
          <input
            type="checkbox"
            checked={showRemindersOnly}
            onChange={e => setShowRemindersOnly(e.target.checked)}
            style={{marginRight:5}}
          />
          Reminders Only
        </label>
        <span style={{ marginLeft: 17, color: "#a2a", fontWeight: 600, fontSize: 13.3 }}>
          {sortedPosts.length} post{sortedPosts.length !== 1 ? "s" : ""}
        </span>
      </div>
      {formOpen && (
        <div
          aria-modal="true"
          role="dialog"
          style={{
            background: "#f8fbff",
            border: "2.2px solid #FFD166",
            boxShadow: "0 4px 28px 0 rgba(120,144,220,0.06)",
            borderRadius: 19,
            padding: "24px 18px 14px 18px",
            marginBottom: 22,
            marginTop: 4,
            position: "relative",
            maxWidth: 470,
          }}
        >
          <form onSubmit={handlePostSubmit}>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontWeight: 700, color: "#234", display: "block", marginBottom: 4 }}>Title</label>
              <input
                className="white-input"
                required
                maxLength={48}
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                autoFocus
                style={{ width: "100%", marginBottom: 7 }}
                placeholder="What’s the announcement about?"
              />
            </div>
            <div style={{ marginBottom: 9 }}>
              <label style={{ fontWeight: 700, color: "#234", display: "block", marginBottom: 4 }}>Details</label>
              <textarea
                className="white-input"
                required
                maxLength={280}
                value={formContent}
                onChange={e => setFormContent(e.target.value)}
                style={{
                  width: "100%", minHeight: 56, fontSize: 15.7, fontFamily: "inherit",
                  fontWeight: 600, marginBottom: 7, resize: "vertical"
                }}
                placeholder="Announcement text…"
              />
            </div>
            <div style={{ display: "flex", gap: 13, alignItems: "center", marginBottom: 10 }}>
              <label style={{ fontWeight: 700, color: "#297" }}>Importance:</label>
              <select
                value={formImportance}
                onChange={e => setFormImportance(e.target.value)}
                className="white-input"
                style={{ width: 110, fontWeight: 700, color: getImportanceStyle(formImportance).color }}
              >
                <option value="high">High ⚠️</option>
                <option value="average">Average 🔔</option>
                <option value="low">Low 📝</option>
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 13, marginTop: -5 }}>
              <label style={{ fontWeight: 700, color: "#297", minWidth: 84 }}>Reminder:</label>
              <input
                className="white-input"
                type="datetime-local"
                value={formReminder}
                onChange={e => setFormReminder(e.target.value)}
                style={{ width: 178, fontWeight: 600, color: "#125" }}
                min={new Date(Date.now() - 60000).toISOString().slice(0, 16)}
              />
              <span style={{ fontSize: 14.5, color: "#b99", marginLeft: 5 }}>(optional)</span>
            </div>
            <div style={{ display: "flex", gap: 13, marginTop: 10 }}>
              <button
                className="main-action-btn main-action-btn-create"
                type="submit"
                style={{ flex: 1, fontWeight: 800 }}
              >
                {editingPostId ? "Update" : "Post"}
              </button>
              <button
                className="main-action-btn"
                type="button"
                style={{
                  background: "#F5F8FA",
                  color: "#954",
                  border: "2px solid #e6ecf5",
                  fontWeight: 800,
                  flex: 1,
                }}
                onClick={() => {
                  setFormOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      <div style={{
        marginTop: 2,
        marginBottom: 7,
        minHeight: 165,
        background: "#fafcff",
        borderRadius: 13,
        border: "1.6px solid #97acd8",
        padding: "13px 8px 7px 8px",
        boxShadow: "0 1.5px 8px 0 rgba(90,140,210,0.03)",
      }}>
        {sortedPosts.length === 0 ? (
          <div style={{
            color: "#b8a", fontWeight: 600, fontSize: 15.5,
            textAlign: "center", padding: 25, opacity: 0.83
          }}>
            No posts yet. Announcements or reminders for the classroom will appear here!
          </div>
        ) : (
            <ul className="bulletin-post-list" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {sortedPosts.map(post => {
                const mine = post.authorCode === userCode;
                const important = post.importance === "high";
                const reminderDue = post.reminder && new Date(post.reminder).getTime() > Date.now() - 900000;
                const highlight = shouldHighlight(post);
                const impStyle = getImportanceStyle(post.importance);
                return (
                  <li
                    key={post.id}
                    className="bulletin-post-item"
                    style={{
                      background: highlight ? impStyle.bg : "#fff",
                      border: highlight ? `2.1px solid ${impStyle.border}` : "2px solid #eef2fb",
                      boxShadow: important
                        ? "0 4px 18px 0 rgba(230,63,53,0.08)"
                        : "0 2.5px 8px 0 rgba(150,150,200,0.06)",
                      borderRadius: 15,
                      marginBottom: 13,
                      position: "relative",
                      transition: "background 0.14s, border .13s",
                      minWidth: 0,
                      minHeight: 0,
                      width: "100%",
                      wordBreak: "break-word",
                      overflowWrap: "anywhere"
                    }}
                  >
                    <div
                      className="bulletin-post-header"
                      style={{
                        color: impStyle.color,
                        marginBottom: 2
                      }}
                    >
                      <span style={{ flexShrink: 0 }}>
                        {importanceIcons[post.importance]}
                      </span>
                      <span className="bulletin-post-title">
                        {post.title}
                      </span>
                      {important &&
                        <span className="bulletin-post-label bulletin-post-highlabel"
                          style={{
                            background: "#d14",
                            color: "#fff"
                          }}>
                          HIGH
                        </span>
                      }
                      {reminderDue && (
                        <span
                          className="bulletin-post-label bulletin-post-reminderlabel"
                          style={{
                            background: "#44b",
                            color: "#fff"
                          }}
                        >
                          Reminder
                        </span>
                      )}
                    </div>
                    <div
                      className="bulletin-post-content"
                    >
                      {post.content}
                    </div>
                    <div className="bulletin-post-meta" style={{ marginTop: 2 }}>
                      <span>
                        Posted by <span style={{ color: "#753", fontWeight: 800 }}>{post.author}</span>
                      </span>
                      <span style={{ color: "#a98", fontWeight: 700 }}>
                        • {formatTs(post.timestamp)}
                      </span>
                      {post.reminder &&
                        <span style={{ color: "#278", fontWeight: 700 }}>
                          • Remind at {formatReminder(post.reminder)}
                        </span>
                      }
                    </div>
                    <div className="bulletin-post-actions">
                      {mine && (
                        <>
                          <button
                            aria-label="Edit"
                            title="Edit post"
                            onClick={() => handleEditPost(post)}
                            style={{
                              background: "#7E9CB2",
                              color: "#fff",
                              fontWeight: 800,
                              padding: "2px 11px",
                              fontSize: 15.5,
                              borderRadius: 11,
                              border: "none",
                              marginRight: 2,
                              opacity: 0.86, cursor: "pointer"
                            }}
                          >✏️</button>
                          <button
                            aria-label="Delete"
                            title="Delete post"
                            onClick={() => handleDeletePost(post.id)}
                            style={{
                              background: "#FFD166",
                              color: "#B52",
                              fontWeight: 900,
                              padding: "2px 11px",
                              fontSize: 15.5,
                              borderRadius: 11,
                              border: "none",
                              opacity: 0.82, cursor: "pointer"
                            }}
                          >🗑️</button>
                        </>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )
        }
      </div>
    </div>
  );
}

// CLASS NOTEBOOK (unchanged, reinserted for build)
function ClassNotebook({ classroom, loggedInUser }) {
  const notebookSessionKey = "notebookFiles";
  const [fileList, setFileList] = React.useState(() => {
    try {
      const all = JSON.parse(window.sessionStorage.getItem(notebookSessionKey) || "{}");
      return all[classroom.code] || [];
    } catch {
      return [];
    }
  });

  const [uploading, setUploading] = React.useState(false);

  const syncFromSession = () => {
    try {
      const all = JSON.parse(window.sessionStorage.getItem(notebookSessionKey) || "{}");
      setFileList(all[classroom.code] || []);
    } catch {
      setFileList([]);
    }
  };

  function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const toSave = files.map(file => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploader: loggedInUser,
      uploadedAt: Date.now(),
      fileBlob: null,
    }));

    Promise.all(
      toSave.map((f, idx) => new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          resolve({ ...f, fileBlob: ev.target.result });
        };
        reader.readAsDataURL(files[idx]);
      }))
    ).then((filesToAdd) => {
      let all = {};
      try {
        all = JSON.parse(window.sessionStorage.getItem(notebookSessionKey) || "{}");
      } catch {}
      if (!all[classroom.code]) all[classroom.code] = [];
      all[classroom.code] = [...filesToAdd, ...(all[classroom.code]||[])].slice(0, 40);
      window.sessionStorage.setItem(notebookSessionKey, JSON.stringify(all));
      setUploading(false);
      syncFromSession();
      e.target.value = "";
    });
  }

  function handleFileDownload(file) {
    const a = document.createElement('a');
    a.href = file.fileBlob;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 120);
  }

  function handleFileRemove(fileId) {
    let all = {};
    try {
      all = JSON.parse(window.sessionStorage.getItem(notebookSessionKey) || "{}");
    } catch {}
    if (!all[classroom.code]) return;
    all[classroom.code] = all[classroom.code].filter(f => f.id !== fileId);
    window.sessionStorage.setItem(notebookSessionKey, JSON.stringify(all));
    syncFromSession();
  }

  const ACCEPTED_TYPES = [
    ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx",
    ".png", ".jpg", ".jpeg", ".gif", ".svg", ".bmp", ".txt", ".md",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "image/*", "text/*"
  ].join(",");

  const sortedFiles = [...fileList].sort((a, b) => b.uploadedAt - a.uploadedAt);

  return (
    <div style={{ minHeight: 360, paddingBottom: 19  }}>
      <h2 style={{
        color: "#195989",
        fontWeight: 800,
        marginTop: 1,
        marginBottom: 13,
        fontSize: 22
      }}>
        <span role="img" aria-label="Notebook" style={{ marginRight: 7 }}>📚</span>
        Notebook
      </h2>
      <div className="notebook-upload-box" style={{
        background: "#fafcff",
        border: "2px dashed #7E9CB2",
        borderRadius: 19,
        boxShadow: "0 2.5px 10px 0 rgba(105,160,200,0.05)",
        padding: "25px 15px 18px 15px",
        marginBottom: 20,
        maxWidth: 420,
        display: "flex",
        gap: 13,
        alignItems: "center",
        flexWrap: "wrap"
      }}>
        <input
          type="file"
          id="notebookfile"
          accept={ACCEPTED_TYPES}
          style={{ display: "none" }}
          multiple
          onChange={handleFileUpload}
          aria-label="Choose files to upload to notebook"
          disabled={uploading}
        />
        <label htmlFor="notebookfile"
          className="main-action-btn main-action-btn-create"
          tabIndex={0}
          style={{
            minWidth: 89,
            border: "2.2px solid #06D6A0",
            background: uploading ? "#bbb" : "var(--accent, #06D6A0)",
            color: "#013c26",
            fontWeight: 800,
            opacity: uploading ? 0.64 : 1,
            cursor: uploading ? "not-allowed" : "pointer"
          }}
        >
          <span role="img" aria-label="Upload" style={{ marginRight: 7 }}>⬆️</span>
          {uploading ? "Uploading..." : "Upload File(s)"}
        </label>
        <div style={{
          color: "#487",
          fontWeight: 600,
          fontSize: 14.5
        }}>
          Attach notes, slides, handouts or assignments (PDF, DOCX, images, etc.)
        </div>
      </div>
      {sortedFiles.length === 0 ? (
        <div style={{
          margin: "30px 0",
          padding: "21px 10px",
          background: "#f6fafd",
          borderRadius: 11,
          color: "#aac",
          fontWeight: 600,
          fontSize: 16.5,
          textAlign: "center"
        }}>
          No files uploaded yet.<br />All files are public and visible only to class members.
        </div>
      ) : (
        <div style={{
          margin: "10px 0 13px 0",
          overflowX: "auto",
          borderRadius: 13,
          background: "#fafdff",
          border: "1.5px solid #97acd8"
        }}>
          <table className="notebook-files-table" style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 16,
            color: "#233",
            minWidth: 340
          }}>
            <thead style={{ background: "#edfbf9" }}>
              <tr>
                <th style={{ textAlign: "left", padding: "11px 7px 10px 12px", fontWeight: 800 }}>File Name</th>
                <th style={{ textAlign: "left", padding: "11px 9px", fontWeight: 800 }}>Uploader</th>
                <th style={{ textAlign: "left", padding: "11px 8px", fontWeight: 800 }}>Uploaded</th>
                <th style={{ textAlign: "center", padding: "11px 8px", fontWeight: 800 }}>Download</th>
                <th style={{ textAlign: "center", padding: "11px 8px", fontWeight: 800 }}>Remove</th>
              </tr>
            </thead>
            <tbody>
              {sortedFiles.map(f => (
                <tr key={f.id} style={{
                  background: "#fff",
                  borderBottom: "1.5px solid #f1f4fb"
                }}>
                  <td style={{ padding: "9px 7px", fontWeight: 700, wordBreak: "break-word" }}>
                    <span style={{ color: "#117c9a" }}>{f.name}</span>
                  </td>
                  <td style={{ padding: "8px 7px", fontSize: 15 }}>
                    {f.uploader}
                  </td>
                  <td style={{ padding: "8px 7px", color: "#985", fontSize: 14, minWidth: 90 }}>
                    {new Date(f.uploadedAt).toLocaleString([], {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </td>
                  <td style={{ padding: "8px 7px", textAlign: "center" }}>
                    <button
                      aria-label={`Download ${f.name}`}
                      title="Download"
                      className="main-action-btn"
                      style={{
                        background: "#7E9CB2",
                        color: "#fff",
                        fontWeight: 900,
                        padding: "3px 14px",
                        fontSize: 15.5,
                        borderRadius: 14,
                        border: "none"
                      }}
                      onClick={() => handleFileDownload(f)}
                    >
                      ⬇️
                    </button>
                  </td>
                  <td style={{ padding: "8px 7px", textAlign: "center" }}>
                    {f.uploader === loggedInUser ? (
                      <button
                        aria-label={`Remove ${f.name}`}
                        title="Remove"
                        className="main-action-btn"
                        style={{
                          background: "#FFD166",
                          color: "#A33",
                          fontWeight: 900,
                          padding: "3px 14px",
                          fontSize: 15.5,
                          borderRadius: 14,
                          border: "none"
                        }}
                        onClick={() => handleFileRemove(f.id)}
                      >
                        🗑️
                      </button>
                    ) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
