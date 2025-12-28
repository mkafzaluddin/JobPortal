import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { showSuccessToast, showErrorToast } from "../utils/toastService.jsx";
import JobFormModal from "../components/JobFormModal.jsx";
import API from "../api/api.js";

export default function EmployerDashboard() {
  const [activeTab, setActiveTab] = useState("postJob");

  const [jobs, setJobs] = useState([]);
  const [closedJobs, setClosedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteJobId, setDeleteJobId] = useState(null);

  const closeJob = async (jobId) => {
    try {
      await API.patch(`/employer/jobs/${jobId}/close`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showSuccessToast("Job closed successfully!");
      fetchJobs();
      fetchClosedJobs();
    } catch (err) {
      showErrorToast("Failed to close job");
    }
  };

  const reopenJob = async (jobId) => {
    try {
      await API.patch(`/employer/jobs/${jobId}/reopen`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showSuccessToast("Job reopened successfully!");
      fetchJobs();
      fetchClosedJobs();
    } catch (err) {
      showErrorToast("Failed to reopen job");
    }
  };

  const token = localStorage.getItem("token");

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();
  const user = JSON.parse(localStorage.getItem("user"));
  const initials = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await API.get("/employer/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(res.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      showErrorToast(err.response?.data?.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchClosedJobs = async () => {
    try {
      const res = await API.get("/employer/jobs/closed", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClosedJobs(res.data);
    } catch (err) {
      console.error("Error fetching closed jobs:", err);
      showErrorToast(err.response?.data?.message || "Failed to fetch closed jobs");
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await API.get("/employer/applications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(res.data);
    } catch (err) {
      console.error("Apps fetch failed:", err);
      showErrorToast("Failed to load applications");
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchClosedJobs();
  }, []);

  useEffect(() => {
    if (activeTab === "applications") {
      fetchApplications();
    }
  }, [activeTab]);

  const handleDelete = async () => {
    if (!deleteJobId) return;
    try {
      await API.delete(`/employer/jobs/${deleteJobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showSuccessToast("Job deleted successfully!");
      fetchJobs();
      fetchClosedJobs();
    } catch (err) {
      console.error("Delete failed:", err);
      showErrorToast(err.response?.data?.message || "Delete failed");
    } finally {
      setShowConfirm(false);
      setDeleteJobId(null);
    }
  };

  const updateStatus = async (applicationId, newStatus) => {
    try {
      const res = await API.patch(
        `/employer/applications/${applicationId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showSuccessToast("Status updated!");
      fetchApplications();
    } catch (err) {
      console.error("Status change failed:", err);
      showErrorToast(err.response?.data?.message || "Status change failed");
    }
  };

  const totalJobs = jobs.length;
  const openJobs = jobs.filter((job) => Number(job.IsActive) === 1).length;
  const closedJobsCount = jobs.filter((job) => Number(job.IsActive) === 0).length;

  const STATUS_OPTIONS = ["Pending", "Reviewed", "Shortlisted", "Rejected", "Hired"];

  return (
    <div className="min-h-screen bg-linear-to-br from-sky-100 via-blue-100 to-indigo-200 p-10 relative">

      <div className="absolute top-6 right-8 z-50" ref={dropdownRef}>
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowDropdown((prev) => !prev)}
          className="bg-blue-700 text-white w-14 h-14 flex items-center justify-center 
               rounded-full font-bold text-xl shadow-lg cursor-pointer 
               hover:bg-blue-800 transition-all duration-300 select-none"
        >
          {initials}
        </motion.button>

        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-3 w-40 bg-white/90 backdrop-blur-md 
                   shadow-xl rounded-xl py-2 border border-gray-100"
            >
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/signin";
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 
                     hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
              >
                🚪 Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-blue-800 text-center mb-10 drop-shadow-sm"
      >
        🌟 Employer Dashboard
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-5xl mx-auto"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          animate={{ scale: [1, 1.03, 1], transition: { duration: 2, repeat: Infinity } }}
          className="bg-white/40 backdrop-blur-lg rounded-2xl shadow-lg p-6 text-center"
        >
          <p className="text-gray-700 text-sm">Total Jobs</p>
          <h2 className="text-3xl font-bold text-blue-700">{totalJobs}</h2>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          animate={{ scale: [1, 1.03, 1], transition: { duration: 2, repeat: Infinity, delay: 0.2 } }}
          className="bg-white/40 backdrop-blur-lg rounded-2xl shadow-lg p-6 text-center"
        >
          <p className="text-gray-700 text-sm">Open Jobs</p>
          <h2 className="text-3xl font-bold text-green-600">{openJobs}</h2>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          animate={{ scale: [1, 1.03, 1], transition: { duration: 2, repeat: Infinity, delay: 0.4 } }}
          className="bg-white/40 backdrop-blur-lg rounded-2xl shadow-lg p-6 text-center"
        >
          <p className="text-gray-700 text-sm">Closed Jobs</p>
          <h2 className="text-3xl font-bold text-red-600">{closedJobsCount}</h2>
        </motion.div>
      </motion.div>

      <div className="flex justify-center mb-8">
        {["postJob", "applications"].map((tab) => (
          <motion.button
            key={tab}
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-full mx-2 text-lg font-semibold shadow-md transition-all duration-300 ${activeTab === tab
              ? "bg-blue-600 text-white"
              : "bg-white/70 backdrop-blur-md text-blue-700 hover:bg-blue-100"
              }`}
          >
            {tab === "postJob" ? "📌 Post Job" : "📄 View Applications"}
          </motion.button>
        ))}
      </div>

      {activeTab === "postJob" && (
        <>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedJob(null);
              setShowModal(true);
            }}
            className="fixed bottom-10 right-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full shadow-2xl transition-all"
          >
            + Create Job
          </motion.button>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white/30 backdrop-blur-md p-6 rounded-2xl h-48"
                ></div>
              ))
            ) : jobs.length === 0 ? (
              <p className="text-center text-gray-600 col-span-full">
                No job postings yet. Start by creating one!
              </p>
            ) : (
              jobs.map((job) => (
                <motion.div
                  key={job.JobID}
                  whileHover={{ scale: 1.03 }}
                  className={`bg-white/60 backdrop-blur-md border border-white/40 shadow-lg rounded-2xl p-6 transition transform ${job.IsActive ? "" : "opacity-70"
                    }`}
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {job.Position}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{job.Location}</p>
                  <p className="text-sm text-blue-700 font-medium mb-3">
                    {job.EmploymentType} | {job.ExperienceLevel}
                  </p>
                  <p className="text-gray-700 font-semibold mb-2">
                    💰 {job.SalaryMin} - {job.SalaryMax}
                  </p>
                  <p
                    className={`font-semibold mb-4 ${job.IsActive ? "text-green-600" : "text-red-600"
                      }`}
                  >
                    {job.IsActive ? "🟢 Open" : "🔴 Closed"}
                  </p>

                  <div className="flex justify-between mt-auto">
                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => {
                        setDeleteJobId(job.JobID);
                        setShowConfirm(true);
                      }}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      🗑️ Delete
                    </button>
                    {job.IsActive ? (
                      <button
                        onClick={() => closeJob(job.JobID)}
                        className="text-orange-600 hover:text-orange-800 font-medium"
                      >
                        🔒 Close Job
                      </button>
                    ) : (
                      <button
                        onClick={() => reopenJob(job.JobID)}
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        🔓 Reopen Job
                      </button>
                    )}

                    <AnimatePresence>
                      {showConfirm && deleteJobId === job.JobID && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10"
                        >
                          <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="rounded-2xl shadow-2xl p-6 text-center border border-gray-400 bg-linear-to-br from-sky-100 via-blue-100 to-indigo-200"
                          >
                            <h2 className="text-md font-semibold text-gray-800 mb-3">
                              Are you sure you want to delete this job?
                            </h2>

                            <div className="flex justify-center gap-3">
                              <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-md"
                              >
                                OK
                              </button>
                              <button
                                onClick={() => {
                                  setShowConfirm(false);
                                  setDeleteJobId(null);
                                }}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium shadow-md"
                              >
                                Cancel
                              </button>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <AnimatePresence>
            {showModal && (
              <JobFormModal
                job={selectedJob}
                onClose={() => setShowModal(false)}
                onSaved={() => {
                  fetchJobs();
                  fetchClosedJobs();
                }}
              />
            )}
          </AnimatePresence>
        </>
      )}

      {activeTab === "applications" && (
        <div className="mt-10 max-w-6xl mx-auto">

          {applications.length === 0 ? (
            <p className="text-center text-gray-600">No applications yet.</p>
          ) : (
            <div className="grid gap-6">
              {applications.map((app) => (
                <motion.div
                  key={app.ApplicationID}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/70 backdrop-blur-md shadow-md rounded-xl p-5 border border-blue-100"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {app.FullName}
                      </h3>
                      <p className="text-gray-600">{app.Email}</p>
                      <p className="text-gray-600">📞 {app.PhoneNumber}</p>
                      <p className="text-gray-600">📍 {app.City}</p>

                      <p className="mt-3 font-semibold">
                        Applied for:{" "}
                        <span className="text-blue-700">{app.Position}</span>
                      </p>

                      <a
                        href={app.ResumeURL}
                        target="_blank"
                        className="mt-2 inline-block text-blue-600 hover:underline"
                      >
                        📥 View Resume
                      </a>
                    </div>

                    <div>
                      <select
                        value={app.Status}
                        onChange={(e) =>
                          updateStatus(app.ApplicationID, e.target.value)
                        }
                        className="px-3 py-2 border rounded-lg shadow-sm bg-white"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <p className="text-sm text-gray-500 mt-2">
                        Updated: {app.UpdatedAt ? new Date(app.UpdatedAt).toLocaleString() : "N/A"}
                      </p>
                    </div>
                  </div>

                  {app.CoverLetter && (
                    <p className="mt-4 text-gray-700">
                      <strong>Cover Letter:</strong> {app.CoverLetter}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
      <p className="text-center text-gray-500 text-xs mt-6">
        © 2025 Job portal . All rights reserved. (Elmhurst University - Group-04)
      </p>
    </div>

  );

}
