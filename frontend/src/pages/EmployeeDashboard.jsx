import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { showSuccessToast, showErrorToast, showWarningToast } from "../utils/toastService.jsx";
import API from "../api/api.js";

export default function EmployeeDashboard() {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    location: "",
    experience: "",
    salaryMin: "",
    salaryMax: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("available");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const initials = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  const [applyForm, setApplyForm] = useState({
    FullName: user?.name || "",
    Email: user?.email || "",
    PhoneNumber: "",
    City: "",
    CoverLetter: "",
    ResumeFile: null,
    ResumeFileName: "",
  });

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  const handleWithdraw = async (applicationId) => {
    try {
      await API.delete(`/employee/applications/${applicationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showSuccessToast("Application withdrawn successfully!");
      fetchAppliedJobs();
      fetchJobs();
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to withdraw application");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setShowApplicationModal(false);
        setSelectedApplication(null);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await API.get("/employee/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(res.data || []);
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const res = await API.get("/employee/applications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppliedJobs(res.data || []);
    } catch (err) {
      showErrorToast("Failed to fetch applied jobs");
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchAppliedJobs();
  }, []);

  const handleApply = async (jobId) => {
    try {
      if (!applyForm.FullName?.trim()) {
        return showWarningToast("Please enter your full name.");
      }

      if (!applyForm.Email?.trim()) {
        return showWarningToast("Please enter your email.");
      }

      if (!applyForm.PhoneNumber || applyForm.PhoneNumber.length === 0) {
        return showWarningToast("Please enter your phone number.");
      }

      if (applyForm.PhoneNumber.length < 10) {
        return showWarningToast(`Phone number must be exactly 10 digits. You entered only ${applyForm.PhoneNumber.length} digit${applyForm.PhoneNumber.length !== 1 ? 's' : ''}.`);
      }

      if (applyForm.PhoneNumber.length > 10) {
        return showWarningToast("Phone number must be exactly 10 digits, Please remove extra digits.");
      }

      if (!applyForm.City?.trim()) {
        return showWarningToast("Please enter your State");
      }

      if (!applyForm.ResumeFile) {
        return showWarningToast("Please upload your resume");
      }

      const formData = new FormData();
      formData.append("FullName", applyForm.FullName);
      formData.append("Email", applyForm.Email);
      formData.append("PhoneNumber", `+1${applyForm.PhoneNumber}`);
      formData.append("City", applyForm.City);
      formData.append("CoverLetter", applyForm.CoverLetter || "");
      formData.append("resume", applyForm.ResumeFile);


      await API.post(`/employee/apply/${jobId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      showSuccessToast("Application submitted successfully!");

      setApplyForm({
        FullName: user?.name || "",
        Email: user?.email || "",
        PhoneNumber: "",
        City: "",
        CoverLetter: "",
        ResumeFile: null,
        ResumeFileName: "",
      });

      setShowApplyModal(false);
      setSelectedJobId(null);

      fetchAppliedJobs();
      fetchJobs();

    } catch (err) {
      showErrorToast(err.response?.data?.message || "Application failed. Please try again.");
    }
  };


  const hasApplied = (jobId) => appliedJobs.some((j) => j.JobID === jobId);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.Position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.Location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation = filters.location
      ? job.Location.toLowerCase().includes(filters.location.toLowerCase())
      : true;

    const matchesExperience = filters.experience
      ? job.ExperienceLevel === filters.experience
      : true;

    const matchesSalary =
      (!filters.salaryMin || Number(job.SalaryMin) >= Number(filters.salaryMin)) &&
      (!filters.salaryMax || Number(job.SalaryMax) <= Number(filters.salaryMax));

    return matchesSearch && matchesLocation && matchesExperience && matchesSalary;
  });

  const availableJobs = filteredJobs.filter((job) => !hasApplied(job.JobID));

  const onPhoneChange = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    setApplyForm((prev) => ({ ...prev, PhoneNumber: digits }));
  };

  const onFileChange = (file) => {

    if (!file) {
      setApplyForm((prev) => ({
        ...prev,
        ResumeFile: null,
        ResumeFileName: "",
      }));
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showErrorToast("File size too large! Maximum allowed is 5MB.");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      showErrorToast("Only PDF, DOC or DOCX files are allowed for resume.");
      return;
    }

    setApplyForm((prev) => ({
      ...prev,
      ResumeFile: file,
      ResumeFileName: file.name,
    }));

  };


  return (
    <div className="min-h-screen bg-linear-to-br from-sky-100 via-blue-100 to-indigo-200 p-10 relative overflow-hidden">
      <div className="absolute top-6 right-8 z-50" ref={dropdownRef}>
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowDropdown((prev) => !prev)}
          className="bg-blue-700 text-white w-14 h-14 flex items-center justify-center rounded-full font-bold text-xl shadow-lg cursor-pointer hover:bg-blue-800 transition-all duration-300"
        >
          {initials}
        </motion.button>

        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-3 w-40 bg-white/90 backdrop-blur-md shadow-xl rounded-xl py-2 border border-gray-100"
            >
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/signin";
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
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
        💫 Employee Dashboard
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
          <h2 className="text-3xl font-bold text-blue-700">{jobs.length}</h2>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          animate={{ scale: [1, 1.03, 1], transition: { duration: 2, repeat: Infinity, delay: 0.2 } }}
          className="bg-white/40 backdrop-blur-lg rounded-2xl shadow-lg p-6 text-center"
        >
          <p className="text-gray-700 text-sm">Applied Jobs</p>
          <h2 className="text-3xl font-bold text-green-600">{appliedJobs.length}</h2>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          animate={{ scale: [1, 1.03, 1], transition: { duration: 2, repeat: Infinity, delay: 0.4 } }}
          className="bg-white/40 backdrop-blur-lg rounded-2xl shadow-lg p-6 text-center"
        >
          <p className="text-gray-700 text-sm">Available Jobs</p>
          <h2 className="text-3xl font-bold text-purple-600">{availableJobs.length}</h2>
        </motion.div>
      </motion.div>

      <div className="flex justify-center mb-8">
        {["available", "applied"].map((tab) => (
          <motion.button
            key={tab}
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-full mx-2 text-lg font-semibold shadow-md transition-all duration-300 ${activeTab === tab
              ? "bg-blue-600 text-white"
              : "bg-white/70 backdrop-blur-md text-blue-700 hover:bg-blue-100"
              }`}
          >
            {tab === "available" ? "📂 Available Jobs" : "📝 My Applications"}
          </motion.button>
        ))}
      </div>

      {activeTab === "available" && (
        <>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-8">
            <input
              type="text"
              placeholder="🔍 Search jobs or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-5 py-3 w-full md:w-1/2 rounded-full bg-white/70 backdrop-blur-md shadow-md outline-none border border-gray-200 focus:ring-2 focus:ring-blue-400"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters((prev) => !prev)}
              className="px-5 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
            >
              ⚙️ Filters
            </motion.button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white/70 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-lg p-6 max-w-4xl mx-auto mb-10 grid grid-cols-1 md:grid-cols-4 gap-4"
              >
                <input
                  type="text"
                  placeholder="🌍 Location"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 outline-none"
                />
                <select
                  value={filters.experience}
                  onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                  className="p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 outline-none"
                >
                  <option value="">Experience</option>
                  <option value="Entry">Entry</option>
                  <option value="Mid">Mid</option>
                  <option value="Senior">Senior</option>
                </select>
                <input
                  type="number"
                  placeholder="💰 Min Salary"
                  value={filters.salaryMin}
                  onChange={(e) => setFilters({ ...filters, salaryMin: e.target.value })}
                  className="p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 outline-none"
                />
                <input
                  type="number"
                  placeholder="💰 Max Salary"
                  value={filters.salaryMax}
                  onChange={(e) => setFilters({ ...filters, salaryMax: e.target.value })}
                  className="p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 outline-none"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white/30 backdrop-blur-md p-6 rounded-2xl h-48"></div>
          ))
        ) : (
          (activeTab === "available" ? availableJobs : appliedJobs).map((job) => (
            <motion.div
              key={job.JobID}
              whileHover={{ scale: 1.03 }}
              className="bg-white/60 backdrop-blur-md border border-white/40 shadow-lg rounded-2xl p-6 hover:shadow-2xl transition"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">{job.Position}</h3>
              <p className="text-sm text-gray-600 mb-2">{job.Location}</p>
              <p className="text-sm text-blue-700 font-medium mb-3">
                {job.EmploymentType} | {job.ExperienceLevel}
              </p>
              <p className="text-gray-700 font-semibold mb-2">
                💰 {job.SalaryMin} - {job.SalaryMax}
              </p>

              {activeTab === "available" ? (
                <button
                  onClick={() => {
                    setSelectedJobId(job.JobID);
                    setShowApplyModal(true);
                  }}
                  disabled={hasApplied(job.JobID)}
                  className={`px-4 py-2 rounded-lg font-medium shadow-md transition ${hasApplied(job.JobID)
                    ? "bg-green-600/80 text-white cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                >
                  {hasApplied(job.JobID) ? "Applied" : "Apply Now 🚀"}
                </button>
              ) : (
                <div className="mt-4 space-y-2">

                  <p className="text-sm font-semibold">
                    Current Status:{" "}
                    <span
                      className={
                        job.Status === "Pending"
                          ? "text-yellow-600"
                          : job.Status === "Reviewed"
                            ? "text-blue-600"
                            : job.Status === "Shortlisted"
                              ? "text-purple-600"
                              : job.Status === "Hired"
                                ? "text-green-600"
                                : "text-red-600"
                      }
                    >
                      {job.Status}
                    </span>
                  </p>

                  <div className="flex justify-between items-center">
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded-md"
                      onClick={() => {
                        setSelectedApplication(job);
                        setShowApplicationModal(true);
                      }}
                    >
                      View
                    </button>

                    <button
                      onClick={() => handleWithdraw(job.ApplicationID)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md"
                    >
                      Delete Application
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </motion.div>

      <AnimatePresence>
        {showApplyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-50"
          >
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-[94%] max-w-xl">
              <h2 className="text-2xl font-bold mb-3 text-blue-700">Apply for Job</h2>

              <div className="space-y-3">
                <input
                  placeholder="Full Name"
                  value={applyForm.FullName}
                  onChange={(e) => setApplyForm({ ...applyForm, FullName: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                />

                <input
                  placeholder="Email"
                  type="email"
                  value={applyForm.Email}
                  onChange={(e) => setApplyForm({ ...applyForm, Email: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                />

                <div className="flex items-center gap-2">
                  <span className="px-3 py-3 bg-gray-100 rounded-lg border">+1</span>
                  <input
                    placeholder="Phone (10 digits)"
                    value={applyForm.PhoneNumber}
                    onChange={(e) => onPhoneChange(e.target.value)}
                    maxLength={10}
                    inputMode="numeric"
                    className="flex-1 p-3 border rounded-lg"
                  />
                </div>

                <input
                  placeholder="State"
                  value={applyForm.City}
                  onChange={(e) => setApplyForm({ ...applyForm, City: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                />

                <div>
                  <label className="block mb-1 font-medium">Upload Resume (PDF / DOC / DOCX)</label>
                  <input
                    type="file"
                    name="resume"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => onFileChange(e.target.files[0])}
                    className="w-full border p-2 rounded-lg bg-white"
                  />

                  {applyForm.ResumeFileName && (
                    <p className="mt-2 text-sm text-green-700 font-semibold">
                      Selected file: {applyForm.ResumeFileName}
                    </p>
                  )}
                </div>

                <textarea
                  placeholder="Cover Letter (optional)"
                  value={applyForm.CoverLetter}
                  onChange={(e) => setApplyForm({ ...applyForm, CoverLetter: e.target.value })}
                  className="w-full p-3 border rounded-lg h-24"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg"
                  onClick={() => {
                    setShowApplyModal(false);
                  }}
                >
                  Cancel
                </button>

                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  onClick={() => {
                    handleApply(selectedJobId);
                  }}
                >
                  Submit
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showApplicationModal && selectedApplication && (
          <motion.div
            key="applicationModal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-md flex justify-center items-center z-50"
            onClick={() => {
              setShowApplicationModal(false);
              setSelectedApplication(null);
            }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-2xl shadow-xl w-[90%] max-w-md"
            >
              <h2 className="text-2xl font-bold mb-4 text-blue-700">
                Application Details
              </h2>

              <p><b>Full Name:</b> {selectedApplication.FullName}</p>
              <p><b>Email:</b> {selectedApplication.Email}</p>
              <p><b>Phone:</b> {selectedApplication.PhoneNumber}</p>
              <p><b>City:</b> {selectedApplication.City}</p>

              <div className="mt-4 p-4 border rounded-xl bg-gray-50 flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-3xl">
                  📄
                </div>

                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-700">
                    Resume File
                  </p>

                  <div className="flex gap-4 mt-2">
                    <a
                      href={selectedApplication.ResumeURL}
                      target="_blank"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                      View
                    </a>

                    <a
                      href={`/download?url=${encodeURIComponent(selectedApplication.ResumeURL)}`}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg"
                    >
                      Download
                    </a>

                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
                  onClick={() => {
                    setShowApplicationModal(false);
                    setSelectedApplication(null);
                  }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="text-center text-gray-500 text-xs mt-6">
        © 2025 Job portal . All rights reserved. (Elmhurst University - Group-04)
      </p>

    </div>
  );
}
