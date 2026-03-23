"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";

type TaskStatus = "backlog" | "in_progress" | "review" | "done";
type TaskPriority = "low" | "medium" | "high" | "urgent";

interface Task {
  _id: Id<"tasks">;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedAgent?: string;
  createdAt: number;
  updatedAt: number;
}

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: "backlog", title: "Backlog", color: "gray" },
  { id: "in_progress", title: "In Progress", color: "blue" },
  { id: "review", title: "Review", color: "gold" },
  { id: "done", title: "Done", color: "darkgreen" },
];

const priorityColors = {
  low: "bg-gray-600",
  medium: "bg-blue-600",
  high: "bg-gold",
  urgent: "bg-terracotta",
};

function DraggableTaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-[#2a2a2a] p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-white">{task.title}</h3>
        <span className={`px-2 py-1 rounded text-xs ${priorityColors[task.priority]} text-white`}>
          {task.priority}
        </span>
      </div>
      <p className="text-sm text-gray-400 mb-3">{task.description}</p>
      {task.assignedAgent && (
        <div className="flex items-center text-xs text-gray-500">
          <span>👤 {task.assignedAgent}</span>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  return (
    <div className="bg-[#2a2a2a] p-4 rounded-lg border border-gray-700">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-white">{task.title}</h3>
        <span className={`px-2 py-1 rounded text-xs ${priorityColors[task.priority]} text-white`}>
          {task.priority}
        </span>
      </div>
      <p className="text-sm text-gray-400 mb-3">{task.description}</p>
      {task.assignedAgent && (
        <div className="flex items-center text-xs text-gray-500">
          <span>👤 {task.assignedAgent}</span>
        </div>
      )}
    </div>
  );
}

function DroppableColumn({
  column,
  tasks,
}: {
  column: { id: TaskStatus; title: string; color: string };
  tasks: Task[];
}) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className="bg-[#242424] rounded-lg p-4 border border-gray-800"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-white">{column.title}</h2>
        <span className="text-sm text-gray-400">{tasks.length}</span>
      </div>
      <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-16rem)]">
        {tasks.map((task) => (
          <DraggableTaskCard key={task._id} task={task} />
        ))}
      </div>
    </div>
  );
}

export default function TasksPage() {
  const tasks = useQuery(api.tasks.list) as Task[] | undefined;
  const updateTask = useMutation(api.tasks.update);
  const createTask = useMutation(api.tasks.create);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTaskColumn, setNewTaskColumn] = useState<TaskStatus>("backlog");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks?.find((t) => t._id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as Id<"tasks">;
    const newStatus = over.id as TaskStatus;

    const task = tasks?.find((t) => t._id === taskId);
    if (task && task.status !== newStatus) {
      updateTask({ id: taskId, status: newStatus });
    }
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks?.filter((task) => task.status === status) || [];
  };

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await createTask({
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      status: newTaskColumn,
      priority: formData.get("priority") as string,
      assignedAgent: formData.get("assignedAgent") as string || undefined,
    });

    setShowNewTaskForm(false);
    e.currentTarget.reset();
  };

  return (
    <div className="p-8 h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Tasks Board</h1>
        <button
          onClick={() => setShowNewTaskForm(true)}
          className="px-4 py-2 bg-terracotta hover:bg-terracotta/80 text-white rounded-lg transition-colors"
        >
          + New Task
        </button>
      </div>

      {showNewTaskForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#242424] p-6 rounded-lg w-full max-w-md border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Create New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={newTaskColumn}
                  onChange={(e) => setNewTaskColumn(e.target.value as TaskStatus)}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-terracotta"
                >
                  {columns.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  defaultValue="medium"
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-terracotta"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Assigned Agent (optional)
                </label>
                <input
                  name="assignedAgent"
                  type="text"
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-terracotta hover:bg-terracotta/80 text-white rounded transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewTaskForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
          {columns.map((column) => (
            <DroppableColumn
              key={column.id}
              column={column}
              tasks={getTasksByStatus(column.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
