import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { showSuccessToast, showErrorToast } from "../utils/toastService";
import API from "../api/api";
import { FaEye, FaEyeSlash, FaBriefcase, FaUserTie, FaRocket } from "react-icons/fa";

export default function SignUp() {
    const [role, setRole] = useState("employee");
    const [name, setName] = useState("");
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
            const endpoint =
                role === "employee"
                    ? "/users/register/employee"
                    : "/users/register/employer";

            const res = await API.post(endpoint, {
                name,
                email,
                password,
            });

            showSuccessToast("Account created successfully! Please sign in.");
            navigate("/signin");

        } catch (err) {
            console.error(err);
            const message = err.response?.data?.message || "Registration failed";

            setError(message);
            showErrorToast(message);

        } finally {
            setLoading(false);
        }
    };

    const roleConfig = {
        employee: { icon: FaBriefcase, color: "from-blue-600 to-indigo-600", label: "Employee" },
        employer: { icon: FaUserTie, color: "from-purple-600 to-pink-600", label: "Employer" }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
            <div className="absolute inset-0 bg-grid-slate-200 opacity-20 pointer-events-none"></div>
            
            <div className="bg-white shadow-2xl rounded-3xl flex flex-col lg:flex-row overflow-hidden w-full max-w-6xl relative z-10 border border-gray-100">

                {/* Left Panel - Enhanced */}
                <div className="lg:w-2/5 bg-linear-to-br from-indigo-600 via-purple-600 to-pink-700 flex flex-col justify-between p-12 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
                    
                    <div className="relative z-10">
                        <div className="inline-block p-3 bg-white/20 rounded-2xl backdrop-blur-sm mb-6">
                            <FaRocket className="text-4xl" />
                        </div>
                        <h2 className="text-4xl font-bold mb-4 leading-tight">Start Your Career Success Story</h2>
                        <p className="text-purple-100 text-lg leading-relaxed">
                            Join thousands of professionals finding their dream jobs or hiring top talent on our platform.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3 text-purple-100">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                <span className="text-xl">🎯</span>
                            </div>
                            <p className="text-sm">Access exclusive job opportunities</p>
                        </div>
                        <div className="flex items-center gap-3 text-purple-100">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                <span className="text-xl">🚀</span>
                            </div>
                            <p className="text-sm">Build your professional profile</p>
                        </div>
                        <div className="flex items-center gap-3 text-purple-100">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                <span className="text-xl">💼</span>
                            </div>
                            <p className="text-sm">Connect with industry leaders</p>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="lg:w-3/5 p-12 flex flex-col justify-center bg-white">
                    <div className="max-w-md mx-auto w-full">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
                        <p className="text-gray-500 mb-8">Sign up to unlock your career potential</p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    required
                                    className="w-full border-2 border-gray-200 rounded-xl p-4 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full border-2 border-gray-200 rounded-xl p-4 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
                                />
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create a strong password"
                                    required
                                    className="w-full border-2 border-gray-200 rounded-xl p-4 pr-12 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-200"
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
                                <label className="block text-sm font-semibold text-gray-700 mb-3">I want to register as:</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {Object.entries(roleConfig).map(([r, config]) => {
                                        const Icon = config.icon;
                                        return (
                                            <button
                                                key={r}
                                                type="button"
                                                className={`relative p-5 rounded-xl border-2 transition-all duration-200 ${
                                                    role === r
                                                        ? "border-indigo-500 bg-indigo-50 shadow-md scale-105"
                                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                }`}
                                                onClick={() => setRole(r)}
                                            >
                                                <div className={`w-12 h-12 mx-auto mb-3 rounded-lg bg-linear-to-br ${config.color} flex items-center justify-center text-white`}>
                                                    <Icon className="text-xl" />
                                                </div>
                                                <p className={`text-sm font-semibold ${role === r ? "text-indigo-600" : "text-gray-600"}`}>
                                                    {config.label}
                                                </p>
                                                {role === r && (
                                                    <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
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
                                className={`w-full py-4 rounded-xl font-semibold text-white text-lg transition-all duration-300 shadow-lg ${
                                    loading
                                        ? "bg-gray-300 cursor-not-allowed"
                                        : "bg-linear-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl transform hover:-translate-y-0.5"
                                }`}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Creating Account...
                                    </div>
                                ) : (
                                    "Create Account"
                                )}
                            </button>

                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                                    <p className="text-red-700 text-sm font-medium">{error}</p>
                                </div>
                            )}

                            <div className="text-center pt-4 border-t border-gray-200">
                                <p className="text-gray-600">
                                    Already have an account?{" "}
                                    <Link to="/signin" className="text-indigo-600 font-semibold hover:text-indigo-700 transition">
                                        Sign In
                                    </Link>
                                </p>
                            </div>
                            <p className="text-center text-gray-500 text-xs mt-6">
                            © 2025 Job portal . All rights reserved. (Elmhurst University - Group-04)
                        </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}