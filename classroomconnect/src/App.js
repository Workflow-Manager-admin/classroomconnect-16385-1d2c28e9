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
const babyBlue = "#7393B3"; // UPDATED PRIMARY BLUE
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
  "--text-secondary": "#406495",
  "--primary-blue": babyBlue,
  "--primary-blue-dark": "#4a6485"
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
    true
  );
  const [selectedClassroom, setSelectedClassroom] = useState(null);

  // Create-Classroom Modal state
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);

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
          joinedAt: Date.now(),
          members: []
        }
      ]);
      setDashboardView(false);
      setSelectedClassroom(code);
    }
  };

  // Show modal to create classroom
  const launchCreateClassroom = () => setShowCreateClassModal(true);

  // Handle Create Classroom with Modal
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
      members: membersList
    };
    setClassrooms((prev) => [...prev, newClass]);
    setDashboardView(false);
    setSelectedClassroom(newCode);
    setShowCreateClassModal(false);
  };

  // Old "onCreate" kept for form compatibility
  const handleCreateClassroom = () => {
    setShowCreateClassModal(true);
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

  // Update classroom on members change (used by GroupProjects modal logic)
  const updateClassroomMembers = (code, newMembers) => {
    setClassrooms((prev) =>
      prev.map((c) =>
        c.code === code ? { ...c, members: newMembers } : c
      )
    );
  };

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

  return (
    <div className="cc-main-bg app-expanded-bg">
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
      <main className="cc-main-container-expanded">
        {dashboardView ? (
          <>
            <Dashboard
              classrooms={classrooms}
              onCreate={launchCreateClassroom}
              onJoin={handleJoinClassroom}
              openClassroom={openClassroom}
              funPalette={funPalette}
            />
            {showCreateClassModal &&
              <CreateClassroomModal
                onSubmit={handleCreateClassroomWithInfo}
                onClose={() => setShowCreateClassModal(false)}
              />
            }
          </>
        ) : (
          <ClassroomPanel
            classroom={
              classrooms.find((c) => c.code === selectedClassroom) || {}
            }
            username={username}
            userCode={userCode}
            leaveClassroom={leaveClassroom}
            updateClassroomMembers={updateClassroomMembers}
            funPalette={funPalette}
          />
        )}
      </main>
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

// --- Modal: Create Classroom ---
function CreateClassroomModal({ onSubmit, onClose }) {
  const [name, setName] = useState("");
  const [numMembers, setNumMembers] = useState(5);

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(115,147,179,0.12)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 9999
    }}>
      <div className="cc-card" style={{
        minWidth: 320, maxWidth: 370, background: "#fff", color: NAVY, position: "relative"
      }}>
        <button type="button"
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16, background: "transparent",
            color: NAVY, fontSize: 22, border: "none", fontWeight: 600, cursor: "pointer"
          }}
          aria-label="Close create classroom modal"
        >✖</button>
        <h2 style={{ color: NAVY, margin: 0, marginBottom: 15 }}>Create a Classroom</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (!name || +numMembers < 1) return;
            onSubmit(name, +numMembers);
          }}
        >
          <label style={{ color: NAVY, fontWeight: 500 }}>Classroom Name</label>
          <input
            className="cc-input"
            required
            maxLength={36}
            placeholder="Cool Classroom Name"
            style={{ width: "95%", marginBottom: 17 }}
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
          <label style={{ color: NAVY, fontWeight: 500 }}>Number of Members</label>
          <input
            className="cc-input"
            type="number"
            required
            min={1}
            max={99}
            style={{ width: 90, marginBottom: 14 }}
            value={numMembers}
            onChange={(e) => setNumMembers(e.target.value.replace(/\D,""))}
          />
          <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
            <button
              className="cc-btn cc-btn-large"
              style={{ background: babyBlue, color: NAVY, flex:1 }}
              type="submit"
            >
              Create
            </button>
            <button
              className="cc-btn cc-btn-large"
              style={{ background: pink, color: NAVY, flex:1 }}
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

