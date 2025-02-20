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
    priority: 1, // Default priority
    labels: [""],
    due_date: "",
  });
  const [editingTask, setEditingTask] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [completedTasksShow, setCompletedTasksShow] = useState([]);
  const [tab, setTab] = useState("active");

  const base_url = "https://jarvis-ai-b6ge.onrender.com";

  // -----------------------------
  // Fetch tasks from FastAPI
  // -----------------------------
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

  // -----------------------------
  // Add a new typed task (if you still need it manually)
  // -----------------------------
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
            priority: 1,
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
      alert("Please provide task content.");
    }
    setIsModalOpen(false);
  };

  // -----------------------------
  // Delete a task
  // -----------------------------
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

  // -----------------------------
  // Update a task
  // -----------------------------
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

  // -----------------------------
  // Mark task as completed or reopen
  // -----------------------------
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

  // -------------------------------------------------
  // Voice task logic: SINGLE CALL to /api/tasks/voice
  // -------------------------------------------------
  const handleAddVoiceTask = async (transcription) => {
    try {
      // Make ONE request to the voice endpoint
      // If that endpoint already creates the task, it should return the new task.
      const response = await fetch(`${base_url}/api/tasks/voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcription }),
      });

      const responseData = await response.json();

      if (response.ok) {
        // If successful and we get a newly created task back
        if (responseData.task) {
          // Add that to our state
          setTasks((prev) => [...prev, responseData.task]);
        } else {
          // If there's no "task" in the response, you might handle that differently.
          console.log("No task returned from voice endpoint.");
        }
      } else {
        // Log any error details
        console.error("Voice API Error:", responseData.detail);
        alert(`Error from voice endpoint: ${responseData.detail}`);
      }
    } catch (error) {
      console.error("Error processing transcription:", error);
      alert(
        "An error occurred while processing voice input. Please try again."
      );
    } finally {
      // Reset the form data
      setNewTask({
        content: "",
        description: "",
        priority: 1,
        labels: [""],
        due_date: "",
      });
      setIsModalOpen(false);
    }
  };

  // -----------------------------
  // Speech Recognition Setup
  // -----------------------------
  let recognition;
  let timeoutId;
  let finalTranscript = "";

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support Speech Recognition. Please use Chrome.");
      return;
    }

    recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => {
      setIsListening(true);
      console.log("Speech recognition started");
    };

    recognition.onresult = (event) => {
      // Clear existing pause timer
      clearTimeout(timeoutId);

      // Accumulate transcript from all result segments
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript;
        interimTranscript += transcriptSegment;
      }
      finalTranscript = interimTranscript.trim();
      console.log("Interim Voice input:", finalTranscript);

      // Reset the 3-second timer each time we get new words
      timeoutId = setTimeout(() => {
        // 3 seconds of no new input
        recognition.stop(); // triggers onend
      }, 3000);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      clearTimeout(timeoutId);
      setIsListening(false);
      console.log("Speech recognition ended. Final transcript:", finalTranscript);

      // If we got some text, auto-add the task
      if (finalTranscript) {
        handleAddVoiceTask(finalTranscript);
      } else {
        // If user didn't say anything
        setIsModalOpen(false);
      }
    };

    recognition.start();
  };

  // -----------------------------
  // Auto-start Voice if Adding New Task
  // -----------------------------
  useEffect(() => {
    if (isModalOpen && !editingTask) {
      // We only auto-start if we are NOT editing a task
      // and the modal is open (i.e., adding a new task).
      startListening();
    }
    // Cleanup: if modal closes, stop recognition
    return () => {
      if (recognition && isListening) {
        recognition.stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen, editingTask]);

  // -----------------------------
  // JSX Render
  // -----------------------------
  return (
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
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
            className="px-6 py-3 bg-neonBlue text-black font-bold rounded-lg shadow-neon
              hover:bg-neonPink hover:shadow-neonPink 
              transition-transform hover:scale-110 ml-auto"
          >
            Add New Task
          </button>
        </div>
      </header>

      {/* Tabs for Active/Completed */}
      <section className="w-full p-4 sm:p-6">
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
                  {/* Left: Checkbox + Content */}
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

                      {/* Completed Info */}
                      {tab === "completed" && (
                        <p className="text-gray-400 text-sm mt-1">
                          Completed at:{" "}
                          {task.completed_at
                            ? new Date(task.completed_at).toLocaleDateString()
                            : "Unknown"}
                        </p>
                      )}

                      {/* Active Info */}
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

                  {/* Action Buttons (only for active tasks) */}
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

      {/* Modal for Add or Edit Task */}
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
              {editingTask ? (
                <>
                  {/* Editing an existing task */}
                  <input
                    type="text"
                    placeholder="Task Content"
                    value={editingTask.content}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        content: e.target.value,
                      })
                    }
                    className="p-3 rounded bg-gray-800 text-gray-200 w-full"
                  />

                  <input
                    type="text"
                    placeholder="Add Description"
                    value={editingTask.description || ""}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        description: e.target.value,
                      })
                    }
                    className="p-3 rounded bg-gray-800 text-gray-200 w-full"
                  />

                  <input
                    type="date"
                    value={editingTask.due_date || ""}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        due_date: e.target.value,
                      })
                    }
                    className="p-2 rounded-lg bg-gray-800 text-white border-2 border-neonPink focus:outline-none"
                  />

                  <button
                    onClick={handleUpdateTask}
                    className="px-8 py-3 bg-neonBlue text-black font-bold rounded-lg shadow-neon 
                      hover:bg-neonPink hover:shadow-neonPink 
                      transition-transform transform hover:scale-110"
                  >
                    Update Task
                  </button>
                </>
              ) : (
                <>
                  {/* Voice-Only New Task */}
                  <p className="text-gray-300 mb-2">
                    Speak your task now... <br />
                    We'll add it automatically after <strong>3 seconds</strong>{" "}
                    of silence.
                  </p>

                  <div className="flex items-center">
                    {isListening ? (
                      <span className="text-green-400 font-semibold">
                        Listening...
                      </span>
                    ) : (
                      <span className="text-red-400 font-semibold">
                        Not listening
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
