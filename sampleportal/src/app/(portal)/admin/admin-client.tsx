"use client";

import { useEffect, useState } from "react";
import { moduleRegistry } from "@/data/modules";
import { ModuleHeader } from "@/components/module-header";
import { StatCard } from "@/components/stat-card";
import type { AccessLevel, Role } from "@/types/portal";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  moduleAccess: Record<string, AccessLevel>;
};

const levels: AccessLevel[] = ["NONE", "VIEW", "EDIT", "ADMIN"];

export function AdminClient() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
    const response = await fetch("/api/admin/access", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, module, accessLevel }),
    });

    if (!response.ok) {
      setError("Failed to update module access.");
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
                        disabled={user.role === "SUPER_ADMIN"}
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
