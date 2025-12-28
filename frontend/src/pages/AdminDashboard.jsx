import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

import { showSuccessToast, showErrorToast } from "../utils/toastService.jsx";
import API from "../api/api.js";



export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("overview");

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalEmployers: 0,
        totalEmployees: 0,
        totalJobs: 0,
        totalApplications: 0,
        jobsOpen: 0,
        jobsClosed: 0,
    });

    const [employers, setEmployers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [newestJobs, setNewestJobs] = useState([]);
    const [recentApplications, setRecentApplications] = useState([]);

    const [loading, setLoading] = useState(false);
    const [tabLoading, setTabLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [selectedApp, setSelectedApp] = useState(null);
    const [showAppModal, setShowAppModal] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);

    const user = JSON.parse(localStorage.getItem("user") || '{"name":"Admin","email":"admin@example.com"}');
    const initials = user?.name ? user.name.charAt(0).toUpperCase() : "A";

    const STATUS_OPTIONS = ["Pending", "Reviewed", "Shortlisted", "Rejected", "Hired"];

    const statusDistribution = useMemo(() => {
        const statusCount = applications.reduce((acc, app) => {
            acc[app.Status] = (acc[app.Status] || 0) + 1;
            return acc;
        }, {});

        const colors = {
            Pending: "#3b82f6",
            Reviewed: "#8b5cf6",
            Shortlisted: "#10b981",
            Rejected: "#ef4444",
            Hired: "#f59e0b",
        };

        return Object.entries(statusCount).map(([name, value]) => ({
            name,
            value,
            color: colors[name] || "#6b7280",
        }));
    }, [applications]);

    const applicationTrend = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const trend = {};

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayName = days[date.getDay()];
            trend[dayName] = { applications: 0, hired: 0 };
        }

        applications.forEach(app => {
            const date = new Date(app.AppliedAt);
            const dayName = days[date.getDay()];
            if (trend[dayName]) {
                trend[dayName].applications++;
                if (app.Status === 'Hired') {
                    trend[dayName].hired++;
                }
            }
        });

        return Object.entries(trend).map(([name, data]) => ({
            name,
            ...data,
        }));
    }, [applications]);

    const jobCategories = useMemo(() => {
        const categories = {};

        jobs.forEach(job => {
            const position = job.Position?.toLowerCase() || '';
            let category = 'Other';

            if (position.includes('developer') || position.includes('engineer') || position.includes('tech')) {
                category = 'Tech';
            } else if (position.includes('market')) {
                category = 'Marketing';
            } else if (position.includes('sales')) {
                category = 'Sales';
            } else if (position.includes('design')) {
                category = 'Design';
            } else if (position.includes('hr') || position.includes('human')) {
                category = 'HR';
            } else if (position.includes('finance') || position.includes('account')) {
                category = 'Finance';
            }

            categories[category] = (categories[category] || 0) + 1;
        });

        return Object.entries(categories)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);
    }, [jobs]);

    const userGrowth = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const growth = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthName = months[date.getMonth()];

            const employersCount = employers.filter(e => {
                const createdDate = new Date(e.CreatedAt);
                return createdDate.getMonth() === date.getMonth() &&
                    createdDate.getFullYear() === date.getFullYear();
            }).length;

            const employeesCount = employees.filter(e => {
                const createdDate = new Date(e.CreatedAt);
                return createdDate.getMonth() === date.getMonth() &&
                    createdDate.getFullYear() === date.getFullYear();
            }).length;

            growth.push({
                month: monthName,
                employers: employersCount,
                employees: employeesCount,
            });
        }

        return growth;
    }, [employers, employees]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const { data } = await API.get("/admin/stats");
            setStats(data);
        } catch (err) {
            showErrorToast(err.message || "Failed to fetch admin stats");
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployers = async () => {
        setTabLoading(true);
        try {
            const { data } = await API.get("/admin/employers");
            setEmployers(data || []);
        } catch (err) {
            showErrorToast("Failed to fetch employers");
        } finally {
            setTabLoading(false);
        }
    };

    const fetchEmployees = async () => {
        setTabLoading(true);
        try {
            const { data } = await API.get("/admin/employees");
            setEmployees(data || []);
        } catch (err) {
            showErrorToast("Failed to fetch employees");
        } finally {
            setTabLoading(false);
        }
    };

    const fetchJobs = async () => {
        setTabLoading(true);
        try {
            const { data } = await API.get("/admin/jobs");
            setJobs(data || []);
        } catch (err) {
            showErrorToast("Failed to fetch jobs");
        } finally {
            setTabLoading(false);
        }
    };

    const fetchApplications = async () => {
        setTabLoading(true);
        try {
            const { data } = await API.get("/admin/applications");
            setApplications(data || []);
        } catch (err) {
            showErrorToast("Failed to fetch applications");
        } finally {
            setTabLoading(false);
        }
    };

    const fetchNewestJobs = async () => {
        try {
            const { data } = await API.get("/admin/newest-jobs");
            setNewestJobs(data || []);
        } catch (err) {
            console.error("Failed to load newest jobs");
        }
    };

    const fetchRecentApplications = async () => {
        try {
            const { data } = await API.get("/admin/recent-applications");
            setRecentApplications(data || []);
        } catch (err) {
            console.error("Failed to load recent applications");
        }
    };

    useEffect(() => {
        fetchStats();
        fetchEmployers();
        fetchEmployees();
        fetchJobs();
        fetchApplications();
        fetchNewestJobs();
        fetchRecentApplications();
    }, []);

    useEffect(() => {
        if (activeTab === "employers") fetchEmployers();
        if (activeTab === "employees") fetchEmployees();
        if (activeTab === "jobs") fetchJobs();
        if (activeTab === "applications") fetchApplications();
        if (activeTab === "overview") {
            fetchStats();
            fetchNewestJobs();
            fetchRecentApplications();
        }
    }, [activeTab]);

    const updateApplicationStatus = async (applicationId, newStatus) => {
        try {
            await API.put(
                `/admin/applications/${applicationId}/status`,
                { Status: newStatus },
            );
            showSuccessToast("Status updated successfully");
            fetchApplications();
            fetchStats();
        } catch (err) {
            showErrorToast(err.message || "Failed to change status");
        }
    };

    const openAppModal = (app) => {
        setSelectedApp(app);
        setShowAppModal(true);
    };

    const handleViewResume = (resumeUrl) => {
        const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(resumeUrl)}&embedded=true`;
        window.open(viewerUrl, '_blank');
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/signin";
    };

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return { employers, employees, jobs, applications };

        return {
            employers: employers.filter((e) => (e.FullName || e.Email || "").toLowerCase().includes(q)),
            employees: employees.filter((e) => (e.FullName || e.Email || "").toLowerCase().includes(q)),
            jobs: jobs.filter((j) => (j.Position || j.Location || "").toLowerCase().includes(q)),
            applications: applications.filter(
                (a) =>
                    (a.FullName || "").toLowerCase().includes(q) ||
                    (a.Email || "").toLowerCase().includes(q) ||
                    (a.Position || "").toLowerCase().includes(q)
            ),
        };
    }, [search, employers, employees, jobs, applications]);

    return (
        <div className="min-h-screen bg-linear-to-br from-sky-50 via-blue-50 to-indigo-100 p-6 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360],
                        opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute -top-40 -right-40 w-96 h-96 bg-blue-300 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [360, 180, 0],
                        opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-300 rounded-full blur-3xl"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 flex justify-between items-center mb-8"
            >
                <div className="text-center w-full">
                    <h1 className="text-5xl font-black text-gray-900 drop-shadow-sm mb-5">
                        🚀 ADMIN COMMAND CENTER
                    </h1>
                    <p className="text-gray-800 text-lg font-medium mb-6">
                        Real-time analytics & insights
                    </p>
                </div>
                <div className="relative">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                        className="w-16 h-16 bg-linear-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg cursor-pointer"
                        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    >
                        {initials}
                    </motion.div>

                    <AnimatePresence>
                        {showProfileDropdown && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                            >
                                <motion.button
                                    whileHover={{ backgroundColor: "#eff6ff", color: "#1d4ed8" }}
                                    onClick={handleLogout}
                                    className="w-full px-4 py-3 text-left text-black-600 font-medium text-sm hover:bg-red-50 transition flex items-center gap-2"
                                >
                                    <span>🚪</span> Sign Out
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { label: "Total Users", value: stats.totalUsers, icon: "👥", color: "from-blue-500 to-cyan-500", delay: 0 },
                    { label: "Total Jobs", value: stats.totalJobs, icon: "💼", color: "from-purple-500 to-pink-500", delay: 0.1 },
                    { label: "Applications", value: stats.totalApplications, icon: "📝", color: "from-green-500 to-emerald-500", delay: 0.2 },
                    { label: "Open Jobs", value: stats.jobsOpen, icon: "🔥", color: "from-orange-500 to-red-500", delay: 0.3 },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        transition={{ delay: stat.delay, type: "spring", stiffness: 200 }}
                        whileHover={{ scale: 1.05, rotateY: 10 }}
                        className={`bg-linear-to-br ${stat.color} p-6 rounded-3xl shadow-xl relative overflow-hidden`}
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute -right-8 -top-8 text-8xl opacity-20"
                        >
                            {stat.icon}
                        </motion.div>
                        <div className="relative z-10">
                            <p className="text-white text-sm font-semibold mb-2">{stat.label}</p>
                            <motion.h2
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: stat.delay + 0.2, type: "spring" }}
                                className="text-5xl font-black text-white"
                            >
                                {stat.value}
                            </motion.h2>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="relative z-10 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        {["overview", "employers", "employees", "jobs", "applications"].map((t) => (
                            <motion.button
                                key={t}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTab(t)}
                                className={`px-5 py-2 rounded-full font-semibold shadow-lg transition ${activeTab === t
                                    ? "bg-white text-indigo-900 scale-105"
                                    : "bg-white/70 text-gray-800 hover:bg-white/90 backdrop-blur-sm"
                                    }`}
                            >
                                {t === "overview" ? "📊 Overview" :
                                    t === "employers" ? "🏢 Employers" :
                                        t === "employees" ? "👤 Employees" :
                                            t === "jobs" ? "📂 Jobs" : "📄 Applications"}
                            </motion.button>
                        ))}
                    </div>

                    {activeTab !== "overview" && (
                        <div className="flex items-center gap-3">
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="🔍 Search..."
                                className="px-4 py-2 rounded-full border-none shadow-lg w-64 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSearch("")}
                                className="px-4 py-2 bg-white text-gray-900 rounded-full shadow-lg font-medium hover:bg-gray-50"
                            >
                                Clear
                            </motion.button>
                        </div>
                    )}

                </div>
            </div>

            <div className="relative z-10">
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-gray-200"
                            >
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">📈 Application Trend (Last 7 Days)</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={applicationTrend}>
                                        <defs>
                                            <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorHired" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                                        <XAxis dataKey="name" stroke="#111827" style={{ fontSize: '13px', fontWeight: 600 }} />
                                        <YAxis stroke="#111827" style={{ fontSize: '13px', fontWeight: 600 }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#ffffff',
                                                border: '2px solid #e5e7eb',
                                                borderRadius: '12px',
                                                color: '#111827',
                                                fontWeight: 600,
                                                padding: '12px',
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                            }}
                                            labelStyle={{ color: '#111827', fontWeight: 700, marginBottom: '4px' }}
                                            itemStyle={{ color: '#374151', fontWeight: 600 }}
                                        />
                                        <Legend wrapperStyle={{ color: '#111827', fontWeight: 600 }} />
                                        <Area type="monotone" dataKey="applications" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorApps)" name="Applications" strokeWidth={2} />
                                        <Area type="monotone" dataKey="hired" stroke="#10b981" fillOpacity={1} fill="url(#colorHired)" name="Hired" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-gray-200"
                            >
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">🥧 Application Status Distribution</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={statusDistribution}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            dataKey="value"
                                        >
                                            {statusDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>

                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#ffffff',
                                                border: '2px solid #e5e7eb',
                                                borderRadius: '12px',
                                                color: '#111827',
                                                fontWeight: 600,
                                                padding: '12px',
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                            }}
                                            itemStyle={{ color: '#374151', fontWeight: 600 }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-gray-200"
                            >
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">📊 Top Job Categories</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={jobCategories}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                                        <XAxis dataKey="category" stroke="#111827" style={{ fontSize: '13px', fontWeight: 600 }} />
                                        <YAxis stroke="#111827" style={{ fontSize: '13px', fontWeight: 600 }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#ffffff',
                                                border: '2px solid #e5e7eb',
                                                borderRadius: '12px',
                                                color: '#111827',
                                                fontWeight: 600,
                                                padding: '12px',
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                            }}
                                            labelStyle={{ color: '#111827', fontWeight: 700, marginBottom: '4px' }}
                                            itemStyle={{ color: '#374151', fontWeight: 600 }}
                                        />
                                        <Bar dataKey="count" fill="#f59e0b" radius={[10, 10, 0, 0]} animationDuration={1000}>
                                            {jobCategories.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-gray-200"
                            >
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">📈 User Growth (Last 6 Months)</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={userGrowth}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                                        <XAxis dataKey="month" stroke="#111827" style={{ fontSize: '13px', fontWeight: 600 }} />
                                        <YAxis stroke="#111827" style={{ fontSize: '13px', fontWeight: 600 }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#ffffff',
                                                border: '2px solid #e5e7eb',
                                                borderRadius: '12px',
                                                color: '#111827',
                                                fontWeight: 600,
                                                padding: '12px',
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                            }}
                                            labelStyle={{ color: '#111827', fontWeight: 700, marginBottom: '4px' }}
                                            itemStyle={{ color: '#374151', fontWeight: 600 }}
                                        />
                                        <Legend wrapperStyle={{ color: '#111827', fontWeight: 600 }} />
                                        <Line type="monotone" dataKey="employers" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6, fill: '#3b82f6' }} animationDuration={1500} name="Employers" />
                                        <Line type="monotone" dataKey="employees" stroke="#10b981" strokeWidth={3} dot={{ r: 6, fill: '#10b981' }} animationDuration={1500} name="Employees" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </motion.div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.8 }}
                                className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-gray-200"
                            >
                                <h3 className="text-xl font-bold text-gray-900 mb-4">🆕 Newest Jobs</h3>
                                <ul className="space-y-2 max-h-40 overflow-auto">
                                    {newestJobs.map((job) => (
                                        <li key={job.JobID} className="text-gray-800 text-sm">
                                            <strong className="text-gray-900">{job.Position}</strong> - <span className="text-gray-700">{job.Location}</span>
                                        </li>
                                    ))}
                                    {newestJobs.length === 0 && <li className="text-gray-600">No jobs yet</li>}
                                </ul>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.9 }}
                                className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-gray-200"
                            >
                                <h3 className="text-xl font-bold text-gray-900 mb-4">📝 Recent Applications</h3>
                                <ul className="space-y-2 max-h-40 overflow-auto">
                                    {recentApplications.map((a) => (
                                        <li key={a.ApplicationID} className="text-gray-800 text-sm">
                                            <strong className="text-gray-900">{a.FullName}</strong> → <span className="text-gray-700">{a.Position}</span>
                                        </li>
                                    ))}
                                    {recentApplications.length === 0 && <li className="text-gray-600">No applications yet</li>}
                                </ul>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1.0 }}
                                className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-gray-200"
                            >
                                <h3 className="text-xl font-bold text-gray-900 mb-4">⚡ Quick Actions</h3>
                                <div className="space-y-3">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setActiveTab("applications")}
                                        className="w-full px-4 py-3 rounded-xl bg-linear-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg"
                                    >
                                        📄 Review Applications
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setActiveTab("employers")}
                                        className="w-full px-4 py-3 rounded-xl bg-linear-to-r from-green-500 to-teal-500 text-white font-semibold shadow-lg"
                                    >
                                        🏢 Manage Employers
                                    </motion.button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}

                {activeTab === "employers" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-gray-200"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">🏢 All Employers</h2>

                        {tabLoading ? (
                            <div className="text-gray-800 text-center py-8 font-medium">Loading employers...</div>
                        ) : (
                            <div className="overflow-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="text-left border-b-2 border-gray-300">
                                            <th className="py-3 px-3 text-gray-900 font-bold">#</th>
                                            <th className="py-3 px-3 text-gray-900 font-bold">Name</th>
                                            <th className="py-3 px-3 text-gray-900 font-bold">Email</th>
                                            <th className="py-3 px-3 text-gray-900 font-bold">Created</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(filtered.employers || []).map((e, idx) => (
                                            <tr key={e.UserID} className="border-b border-gray-200 hover:bg-blue-50 transition">
                                                <td className="py-3 px-3 text-gray-800 font-medium">{idx + 1}</td>
                                                <td className="py-3 px-3 font-semibold text-gray-900">{e.FullName}</td>
                                                <td className="py-3 px-3 text-gray-800">{e.Email}</td>
                                                <td className="py-3 px-3 text-gray-700">{new Date(e.CreatedAt).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        {(filtered.employers || []).length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="py-8 text-center text-gray-600 font-medium">No employers found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === "employees" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-gray-200"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">👤 All Employees</h2>

                        {tabLoading ? (
                            <div className="text-gray-800 text-center py-8 font-medium">Loading employees...</div>
                        ) : (
                            <div className="overflow-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="text-left border-b-2 border-gray-300">
                                            <th className="py-3 px-3 text-gray-900 font-bold">#</th>
                                            <th className="py-3 px-3 text-gray-900 font-bold">Name</th>
                                            <th className="py-3 px-3 text-gray-900 font-bold">Email</th>
                                            <th className="py-3 px-3 text-gray-900 font-bold">Created</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(filtered.employees || []).map((u, idx) => (
                                            <tr key={u.UserID} className="border-b border-gray-200 hover:bg-blue-50 transition">
                                                <td className="py-3 px-3 text-gray-800 font-medium">{idx + 1}</td>
                                                <td className="py-3 px-3 font-semibold text-gray-900">{u.FullName}</td>
                                                <td className="py-3 px-3 text-gray-800">{u.Email}</td>
                                                <td className="py-3 px-3 text-gray-700">{new Date(u.CreatedAt).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        {(filtered.employees || []).length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="py-8 text-center text-gray-600 font-medium">No employees found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === "jobs" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-gray-200"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">📂 All Jobs</h2>

                        {tabLoading ? (
                            <div className="text-gray-800 text-center py-8 font-medium">Loading jobs...</div>
                        ) : (
                            <div className="grid gap-4">
                                {(filtered.jobs || []).map((j) => (
                                    <motion.div
                                        key={j.JobID}
                                        whileHover={{ scale: 1.02 }}
                                        className="p-5 rounded-2xl bg-white border-2 border-gray-200 flex justify-between items-center shadow-lg"
                                    >
                                        <div>
                                            <h3 className="font-bold text-xl text-gray-900">{j.Position}</h3>
                                            <p className="text-sm text-gray-700 font-medium">{j.Location} • {j.ExperienceLevel}</p>
                                            <p className="text-sm text-gray-900 font-semibold mt-1">💰 {j.SalaryMin} - {j.SalaryMax}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-4 py-2 rounded-full text-sm font-bold ${(j.IsActive || new Date(j.ClosingDate) >= new Date())
                                                ? "bg-green-100 text-green-800 border-2 border-green-300"
                                                : "bg-red-100 text-red-800 border-2 border-red-300"
                                                }`}>
                                                {(j.IsActive || new Date(j.ClosingDate) >= new Date()) ? "✅ Open" : "❌ Closed"}
                                            </span>
                                            <div className="text-xs text-gray-700 font-medium mt-2">{new Date(j.CreatedAt).toLocaleDateString()}</div>
                                        </div>
                                    </motion.div>
                                ))}
                                {(filtered.jobs || []).length === 0 && (
                                    <p className="text-center text-gray-600 font-medium py-8">No jobs found</p>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === "applications" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-gray-200"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">📄 All Applications</h2>

                        {tabLoading ? (
                            <div className="text-gray-800 text-center py-8 font-medium">Loading applications...</div>
                        ) : (
                            <div className="grid gap-4">
                                {(filtered.applications || []).map((app) => (
                                    <motion.div
                                        key={app.ApplicationID}
                                        whileHover={{ scale: 1.01 }}
                                        className="bg-white rounded-2xl p-5 border-2 border-gray-200 flex flex-col md:flex-row justify-between gap-4 items-start shadow-lg"
                                    >
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-gray-900">
                                                {app.FullName} <span className="text-sm text-gray-600 font-normal">({app.Email})</span>
                                            </h3>
                                            <p className="text-sm text-gray-800 font-medium mt-1">
                                                Applied for: <span className="text-indigo-700 font-semibold">{app.Position}</span>
                                            </p>
                                            <p className="text-xs text-gray-600 font-medium mt-2">
                                                Applied: {new Date(app.AppliedAt).toLocaleString()}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-end gap-3">
                                            <div className="flex gap-2 items-center">
                                                <select
                                                    value={app.Status}
                                                    onChange={(e) => updateApplicationStatus(app.ApplicationID, e.target.value)}
                                                    className="px-3 py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                                >
                                                    {STATUS_OPTIONS.map((s) => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>

                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => openAppModal(app)}
                                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-lg"
                                                >
                                                    👁️ View
                                                </motion.button>
                                            </div>

                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleViewResume(app.ResumeURL)}
                                                className="text-sm text-green-700 hover:text-green-800 font-semibold"
                                            >
                                                📥 View Resume
                                            </motion.button>

                                            <p className="text-xs text-gray-600 font-medium">
                                                Updated: {app.UpdatedAt ? new Date(app.UpdatedAt).toLocaleString() : "N/A"}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}

                                {(filtered.applications || []).length === 0 && (
                                    <p className="text-center text-gray-600 font-medium py-8">No applications found</p>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            <AnimatePresence>
                {showAppModal && selectedApp && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
                        onClick={() => {
                            setShowAppModal(false);
                            setSelectedApp(null);
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-linear-to-br from-indigo-600 to-purple-700 rounded-3xl shadow-2xl p-8 w-full max-w-2xl border-2 border-white/30 max-h-[90vh] overflow-y-auto"
                        >
                            <h3 className="text-3xl font-bold text-white mb-4">{selectedApp.FullName}</h3>

                            <div className="space-y-3 mb-6">
                                <p className="text-white">
                                    <span className="font-bold text-white">📧 Email:</span> <span className="font-medium">{selectedApp.Email}</span>
                                </p>
                                <p className="text-white">
                                    <span className="font-bold text-white">📱 Phone:</span> <span className="font-medium">{selectedApp.PhoneNumber}</span>
                                </p>
                                <p className="text-white">
                                    <span className="font-bold text-white">🏙️ City:</span> <span className="font-medium">{selectedApp.City}</span>
                                </p>
                                <p className="text-white">
                                    <span className="font-bold text-white">💼 Position:</span> <span className="font-medium">{selectedApp.Position}</span>
                                </p>
                                <p className="text-white">
                                    <span className="font-bold text-white">📊 Status:</span>{" "}
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${selectedApp.Status === 'Hired' ? 'bg-green-400 text-green-900' :
                                        selectedApp.Status === 'Rejected' ? 'bg-red-400 text-red-900' :
                                            selectedApp.Status === 'Shortlisted' ? 'bg-blue-400 text-blue-900' :
                                                'bg-yellow-400 text-yellow-900'
                                        }`}>
                                        {selectedApp.Status}
                                    </span>
                                </p>
                            </div>

                            {selectedApp.CoverLetter && (
                                <div className="mb-6 p-5 bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-white/30">
                                    <strong className="block mb-3 text-white text-lg font-bold">📝 Cover Letter</strong>
                                    <p className="text-white font-medium whitespace-pre-wrap leading-relaxed">
                                        {selectedApp.CoverLetter}
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3 justify-end">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleViewResume(selectedApp.ResumeURL)}
                                    className="px-6 py-3 bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold shadow-lg"
                                >
                                    📄 View Resume
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-6 py-3 bg-white/30 backdrop-blur-sm text-white rounded-xl font-bold border-2 border-white/50"
                                    onClick={() => {
                                        setShowAppModal(false);
                                        setSelectedApp(null);
                                    }}
                                >
                                    Close
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}