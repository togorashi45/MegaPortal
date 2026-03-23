"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import ReactMarkdown from "react-markdown";

interface Memory {
  _id: Id<"memories">;
  agentId: string;
  fileName: string;
  content: string;
  lastUpdated: number;
}

export default function MemoryPage() {
  const memories = useQuery(api.memories.list) as Memory[] | undefined;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string>("all");

  const filteredMemories = memories?.filter((memory) => {
    const matchesSearch =
      memory.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memory.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memory.agentId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAgent =
      selectedAgent === "all" || memory.agentId === selectedAgent;

    return matchesSearch && matchesAgent;
  });

  const uniqueAgents = Array.from(
    new Set(memories?.map((m) => m.agentId) || [])
  ).sort();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="flex h-full">
      {/* Sidebar with memory list */}
      <div className="w-96 border-r border-gray-800 bg-[#242424] flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-white mb-4">Memory Viewer</h1>

          {/* Search */}
          <input
            type="text"
            placeholder="Search memories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-terracotta mb-3"
          />

          {/* Agent filter */}
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-terracotta"
          >
            <option value="all">All Agents</option>
            {uniqueAgents.map((agent) => (
              <option key={agent} value={agent}>
                {agent}
              </option>
            ))}
          </select>
        </div>

        {/* Memory list */}
        <div className="flex-1 overflow-y-auto">
          {!filteredMemories ? (
            <div className="p-6 text-gray-400 text-center">Loading...</div>
          ) : filteredMemories.length === 0 ? (
            <div className="p-6 text-gray-400 text-center">
              {searchTerm ? "No memories found" : "No memories yet"}
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {filteredMemories.map((memory) => (
                <div
                  key={memory._id}
                  onClick={() => setSelectedMemory(memory)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedMemory?._id === memory._id
                      ? "bg-[#2a2a2a] border-l-4 border-terracotta"
                      : "hover:bg-[#2a2a2a]"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-white text-sm">
                      {memory.fileName}
                    </h3>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    Agent: {memory.agentId}
                  </div>
                  <div className="text-xs text-gray-500">
                    Updated: {formatDate(memory.lastUpdated)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="p-4 border-t border-gray-800 text-sm text-gray-400">
          {filteredMemories && (
            <>
              Showing {filteredMemories.length} of {memories?.length || 0}{" "}
              memories
            </>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        {selectedMemory ? (
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {selectedMemory.fileName}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>Agent: {selectedMemory.agentId}</span>
                <span>•</span>
                <span>Last updated: {formatDate(selectedMemory.lastUpdated)}</span>
              </div>
            </div>

            <div className="prose prose-invert max-w-none">
              <div className="bg-[#242424] rounded-lg p-6 border border-gray-800">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold text-white mb-4">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-bold text-white mb-3 mt-6">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-bold text-white mb-2 mt-4">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-gray-300 mb-4 leading-relaxed">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside text-gray-300 mb-4 space-y-1">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-1">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-gray-300">{children}</li>
                    ),
                    code: ({ children, className }) => {
                      const isInline = !className;
                      if (isInline) {
                        return (
                          <code className="bg-[#1a1a1a] px-1.5 py-0.5 rounded text-terracotta font-mono text-sm">
                            {children}
                          </code>
                        );
                      }
                      return (
                        <code className="block bg-[#1a1a1a] p-4 rounded text-gray-300 font-mono text-sm overflow-x-auto">
                          {children}
                        </code>
                      );
                    },
                    pre: ({ children }) => (
                      <pre className="mb-4">{children}</pre>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-terracotta pl-4 italic text-gray-400 mb-4">
                        {children}
                      </blockquote>
                    ),
                    a: ({ children, href }) => (
                      <a
                        href={href}
                        className="text-terracotta hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-bold text-white">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-gray-300">{children}</em>
                    ),
                  }}
                >
                  {selectedMemory.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <div className="text-6xl mb-4">🧠</div>
              <p>Select a memory file to view its contents</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
