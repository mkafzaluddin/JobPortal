import { FaEye, FaEyeSlash, FaBriefcase, FaUserTie, FaUserShield } from "react-icons/fa";
import { showSuccessToast, showErrorToast } from "../utils/toastService";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";

export default function SignIn() {
    const [role, setRole] = useState("employee");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;
        if (!emailRegex.test(email)) {
            setLoading(false);
            setError("Please enter a valid email ending with .com");
            showErrorToast("Invalid email format!");
            return;
        }

        try {
            let endpoint = "";
            if (role === "employee") endpoint = "/users/login/employee";
            else if (role === "employer") endpoint = "/users/login/employer";
            else if (role === "admin") endpoint = "/users/login/admin";

            const res = await API.post(endpoint, { email, password });

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            localStorage.setItem("role", role);

            showSuccessToast("Login successful!");

            if (role === "admin") navigate("/admin/dashboard");
            else if (role === "employer") navigate("/employer/dashboard");
            else navigate("/employee/dashboard");

        } catch (err) {
            console.error(err);
            const message = err.response?.data?.message || "Invalid credentials";
            setError(message);
            showErrorToast(message);
        } finally {
            setLoading(false);
        }
    };

    const roleConfig = {
        employee: { icon: FaBriefcase, color: "from-blue-600 to-indigo-600", label: "Employee" },
        employer: { icon: FaUserTie, color: "from-purple-600 to-pink-600", label: "Employer" },
        admin: { icon: FaUserShield, color: "from-gray-700 to-gray-900", label: "Admin" }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
            <div className="absolute inset-0 bg-grid-slate-200 opacity-20 pointer-events-none"></div>

            <div className="bg-white shadow-2xl rounded-3xl flex flex-col lg:flex-row overflow-hidden w-full max-w-6xl relative z-10 border border-gray-100">

                {/* Left Panel - Enhanced */}
                <div className="lg:w-2/5 bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 flex flex-col justify-between p-12 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>

                    <div className="relative z-10">
                        <div className="inline-block p-3 bg-white/20 rounded-2xl backdrop-blur-sm mb-6">
                            <FaBriefcase className="text-4xl" />
                        </div>
                        <h2 className="text-4xl font-bold mb-4 leading-tight">Welcome Back to Your Career Journey</h2>
                        <p className="text-blue-100 text-lg leading-relaxed">
                            Sign in to access thousands of opportunities, manage your applications, or post new positions.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3 text-blue-100">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                <span className="text-xl">✓</span>
                            </div>
                            <p className="text-sm">Personalized job recommendations</p>
                        </div>
                        <div className="flex items-center gap-3 text-blue-100">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                <span className="text-xl">✓</span>
                            </div>
                            <p className="text-sm">Track your applications in real-time</p>
                        </div>
                        <div className="flex items-center gap-3 text-blue-100">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                <span className="text-xl">✓</span>
                            </div>
                            <p className="text-sm">Connect with top employers</p>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="lg:w-3/5 p-12 flex flex-col justify-center bg-white">
                    <div className="max-w-md mx-auto w-full">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign In</h2>
                        <p className="text-gray-500 mb-8">Enter your credentials to access your account</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full border-2 border-gray-200 rounded-xl p-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200"
                                />
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    className="w-full border-2 border-gray-200 rounded-xl p-4 pr-12 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-11 text-gray-400 hover:text-gray-600 transition"
                                >
                                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Select Your Role</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {Object.entries(roleConfig).map(([r, config]) => {
                                        const Icon = config.icon;
                                        return (
                                            <button
                                                key={r}
                                                type="button"
                                                className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${role === r
                                                        ? "border-blue-500 bg-blue-50 shadow-md scale-105"
                                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                    }`}
                                                onClick={() => setRole(r)}
                                            >
                                                <div className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-linear-to-br ${config.color} flex items-center justify-center text-white`}>
                                                    <Icon className="text-lg" />
                                                </div>
                                                <p className={`text-xs font-semibold ${role === r ? "text-blue-600" : "text-gray-600"}`}>
                                                    {config.label}
                                                </p>
                                                {role === r && (
                                                    <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-xs">✓</span>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 rounded-xl font-semibold text-white text-lg transition-all duration-300 shadow-lg ${loading
                                        ? "bg-gray-300 cursor-not-allowed"
                                        : "bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5"
                                    }`}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Signing In...
                                    </div>
                                ) : (
                                    "Sign In"
                                )}
                            </button>

                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                                    <p className="text-red-700 text-sm font-medium">{error}</p>
                                </div>
                            )}

                            <div className="text-center pt-4 border-t border-gray-200">
                                <p className="text-gray-600">
                                    Don't have an account?{" "}
                                    <Link to="/signup" className="text-blue-600 font-semibold hover:text-blue-700 transition">
                                        Create Account
                                    </Link>
                                </p>
                            </div>
                        </form>
                      <p className="text-center text-gray-500 text-xs mt-6">
                            © 2025 Job portal . All rights reserved. (Elmhurst University - Group-04)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

}