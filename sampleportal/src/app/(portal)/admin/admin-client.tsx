"use client";

import { useEffect, useState } from "react";
import { demoModuleConfigs } from "@/data/module-demos";
import { moduleRegistry } from "@/data/modules";
import { superAdminOnlyModules } from "@/data/users";
import { ModuleHeader } from "@/components/module-header";
import { StatCard } from "@/components/stat-card";
import type { AccessLevel, ModuleKey, Role } from "@/types/portal";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  moduleAccess: Record<string, AccessLevel>;
};

const levels: AccessLevel[] = ["NONE", "VIEW", "EDIT", "ADMIN"];
const hardLockedModules: ModuleKey[] = ["admin", ...superAdminOnlyModules];
const extraStorageKeys = [
  "sampleportal.dashboard.focus",
  "sampleportal.dashboard.announcements",
  "sampleportal.gps.state",
  "sampleportal.tasks.state",
  "sampleportal.training.state",
  "sampleportal.calendar.state",
  "sampleportal.assets.state",
];

function canAssignModule(role: Role, module: ModuleKey): boolean {
  if (role !== "SUPER_ADMIN" && hardLockedModules.includes(module)) {
    return false;
  }
  return true;
}

export function AdminClient() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [demoOpsMessage, setDemoOpsMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("sample123");
  const [role, setRole] = useState<Role>("MEMBER");

  async function loadUsers(): Promise<void> {
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/users");
    if (!response.ok) {
      setLoading(false);
      setError("Unable to load users. SUPER_ADMIN required.");
      return;
    }

    const payload = (await response.json()) as { users: UserRow[] };
    setUsers(payload.users);
    setLoading(false);
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  async function createUser(): Promise<void> {
    if (!name.trim() || !email.trim()) return;

    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      setError(payload.error || "Failed to create user.");
      return;
    }

    setName("");
    setEmail("");
    setPassword("sample123");
    setRole("MEMBER");
    await loadUsers();
  }

  async function changeAccess(userId: string, module: string, accessLevel: AccessLevel): Promise<void> {
    setError("");
    const response = await fetch("/api/admin/access", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, module, accessLevel }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      setError(payload.error || "Failed to update module access.");
      return;
    }

    setUsers((current) =>
      current.map((user) =>
        user.id === userId
          ? { ...user, moduleAccess: { ...user.moduleAccess, [module]: accessLevel } }
          : user
      )
    );
  }

  function clearModuleDemoData(): void {
    for (const config of Object.values(demoModuleConfigs)) {
      window.localStorage.removeItem(config.storageKey);
    }
    for (const key of extraStorageKeys) {
      window.localStorage.removeItem(key);
    }
    setDemoOpsMessage("Cleared saved module demo state. Refresh pages to reload seeded data.");
  }

  function exportDemoSnapshot(): void {
    const snapshot: Record<string, unknown> = {
      generatedAt: new Date().toISOString(),
      users,
      modules: {},
    };

    for (const [moduleKey, config] of Object.entries(demoModuleConfigs)) {
      const raw = window.localStorage.getItem(config.storageKey);
      let rows: unknown = config.seedRows;
      if (raw) {
        try {
          rows = JSON.parse(raw) as unknown;
        } catch {
          rows = config.seedRows;
        }
      }
      (snapshot.modules as Record<string, unknown>)[moduleKey] = rows;
    }

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sampleportal-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDemoOpsMessage("Downloaded demo snapshot JSON.");
  }

  return (
    <>
      <ModuleHeader
        title="Admin Panel"
        description="Manage demo users, roles, module access, and AI-ready security scaffolding."
        right={
          <button className="btn" type="button" onClick={() => void loadUsers()}>
            Refresh
          </button>
        }
      />

      {error ? <div className="alert">{error}</div> : null}

      <section className="card-grid">
        <StatCard title="Users" value={String(users.length)} note="Demo user accounts" />
        <StatCard title="SUPER_ADMIN" value={String(users.filter((user) => user.role === "SUPER_ADMIN").length)} note="Full access" />
        <StatCard title="ADMIN" value={String(users.filter((user) => user.role === "ADMIN").length)} note="Elevated access" />
        <StatCard title="MEMBER" value={String(users.filter((user) => user.role === "MEMBER").length)} note="Standard users" />
      </section>

      <article className="panel form-grid">
        <h4>Demo Operations</h4>
        <p className="muted">Controls for preparing clean walkthrough runs and backups.</p>
        <div className="control-row">
          <button className="btn" type="button" onClick={clearModuleDemoData}>
            Clear Saved Module State
          </button>
          <button className="btn" type="button" onClick={exportDemoSnapshot}>
            Export Demo Snapshot
          </button>
        </div>
        {demoOpsMessage ? <p className="muted">{demoOpsMessage}</p> : null}
      </article>

      <section className="split-2">
        <article className="panel form-grid">
          <h4>Create User</h4>
          <input placeholder="Full name" value={name} onChange={(event) => setName(event.target.value)} />
          <input placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <input placeholder="Temp password" value={password} onChange={(event) => setPassword(event.target.value)} />
          <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            <option value="ADMIN">ADMIN</option>
            <option value="MEMBER">MEMBER</option>
          </select>
          <button className="btn" type="button" onClick={() => void createUser()}>
            Create User
          </button>
        </article>

        <article className="panel">
          <h4>User Directory</h4>
          {loading ? <p className="muted" style={{ marginTop: 8 }}>Loading users...</p> : null}
          {!loading ? (
            <div className="table-wrap" style={{ marginTop: 8 }}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td><span className="chip auto">{user.role}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </article>
      </section>

      <article className="panel">
        <h4>Module Access Matrix</h4>
        <div className="table-wrap" style={{ marginTop: 8 }}>
          <table>
            <thead>
              <tr>
                <th>User</th>
                {moduleRegistry.map((module) => (
                  <th key={module.key}>{module.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  {moduleRegistry.map((module) => (
                    <td key={`${user.id}-${module.key}`}>
                      <select
                        value={user.moduleAccess[module.key] || "NONE"}
                        disabled={
                          user.role === "SUPER_ADMIN" ||
                          !canAssignModule(user.role, module.key)
                        }
                        onChange={(event) =>
                          void changeAccess(user.id, module.key, event.target.value as AccessLevel)
                        }
                      >
                        {levels.map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </>
  );
}