// ========== DASHBOARD ==========
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
        <div className="cc-main-cta-center">
          <button
            className="cc-btn cc-btn-large cc-main-big-btn"
            type="button"
            onClick={onCreate}
          >
            <span role="img" aria-label="add" style={{ marginRight: 10, fontSize: '1.2em' }}>➕</span>
            Create
          </button>
          <form
            onSubmit={handleJoin}
            className="cc-main-cta-join-form"
            autoComplete="off"
            style={{width:'100%'}}
          >
            <input
              className="cc-input cc-main-big-input"
              placeholder="Enter Code"
              maxLength={6}
              minLength={6}
              required
              style={{ textAlign: "center" }}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.replace(/[^\d]/g, ""))}
            />
            <button
              className="cc-btn cc-btn-large cc-main-big-btn"
              style={{ marginTop: '4px' }}
              type="submit"
            >
              <span role="img" aria-label="join" style={{ marginRight: 10, fontSize: '1.08em' }}>🚪</span>
              Join
            </button>
          </form>
        </div>
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

// ========== CLASSROOM PANEL ==========
function ClassroomPanel({
  classroom,
  username,
  userCode,
  leaveClassroom,
  updateClassroomMembers,
  funPalette
}) {
  const [tab, setTab] = useState("chat");
  return (
    <div className="cc-classroom-bg">
      <div className="cc-classroom-header">
        {/* Exit classroom button */}
        <button
          className="cc-btn cc-btn-large"
          onClick={leaveClassroom}
          style={{
            color: NAVY,
            background: secondary,
            marginRight: 10
          }}
        >
          ⬅ Exit Classroom
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
          <GroupProjects
            username={username}
            classCode={classroom.code}
            classroom={classroom}
            updateClassroomMembers={updateClassroomMembers}
            funPalette={funPalette}
          />
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

// ========== GROUP PROJECTS ==========
function GroupProjects({
  username,
  classCode,
  classroom,
  updateClassroomMembers,
  funPalette
}) {
  const STORAGE_KEY = "CC_Projects_" + classCode;
  const [projects, setProjects] = useState(
    JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  );
  const [showNew, setShowNew] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newProjectDetails, setNewProjectDetails] = useState({
    projectName: "",
    step: 1,
    teamType: "",
    manualSelected: [],
    randomSize: 2
  });

  const [draggedTask, setDraggedTask] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const launchNewProjectModal = () => {
    setShowGroupModal(true);
    setNewProjectDetails({
      projectName: "",
      step: 1,
      teamType: "",
      manualSelected: [],
      randomSize: 2
    });
  };

  const completeNewProject = (projectName, teams) => {
    const newProj = {
      id: Date.now(),
      name: projectName,
      teams,
      tasks: [],
      progress: 0
    };
    setProjects((prev) => [...prev, newProj]);
    setShowGroupModal(false);
    setNewProjectDetails({
      projectName: "",
      step: 1,
      teamType: "",
      manualSelected: [],
      randomSize: 2
    });
  };

  const processTeamCreationFlow = {
    onContinueName: (name) => setNewProjectDetails((prev) => ({ ...prev, step: 2, projectName: name.trim() })),
    onSelectType: (type) => setNewProjectDetails((prev) => ({ ...prev, teamType: type, step: 3 })),
    onManualSelect: (selected) => setNewProjectDetails((prev) => ({ ...prev, manualSelected: selected })),
    onRandomSize: (size) => setNewProjectDetails((prev) => ({ ...prev, randomSize: size }))
  };

  let classroomMembers = [];
  if (classroom && classroom.members && classroom.members.length > 0) {
    classroomMembers = [...new Set([...classroom.members, username])];
  } else {
    let classroomKey = "CC_Chat_" + classCode;
    classroomMembers = JSON.parse(localStorage.getItem(classroomKey) || "[]")
      .map((m) => m.sender)
      .filter(Boolean);
    if (!classroomMembers.includes(username))
      classroomMembers.push(username);
    classroomMembers = Array.from(new Set(classroomMembers));
  }
  if (!classroomMembers.includes(username))
    classroomMembers.push(username);

  useEffect(() => {
    if (updateClassroomMembers && classroom && classroom.code) {
      updateClassroomMembers(classroom.code, classroomMembers);
    }
  }, []); // only run once

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

  return (
    <div className="cc-projects-wrap">
      <div className="cc-card cc-projects-card">
        <div className="cc-projects-heading" style={{ color: NAVY }}>
          <span>Group Projects</span>
          <button
            className="cc-btn cc-btn-small"
            style={{
              background: showGroupModal ? accent : secondary,
              color: "#194"
            }}
            onClick={launchNewProjectModal}
          >
            {showGroupModal ? "Cancel" : "➕ New Project"}
          </button>
        </div>
        {showGroupModal && (
          <ProjectTeamModal
            details={newProjectDetails}
            setDetails={setNewProjectDetails}
            onClose={() => setShowGroupModal(false)}
            classroomMembers={classroomMembers}
            funPalette={funPalette}
            onComplete={completeNewProject}
            processTeamCreationFlow={processTeamCreationFlow}
            username={username}
          />
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
              <div className="cc-teams-bar">
                {p.teams.length === 0 ? (
                  <div style={{ color: NAVY, fontWeight: 500 }}>
                    No teams formed yet.
                    <button
                      className="cc-btn cc-btn-xsmall"
                      style={{ marginLeft: 10, background: pink, color: NAVY }}
                      onClick={() =>
                        setProjects(prev =>
                          prev.map(x =>
                            x.id === p.id
                              ? {
                                  ...x,
                                  teams: makeRandomTeams(classroomMembers, 2)
                                }
                              : x
                          )
                        )
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
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

function ProjectTeamModal({
  details,
  setDetails,
  onClose,
  classroomMembers,
  onComplete,
  funPalette,
  processTeamCreationFlow,
  username
}) {
  // All hooks at top, never after any return
  const [manualSelected, setManualSelected] = React.useState(() => {
    if (details.teamType === "manual" && username && Array.isArray(details.manualSelected)) {
      return details.manualSelected.includes(username)
        ? details.manualSelected
        : [username, ...details.manualSelected];
    }
    return details.manualSelected || [];
  });

  React.useEffect(() => {
    if (
      details.teamType === "manual" &&
      username &&
      !manualSelected.includes(username)
    ) {
      setManualSelected(prev => [username, ...prev]);
    }
    // eslint-disable-next-line
  }, [details.teamType, username]);

  // UI rendering (AFTER hooks)
  if (details.step === 1) {
    return (
      <div style={{
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
        background: "rgba(115,147,179,.13)", display: "flex",
        alignItems: "center", justifyContent: "center", zIndex: 9999
      }}>
        <div className="cc-card" style={{
          minWidth: 320, maxWidth: 370, background: "#fff", color: NAVY, position: "relative"
        }}>
          <button type="button"
            onClick={onClose}
            style={{
              position: "absolute", top: 16, right: 16, background: "transparent",
              color: NAVY, fontSize: 22, border: "none", fontWeight: 600, cursor: "pointer"
            }}
            aria-label="Close project create modal"
          >✖</button>
          <h2 style={{ color: NAVY, marginBottom: 11 }}>New Group Project</h2>
          <form
            onSubmit={e => {
              e.preventDefault();
              if ((details.projectName || "").length < 2) return;
              processTeamCreationFlow.onContinueName(details.projectName);
            }}
          >
            <label style={{ fontWeight: 500, color: NAVY }}>Project Name</label>
            <input
              className="cc-input"
              required
              maxLength={46}
              placeholder="Project name"
              value={details.projectName}
              onChange={e =>
                setDetails(prev => ({ ...prev, projectName: e.target.value }))
              }
              style={{ marginBottom: 18, width: "96%" }}
              autoFocus
            />
            <div style={{display: "flex", gap: 16, marginTop: 6, justifyContent:"flex-end"}}>
              <button
                className="cc-btn cc-btn-large"
                style={{ background: accent, color: "#fff" }}
                type="submit"
              >Next</button>
              <button
                className="cc-btn cc-btn-large"
                style={{ background: pink, color: NAVY }}
                type="button" onClick={onClose}
              >Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  if (details.step === 2) {
    return (
      <div style={{
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
        background: "rgba(115,147,179,.08)", display: "flex",
        alignItems: "center", justifyContent: "center", zIndex: 9999
      }}>
        <div className="cc-card" style={{
          minWidth: 320, maxWidth: 370, background: "#fff", color: NAVY, position: "relative"
        }}>
          <button type="button"
            onClick={onClose}
            style={{
              position: "absolute", top: 16, right: 16, background: "transparent",
              color: NAVY, fontSize: 22, border: "none", fontWeight: 600, cursor: "pointer"
            }}
            aria-label="Close project create modal"
          >✖</button>
          <h2 style={{ color: NAVY, marginBottom: 5 }}>Team Formation</h2>
          <div>
            <button
              className="cc-btn cc-btn-large"
              style={{
                background: babyBlue,
                color: NAVY,
                width: "100%",
                marginBottom: 16
              }}
              type="button"
              onClick={() => processTeamCreationFlow.onSelectType("manual")}
            >Manual Selection</button>
            <button
              className="cc-btn cc-btn-large"
              style={{
                background: accent,
                color: "#fff",
                width: "100%"
              }}
              type="button"
              onClick={() => processTeamCreationFlow.onSelectType("random")}
            >Random Assignment</button>
          </div>
        </div>
      </div>
    );
  }
  if (details.teamType === "manual" && details.step === 3) {
    return (
      <div style={{
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
        background: "rgba(174,191,212,0.09)", display: "flex",
        alignItems: "center", justifyContent: "center", zIndex: 9999
      }}>
        <div className="cc-card" style={{
          minWidth: 320, maxWidth: 420, background: "#fff", color: NAVY, position: "relative"
        }}>
          <button type="button"
            onClick={onClose}
            style={{
              position: "absolute", top: 16, right: 16, background: "transparent",
              color: NAVY, fontSize: 22, border: "none", fontWeight: 600, cursor: "pointer"
            }}
            aria-label="Close group modal"
          >✖</button>
          <h2 style={{ color: NAVY, marginBottom: 5 }}>Manual Team Selection</h2>
          <form
            onSubmit={e => {
              e.preventDefault();
              if (manualSelected.length < 1) return;
              const teamObj = [{
                name: "Team 1",
                members: manualSelected,
                leader: manualSelected[0]
              }];
              onComplete(details.projectName, teamObj);
            }}
          >
            <div
              style={{
                display: "flex", flexDirection: "column",
                gap: 6, marginBottom: 19, marginTop: 10
              }}
            >
              {classroomMembers.map((m, idx) => (
                <label key={idx} style={{ color: NAVY }}>
                  <input
                    type="checkbox"
                    checked={manualSelected.includes(m)}
                    onChange={e => {
                      setManualSelected(prev => {
                        if (e.target.checked)
                          return [...prev, m];
                        else
                          return prev.filter(x => x !== m);
                      });
                    }}
                    disabled={username === m}
                  />
                  <span style={{
                    marginLeft: 8,
                    fontWeight: username === m ? 700 : 500,
                    color: username === m ? accent : NAVY
                  }}>
                    {m}
                    {username === m ? " (You)" : ""}
                  </span>
                </label>
              ))}
            </div>
            <div style={{display: "flex", gap: 16, marginTop: 6, justifyContent:"flex-end"}}>
              <button
                className="cc-btn cc-btn-large"
                style={{ background: accent, color: "#fff" }}
                type="submit"
                disabled={manualSelected.length < 1}
              >Create Project</button>
              <button
                className="cc-btn cc-btn-large"
                style={{ background: pink, color: NAVY }}
                type="button" onClick={onClose}
              >Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  if (details.teamType === "random" && details.step === 3) {
    return (
      <div style={{
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
        background: "rgba(174,191,212,0.09)", display: "flex",
        alignItems: "center", justifyContent: "center", zIndex: 9999
      }}>
        <div className="cc-card" style={{
          minWidth: 320, maxWidth: 420, background: "#fff", color: NAVY, position: "relative"
        }}>
          <button type="button"
            onClick={onClose}
            style={{
              position: "absolute", top: 16, right: 16, background: "transparent",
              color: NAVY, fontSize: 22, border: "none", fontWeight: 600, cursor: "pointer"
            }}
            aria-label="Close group modal"
          >✖</button>
          <h2 style={{ color: NAVY, marginBottom: 5 }}>Random Team Assignment</h2>
          <form
            onSubmit={e => {
              e.preventDefault();
              const teamSize = +details.randomSize;
              if (teamSize < 1 || teamSize > classroomMembers.length) return;
              let shuffled = classroomMembers.slice();
              for (let i = shuffled.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
              }
              let teams = [];
              for (let i = 0; i < shuffled.length; i += teamSize) {
                teams.push(shuffled.slice(i, i + teamSize));
              }
              const teamObjs = teams.map((members, idx) => ({
                name: "Team " + (idx + 1),
                members,
                leader: members[0] || ""
              }));
              onComplete(details.projectName, teamObjs);
            }}
          >
            <label style={{ color: NAVY, fontWeight: 500 }}>
              Team size (members per team)
            </label>
            <input
              className="cc-input"
              type="number"
              required
              min={1}
              max={classroomMembers.length}
              value={details.randomSize}
              style={{ width: 90, marginBottom: 14, marginTop: 4 }}
              onChange={e => processTeamCreationFlow.onRandomSize(+e.target.value)}
            />
            <div style={{ color: NAVY, fontWeight: 400, fontSize: 13 }}>
              {classroomMembers.length} total members.
            </div>
            <div style={{display: "flex", gap: 16, marginTop: 15, justifyContent:"flex-end"}}>
              <button
                className="cc-btn cc-btn-large"
                style={{ background: accent, color: "#fff" }}
                type="submit"
              >Create Project</button>
              <button
                className="cc-btn cc-btn-large"
                style={{ background: pink, color: NAVY }}
                type="button" onClick={onClose}
              >Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  return null;
}

// Helper for random teams
function makeRandomTeams(members, teamCount) {
  if (!Array.isArray(members) || members.length < 1) return [];
  let shuffled = members.slice();
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
  return teamObjs;
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

// ========== (KEEP THE REMAINING PANELS/COMPONENTS UNCHANGED) ==========

function ClassroomChat({ username, classCode }) {
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
    const updated = [...messages, newMessage].slice(-120);
    setMessages(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setInput("");
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const latest = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (JSON.stringify(latest) !== JSON.stringify(messages))
        setMessages(latest);
    }, 1050);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line

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

function NotebookBoard({ username, classCode }) {
  const STORAGE_KEY = "CC_Notebook_" + classCode;
  const [notes, setNotes] = useState(
    JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  );
  const [subject, setSubject] = useState("");
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);

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

function CallsPanel({ username, classCode }) {
  const [activeTab, setActiveTab] = useState("start");
  const [callActive, setCallActive] = useState(false);
  const CALL_KEY = "CC_Call_" + classCode;

  useEffect(() => {
    const status = localStorage.getItem(CALL_KEY);
    setCallActive(status === "active");
  }, []); // eslint-disable-line

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

// ========== STYLES (unchanged injection) ==========
const globalCSS = `
body, .cc-main-bg, .cc-dashboard-wrap, .cc-classroom-header, .cc-classcard, .cc-card, .cc-btn, .cc-input, h1, h2, h3, h4, h5, h6, p, span, label, select, option, .cc-class-tab-btn, .cc-chat-msg, .cc-projects-heading, .cc-empty-text, .cc-bulletin-empty, .cc-notebook-empty, .cc-note-item, .cc-team-members {
  color: var(--navy, #001f4d) !important;
}
body, .cc-main-bg {
  background: var(--main-bg, #7393B3);
  min-height: 100vh;
  font-family: 'Quicksand', 'Inter', 'Roboto', sans-serif;
}
/* ...truncated... all other injected CSS present in original file... */
`;

if (!document.getElementById("cc-global-styles")) {
  const styleTag = document.createElement("style");
  styleTag.id = "cc-global-styles";
  styleTag.innerHTML = globalCSS;
  document.head.appendChild(styleTag);
}

export default App;
