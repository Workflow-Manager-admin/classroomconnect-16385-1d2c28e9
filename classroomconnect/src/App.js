import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// Util for random unique code
function generateCode(length = 6, alphanumeric = false) {
  const chars = alphanumeric
    ? "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    : "0123456789";
  let code = "";
  for (let i = 0; i < length; ++i)
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

/**
 * ===== STYLES =====
 * Update navy blue for all text
 */
const NAVY = "#001f4d";
const babyBlue = "#A7C7E7";
const accent = "#06D6A0";
const secondary = "#FFD166";
const pink = "#FCC2FF";
const orange = "#FFD795";
const purple = "#9DF6FF";
const funPalette = [babyBlue, pink, orange, purple, secondary, accent];

const themeVars = {
  "--main-bg": babyBlue,
  "--main-accent": accent,
  "--main-secondary": secondary,
  "--border-radius": "22px",
  "--large-radius": "30px",
  "--card-radius": "18px",
  "--navy": NAVY,
  "--text-color": NAVY,
  "--text-secondary": "#406495"
};

const applyTheme = () => {
  for (let [cssVar, value] of Object.entries(themeVars))
    document.documentElement.style.setProperty(cssVar, value);
};
applyTheme();

// ====== MAIN APP CONTEXT ======
function App() {
  // Registration simulation (actual prod would use backend/auth)
  const [userCode, setUserCode] = useState(
    localStorage.getItem("userCode") ||
      generateCode(8, true)
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
  const [dashboardView, setDashboardView] = useState(
    true // true=show dashboard, false=inside classroom
  );
  const [selectedClassroom, setSelectedClassroom] = useState(null);

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

  // Dashboard handlers
  const handleJoinClassroom = (code) => {
    if (
      code.length === 6 &&
      !classrooms.find((c) => c.code === code)
    ) {
      const name = `Classroom ${code}`;
      setClassrooms((prev) => [
        ...prev,
        {
          code,
          name,
          color: funPalette[(prev.length + 1) % funPalette.length],
          joinedAt: Date.now()
        }
      ]);
      setDashboardView(false);
      setSelectedClassroom(code);
    }
  };
  const handleCreateClassroom = () => {
    let newCode = generateCode(6, false);
    // Ensure code not duplicate (client-side "serverless" sim)
    while (classrooms.some((c) => c.code === newCode))
      newCode = generateCode(6, false);
    const name = `Classroom ${newCode}`;
    const newClass = {
      code: newCode,
      name,
      color: funPalette[(classrooms.length + 2) % funPalette.length],
      joinedAt: Date.now()
    };
    setClassrooms((prev) => [...prev, newClass]);
    setDashboardView(false);
    setSelectedClassroom(newCode);
  };

  // Enter classroom
  const openClassroom = (code) => {
    setSelectedClassroom(code);
    setDashboardView(false);
  };

  const leaveClassroom = () => {
    setSelectedClassroom(null);
    setDashboardView(true);
  };

  // ============ RENDERS ===========
  // Registration screen
  if (!registered) {
    return (
      <div className="cc-main-bg">
        <nav className="cc-navbar">
          <div className="cc-logo" style={{ color: NAVY }}>ClassroomConnect</div>
        </nav>
        <div className="cc-register-wrap">
          <div className="cc-card cc-register-card">
            <h2 style={{ color: NAVY }}>Welcome to ClassroomConnect!</h2>
            <p style={{ color: NAVY }}>
              Create or join virtual classrooms! Enter your nickname to get
              started.
            </p>
            <form onSubmit={handleRegistration} style={{ width: "100%" }}>
              <input
                className="cc-input"
                placeholder="Enter your nickname..."
                maxLength={20}
                minLength={2}
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: "100%" }}
                autoFocus
              />
              <div className="cc-ucode-label" style={{ color: NAVY }}>
                <span>Your unique code: </span>
                <span className="cc-ucode">{userCode}</span>
              </div>
              <button className="cc-btn cc-btn-large" type="submit">
                Get Started
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard or classroom
  return (
    <div className="cc-main-bg app-expanded-bg">
      {/* Modernized Top Navigation */}
      <nav className="cc-navbar cc-navbar-modern">
        <div className="cc-logo" style={{ color: NAVY }}>
          <span className="cc-logo-img" role="img" style={{ marginRight: 7 }}>
            🎒
          </span>
          ClassroomConnect
        </div>
        <div className="cc-nav-right">
          <span className="cc-username" style={{ color: NAVY }}>{username}</span>
          <span className="cc-ucode" title="Your unique user code">
            {userCode}
          </span>
        </div>
      </nav>

      {/* Main Container */}
      <main className="cc-main-container-expanded">
        {dashboardView ? (
          <Dashboard
            classrooms={classrooms}
            onCreate={handleCreateClassroom}
            onJoin={handleJoinClassroom}
            openClassroom={openClassroom}
            funPalette={funPalette}
          />
        ) : (
          <ClassroomPanel
            classroom={
              classrooms.find((c) => c.code === selectedClassroom) || {}
            }
            username={username}
            userCode={userCode}
            leaveClassroom={leaveClassroom}
          />
        )}
      </main>

      {/* Modern Footer */}
      <footer className="cc-footer-expanded">
        <div className="cc-footer-content">
          <span style={{ fontWeight: 600, color: NAVY }}>
            ClassroomConnect 
          </span>
          <span className="cc-footer-spacer" />
          <span style={{ color: "#406495", fontSize: "0.98rem" }}>
            Playful learning, connected! &copy; {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </div>
  );
}

// ========== DASHBOARD (Shows classroom cards, join/create options) ==========
function Dashboard({
  classrooms,
  onCreate,
  onJoin,
  openClassroom,
  funPalette
}) {
  const [joinCode, setJoinCode] = useState("");
  const handleJoin = (e) => {
    e.preventDefault();
    if (joinCode.length === 6) {
      onJoin(joinCode);
    }
  };

  return (
    <div className="cc-dash-bg">
      <div className="cc-hero">
        <h1 style={{ color: NAVY, marginBottom: 8 }}>Welcome!</h1>
        <p className="cc-blurb" style={{ marginBottom: 25, color: NAVY }}>
          Playful, easy virtual classrooms for everyone. Create a new class, join one with a code, or access your classes.
        </p>
      </div>
      <div className="cc-dashboard-wrap">
        <form
          className="cc-card cc-create-join"
          onSubmit={handleJoin}
          style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}
        >
          <button
            className="cc-btn cc-btn-large"
            type="button"
            style={{ background: funPalette[0], color: "#233", flex: 1 }}
            onClick={onCreate}
          >
            <span role="img" aria-label="add" style={{ marginRight: 8 }}>
              ➕
            </span>
            Create Classroom
          </button>
          <input
            className="cc-input"
            placeholder="Enter 6-digit code"
            maxLength={6}
            minLength={6}
            required
            style={{ width: 120, flex: "none", textAlign: "center" }}
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.replace(/[^\d]/g, ""))}
          />
          <button
            className="cc-btn cc-btn-large"
            style={{
              background: funPalette[1],
              color: "#233",
              flex: 1,
              minWidth: 150
            }}
            type="submit"
          >
            <span role="img" aria-label="join" style={{ marginRight: 8 }}>
              🚪
            </span>
            Join Classroom
          </button>
        </form>
        <div
          style={{
            marginBottom: 28,
            color: NAVY,
            fontWeight: 600,
            marginLeft: 10
          }}
        >
          Your Classrooms
        </div>
        <div className="cc-classcards-grid">
          {classrooms.length === 0 && (
            <div
              style={{
                textAlign: "center",
                color: NAVY,
                fontSize: "1.12rem"
              }}
            >
              No classes yet. Join or create one!
            </div>
          )}
          {classrooms.sort((a, b) => b.joinedAt - a.joinedAt).map((c, idx) => (
            <ClassCard
              key={c.code}
              classroom={c}
              color={c.color || funPalette[idx % funPalette.length]}
              onClick={() => openClassroom(c.code)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ClassCard({ classroom, color, onClick }) {
  return (
    <button
      className="cc-card cc-classcard"
      tabIndex={0}
      style={{
        border: "0px solid #fff5",
        background: color,
        color: NAVY,
        cursor: "pointer"
      }}
      onClick={onClick}
      aria-label={"Open " + classroom.name}
    >
      <div style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: 6, color: NAVY }}>
        {classroom.name}
      </div>
      <div style={{ fontWeight: 500, letterSpacing: 2, color: NAVY }}>
        #{classroom.code}
      </div>
      <div style={{ fontSize: 13, color: NAVY }}>
        Joined{" "}
        {new Date(classroom.joinedAt).toLocaleDateString([], {
          month: "short",
          day: "numeric"
        })}
      </div>
    </button>
  );
}

// ========== CLASSROOM PANEL (Tabs: Chat, Bulletin, Notebook, Projects, Calls) ==========
function ClassroomPanel({
  classroom,
  username,
  userCode,
  leaveClassroom
}) {
  const [tab, setTab] = useState("chat");
  return (
    <div className="cc-classroom-bg">
      <div className="cc-classroom-header">
        <button className="cc-btn cc-btn-naked" onClick={leaveClassroom} style={{ color: NAVY }}>
          ⬅ Back
        </button>
        <div
          className="cc-crumb-title"
          style={{
            color: NAVY
          }}
        >
          {classroom.name || "Classroom"}
        </div>
        <span className="cc-classcode" style={{ color: NAVY }}>#{classroom.code}</span>
      </div>
      <div className="cc-class-tabs-bar">
        <TabButton
          active={tab === "chat"}
          onClick={() => setTab("chat")}
          label="💬 Chat"
        />
        <TabButton
          active={tab === "bulletin"}
          onClick={() => setTab("bulletin")}
          label="📢 Bulletin"
        />
        <TabButton
          active={tab === "notebook"}
          onClick={() => setTab("notebook")}
          label="📖 Notebook"
        />
        <TabButton
          active={tab === "projects"}
          onClick={() => setTab("projects")}
          label="🤝 Group Projects"
        />
        <TabButton
          active={tab === "calls"}
          onClick={() => setTab("calls")}
          label="🎥 Calls"
        />
      </div>
      <div className="cc-tabview">
        {tab === "chat" && (
          <ClassroomChat username={username} classCode={classroom.code} />
        )}
        {tab === "bulletin" && (
          <BulletinBoard username={username} classCode={classroom.code} />
        )}
        {tab === "notebook" && (
          <NotebookBoard username={username} classCode={classroom.code} />
        )}
        {tab === "projects" && (
          <GroupProjects username={username} classCode={classroom.code} />
        )}
        {tab === "calls" && (
          <CallsPanel username={username} classCode={classroom.code} />
        )}
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      className={
        "cc-class-tab-btn" +
        (active ? " cc-class-tab-btn-active" : "")
      }
      onClick={onClick}
      type="button"
      style={{
        color: NAVY,
        background: active ? "var(--main-secondary)" : "transparent"
      }}
    >
      {label}
    </button>
  );
}

// ========== PUBLIC CHAT ==========
function ClassroomChat({ username, classCode }) {
  // In prod: Use websockets. Here: localStorage simulation, scoped per classroom.
  const STORAGE_KEY = "CC_Chat_" + classCode;
  const [messages, setMessages] = useState(
    JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  );
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim().length === 0) return;
    const newMessage = {
      id: Date.now(),
      sender: username,
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    const updated = [...messages, newMessage].slice(-120); // cap history
    setMessages(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setInput("");
  };

  // Poll chat for updates (simulate live)
  useEffect(() => {
    const interval = setInterval(() => {
      const latest = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (JSON.stringify(latest) !== JSON.stringify(messages))
        setMessages(latest);
    }, 1050);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  return (
    <div className="cc-chat-wrap">
      <div className="cc-card cc-chat-card">
        <div className="cc-chat-history">
          {messages.length === 0 && (
            <div className="cc-chat-empty" style={{ color: NAVY }}>No messages yet. Start chatting!</div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={msg.id}
              className={
                "cc-chat-msg" +
                (msg.sender === username ? " cc-chat-own" : "")
              }
              style={msg.sender === username
                  ? { background: accent, color: "#fff" }
                  : { color: NAVY }}
            >
              <span className="cc-chat-sender" style={{ color: NAVY }}>
                {msg.sender}
              </span>
              <span className="cc-chat-text">{msg.text}</span>
              <span className="cc-chat-time" style={{ color: NAVY }}>{msg.time}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <form
          className="cc-chat-send"
          onSubmit={sendMessage}
          autoComplete="off"
        >
          <input
            className="cc-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            maxLength={240}
            style={{ flex: 1 }}
            autoFocus
          />
          <button className="cc-btn" style={{ marginLeft: 7 }} type="submit">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

// ========== BULLETIN BOARD ==========
function BulletinBoard({ username, classCode }) {
  const STORAGE_KEY = "CC_Bulletin_" + classCode;
  const [posts, setPosts] = useState(
    JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  );
  const [input, setInput] = useState("");
  const postRef = useRef();

  const addPost = (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    const newPosts = [
      ...posts,
      {
        id: Date.now(),
        author: username,
        text: input.trim(),
        time: new Date().toLocaleDateString() +
          " " +
          new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ].slice(-50);
    setPosts(newPosts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPosts));
    setInput("");
    postRef.current?.focus();
  };

  return (
    <div className="cc-bulletin-wrap">
      <div className="cc-card cc-bulletin-card">
        <div className="cc-bulletin-list">
          {posts.length === 0 ? (
            <div className="cc-bulletin-empty" style={{ color: NAVY }}>
              No announcements yet!
            </div>
          ) : (
            posts.slice().reverse().map((b) => (
              <div key={b.id} className="cc-bulletin-item" style={{ color: NAVY }}>
                <div className="cc-bulletin-meta" style={{ color: NAVY }}>
                  <span className="cc-bulletin-author" style={{ color: NAVY }}>{b.author}</span>
                  <span className="cc-bulletin-time" style={{ color: NAVY }}>
                    {b.time}
                  </span>
                </div>
                <div className="cc-bulletin-text">{b.text}</div>
              </div>
            ))
          )}
        </div>
        <form className="cc-bulletin-postform" onSubmit={addPost}>
          <input
            className="cc-input"
            ref={postRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Post a reminder or announcement"
            style={{ flex: 1 }}
            maxLength={160}
          />
          <button className="cc-btn" type="submit">
            Post
          </button>
        </form>
      </div>
    </div>
  );
}

// ========== NOTEBOOK ==========
function NotebookBoard({ username, classCode }) {
  const STORAGE_KEY = "CC_Notebook_" + classCode;
  const [notes, setNotes] = useState(
    JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  );
  const [subject, setSubject] = useState("");
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const addNote = (e) => {
    e.preventDefault();
    if (!subject) return;
    const reader = new FileReader();
    reader.onload = function (evt) {
      const url = evt.target.result;
      const newNote = {
        id: Date.now(),
        subject: subject,
        text: input.trim(),
        fileName: file ? file.name : null,
        fileUrl: file ? url : null,
        author: username,
        created: new Date().toLocaleString()
      };
      setNotes((prev) => [...prev, newNote].slice(-60));
      setSubject("");
      setInput("");
      setFile(null);
    };
    if (file) {
      reader.readAsDataURL(file);
    } else {
      reader.onload({ target: { result: null } });
    }
  };

  const subjects = [
    ...new Set(notes.map((n) => n.subject).concat(["Math", "Science", "English", "Other"]))
  ];

  return (
    <div className="cc-notebook-wrap">
      <div className="cc-card cc-notebook-card">
        <form className="cc-notebook-form" onSubmit={addNote}>
          <select
            className="cc-input"
            style={{ flex: 1, marginRight: 6 }}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          >
            <option value="">Subject</option>
            {subjects.map((s, i) => (
              <option value={s} key={i}>
                {s}
              </option>
            ))}
          </select>
          <input
            className="cc-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Note title or description"
            maxLength={60}
            required
            style={{ flex: 2, marginRight: 6 }}
          />
          <input
            className="cc-input"
            type="file"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ flex: 2, marginRight: 6, padding: 0 }}
          />
          <button className="cc-btn" type="submit">
            Upload
          </button>
        </form>
        <div className="cc-notebook-list">
          {notes.length === 0 && (
            <div className="cc-notebook-empty" style={{ color: NAVY }}>No notes yet! Upload one.</div>
          )}
          {notes
            .slice()
            .reverse()
            .map((n) => (
              <div key={n.id} className="cc-note-item" style={{ color: NAVY }}>
                <div>
                  <strong className="cc-note-subject" style={{ color: accent }}>{n.subject}</strong>
                  <span className="cc-note-author" style={{ color: NAVY }}> by {n.author}</span>
                  <span className="cc-note-date" style={{ color: NAVY }}>
                    {" "}
                    ({n.created.replace(",", "")})
                  </span>
                </div>
                <div className="cc-note-title">{n.text}</div>
                {n.fileName && (
                  <div>
                    <a
                      href={n.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="cc-btn cc-btn-small"
                      style={{ background: accent, color: "#fff" }}
                    >
                      📎 {n.fileName}
                    </a>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ========== GROUP PROJECTS ==========
function GroupProjects({ username, classCode }) {
  // In a real app this would be server sync! Here: localStorage sim.
  // Simple model: projects (can be many, each w/teams, tasks, progress)
  const STORAGE_KEY = "CC_Projects_" + classCode;
  const [projects, setProjects] = useState(
    JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  );
  const [newProjectName, setNewProjectName] = useState("");
  const [showNew, setShowNew] = useState(false);

  // For drag-drop reordering
  const [draggedTask, setDraggedTask] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  // ============ PROJECT ACTIONS ============
  const addProject = (e) => {
    e.preventDefault();
    if (newProjectName.length < 2) return;
    const newProj = {
      id: Date.now(),
      name: newProjectName,
      teams: [],
      tasks: [],
      progress: 0
    };
    setProjects((prev) => [...prev, newProj]);
    setNewProjectName("");
    setShowNew(false);
  };

  const addTeam = (projId, teamName) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projId
          ? {
              ...p,
              teams: [
                ...p.teams,
                { name: teamName, members: [username], leader: username }
              ]
            }
          : p
      )
    );
  };

  const joinTeam = (projId, teamIdx) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projId
          ? {
              ...p,
              teams: p.teams.map((t, idx) =>
                idx === teamIdx && !t.members.includes(username)
                  ? {
                      ...t,
                      members: [...t.members, username]
                    }
                  : t
              )
            }
          : p
      )
    );
  };

  const startRandomTeams = (projId, teamCount) => {
    // For demo: assign names from classCode-users-list simulation
    let classroomKey = "CC_Chat_" + classCode;
    let users = JSON.parse(localStorage.getItem(classroomKey) || "[]")
      .map((m) => m.sender);
    users = Array.from(new Set(users));
    if (!users.includes(username)) users.push(username);

    // Shuffle and divide
    let shuffled = users.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    let teams = Array.from({ length: Math.max(1, teamCount) }, () => []);
    shuffled.forEach((user, idx) => {
      teams[idx % teamCount].push(user);
    });
    let teamObjs = teams.map(
      (members, idx) => ({
        name: "Team " + (idx + 1),
        members: members,
        leader: members[0] || ""
      })
    );
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projId ? { ...p, teams: teamObjs } : p
      )
    );
  };

  const addTask = (projId, taskName) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projId
          ? {
              ...p,
              tasks: [
                ...p.tasks,
                {
                  id: Date.now() + Math.random(),
                  name: taskName,
                  completed: false,
                  assignee: "",
                  progress: 0
                }
              ]
            }
          : p
      )
    );
  };

  const assignTask = (projId, taskId, user) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projId
          ? {
              ...p,
              tasks: p.tasks.map((t) =>
                t.id === taskId
                  ? { ...t, assignee: user }
                  : t
              )
            }
          : p
      )
    );
  };

  const toggleTaskDone = (projId, taskId) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projId) return p;
        const updatedTasks = p.tasks.map((t) =>
          t.id === taskId
            ? { ...t, completed: !t.completed }
            : t
        );
        const prog =
          updatedTasks.filter((t) => t.completed).length /
          (updatedTasks.length || 1);
        return {
          ...p,
          tasks: updatedTasks,
          progress: Math.round(prog * 100)
        };
      })
    );
  };

  // Drag & drop (reorder tasks in UI, not strictly functional in localstorage sim)
  const handleDragStart = (task) => setDraggedTask(task);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (projId, targetTask) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projId) return p;
        const tasks = p.tasks.slice();
        const from = tasks.findIndex((t) => t.id === draggedTask.id);
        const to = tasks.findIndex((t) => t.id === targetTask.id);
        if (from === -1 || to === -1) return p;
        tasks.splice(from, 1);
        tasks.splice(to, 0, draggedTask);
        return { ...p, tasks };
      })
    );
    setDraggedTask(null);
  };

  // UI
  return (
    <div className="cc-projects-wrap">
      <div className="cc-card cc-projects-card">
        <div className="cc-projects-heading" style={{ color: NAVY }}>
          <span>Group Projects</span>
          <button
            className="cc-btn cc-btn-small"
            style={{
              background: showNew ? accent : secondary,
              color: "#194"
            }}
            onClick={() => setShowNew((v) => !v)}
          >
            {showNew ? "Cancel" : "➕ New Project"}
          </button>
        </div>
        {showNew && (
          <form
            className="cc-projects-form"
            onSubmit={addProject}
            style={{ marginBottom: 18 }}
          >
            <input
              className="cc-input"
              required
              maxLength={46}
              placeholder="Project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              style={{ marginRight: 8 }}
            />
            <button className="cc-btn" type="submit">
              Create
            </button>
          </form>
        )}
        <div className="cc-projects-list">
          {projects.length === 0 && (
            <div className="cc-empty-text" style={{ color: NAVY }}>
              No group projects yet. Start one!
            </div>
          )}
          {projects.map((p) => (
            <div key={p.id} className="cc-single-project">
              <div className="cc-proj-title" style={{ color: NAVY }}>
                <b>{p.name}</b>
              </div>
              {/* Teams */}
              <div className="cc-teams-bar">
                {p.teams.length === 0 ? (
                  <div style={{ color: NAVY, fontWeight: 500 }}>
                    No teams formed yet.
                    <button
                      className="cc-btn cc-btn-xsmall"
                      style={{ marginLeft: 10, background: pink, color: NAVY }}
                      onClick={() =>
                        startRandomTeams(p.id, 2)
                      }
                    >
                      Random Teams
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      gap: 14,
                      flexWrap: "wrap"
                    }}
                  >
                    {p.teams.map((t, i) => (
                      <div
                        key={i}
                        className="cc-team-card"
                        style={{
                          background: funPalette[i % funPalette.length],
                          borderRadius: 15,
                          padding: "5px 12px",
                          minWidth: 90,
                          color: NAVY
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>
                          {t.name}
                        </div>
                        <div className="cc-team-members" style={{ color: NAVY }}>
                          {t.members.map((m, midx) => (
                            <span key={midx}>
                              {m}
                              {m === t.leader && (
                                <span style={{ color: secondary, fontSize: 14 }}>
                                  {" "}
                                  👑
                                </span>
                              )}
                              {midx < t.members.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </div>
                        {!t.members.includes(username) && (
                          <button
                            className="cc-btn cc-btn-xsmall"
                            onClick={() => joinTeam(p.id, i)}
                            style={{ marginTop: 5, background: accent, color: "#fff" }}
                          >
                            Join Team
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Tasks / Progress */}
              <div className="cc-tasks-sec">
                <TasksSection
                  tasks={p.tasks}
                  project={p}
                  addTask={(name) => addTask(p.id, name)}
                  assignTask={(tid, u) => assignTask(p.id, tid, u)}
                  toggleTaskDone={(tid) => toggleTaskDone(p.id, tid)}
                  handleDragStart={handleDragStart}
                  handleDragOver={handleDragOver}
                  handleDrop={(t) => handleDrop(p.id, t)}
                  draggedTask={draggedTask}
                  users={p.teams.flatMap((t) => t.members)}
                />
                {/* Progress bar */}
                <div className="cc-progress-bar-wrap">
                  <div className="cc-progress-bar-label">
                    Overall Progress: {p.progress || 0}%
                  </div>
                  <div className="cc-progress-outer">
                    <div
                      className="cc-progress-inner"
                      style={{
                        width: (p.progress || 0) + "%",
                        background: accent
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function TasksSection({
  tasks,
  project,
  addTask,
  assignTask,
  toggleTaskDone,
  handleDragStart,
  handleDragOver,
  handleDrop,
  draggedTask,
  users = []
}) {
  const [taskName, setTaskName] = useState("");
  return (
    <div className="cc-tasks-wrap">
      <form
        className="cc-tasks-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (taskName.trim()) {
            addTask(taskName.trim());
            setTaskName("");
          }
        }}
      >
        <input
          className="cc-input"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="New task"
          maxLength={40}
          style={{ marginRight: 6 }}
        />
        <button className="cc-btn" type="submit">
          Add
        </button>
      </form>
      {tasks.length === 0 ? (
        <div className="cc-empty-text" style={{ marginTop: 16, color: NAVY }}>
          No tasks yet.
        </div>
      ) : (
        <ul className="cc-tasks-list" style={{ color: NAVY }}>
          {tasks.map((t) => (
            <li
              key={t.id}
              className={"cc-task-item" + (t.completed ? " cc-task-completed" : "")}
              draggable
              onDragStart={() => handleDragStart(t)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(t)}
              aria-label={`Task: ${t.name}`}
              style={{ color: NAVY }}
            >
              <input
                type="checkbox"
                checked={t.completed}
                onChange={() => toggleTaskDone(t.id)}
                style={{ marginRight: 8 }}
                aria-label={t.completed ? "Mark incomplete" : "Mark completed"}
              />
              <span>{t.name}</span>
              <div className="cc-task-right-group">
                <select
                  className="cc-task-assignee"
                  value={t.assignee}
                  onChange={(e) => assignTask(t.id, e.target.value)}
                  style={{ color: NAVY }}
                >
                  <option value="">Unassigned</option>
                  {users.map((u, i) => (
                    <option key={i} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                {t.assignee && (
                  <span className="cc-task-assignee-label" style={{ color: NAVY }}>
                    {t.assignee}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ========== CALLS (SIMULATED) ==========
function CallsPanel({ username, classCode }) {
  // For produce: Would use WebRTC. Here: Display simulated "calls" UI.
  const [activeTab, setActiveTab] = useState("start");
  const [callActive, setCallActive] = useState(false);
  // Share in localStorage fake "ongoing" call status
  const CALL_KEY = "CC_Call_" + classCode;

  useEffect(() => {
    const status = localStorage.getItem(CALL_KEY);
    setCallActive(status === "active");
    // eslint-disable-next-line
  }, []);

  const startCall = (type) => {
    setActiveTab(type);
    setCallActive(true);
    localStorage.setItem(CALL_KEY, "active");
  };

  const endCall = () => {
    setCallActive(false);
    localStorage.removeItem(CALL_KEY);
    setActiveTab("start");
  };

  return (
    <div className="cc-calls-wrap">
      <div className="cc-card cc-calls-card">
        {!callActive ? (
          <div className="cc-calls-chooser" style={{ color: NAVY }}>
            <h3 style={{ color: NAVY }}>Start a Call</h3>
            <div style={{ display: "flex", gap: 18, marginTop: 18 }}>
              <button
                className="cc-btn cc-btn-large"
                style={{ background: accent, color: "#fff" }}
                onClick={() => startCall("audio")}
              >
                🔊 Audio Call
              </button>
              <button
                className="cc-btn cc-btn-large"
                style={{ background: babyBlue, color: "#223" }}
                onClick={() => startCall("video")}
              >
                🎥 Video Call
              </button>
            </div>
            <div
              style={{
                color: NAVY,
                marginTop: 22,
                fontSize: "1rem",
                fontWeight: 500
              }}
            >
              (This is a simulation. Video/audio not recorded or transmitted.)
            </div>
          </div>
        ) : (
          <div className="cc-calls-ongoing">
            <h3 style={{ color: NAVY }}>
              {activeTab === "audio" ? "Audio" : "Video"} Call in Progress
            </h3>
            <div className="cc-calls-fakevideo">
              <div className="cc-calls-avatar">
                <span role="img" aria-label="avatar" style={{ fontSize: "3.5rem" }}>
                  🎧
                </span>
                <div style={{fontWeight:"700", fontSize:"1.25rem", marginTop:5, color: NAVY}}>
                  {username}
                </div>
                <div style={{fontSize:13, color:NAVY, marginTop:4}}>
                  {activeTab === "video"
                    ? "Camera simulation active"
                    : "Audio-only simulation"}
                </div>
              </div>
              <div style={{margin: "auto", marginTop: 24}}>
                <button
                  className="cc-btn cc-btn-large"
                  style={{
                    background: secondary,
                    color: NAVY
                  }}
                  onClick={endCall}
                >
                  ⏹ End Call
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ========== STYLES: CSS-IN-JS INJECTION ==========
const globalCSS = `
/* === Custom Styles for ClassroomConnect + Navy Text Override === */
body, .cc-main-bg, .cc-dashboard-wrap, .cc-classroom-header, .cc-classcard, .cc-card, .cc-btn, .cc-input, h1, h2, h3, h4, h5, h6, p, span, label, select, option, .cc-class-tab-btn, .cc-chat-msg, .cc-projects-heading, .cc-empty-text, .cc-bulletin-empty, .cc-notebook-empty, .cc-note-item, .cc-team-members {
  color: var(--navy, #001f4d) !important;
}

body, .cc-main-bg {
  background: var(--main-bg, #A7C7E7);
  min-height: 100vh;
  font-family: 'Quicksand', 'Inter', 'Roboto', sans-serif;
}

.cc-navbar {
  height: 60px;
  background: var(--main-bg, #A7C7E7);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  border-bottom: 2px solid #cae4fb;
  position: sticky;
  top: 0;
  z-index: 10;
  border-radius: 0 0 var(--large-radius, 30px) var(--large-radius, 30px)
}

.cc-logo {
  font-size: 1.6rem;
  font-weight: bold;
  color: #0b3a4b;
  display: flex;
  align-items: center;
  letter-spacing: 1.2px;
}
.cc-logo-img {
  font-size: 2.1rem;
  margin-right: 6px;
}
.cc-nav-right {
  display: flex;
  align-items: center;
  gap: 18px;
}
.cc-username {
  font-size: 1.0rem;
  font-weight: 600;
  color: #156083;
  background: #fff3;
  padding: 6px 15px;
  border-radius: 15px;
}
.cc-ucode {
  font-family: monospace;
  background: #06D6A0;
  color: #fff;
  padding: 5px 9px;
  border-radius: 11px;
  font-weight: 600;
  letter-spacing: 1.5px;
  margin-left: 5px;
}
.cc-ucode-label {
  font-size: 0.96rem;
  margin: 16px 0 4px 0;
  color: #185;
}
.cc-dash-bg {
  background: var(--main-bg, #A7C7E7);
  padding-top: 60px;
  min-height: 100vh;
}
.cc-hero {
  max-width: 430px;
  margin: 25px auto 0 auto;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-radius: var(--large-radius, 30px);
  background: #d9ecffad;
  box-shadow: 0 4px 18px 0 #b2caf713;
  text-align: center;
}

.cc-crumb-title {
  font-size: 1.4rem;
  font-weight: bold;
  color: #1874;
}
.cc-classcode {
  font-family: monospace;
  color: var(--main-accent, #06D6A0);
  padding: 3px 7px;
  border-radius: 7px;
  background: #dffd;
  margin-left: 12px;
}

.cc-card {
  background: #fafdff;
  border-radius: var(--card-radius, 18px);
  box-shadow: 0 2px 10px 2px #b8ccee36;
  padding: 26px 35px;
  margin-bottom: 32px;
  width: 100%;
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
}
.cc-register-card {
  margin-top: 110px;
  text-align: center;
  max-width: 390px;
}

.cc-input {
  border: 0px solid #b9cce7;
  background: #f7fbff;
  border-radius: 15px;
  padding: 12px 16px;
  font-size: 1.1rem;
  color: #15354a;
  min-width: 0;
  outline: 1.5px solid #dbeefe;
  outline-offset: 0;
  margin-bottom: 8px;
  transition: outline-color 0.2s;
}
.cc-input:focus {
  outline: 2.5px solid var(--main-accent, #06D6A0);
}
.cc-btn {
  background-color: var(--main-secondary, #FFD166);
  color: #204037;
  border: none;
  border-radius: var(--border-radius, 22px);
  padding: 10px 28px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.18s, color 0.14s;
  box-shadow: 0 1.5px 7px 0 #c5d9ee2a;
}
.cc-btn:hover, .cc-btn:focus {
  background: var(--main-accent, #06D6A0);
  color: #fff;
}
.cc-btn-large {
  font-size: 1.18rem;
  padding: 14px 34px;
  border-radius: var(--large-radius, 30px);
}
.cc-btn-small {
  padding: 5px 19px;
  font-size: 0.99rem;
  background: var(--main-secondary, #FFD166);
  border-radius: 16px;
  margin-left: 10px;
}
.cc-btn-xsmall { padding: 3px 9px; font-size: 0.98rem; border-radius: 12px;}
.cc-btn-naked {
  background: transparent !important;
  color: #0b657a !important;
  border: none;
  font-weight: 700;
  padding: 7px 13px;
}

.cc-dashboard-wrap {
  max-width: 860px;
  margin:30px auto;
  display: flex;
  flex-direction: column;
  min-height: 200px;
}
.cc-create-join {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: center;
}

.cc-classcards-grid {
  display: grid;
  gap: 26px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  margin-top: 10px;
}
.cc-classcard {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border: none;
  border-radius: var(--card-radius, 18px);
  box-shadow: 0 1px 8px #aec6d43c;
  height: 135px;
  min-width: 0;
  margin-bottom: 4px;
  transition: transform 0.1s, box-shadow 0.12s;
}
.cc-classcard:focus, .cc-classcard:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 6px 32px #a7c7e7bb;
}

.cc-classroom-bg, .cc-register-wrap {
  min-height: 100vh;
  background: var(--main-bg, #A7C7E7);
  padding-top: 70px;
}
.cc-classroom-header {
  display: flex;
  align-items: center;
  background: #fff8;
  padding: 21px 38px;
  gap: 18px;
  font-size: 1.28rem;
  border-radius: var(--large-radius, 30px);
  box-shadow: 0 2px 10px #b4CDD62d;
  margin: 12px auto 0 auto;
  max-width: 900px;
}
.cc-class-tabs-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 19px 0;
  gap: 7px;
  background: #c9e3f648;
  border-radius: var(--large-radius, 30px);
  width: 88vw;
  max-width: 850px;
  min-width: 0;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 0.7px 3px #bbdffd33;
  padding: 6px 3px;
}
.cc-class-tab-btn {
  background: none;
  border: none;
  color: #345;
  font-size: 1.08rem;
  font-weight: 700;
  border-radius: 16px;
  padding: 8px 22px;
  margin: 0 2px;
  transition: background 0.25s, color 0.16s;
  outline: 0px solid transparent;
  cursor: pointer;
}
.cc-class-tab-btn-active, .cc-class-tab-btn:focus, .cc-class-tab-btn:hover {
  background: var(--main-secondary, #FFD166);
  color: #0b3a4b;
}
.cc-tabview {
  max-width: 900px;
  margin: 0 auto;
  width: 98vw;
}

.cc-chat-wrap, .cc-bulletin-wrap, .cc-notebook-wrap, .cc-projects-wrap, .cc-calls-wrap {
  padding: 14px 0;
  width: 100%;
}
.cc-chat-card, .cc-bulletin-card, .cc-notebook-card, .cc-projects-card, .cc-calls-card {
  min-height: 350px;
  background: #fff;
  border-radius: var(--large-radius, 30px);
  padding: 30px 34px;
}
.cc-chat-history {
  height: 220px;
  overflow-y: auto;
  background: #eaf2ff59;
  border-radius: var(--large-radius, 30px);
  padding: 11px 17px 3px 13px;
  margin-bottom: 18px;
  box-shadow: 0 2px 12px #e1e8fc27;
}
.cc-chat-empty {
  color: #208cbb;
  padding-top: 30px;
  font-weight: 600;
}
.cc-chat-msg {
  padding: 6px 8px;
  margin: 6px 0;
  border-radius: 16px;
  background: #eaf2ff;
  color: #0b3a4b;
  font-size: 1rem;
  position: relative;
  display: flex;
  gap: 10px;
  align-items: baseline;
}
.cc-chat-own {
  background: var(--main-accent, #06D6A0);
  color: #fff;
  align-self: flex-end;
}
.cc-chat-sender {
  font-size: 0.95rem;
  font-weight: 700;
  min-width: 55px;
}

.cc-chat-text {
  flex-grow: 1;
}
.cc-chat-time {
  color: #338a72bb;
  font-size: 0.8rem;
  padding-left: 9px;
}
.cc-chat-send {
  display: flex;
  gap: 7px;
  align-items: center;
}
.cc-bulletin-list, .cc-notebook-list {
  margin-top: 10px;
  max-height: 220px;
  overflow-y: auto;
}
.cc-bulletin-empty, .cc-notebook-empty {
  color: #ccc;
  text-align: center;
  padding-top: 35px;
  font-weight: 500;
}
.cc-bulletin-item, .cc-note-item {
  background: #e5f2fa;
  border-radius: 16px;
  margin-bottom: 12px;
  padding: 11px 17px;
  color: #1e4763;
  box-shadow: 0 1px 4px #c1d6f726;
}
.cc-bulletin-meta {
  display: flex;
  font-size: 0.96rem;
  gap: 11px;
  color: #097f7c;
  font-weight: 600;
  margin-bottom: 2px;
}
.cc-bulletin-author {
  color: #097f7c;
  font-weight: 700;
}
.cc-bulletin-time {
  color: #1e4763cc;
  font-weight: 400;
}

.cc-bulletin-text {
  margin-top: 3px;
  font-size: 1.08rem;
}
.cc-bulletin-postform {
  display: flex;
  gap: 9px;
  margin-top: 18px;
}

.cc-notebook-form {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.cc-note-item {
  margin-bottom: 13px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.cc-note-subject {
  color: var(--main-accent, #06D6A0);
  font-weight: 700;
  margin-right: 6px;
}
.cc-note-title {
  font-size: 1.05rem;
  margin-top: 2px;
}
.cc-note-date {
  font-size: 0.93rem;
  color: #aecce5;
}
.cc-note-author {
  font-size: 0.98rem;
  color: #7a5;
  font-weight: 500;
}
.cc-btn[disabled], .cc-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cc-projects-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 1.17rem;
  font-weight: 700;
  gap: 32px;
}
.cc-projects-form {
  display: flex;
  align-items: center;
  gap: 7px;
}
.cc-projects-list {
  margin-top: 15px;
}
.cc-empty-text {
  color: #8bb;
  font-size: 1.08rem;
  text-align: center;
}

.cc-single-project {
  margin-bottom: 33px;
}
.cc-proj-title {
  font-size: 1.18rem;
  font-weight: 700;
  margin-bottom: 7px;
  margin-top: 7px;
  color: #277cb6;
}
.cc-teams-bar {
  margin-bottom: 11px;
  margin-top: 5px;
}
.cc-team-card {
  margin-right: 13px;
}
.cc-team-members {
  font-size: 0.99rem;
  font-weight: 500;
  color: #235b59;
}
.cc-tasks-sec {
  margin-top: 8px;
  border-radius: 19px;
  background: #eaf9ed;
  padding: 9px 13px 9px 14px;
}
.cc-tasks-wrap {
  margin-bottom: 10px;
}
.cc-tasks-form {
  display: flex;
  align-items: center;
  gap: 8px;
}
.cc-tasks-list {
  padding: 0;
  margin: 0;
  list-style: none;
}
.cc-task-item {
  display: flex;
  align-items: center;
  background: #ffffffcc;
  border-radius: 13px;
  margin: 8px 0;
  padding: 8px 11px;
  font-size: 1.04rem;
  border: 1px solid #cafbe0aa;
}
.cc-task-completed {
  text-decoration: line-through;
  background: #c8ffe5bb;
  color: #45a16e;
}
.cc-task-right-group {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 9px;
}
.cc-task-assignee {
  border: 1px solid #b5eee2;
  color: #098;
  background: #eafffa;
  border-radius: 8px;
  padding: 3px 8px;
}
.cc-progress-bar-wrap {
  margin: 9px 0 3px 0;
}
.cc-progress-bar-label {
  font-size: 1.03rem;
  font-weight: 700;
  margin-bottom: 3px;
  color: #1678b5;
}
.cc-progress-outer {
  width: 100%;
  height: 17px;
  background: #c2e3ff;
  border-radius: 10px;
  overflow: hidden;
}
.cc-progress-inner {
  height: 100%;
  background: var(--main-accent, #06D6A0);
  transition: width 0.5s;
}

.cc-calls-chooser {
  text-align: center;
  padding: 16px 0;
}
.cc-calls-fakevideo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}
.cc-calls-avatar {
  margin: 16px 0 0 0;
  background: #A7C7E7;
  border-radius: 100px;
  width: 120px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 3px 15px #aad8eb5d;
  font-size: 2.4rem;
}

@media (max-width: 670px) {
  .cc-navbar {
    padding: 0 8px;
    font-size: 1rem;
  }
  .cc-card {
    padding: 16px 12px;
    margin-bottom: 22px;
  }
  .cc-create-join {
    flex-direction: column !important;
    gap: 11px;
  }
  .cc-classroom-header {
    padding: 13px 8px;
    font-size: 1.04rem;
  }
  .cc-class-tabs-bar {
    font-size: 1rem;
    width: 99vw;
    min-width: 0;
    max-width: 98vw;
    padding: 3px;
  }
}

::-webkit-scrollbar {
  width: 7px;
  background: #edf7fa77;
  border-radius: 12px;
}
::-webkit-scrollbar-thumb {
  background: #93bedd;
  border-radius: 16px;
}
`;

// Inject CSS once on first load
if (!document.getElementById("cc-global-styles")) {
  const styleTag = document.createElement("style");
  styleTag.id = "cc-global-styles";
  styleTag.innerHTML = globalCSS;
  document.head.appendChild(styleTag);
}

export default App;
