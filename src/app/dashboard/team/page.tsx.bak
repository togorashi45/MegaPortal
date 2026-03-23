"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

type AgentLocation = "macmini" | "vps";
type AgentStatus = "online" | "offline";

interface Agent {
  _id: Id<"agents">;
  name: string;
  role: string;
  model: string;
  status: AgentStatus;
  location: AgentLocation;
  avatar?: string;
  lastActivity?: number;
  sessionCount?: number;
}

const agentRoster = {
  macmini: [
    { name: "Rusticus", role: "CEO / Chief of Staff", model: "Claude Opus" },
  ],
  vps: [
    { name: "Marcus", role: "Executive Assistant", model: "Claude Sonnet" },
    { name: "Scipio", role: "Strategy", model: "Claude Sonnet" },
    { name: "Cato", role: "Operations", model: "Claude Sonnet" },
    { name: "Crassus", role: "Finance", model: "Claude Sonnet" },
    { name: "Cicero", role: "Sales/Marketing", model: "Claude Sonnet" },
    { name: "Ovid", role: "Marketing", model: "Claude Sonnet" },
    { name: "Euclid", role: "Technical", model: "Claude Sonnet" },
    { name: "Seneca", role: "Chief of Staff", model: "Claude Sonnet" },
    { name: "Socrates", role: "Coach", model: "Claude Sonnet" },
  ],
};

function AgentCard({ agent }: { agent: Agent }) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatLastActivity = (timestamp?: number) => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="bg-[#2a2a2a] rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
              agent.status === "online" ? "bg-darkgreen" : "bg-gray-600"
            }`}
          >
            {agent.avatar || getInitials(agent.name)}
          </div>
          <div>
            <h3 className="font-semibold text-white">{agent.name}</h3>
            <p className="text-sm text-gray-400">{agent.role}</p>
          </div>
        </div>
        <div
          className={`px-2 py-1 rounded text-xs font-medium ${
            agent.status === "online"
              ? "bg-green-900 text-green-300"
              : "bg-gray-700 text-gray-400"
          }`}
        >
          {agent.status}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between text-gray-300">
          <span>Model:</span>
          <span className="font-medium">{agent.model}</span>
        </div>
        <div className="flex items-center justify-between text-gray-300">
          <span>Location:</span>
          <span className="font-medium capitalize">{agent.location}</span>
        </div>
        {agent.sessionCount !== undefined && (
          <div className="flex items-center justify-between text-gray-300">
            <span>Sessions:</span>
            <span className="font-medium">{agent.sessionCount}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-gray-300">
          <span>Last Activity:</span>
          <span className="font-medium">{formatLastActivity(agent.lastActivity)}</span>
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const agents = useQuery(api.agents.list) as Agent[] | undefined;

  // Merge roster with actual agent data
  const getMergedAgents = (location: AgentLocation) => {
    const rosterAgents = agentRoster[location];
    return rosterAgents.map((rosterAgent) => {
      const liveAgent = agents?.find((a) => a.name === rosterAgent.name);
      return (
        liveAgent || {
          _id: `placeholder-${rosterAgent.name}` as Id<"agents">,
          name: rosterAgent.name,
          role: rosterAgent.role,
          model: rosterAgent.model,
          status: "offline" as AgentStatus,
          location,
        }
      );
    });
  };

  const macMiniAgents = getMergedAgents("macmini");
  const vpsAgents = getMergedAgents("vps");

  const onlineCount = agents?.filter((a) => a.status === "online").length || 0;
  const totalCount = agentRoster.macmini.length + agentRoster.vps.length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Team</h1>
        <p className="text-gray-400">
          {onlineCount} of {totalCount} agents online
        </p>
      </div>

      {/* Mac Mini Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <h2 className="text-xl font-semibold text-white">Mac Mini</h2>
          <span className="px-3 py-1 bg-darkgreen text-white rounded-full text-sm">
            Primary Operations
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {macMiniAgents.map((agent) => (
            <AgentCard key={agent._id} agent={agent} />
          ))}
        </div>
      </div>

      {/* VPS Section */}
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <h2 className="text-xl font-semibold text-white">VPS (Cloud)</h2>
          <span className="px-3 py-1 bg-terracotta text-white rounded-full text-sm">
            Specialized Advisors
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vpsAgents.map((agent) => (
            <AgentCard key={agent._id} agent={agent} />
          ))}
        </div>
      </div>

      {/* Network Info */}
      <div className="mt-8 p-6 bg-[#242424] rounded-lg border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-3">Network Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Mac Mini (Tailscale):</span>
            <span className="text-gray-300 ml-2 font-mono">100.80.167.67</span>
          </div>
          <div>
            <span className="text-gray-400">VPS (Tailscale):</span>
            <span className="text-gray-300 ml-2 font-mono">100.111.255.82</span>
          </div>
          <div>
            <span className="text-gray-400">VPS (Public):</span>
            <span className="text-gray-300 ml-2 font-mono">187.77.22.12</span>
          </div>
        </div>
      </div>
    </div>
  );
}
