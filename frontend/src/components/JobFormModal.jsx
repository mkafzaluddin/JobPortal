import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { showSuccessToast, showErrorToast } from "../utils/toastService.jsx";
import API from "../api/api.js";

export default function JobFormModal({ job, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    position: "",
    description: "",
    location: "",
    employmentType: "Full-time",
    experienceLevel: "Entry",
    salaryMin: "",
    salaryMax: "",
    openingDate: "",
    closingDate: "",
    skillsRequired: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (job) {
      setFormData({
        position: job.Position || "",
        description: job.Description || "",
        location: job.Location || "",
        employmentType: job.EmploymentType || "Full-time",
        experienceLevel: job.ExperienceLevel || "Entry",
        salaryMin: job.SalaryMin || "",
        salaryMax: job.SalaryMax || "",
        openingDate: job.OpeningDate?.split("T")[0] || "",
        closingDate: job.ClosingDate?.split("T")[0] || "",
        skillsRequired: job.SkillsRequired || "",
      });
    }
  }, [job]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.openingDate && formData.closingDate) {
      const open = new Date(formData.openingDate);
      const close = new Date(formData.closingDate);
      if (close < open) {
        showErrorToast("Closing date cannot be before opening date!");
        return;
      }
    }

    if (formData.salaryMin && formData.salaryMax) {
      const min = Number(formData.salaryMin);
      const max = Number(formData.salaryMax);
      if (min >= max) {
        showErrorToast("Maximum salary must be greater than minimum salary!");
        return;
      }
    }

    const payload = {
      position: formData.position,
      description: formData.description,
      location: formData.location,
      employmentType: formData.employmentType,
      experienceLevel: formData.experienceLevel,
      salaryMin: formData.salaryMin,
      salaryMax: formData.salaryMax,
      openingDate: formData.openingDate,
      closingDate: formData.closingDate,
      skillsRequired: formData.skillsRequired,
    };

    const url = job
      ? `/employer/jobs/${job.JobID}`
      : `/employer/create-job`;
    const method = job ? "put" : "post";

    try {
      await API[method](url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showSuccessToast(job ? "Job updated successfully!" : "🎉 Job created successfully!");
      onSaved();
      onClose();
    } catch (err) {
      console.error("Job save error:", err);
      showErrorToast(err.response?.data?.message || "Error saving job");
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        transition={{ type: "spring", damping: 15 }}
        className="bg-white/90 backdrop-blur-lg p-6 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {job ? "✏️ Edit Job" : "🚀 Create Job"}
        </h2>

        <form className="grid grid-cols-2 gap-4" onSubmit={handleSubmit}>
          <div className="col-span-2">
            <label className="block text-gray-700 font-medium mb-1">
              Position
            </label>
            <input
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="e.g. Software Engineer"
              className="border rounded-lg p-2 w-full"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Location
            </label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. California"
              className="border rounded-lg p-2 w-full"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Employment Type
            </label>
            <select
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              className="border rounded-lg p-2 w-full"
            >
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Experience Level
            </label>
            <select
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              className="border rounded-lg p-2 w-full"
            >
              <option>Entry</option>
              <option>Mid</option>
              <option>Senior</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Minimum Salary
            </label>
            <input
              type="number"
              name="salaryMin"
              value={formData.salaryMin}
              onChange={handleChange}
              placeholder="e.g. 30000"
              className="border rounded-lg p-2 w-full"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Maximum Salary
            </label>
            <input
              type="number"
              name="salaryMax"
              value={formData.salaryMax}
              onChange={handleChange}
              placeholder="e.g. 50000"
              className="border rounded-lg p-2 w-full"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Opening Date
            </label>
            <input
              type="date"
              name="openingDate"
              value={formData.openingDate}
              onChange={handleChange}
              className="border rounded-lg p-2 w-full"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Closing Date
            </label>
            <input
              type="date"
              name="closingDate"
              value={formData.closingDate}
              onChange={handleChange}
              className="border rounded-lg p-2 w-full"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-gray-700 font-medium mb-1">
              Job Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the job responsibilities and requirements..."
              rows="3"
              className="border rounded-lg p-2 w-full"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-gray-700 font-medium mb-1">
              Skills Required
            </label>
            <textarea
              name="skillsRequired"
              value={formData.skillsRequired}
              onChange={handleChange}
              placeholder="e.g. React, Node.js, SQL"
              className="border rounded-lg p-2 w-full"
            />
          </div>

          <div className="col-span-2 flex justify-end gap-3 mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {job ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
