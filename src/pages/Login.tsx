import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { ActivityLogger } from "../services/activityLogger";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.username.trim()) {
      toast.error(t("validation.usernameRequired"));
      return;
    }
    
    if (!formData.password) {
      toast.error(t("validation.passwordRequired"));
      return;
    }
    
    try {
      await login(formData.username, formData.password);
      await ActivityLogger.logLogin(formData.username);
      toast.success(t("login.welcome").replace("{{username}}", formData.username));
      navigate("/");
    } catch (error: unknown) {
      await ActivityLogger.logLoginAttempt(formData.username, false);
      const errorMessage = error instanceof Error && 'response' in error && 
        typeof error.response === 'object' && error.response && 
        'data' in error.response && typeof error.response.data === 'object' && 
        error.response.data && 'message' in error.response.data
        ? String((error.response.data as { message: unknown }).message)
        : t("login.failed");
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col lg:flex-row">
      {/* Left Section - Branding */}
      <div className="lg:w-1/2 bg-gradient-to-br from-white via-gray-50 to-slate-100 flex items-center justify-center p-8 lg:p-16 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-green-500 rounded-full blur-2xl"></div>
        </div>
        
        <div className="max-w-md w-full relative z-10">
          {/* Logo and Brand */}
          <div className="text-center mb-16">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/25 transform hover:scale-105 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">
              {t("app.name")}
            </h1>
            <p className="text-xl text-gray-600 font-medium">{t("auth.login.slogan")}</p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Features */}
          <div className="space-y-8">
            <div className="flex items-center gap-5 group hover:transform hover:translate-x-2 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{t("auth.login.feature1Title")}</h3>
                <p className="text-gray-600">{t("auth.login.feature1Desc")}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-5 group hover:transform hover:translate-x-2 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-xl group-hover:shadow-emerald-500/40 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{t("auth.login.feature2Title")}</h3>
                <p className="text-gray-600">{t("auth.login.feature2Desc")}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-5 group hover:transform hover:translate-x-2 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-xl group-hover:shadow-purple-500/40 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4"></path>
                  <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                  <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                  <path d="M15 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"></path>
                  <path d="M9 21c0-1-1-3-3-3s-3 2-3 3 1 3 3 3 3-2 3-3"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{t("auth.login.feature3Title")}</h3>
                <p className="text-gray-600">{t("auth.login.feature3Desc")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-gradient-to-br from-white to-gray-50">
        <div className="max-w-md w-full">
          {/* Login Card */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 backdrop-blur-sm">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">{t("auth.login.title")}</h2>
              <p className="text-gray-600 text-lg">{t("auth.login.subtitle")}</p>
              
              {/* Language Toggle */}
              <div className="flex justify-center mt-8">
                <div className="flex bg-gray-100 rounded-2xl p-1.5 shadow-inner">
                  <button
                    className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                      localStorage.getItem("language") !== "sw" 
                        ? "bg-white shadow-lg text-blue-600 transform scale-105"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    onClick={() => {
                      localStorage.setItem("language", "en");
                      window.location.reload();
                    }}
                  >
                    English
                  </button>
                  <button
                    className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                      localStorage.getItem("language") === "sw"
                        ? "bg-white shadow-lg text-blue-600 transform scale-105"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    onClick={() => {
                      localStorage.setItem("language", "sw");
                      window.location.reload();
                    }}
                  >
                    Kiswahili
                  </button>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-8">
                <div>
                  <label htmlFor="username" className="block text-sm font-bold text-gray-700 mb-3">
                    {t("auth.username")}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-500 hover:border-gray-300"
                      placeholder={t("auth.login.usernamePlaceholder")}
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label htmlFor="password" className="block text-sm font-bold text-gray-700">
                      {t("auth.password")}
                    </label>
                    
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-500 hover:border-gray-300"
                      placeholder={t("auth.login.passwordPlaceholder")}
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 flex items-center justify-center gap-3 group transform hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                {t("auth.signIn")}
              </button>
            </form>
            
           
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
