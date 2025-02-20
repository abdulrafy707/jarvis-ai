"use client";

import { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaEdit,
  FaFlag,
  FaTasks,
  FaTrash,
} from "react-icons/fa";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    content: "",
    description: "",
    priority: 0,
    labels: [""],
    due_date: "",
  });
  const [editingTask, setEditingTask] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceTask, setIsVoiceTask] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [completedTasksShow, setCompletedTasksShow] = useState([]);
  const [tab, setTab] = useState("active");

  const base_url = "https://jarvis-ai-b6ge.onrender.com";

  // Fetch tasks from FastAPI based on the current tab
  useEffect(() => {
    const fetchTasksData = async () => {
      try {
        const url =
          tab === "active"
            ? `${base_url}/api/tasks/list`
            : `${base_url}/api/tasks/completed-tasks`;

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (tab === "active") {
            setTasks(data);
          } else {
            setCompletedTasksShow(data.items);
          }
        } else {
          console.error(`Failed to fetch ${tab} tasks`);
        }
      } catch (error) {
        console.error(`Error fetching ${tab} tasks:`, error);
      }
    };

    fetchTasksData();
  }, [tab]);

  // Add a new task (typed)
  const handleAddTask = async () => {
    if (newTask.content) {
      try {
        const response = await fetch(`${base_url}/api/tasks/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTask),
        });

        if (response.ok) {
          const addedTask = await response.json();
          setTasks((prev) => [...prev, addedTask.task]);
          setNewTask({
            content: "",
            description: "",
            priority: 0,
            labels: [""],
            due_date: "",
          });
        } else {
          console.error("Failed to add task:", response.status);
          alert("Failed to add task.");
        }
      } catch (error) {
        console.error("Error adding task:", error);
      }
    } else {
      alert("Please fill in all fields.");
    }
    setIsModalOpen(false);
  };

  // Delete a task
  const handleDeleteTask = async (id) => {
    try {
      const response = await fetch(`${base_url}/api/tasks/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setTasks((prev) => prev.filter((task) => task.id !== id));
      } else {
        alert("Failed to delete task.");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
    setIsModalOpen(false);
  };

  // Update a task
  const handleUpdateTask = async () => {
    if (editingTask && editingTask.content) {
      try {
        const payload = { content: editingTask.content };
        const taskId = editingTask.id;

        const response = await fetch(`${base_url}/api/tasks/edit/${taskId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const updatedTask = await response.json();
          setTasks((prev) =>
            prev.map((task) =>
              task.id === updatedTask.task.id
                ? { ...task, content: updatedTask.task.content }
                : task
            )
          );
          setEditingTask(null);
        } else {
          const errorText = await response.text();
          console.error("Failed to update task:", errorText);
          alert("Failed to update task.");
        }
      } catch (error) {
        console.error("Error updating task:", error);
      }
    } else {
      alert("Please fill in all fields.");
    }
    setIsModalOpen(false);
  };

  // Mark task as completed / reopen task
  const handleCompleteTask = async (taskId) => {
    try {
      if (tab === "active") {
        // Mark as completed
        const response = await fetch(`${base_url}/api/tasks/${taskId}/close`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          setTasks((prevTasks) => {
            const taskToComplete = prevTasks.find((t) => t.id === taskId);
            if (!taskToComplete) {
              console.error(`Task with ID ${taskId} not found in active tasks.`);
              return prevTasks;
            }
            setCompletedTasks((prevCompleted) => [
              ...prevCompleted,
              { ...taskToComplete, completed: true },
            ]);
            return prevTasks.filter((t) => t.id !== taskId);
          });
        } else {
          console.error("Failed to mark task as completed:", response.status);
        }
      } else if (tab === "completed") {
        // Reopen task
        const response = await fetch(`${base_url}/api/tasks/${taskId}/reopen`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          setCompletedTasks((prevCompletedTasks) => {
            const taskToReopen = prevCompletedTasks.find(
              (t) => t.task_id === taskId
            );
            if (!taskToReopen) {
              console.error(
                `Task with ID ${taskId} not found in completed tasks.`
              );
              return prevCompletedTasks;
            }

            setTasks((prevTasks) => [
              ...prevTasks,
              { ...taskToReopen, completed: false },
            ]);
            return prevCompletedTasks.filter((t) => t.task_id !== taskId);
          });
        } else {
          console.error("Failed to reopen task:", response.status);
        }
      }
    } catch (error) {
      console.error("Error updating task state:", error);
    }
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Add a new task (voice)
  const handleAddVoiceTask = async (transcription) => {
    try {
      const response = await fetch(`${base_url}/api/tasks/voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcription }),
      });

      const responseData = await response.json();
      if (response.ok) {
        if (responseData.task) {
          const { content, description, priority, labels, due_date } =
            responseData.task;
          setNewTask({
            content: content || "",
            description: description || "",
            priority: priority || 1,
            labels: labels || ["general"],
            due_date: due_date || "",
          });
        } else {
          console.log("Failed to create a task. Check your transcription.");
        }
      } else {
        console.error("API Error:", responseData.detail);
        alert(`Error: ${responseData.detail}`);
      }
    } catch (error) {
      console.error("Error processing transcription:", error);
      alert(
        "An error occurred while processing the voice input. Please try again."
      );
    }
  };

  // Speech Recognition for Voice Input
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support Speech Recognition. Please use Chrome.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      console.log("Speech recognition started");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      console.log("Voice input:", transcript);
      if (transcript) {
        handleAddVoiceTask(transcript);
      } else {
        alert("No voice input detected. Please try again.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log("Speech recognition ended");
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <>
      {/* 
        On small screens, there's no left margin so it takes full width.
        On md+ screens, we add a left margin of 20% (if you have a sidebar).
      */}
      <div className="flex flex-col bg-black min-h-screen text-light md:ml-[5%]">
        {/* Header */}
        <header
          className="
            flex flex-col gap-6
            sm:flex-row sm:items-center 
            justify-between 
            p-8 sm:p-16
            text-center sm:text-left
          "
        >
          <div className="p-4 sm:p-0 text-center sm:text-left">
  <h1 className="text-neonPink text-3xl sm:text-5xl font-extrabold glowing-text">
    Task Management
  </h1>
  <p className="text-gray-300 text-base sm:text-lg mt-2 sm:mt-4">
    Manage your tasks effectively.
  </p>
</div>


          <div className="sm:mt-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-neonBlue text-black font-bold rounded-lg shadow-neon 
                hover:bg-neonPink hover:shadow-neonPink 
                transition-transform hover:scale-110 ml-auto"
            >
              Add New Task
            </button>
          </div>
        </header>

        {/* Task List Section */}
        <section className="w-full p-4 sm:p-6">
          {/* Tabs for Active/Completed Tasks */}
          <div className="flex space-x-8 mb-4 border-b-2 border-gray-600">
            <button
              onClick={() => setTab("active")}
              className={`
                text-lg font-semibold py-2 px-4 
                ${
                  tab === "active"
                    ? "text-neonPink border-b-2 border-neonPink"
                    : "text-gray-300"
                }
              `}
            >
              Active Tasks
            </button>
            <button
              onClick={() => setTab("completed")}
              className={`
                text-lg font-semibold py-2 px-4 
                ${
                  tab === "completed"
                    ? "text-neonPink border-b-2 border-neonPink"
                    : "text-gray-300"
                }
              `}
            >
              Completed Tasks
            </button>
          </div>

          {/* Task List */}
          <div className="max-w-screen-lg mx-auto">
            <ul className="mt-6 space-y-4">
              {(tab === "active" ? tasks : completedTasksShow)
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map((task, index) => (
                  <li
                    key={index}
                    className={`
                      bg-gray-800 p-4 rounded-xl 
                      flex flex-col gap-4
                      sm:flex-row sm:items-center sm:justify-between
                      shadow-md hover:shadow-lg transition-shadow
                      ${
                        tab === "completed" && task.completed
                          ? "bg-green-700"
                          : ""
                      }
                    `}
                  >
                    {/* Left Section: Checkbox + Content */}
                    <div className="flex flex-col sm:flex-row sm:items-center flex-1 gap-4">
                      {/* Checkbox */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={tab === "completed"}
                          onChange={() =>
                            handleCompleteTask(
                              tab === "completed" ? task.task_id : task.id
                            )
                          }
                          className={`
                            w-6 h-6 rounded-full border-2 appearance-none
                            ${
                              tab === "completed"
                                ? "bg-green-300 border-green-500"
                                : "bg-white border-gray-500"
                            }
                            focus:outline-none checked:bg-green-500 checked:ring-2 checked:ring-green-300
                          `}
                        />
                      </div>

                      {/* Task Content */}
                      <div>
                        <h3
                          className={`
                            text-neonPink text-lg font-semibold
                            ${task.completed ? "line-through" : ""}
                            capitalize
                          `}
                        >
                          {task.content}
                        </h3>

                        {/* Completed Tasks Info */}
                        {tab === "completed" && (
                          <p className="text-gray-400 text-sm mt-1">
                            Completed at:{" "}
                            {task.completed_at
                              ? new Date(task.completed_at).toLocaleDateString()
                              : "Unknown"}
                          </p>
                        )}

                        {/* Active Tasks Extra Info */}
                        {tab === "active" && (
                          <>
                            <p className="text-gray-400 text-sm mt-1">
                              Created at:{" "}
                              {task.created_at
                                ? new Date(task.created_at).toLocaleDateString()
                                : "Unknown"}
                            </p>
                            <div className="flex items-center mt-2 space-x-4 text-gray-400 text-sm">
                              {/* Priority */}
                              <div className="flex items-center">
                                <FaFlag className="text-yellow-500 mr-2" />
                                <span
                                  className={`
                                    px-2 py-1 rounded-full font-medium
                                    ${
                                      task.priority === 4
                                        ? "bg-red-700 text-white"
                                        : task.priority === 3
                                        ? "bg-red-500 text-white"
                                        : task.priority === 2
                                        ? "bg-yellow-500 text-black"
                                        : "bg-green-500 text-white"
                                    }
                                  `}
                                >
                                  {task.priority === 4
                                    ? "Highest"
                                    : task.priority === 3
                                    ? "High"
                                    : task.priority === 2
                                    ? "Medium"
                                    : "Low"}
                                </span>
                              </div>

                              {/* Due Date */}
                              <div className="flex items-center">
                                <FaCalendarAlt className="text-blue-500 mr-2" />
                                {task.due?.string ? (
                                  <span>
                                    {new Date(task.due.date).toLocaleDateString()}
                                  </span>
                                ) : (
                                  "No due date"
                                )}
                              </div>

                              {/* Progress */}
                              <div className="flex items-center">
                                <FaTasks className="text-green-500 mr-2" />
                                <span>{task.progress || "In Progress"}</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons (active tab only) */}
                    {tab === "active" && (
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleEditClick(task)}
                          className="p-2 bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors"
                        >
                          <FaEdit className="text-white" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <FaTrash className="text-white" />
                        </button>
                      </div>
                    )}
                  </li>
                ))}
            </ul>
          </div>
        </section>

        {/* Modal for Add/Edit Task */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-lg relative">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-neonPurple text-3xl font-extrabold glowing-text">
                  {editingTask ? "Edit Task" : "Add New Task"}
                </h2>
                {/* Close Button */}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white text-2xl hover:text-red-500"
                  title="Close Modal"
                >
                  &times;
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex flex-col gap-4">
                {/* Task Content with Voice Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Task Content"
                    value={editingTask ? editingTask.content : newTask.content}
                    onChange={(e) =>
                      editingTask
                        ? setEditingTask({
                            ...editingTask,
                            content: e.target.value,
                          })
                        : setNewTask({ ...newTask, content: e.target.value })
                    }
                    className="p-3 rounded bg-gray-800 text-gray-200 w-full pr-12"
                  />
                  <button
                    onClick={startListening}
                    disabled={isListening}
                    className={`
                      absolute top-1/2 right-3 transform -translate-y-1/2 text-black bg-transparent 
                      ${
                        isListening
                          ? "text-gray-500 cursor-not-allowed"
                          : "hover:text-neonPink transition-transform transform hover:scale-110"
                      }
                    `}
                    title={isListening ? "Listening..." : "Start Voice Input"}
                  >
                    {isListening ? (
                      <span className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v8m0 0c1.657 0 3 1.343 3 3m-6 0a3 3 0 006 0m0 0v2a3 3 0 01-6 0v-2m0 0H6m6 0h6"
                          />
                        </svg>
                        <span className="text-sm font-bold">Listening...</span>
                      </span>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6V18M8 10V18M12 4V18M16 8V18M20 6V18"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Description */}
                <input
                  type="text"
                  placeholder="Add Description"
                  value={
                    editingTask ? editingTask.description : newTask.description
                  }
                  onChange={(e) =>
                    editingTask
                      ? setEditingTask({
                          ...editingTask,
                          description: e.target.value,
                        })
                      : setNewTask({ ...newTask, description: e.target.value })
                  }
                  className="p-3 rounded bg-gray-800 text-gray-200 w-full"
                />

                {/* Priority */}
                <select
                  value={
                    editingTask ? editingTask.priority : newTask.priority || ""
                  }
                  onChange={(e) =>
                    editingTask
                      ? setEditingTask({
                          ...editingTask,
                          priority: Number(e.target.value),
                        })
                      : setNewTask({
                          ...newTask,
                          priority: Number(e.target.value),
                        })
                  }
                  className="p-3 rounded bg-gray-800 text-gray-200 w-full"
                >
                  <option value="" disabled>
                    Select Priority
                  </option>
                  <option value="1">Priority 1</option>
                  <option value="2">Priority 2</option>
                  <option value="3">Priority 3</option>
                  <option value="4">Priority 4</option>
                </select>

                {/* Labels */}
                <select
                  value={
                    (editingTask &&
                      editingTask.labels &&
                      editingTask.labels[0]) ||
                    (newTask.labels && newTask.labels[0]) ||
                    ""
                  }
                  onChange={(e) => {
                    const selectedLabel = e.target.value;
                    if (editingTask) {
                      setEditingTask({
                        ...editingTask,
                        labels: [selectedLabel],
                      });
                    } else {
                      setNewTask({ ...newTask, labels: [selectedLabel] });
                    }
                  }}
                  className="p-3 rounded bg-gray-800 text-gray-200 w-full"
                >
                  <option value="" disabled>
                    Label
                  </option>
                  <option value="email">Email</option>
                  <option value="calendar">Calendar</option>
                </select>

                {/* Due Date */}
                <input
                  type="date"
                  value={editingTask ? editingTask.due_date : newTask.due_date}
                  onChange={(e) =>
                    editingTask
                      ? setEditingTask({ ...editingTask, due_date: e.target.value })
                      : setNewTask({ ...newTask, due_date: e.target.value })
                  }
                  className="p-2 rounded-lg bg-gray-800 text-white border-2 border-neonPink focus:outline-none"
                />

                {/* Add/Update Button */}
                <button
                  onClick={
                    editingTask
                      ? handleUpdateTask
                      : isVoiceTask
                      ? handleAddVoiceTask
                      : handleAddTask
                  }
                  className="px-8 py-3 bg-neonBlue text-black font-bold rounded-lg shadow-neon 
                    hover:bg-neonPink hover:shadow-neonPink 
                    transition-transform transform hover:scale-110"
                >
                  {editingTask
                    ? "Update Task"
                    : isVoiceTask
                    ? "Add Voice Task"
                    : "Add Task"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
