import { useState } from "react";
import { FaTasks, FaCoins, FaClock, FaCheck, FaPlay, FaEye } from "react-icons/fa";
import { toast } from "sonner";
import { useTheme } from "../context/ThemeContext";

const Tasks = () => {
  const { theme, themeColors } = useTheme();
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Complete Profile Setup",
      description: "Fill out your complete profile information including KYC documents",
      reward: 500,
      timeRequired: "10 minutes",
      difficulty: "Easy",
      status: "completed",
      category: "Profile",
      completedDate: "2024-01-15"
    },
    {
      id: 2,
      title: "Refer 5 New Users",
      description: "Successfully refer 5 new users to the platform and earn bonus rewards",
      reward: 2500,
      timeRequired: "1 week",
      difficulty: "Medium",
      status: "in-progress",
      category: "Referral",
      progress: 3,
      target: 5
    },
    {
      id: 3,
      title: "Daily Check-in (7 days)",
      description: "Login daily for 7 consecutive days to earn loyalty bonus",
      reward: 700,
      timeRequired: "1 week",
      difficulty: "Easy",
      status: "available",
      category: "Daily",
      progress: 0,
      target: 7
    },
    {
      id: 4,
      title: "Product Review Task",
      description: "Write detailed reviews for 10 products on the platform",
      reward: 1000,
      timeRequired: "2 hours",
      difficulty: "Medium",
      status: "available",
      category: "Content",
      progress: 0,
      target: 10
    },
    {
      id: 5,
      title: "Social Media Sharing",
      description: "Share platform content on your social media accounts (5 posts)",
      reward: 300,
      timeRequired: "30 minutes",
      difficulty: "Easy",
      status: "available",
      category: "Social",
      progress: 0,
      target: 5
    },
    {
      id: 6,
      title: "Complete Training Module",
      description: "Complete the Referal training course and pass the quiz with 80% score",
      reward: 1500,
      timeRequired: "3 hours",
      difficulty: "Hard",
      status: "locked",
      category: "Training",
      requirement: "Complete Profile Setup first"
    }
  ]);

  const [filter, setFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filter === "all" || task.status === filter;
    const categoryMatch = selectedCategory === "all" || task.category === selectedCategory;
    return statusMatch && categoryMatch;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case "completed": return theme === 'dark' ? "bg-red-900/30 text-red-500" : "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "available": return "bg-yellow-100 text-yellow-800";
      case "locked": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case "Easy": return theme === 'dark' ? "bg-red-900/30 text-red-500" : "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleStartTask = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: "in-progress" }
        : task
    ));
    toast.success("Task started successfully!");
  };

  const handleCompleteTask = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: "completed", completedDate: new Date().toISOString().split('T')[0] }
        : task
    ));
    toast.success("Task completed! Reward added to your account.");
  };

  const totalEarned = tasks
    .filter(task => task.status === "completed")
    .reduce((sum, task) => sum + task.reward, 0);

  const availableRewards = tasks
    .filter(task => task.status === "available" || task.status === "in-progress")
    .reduce((sum, task) => sum + task.reward, 0);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: themeColors.background }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: themeColors.text }}>Available Tasks</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="rounded-xl p-6 shadow-lg border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Total Tasks</p>
                <p className="text-2xl font-bold" style={{ color: themeColors.info }}>{tasks.length}</p>
              </div>
              <FaTasks className="text-2xl" style={{ color: themeColors.info }} />
            </div>
          </div>
          <div className="rounded-xl p-6 shadow-lg border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Completed</p>
                <p className="text-2xl font-bold" style={{ color: theme === 'dark' ? '#db2b1c' : '#166534' }}>
                  {tasks.filter(t => t.status === "completed").length}
                </p>
              </div>
              <FaCheck className="text-2xl" style={{ color: theme === 'dark' ? '#db2b1c' : '#166534' }} />
            </div>
          </div>
          <div className="rounded-xl p-6 shadow-lg border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Total Earned</p>
                <p className="text-2xl font-bold text-purple-600">₹{totalEarned.toLocaleString()}</p>
              </div>
              <FaCoins className="text-2xl text-purple-600" />
            </div>
          </div>
          <div className="rounded-xl p-6 shadow-lg border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Available Rewards</p>
                <p className="text-2xl font-bold text-orange-600">₹{availableRewards.toLocaleString()}</p>
              </div>
              <FaCoins className="text-2xl text-orange-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl p-6 shadow-lg mb-8 border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-opacity-50"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ backgroundColor: themeColors.background, color: themeColors.text, borderColor: themeColors.border }}
            >
              <option value="all">All Tasks</option>
              <option value="available">Available</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="locked">Locked</option>
            </select>
            <select
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-opacity-50"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ backgroundColor: themeColors.background, color: themeColors.text, borderColor: themeColors.border }}
            >
              <option value="all" style={{ backgroundColor: themeColors.background }}>All Categories</option>
              <option value="Profile">Profile</option>
              <option value="Referral">Referral</option>
              <option value="Daily">Daily</option>
              <option value="Content">Content</option>
              <option value="Social">Social</option>
              <option value="Training">Training</option>
            </select>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <div key={task.id} className="rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: themeColors.text }}>{task.title}</h3>
                  <p className="text-sm mb-3" style={{ color: themeColors.textSecondary }}>{task.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                  {task.status.replace('-', ' ').toUpperCase()}
                </span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(task.difficulty)}`}>
                  {task.difficulty}
                </span>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {task.category}
                </span>
              </div>

              {task.progress !== undefined && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1" style={{ color: themeColors.textSecondary }}>
                    <span>Progress</span>
                    <span>{task.progress}/{task.target}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(task.progress / task.target) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-sm" style={{ color: themeColors.textSecondary }}>
                  <FaClock className="mr-1" />
                  {task.timeRequired}
                </div>
                <div className="flex items-center font-semibold" style={{ color: theme === 'dark' ? '#db2b1c' : '#166534' }}>
                  <FaCoins className="mr-1" />
                  ₹{task.reward}
                </div>
              </div>

              {task.requirement && (
                <p className="text-xs text-red-600 mb-4">
                  Requirement: {task.requirement}
                </p>
              )}

              <div className="flex gap-2">
                {task.status === "available" && (
                  <button
                    onClick={() => handleStartTask(task.id)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaPlay className="text-sm" />
                    Start Task
                  </button>
                )}
                {task.status === "in-progress" && (
                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    className="flex-1 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 hover:opacity-90"
                    style={{ backgroundColor: theme === 'dark' ? '#db2b1c' : '#166534' }}
                  >
                    <FaCheck className="text-sm" />
                    Complete
                  </button>
                )}
                {task.status === "completed" && (
                  <div className="flex-1 bg-gray-100 text-gray-600 py-2 px-4 rounded-lg text-center">
                    Completed on {task.completedDate}
                  </div>
                )}
                {task.status === "locked" && (
                  <div className="flex-1 bg-gray-100 text-gray-500 py-2 px-4 rounded-lg text-center">
                    Locked
                  </div>
                )}
                <button 
                  onClick={() => {
                    setSelectedTask(task);
                    setShowModal(true);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FaEye />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <FaTasks className="mx-auto text-4xl text-gray-400 mb-4" />
            <p className="text-gray-500">No tasks found matching your criteria</p>
          </div>
        )}

        {/* Task Details Modal */}
        {showModal && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Task Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Task Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">{selectedTask.title}</h4>
                  <p className="text-gray-600 mb-4">{selectedTask.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Category:</span>
                      <p className="font-medium">{selectedTask.category}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Difficulty:</span>
                      <div className="mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(selectedTask.difficulty)}`}>
                          {selectedTask.difficulty}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Time Required:</span>
                      <p className="font-medium">{selectedTask.timeRequired}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Reward:</span>
                      <p className="font-medium text-green-600">₹{selectedTask.reward}</p>
                    </div>
                  </div>
                </div>

                {/* Status & Progress */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Status & Progress</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Current Status:</span>
                      <div className="mt-1">
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedTask.status)}`}>
                          {selectedTask.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    {selectedTask.progress !== undefined && (
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Progress:</span>
                          <span>{selectedTask.progress}/{selectedTask.target}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${(selectedTask.progress / selectedTask.target) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.round((selectedTask.progress / selectedTask.target) * 100)}% Complete
                        </p>
                      </div>
                    )}
                    
                    {selectedTask.completedDate && (
                      <div>
                        <span className="text-sm text-gray-600">Completed Date:</span>
                        <p className="font-medium">{selectedTask.completedDate}</p>
                      </div>
                    )}
                    
                    {selectedTask.requirement && (
                      <div>
                        <span className="text-sm text-gray-600">Requirements:</span>
                        <p className="font-medium text-red-600">{selectedTask.requirement}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Task Instructions */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Instructions</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Complete all required steps for this task</p>
                    <p>• Ensure you meet the minimum requirements</p>
                    <p>• Submit proof of completion if required</p>
                    <p>• Rewards will be credited within 24 hours</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
                {selectedTask.status === "available" && (
                  <button
                    onClick={() => {
                      handleStartTask(selectedTask.id);
                      setShowModal(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <FaPlay className="text-sm" />
                    Start Task
                  </button>
                )}
                {selectedTask.status === "in-progress" && (
                  <button
                    onClick={() => {
                      handleCompleteTask(selectedTask.id);
                      setShowModal(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <FaCheck className="text-sm" />
                    Complete Task
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;