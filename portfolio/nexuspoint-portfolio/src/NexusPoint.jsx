import React, { useState } from "react";
import {
  FaShieldAlt,
  FaUserShield,
  FaUserTie,
  FaUsersCog,
  FaCode,
  FaRobot,
  FaFileUpload,
  FaEye,
  FaTasks,
  FaProjectDiagram,
  FaLayerGroup,
  FaCheckCircle,
  FaClock,
  FaSync,
  FaArchive,
  FaChevronRight,
  FaLock,
  FaDatabase,
  FaServer,
  FaDesktop,
  FaRocket,
  FaExternalLinkAlt
} from "react-icons/fa";

export default function NexusPointPortfolio() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRole, setSelectedRole] = useState("MasterAdmin");

  const LIVE_PROJECT_URL = "https://nexuspointtt.netlify.app/";

  const roleData = {
    MasterAdmin: {
      title: "Master Admin",
      icon: <FaShieldAlt style={{ color: "#f87171", fontSize: "1.5rem" }} />,
      badge: "System Superuser",
      gradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(236, 72, 153, 0.05))",
      borderColor: "rgba(239, 68, 68, 0.4)",
      description:
        "Has complete control over the application, organization structure, and top-level administrative operations.",
      responsibilities: [
        "Full system access and global organization administration",
        "Manage top-level platform configurations and permissions",
        "Provision Admins and manage system-wide security settings",
        "Access to complete audit logs and project telemetry"
      ],
      accessLevel: "Level 5 - Unrestricted Access"
    },
    Admin: {
      title: "Admin",
      icon: <FaUserShield style={{ color: "#c084fc", fontSize: "1.5rem" }} />,
      badge: "Org Management",
      gradient: "linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(99, 102, 241, 0.05))",
      borderColor: "rgba(168, 85, 247, 0.4)",
      description:
        "Manages organization members, credentials, and oversees project manager assignments.",
      responsibilities: [
        "Create & manage Member credentials (Member ID + Password generation)",
        "Assign and update user roles (Project Manager, Team Owner, Developer)",
        "Oversee organization-wide projects, modules, and team assignments",
        "Monitor project health and archive completed milestones"
      ],
      accessLevel: "Level 4 - Organization Administrative Control"
    },
    ProjectManager: {
      title: "Project Manager",
      icon: <FaUserTie style={{ color: "#60a5fa", fontSize: "1.5rem" }} />,
      badge: "Project Owner",
      gradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(6, 182, 212, 0.05))",
      borderColor: "rgba(59, 130, 246, 0.4)",
      description:
        "Drives project execution by defining modules, creating projects, and assigning Team Owners.",
      responsibilities: [
        "Create projects and define functional project modules",
        "Assign Team Owners to specific modules and workflows",
        "Set project timelines, priorities, and module breakdowns",
        "Track task status across Todo, In-Progress, Review, and Complete"
      ],
      accessLevel: "Level 3 - Project & Module Control"
    },
    TeamOwner: {
      title: "Team Owner",
      icon: <FaUsersCog style={{ color: "#34d399", fontSize: "1.5rem" }} />,
      badge: "Team Lead",
      gradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(20, 184, 166, 0.05))",
      borderColor: "rgba(16, 185, 129, 0.4)",
      description:
        "Leads execution teams, breaks modules into actionable tasks, and manages developers.",
      responsibilities: [
        "Assign granular tasks to developers with priority levels",
        "Review task submissions (Review state → Complete state)",
        "Manage day-to-day team coordination and task status updates",
        "Ensure module completion deadlines are strictly met"
      ],
      accessLevel: "Level 2 - Task Delegation & Review Control"
    },
    Developer: {
      title: "Developer",
      icon: <FaCode style={{ color: "#facc15", fontSize: "1.5rem" }} />,
      badge: "Execution Specialist",
      gradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(234, 179, 8, 0.05))",
      borderColor: "rgba(245, 158, 11, 0.4)",
      description:
        "Executes assigned tasks, updates progress statuses, and collaborates with team members.",
      responsibilities: [
        "View assigned tasks categorized by project & module",
        "Update task statuses dynamically (Pending → In Progress → Under Review)",
        "Collaborate with Team Owners on task completion requirements",
        "Filter workspace tasks by status: Todo, In-Progress, Review, Complete"
      ],
      accessLevel: "Level 1 - Task Execution Access"
    }
  };

  return (
    <div style={styles.pageContainer}>
      <style>{styles.embeddedCSS}</style>

      {/* HEADER SECTION */}
      <header style={styles.header}>
        <div style={styles.badgeContainer}>
          <span >
          </span>
           <img src="icon3.png" width="50px"/>
           NexusPoint
        </div>

        <h1 style={styles.title}>Project Workflow & System Architecture</h1>

        <p style={styles.subtitle}>
          An interactive overview of{" "}
          <span style={styles.cyanText}>NexusPoint</span> — a role-based team
          collaboration platform built with MongoDB, Express.js, React, Node.js,
          and Socket.IO.
        </p>

        {/* GET STARTED CTA BUTTON */}
        <div style={{ marginTop: "24px", marginBottom: "32px" }}>
          <a
            href={LIVE_PROJECT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="np-btn-primary"
            style={styles.getStartedBtn}
          >
            <FaRocket style={{ fontSize: "1.1rem" }} />
            <span>Get Started / Launch Live App</span>
            <FaExternalLinkAlt style={{ fontSize: "0.85rem", opacity: 0.8 }} />
          </a>
        </div>

        {/* TAB NAVIGATION */}
        <div style={styles.tabNav}>
          {[
            { id: "overview", label: "Workflow & Hierarchy", icon: <FaProjectDiagram /> },
            { id: "roles", label: "Roles & Access", icon: <FaUserShield /> },
            { id: "tech", label: "Tech Architecture", icon: <FaServer /> },
            { id: "roadmap", label: "Future Scope", icon: <FaRobot /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tabBtn,
                ...(activeTab === tab.id ? styles.tabBtnActive : {})
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main style={styles.main}>
        {/* TAB 1: WORKFLOW & HIERARCHY */}
        {activeTab === "overview" && (
          <div className="np-fade-in" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>
                <FaLayerGroup style={{ color: "#06b6d4" }} /> Dynamic Entity Hierarchy
              </h2>
              <p style={styles.sectionDesc}>
                NexusPoint maintains strict data relational integrity across all levels of project organization.
              </p>

              <div style={styles.grid4}>
                {[
                  { step: "01", title: "Organization", desc: "Top-level workspace boundary containing all members, roles, and security policies." },
                  { step: "02", title: "Project", desc: "Created by PMs/Admins with start/end dates, team members, and high-level targets." },
                  { step: "03", title: "Module", desc: "Sub-division of a project assigned to a Team Owner (e.g., Auth, Dashboard, API)." },
                  { step: "04", title: "Task", desc: "Granular work unit assigned to Developers with dynamic status tracking." }
                ].map((item, idx) => (
                  <div key={idx} style={styles.stepCard} className="np-step-card">
                    <div style={styles.stepNum}>{item.step}</div>
                    <h3 style={styles.stepTitle}>{item.title}</h3>
                    <p style={styles.stepDesc}>{item.desc}</p>
                    {idx < 3 && (
                      <FaChevronRight className="np-chevron" style={styles.chevron} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>
                <FaTasks style={{ color: "#06b6d4" }} /> Active Task Lifecycle States
              </h2>
              <div style={styles.grid5}>
                {[
                  { title: "Pending / Todo", icon: <FaClock style={{ color: "#fbbf24" }} />, desc: "Newly assigned task waiting for developer pickup." },
                  { title: "In Progress", icon: <FaSync className="np-spin" style={{ color: "#60a5fa" }} />, desc: "Active development underway by assigned engineer." },
                  { title: "Under Review", icon: <FaEye style={{ color: "#c084fc" }} />, desc: "Submitted to Team Owner / PM for quality review." },
                  { title: "Completed", icon: <FaCheckCircle style={{ color: "#34d399" }} />, desc: "Approved and merged into module release." },
                  { title: "Archived", icon: <FaArchive style={{ color: "#64748b" }} />, desc: "Historical task preserved for operational metrics." }
                ].map((st, i) => (
                  <div key={i} style={styles.statusCard}>
                    <div style={styles.statusHeader}>
                      {st.icon}
                      <span>{st.title}</span>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0 }}>{st.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ROLES & RESPONSIBILITIES */}
        {activeTab === "roles" && (
          <div className="np-fade-in" style={styles.rolesContainer}>
            <div style={styles.roleSidebar}>
              <h3 style={styles.sidebarTitle}>Select User Role</h3>
              {Object.keys(roleData).map((roleKey) => {
                const role = roleData[roleKey];
                const isSelected = selectedRole === roleKey;
                return (
                  <button
                    key={roleKey}
                    onClick={() => setSelectedRole(roleKey)}
                    style={{
                      ...styles.roleSelectBtn,
                      ...(isSelected ? styles.roleSelectBtnActive : {})
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {role.icon}
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>{role.title}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{role.badge}</div>
                      </div>
                    </div>
                    <FaChevronRight style={{ fontSize: "0.75rem", color: isSelected ? "#06b6d4" : "#475569" }} />
                  </button>
                );
              })}
            </div>

            <div style={{ flex: 1 }}>
              {(() => {
                const activeRole = roleData[selectedRole];
                return (
                  <div
                    style={{
                      ...styles.roleDetailCard,
                      background: activeRole.gradient,
                      borderColor: activeRole.borderColor
                    }}
                  >
                    <div style={styles.roleHeader}>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={styles.roleIconBox}>{activeRole.icon}</div>
                        <div>
                          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", margin: 0 }}>
                            {activeRole.title}
                          </h2>
                          <span style={styles.roleAccessBadge}>{activeRole.accessLevel}</span>
                        </div>
                      </div>
                    </div>

                    <p style={styles.roleDesc}>{activeRole.description}</p>

                    <div style={styles.respBox}>
                      <h4 style={styles.respTitle}>Core Responsibilities & Capabilities</h4>
                      <ul style={styles.respList}>
                        {activeRole.responsibilities.map((res, i) => (
                          <li key={i} style={styles.respItem}>
                            <FaCheckCircle style={{ color: "#06b6d4", fontSize: "1rem", flexShrink: 0, marginTop: "2px" }} />
                            <span>{res}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* TAB 3: TECH ARCHITECTURE */}
        {activeTab === "tech" && (
          <div className="np-fade-in" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <div style={styles.grid3}>
              <div style={styles.card}>
                <div style={{ ...styles.techTitle, color: "#22d3ee" }}>
                  <FaDesktop /> Frontend Layer
                </div>
                <ul style={styles.techList}>
                  <li style={styles.techItem}><span style={{ ...styles.bullet, backgroundColor: "#22d3ee" }}></span> React.js (Single Page Application)</li>
                  <li style={styles.techItem}><span style={{ ...styles.bullet, backgroundColor: "#22d3ee" }}></span> CSS3 / Responsive Layouts</li>
                  <li style={styles.techItem}><span style={{ ...styles.bullet, backgroundColor: "#22d3ee" }}></span> Axios HTTP Client with Credentials</li>
                  <li style={styles.techItem}><span style={{ ...styles.bullet, backgroundColor: "#22d3ee" }}></span> React Icons & Dynamic Views</li>
                </ul>
              </div>

              <div style={styles.card}>
                <div style={{ ...styles.techTitle, color: "#c084fc" }}>
                  <FaServer /> Backend Layer
                </div>
                <ul style={styles.techList}>
                  <li style={styles.techItem}><span style={{ ...styles.bullet, backgroundColor: "#c084fc" }}></span> Node.js & Express.js REST APIs</li>
                  <li style={styles.techItem}><span style={{ ...styles.bullet, backgroundColor: "#c084fc" }}></span> JWT Authentication Middleware</li>
                  <li style={styles.techItem}><span style={{ ...styles.bullet, backgroundColor: "#c084fc" }}></span> Role-Based Authorization Guard</li>
                  <li style={styles.techItem}><span style={{ ...styles.bullet, backgroundColor: "#c084fc" }}></span> Socket.IO Real-time Messaging</li>
                </ul>
              </div>

              <div style={styles.card}>
                <div style={{ ...styles.techTitle, color: "#34d399" }}>
                  <FaDatabase /> Database Layer
                </div>
                <ul style={styles.techList}>
                  <li style={styles.techItem}><span style={{ ...styles.bullet, backgroundColor: "#34d399" }}></span> MongoDB Document Storage</li>
                  <li style={styles.techItem}><span style={{ ...styles.bullet, backgroundColor: "#34d399" }}></span> Mongoose ODM Schema Models</li>
                  <li style={styles.techItem}><span style={{ ...styles.bullet, backgroundColor: "#34d399" }}></span> Relational Population (`organizationId`)</li>
                  <li style={styles.techItem}><span style={{ ...styles.bullet, backgroundColor: "#34d399" }}></span> BCrypt Password Hashing</li>
                </ul>
              </div>
            </div>

            <div style={styles.securityBox}>
              <div style={styles.securityIconBox}>
                <FaLock style={{ color: "#06b6d4", fontSize: "1.75rem" }} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#fff", margin: "0 0 4px 0" }}>
                  Security & Authentication Standards
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>
                  NexusPoint enforces custom Member IDs with unique organization scope validation. Passwords are securely hashed before persisting to MongoDB, ensuring that role credentials cannot be compromised across tenant boundaries.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: FUTURE ROADMAP */}
        {activeTab === "roadmap" && (
          <div className="np-fade-in">
            <div style={styles.roadmapCard}>
              <h2 style={{ ...styles.sectionTitle, color: "#fff" }}>
                <FaRobot style={{ color: "#06b6d4" }} /> Next Evolution: NexusPoint AI & Client Suite
              </h2>
              <p style={{ ...styles.sectionDesc, marginBottom: "24px" }}>
                Upcoming major feature upgrades designed to transform NexusPoint into an all-in-one agency and client platform.
              </p>

              <div style={styles.grid3}>
                <div style={styles.upgCard}>
                  <div style={{ ...styles.upgIconBox, backgroundColor: "rgba(6, 182, 212, 0.2)", color: "#22d3ee" }}>
                    <FaEye />
                  </div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>Client Progress Monitor Role</h3>
                  <p style={{ fontSize: "0.75rem", color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>
                    Dedicated read-only Client portal allowing external stakeholders to view project completion meters, module progress, and task statuses without technical write privileges.
                  </p>
                </div>

                <div style={styles.upgCard}>
                  <div style={{ ...styles.upgIconBox, backgroundColor: "rgba(168, 85, 247, 0.2)", color: "#c084fc" }}>
                    <FaRobot />
                  </div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>Embedded AI Assistant</h3>
                  <p style={{ fontSize: "0.75rem", color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>
                    Context-aware AI helper for automatically summarizing long chat streams, generating initial module task breakdowns, and answering codebase documentation queries.
                  </p>
                </div>

                <div style={styles.upgCard}>
                  <div style={{ ...styles.upgIconBox, backgroundColor: "rgba(16, 185, 129, 0.2)", color: "#34d399" }}>
                    <FaFileUpload />
                  </div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>Rich Asset & File Stream</h3>
                  <p style={{ fontSize: "0.75rem", color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>
                    Direct uploading and previewing of PDFs, images, code snippets, and wireframe documents directly linked inside Socket.IO project channels.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer style={styles.footer}>
        NexusPoint Platform Architecture • Full Stack Technical Portfolio Documentation
      </footer>
    </div>
  );
}

// Inline CSS Styles Object
const styles = {
  pageContainer: {
    minHeight: "100vh",
    backgroundColor: "#020617",
    color: "#f1f5f9",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    padding: "24px 16px 48px 16px"
  },
  header: {
    maxWidth: "1280px",
    margin: "0 auto 40px auto",
    textAlign: "center"
  },
  badgeContainer: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    padding: "6px 16px",
    borderRadius: "9999px",
    // backgroundColor: "rgba(6, 182, 212, 0.1)",
    border: "1px solid rgba(6, 182, 212, 0.3)",
    color: "#22d3ee",
    fontSize: "0.875rem",
    fontWeight: 600,
    marginBottom: "16px"
  },
  pingDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#22d3ee"
  },
  title: {
    fontSize: "clamp(2rem, 5vw, 3.5rem)",
    fontWeight: 400,
    letterSpacing: "-0.025em",
    color: "#ffffff",
    margin: "0 0 16px 0"
  },
  subtitle: {
    maxWidth: "768px",
    margin: "0 auto",
    color: "#94a3b8",
    fontSize: "1.125rem",
    lineHeight: 1.6
  },
  cyanText: {
    color: "#22d3ee",
    fontWeight: 600
  },
  getStartedBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 28px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #0891b2 0%, #0284c7 100%)",
    color: "#ffffff",
    fontSize: "1rem",
    fontWeight: 700,
    textDecoration: "none",
    boxShadow: "0 10px 25px -5px rgba(6, 182, 212, 0.4)",
    transition: "all 0.25s ease",
    cursor: "pointer"
  },
  tabNav: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "8px",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    padding: "6px",
    borderRadius: "14px",
    border: "1px solid #1e293b",
    maxWidth: "640px",
    margin: "0 auto"
  },
  tabBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    borderRadius: "10px",
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#94a3b8",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  tabBtnActive: {
    backgroundColor: "#0891b2",
    color: "#ffffff",
    boxShadow: "0 4px 14px rgba(8, 145, 178, 0.4)"
  },
  main: {
    maxWidth: "1280px",
    margin: "0 auto"
  },
  card: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "24px",
    backdropFilter: "blur(12px)"
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#ffffff",
    margin: "0 0 8px 0",
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  sectionDesc: {
    color: "#94a3b8",
    fontSize: "0.875rem",
    margin: "0 0 24px 0"
  },
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    position: "relative"
  },
  grid5: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px"
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "24px"
  },
  stepCard: {
    backgroundColor: "rgba(2, 6, 23, 0.8)",
    border: "1px solid #1e293b",
    padding: "20px",
    borderRadius: "12px",
    position: "relative"
  },
  stepNum: {
    fontSize: "1.75rem",
    fontWeight: 900,
    color: "rgba(6, 182, 212, 0.25)",
    marginBottom: "8px"
  },
  stepTitle: {
    fontSize: "1.125rem",
    fontWeight: 700,
    color: "#f1f5f9",
    margin: "0 0 6px 0"
  },
  stepDesc: {
    fontSize: "0.75rem",
    color: "#94a3b8",
    margin: 0,
    lineHeight: 1.5
  },
  chevron: {
    position: "absolute",
    right: "-12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#334155"
  },
  statusCard: {
    backgroundColor: "rgba(2, 6, 23, 0.6)",
    border: "1px solid rgba(30, 41, 59, 0.8)",
    padding: "16px",
    borderRadius: "12px"
  },
  statusHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: 600,
    fontSize: "0.875rem",
    marginBottom: "6px"
  },
  rolesContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: "24px"
  },
  roleSidebar: {
    width: "300px",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  sidebarTitle: {
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#94a3b8",
    fontWeight: 700,
    padding: "0 8px",
    margin: "0 0 8px 0"
  },
  roleSelectBtn: {
    width: "100%",
    textAlign: "left",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #1e293b",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  roleSelectBtnActive: {
    backgroundColor: "#1e293b",
    borderColor: "#06b6d4",
    color: "#ffffff"
  },
  roleDetailCard: {
    border: "1px solid",
    padding: "32px",
    borderRadius: "16px",
    backdropFilter: "blur(12px)",
    height: "100%",
    boxSizing: "border-box"
  },
  roleHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px"
  },
  roleIconBox: {
    padding: "12px",
    borderRadius: "12px",
    backgroundColor: "rgba(2, 6, 23, 0.8)",
    border: "1px solid #1e293b"
  },
  roleAccessBadge: {
    display: "inline-block",
    marginTop: "6px",
    fontSize: "0.75rem",
    fontWeight: 600,
    padding: "2px 10px",
    borderRadius: "9999px",
    backgroundColor: "rgba(6, 182, 212, 0.2)",
    color: "#67e8f9",
    border: "1px solid rgba(6, 182, 212, 0.3)"
  },
  roleDesc: {
    color: "#cbd5e1",
    fontSize: "1rem",
    lineHeight: 1.6,
    marginBottom: "24px"
  },
  respBox: {
    backgroundColor: "rgba(2, 6, 23, 0.7)",
    border: "1px solid rgba(30, 41, 59, 0.8)",
    borderRadius: "12px",
    padding: "20px"
  },
  respTitle: {
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#94a3b8",
    fontWeight: 700,
    margin: "0 0 16px 0"
  },
  respList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  respItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    fontSize: "0.875rem",
    color: "#e2e8f0"
  },
  techTitle: {
    fontSize: "1.25rem",
    fontWeight: 700,
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  techList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  techItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "0.875rem",
    color: "#cbd5e1"
  },
  bullet: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    display: "inline-block"
  },
  securityBox: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    alignItems: "center",
    gap: "24px"
  },
  securityIconBox: {
    padding: "16px",
    borderRadius: "16px",
    backgroundColor: "rgba(6, 182, 212, 0.1)",
    border: "1px solid rgba(6, 182, 212, 0.3)",
    flexShrink: 0
  },
  roadmapCard: {
    background: "linear-gradient(135deg, rgba(8, 47, 73, 0.4), rgba(15, 23, 42, 1), rgba(88, 28, 135, 0.4))",
    border: "1px solid rgba(6, 182, 212, 0.3)",
    borderRadius: "16px",
    padding: "32px"
  },
  upgCard: {
    backgroundColor: "rgba(2, 6, 23, 0.8)",
    border: "1px solid #1e293b",
    padding: "20px",
    borderRadius: "12px"
  },
  upgIconBox: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.25rem",
    marginBottom: "16px"
  },
  footer: {
    maxWidth: "1280px",
    margin: "64px auto 0 auto",
    paddingTop: "32px",
    borderTop: "1px solid #1e293b",
    textAlign: "center",
    fontSize: "0.75rem",
    color: "#64748b"
  },
  embeddedCSS: `
    .np-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 14px 30px -4px rgba(6, 182, 212, 0.6) !important;
    }
    .np-fade-in {
      animation: npFadeIn 0.3s ease-in-out;
    }
    @keyframes npFadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .np-spin {
      animation: npSpin 2s linear infinite;
    }
    @keyframes npSpin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @media (max-width: 768px) {
      .np-chevron { display: none !important; }
    }
  `
};