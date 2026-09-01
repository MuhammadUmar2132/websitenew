'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, getAuthHeaders, setAuthSession, clearAuthSession } from '../../utils/auth';

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Active Tab: 'overview' | 'projects' | 'leads' | 'users'
  const [activeTab, setActiveTab] = useState('overview');

  // Stats & Data
  const [stats, setStats] = useState({ totalUsers: 0, totalProjects: 0, totalLeads: 0, pendingLeads: 0 });
  const [projects, setProjects] = useState([]);
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');

  // Modals & Forms
  const [modalType, setModalType] = useState(null); // 'create_project' | 'edit_project' | 'create_user' | 'edit_user' | 'view_lead' | 'delete_confirm'
  const [activeItem, setActiveItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Inline Quick Admin Login State (if guest arrives directly at /Admin)
  const [loginCreds, setLoginCreds] = useState({ username: 'umar', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8009';

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Check Auth State on mount
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setIsAuthLoading(false);
  }, []);

  // Fetch Data when authenticated as admin
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchDashboardData();
    }
  }, [currentUser]);

  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      const headers = getAuthHeaders();

      // 1. Stats
      const statsRes = await fetch(`${API_URL}/admin/stats`, { headers, credentials: 'include' });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats || { totalUsers: 0, totalProjects: 0, totalLeads: 0, pendingLeads: 0 });
      }

      // 2. Projects
      const projectsRes = await fetch(`${API_URL}/photos`);
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(Array.isArray(projectsData) ? projectsData : projectsData.projects || []);
      }

      // 3. Leads
      const leadsRes = await fetch(`${API_URL}/admin/leads`, { headers, credentials: 'include' });
      if (leadsRes.ok) {
        const leadsData = await leadsRes.json();
        setLeads(leadsData || []);
      }

      // 4. Users
      const usersRes = await fetch(`${API_URL}/admin/users`, { headers, credentials: 'include' });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      showNotification('Failed to load some dashboard data', 'error');
    } finally {
      setLoadingData(false);
    }
  };

  // Quick Inline Admin Login
  const handleQuickLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginCreds),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      if (data.user?.role !== 'admin') {
        throw new Error('Access denied: You are not an admin');
      }

      setAuthSession(data.user, data.token);
      setCurrentUser(data.user);
      showNotification(`Welcome back, ${data.user.name || data.user.username}!`);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await clearAuthSession(API_URL);
    setCurrentUser(null);
    router.push('/');
  };

  // ----------------------------------------------------
  // PROJECT CRUD HANDLERS
  // ----------------------------------------------------
  const openCreateProjectModal = () => {
    setFormData({ title: '', description: '', link: '', image: null });
    setImagePreview(null);
    setModalType('create_project');
  };

  const openEditProjectModal = (project) => {
    setActiveItem(project);
    setFormData({
      title: project.title,
      description: project.description || '',
      link: project.link,
      image: null
    });
    setImagePreview(project.imageUrl);
    setModalType('edit_project');
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('link', formData.link);
      if (formData.image) {
        payload.append('image', formData.image);
      }

      const headers = getAuthHeaders(true); // multipart headers

      if (modalType === 'create_project') {
        if (!formData.image) {
          throw new Error('Please select a project image');
        }
        const res = await fetch(`${API_URL}/upload-photo`, {
          method: 'POST',
          headers,
          body: payload,
          credentials: 'include',
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Failed to create project');
        }
        showNotification('Project created successfully!');
      } else if (modalType === 'edit_project') {
        const id = activeItem._id || activeItem.id;
        const res = await fetch(`${API_URL}/update-photo/${id}`, {
          method: 'PUT',
          headers,
          body: payload,
          credentials: 'include',
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Failed to update project');
        }
        showNotification('Project updated successfully!');
      }

      setModalType(null);
      fetchDashboardData();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_URL}/delete-photo/${id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete project');
      showNotification('Project deleted successfully');
      setModalType(null);
      fetchDashboardData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // ----------------------------------------------------
  // LEADS MANAGEMENT HANDLERS
  // ----------------------------------------------------
  const handleUpdateLeadStatus = async (leadId, newStatus, notes = undefined) => {
    try {
      const headers = getAuthHeaders();
      const body = { status: newStatus };
      if (notes !== undefined) body.notes = notes;

      const res = await fetch(`${API_URL}/admin/leads/${leadId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to update lead');
      showNotification(`Lead status changed to ${newStatus}`);
      fetchDashboardData();
      if (activeItem && (activeItem._id === leadId || activeItem.id === leadId)) {
        setActiveItem(prev => ({ ...prev, status: newStatus, notes: notes !== undefined ? notes : prev.notes }));
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteLead = async (id) => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_URL}/admin/leads/${id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete lead');
      showNotification('Lead removed successfully');
      setModalType(null);
      fetchDashboardData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // ----------------------------------------------------
  // USER CRUD HANDLERS
  // ----------------------------------------------------
  const openCreateUserModal = () => {
    setFormData({ name: '', username: '', email: '', password: '', role: 'user' });
    setModalType('create_user');
  };

  const openEditUserModal = (user) => {
    setActiveItem(user);
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role || 'user',
      password: ''
    });
    setModalType('edit_user');
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const headers = getAuthHeaders();

      if (modalType === 'create_user') {
        const res = await fetch(`${API_URL}/admin/users`, {
          method: 'POST',
          headers,
          body: JSON.stringify(formData),
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to create user');
        showNotification('User created successfully!');
      } else if (modalType === 'edit_user') {
        const id = activeItem._id || activeItem.id;
        const res = await fetch(`${API_URL}/admin/users/${id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(formData),
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update user');
        showNotification('User updated successfully!');
      }

      setModalType(null);
      fetchDashboardData();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete user');
      showNotification('User deleted successfully');
      setModalType(null);
      fetchDashboardData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // ----------------------------------------------------
  // FILTERED DATA
  // ----------------------------------------------------
  const filteredProjects = projects.filter(p =>
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLeads = leads.filter(l => {
    const matchesSearch =
      l.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.message?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = leadStatusFilter === 'all' || l.status === leadStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ----------------------------------------------------
  // RENDER: UNAUTHENTICATED OR NON-ADMIN SCREEN
  // ----------------------------------------------------
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Admin Access Required</h2>
            <p className="text-gray-400 text-sm mt-1">
              Please sign in with your admin credentials (e.g. <span className="text-indigo-400 font-mono">umar / Umar214365</span>)
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleQuickLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Username / Email
              </label>
              <input
                type="text"
                required
                value={loginCreds.username}
                onChange={(e) => setLoginCreds({ ...loginCreds, username: e.target.value })}
                placeholder="umar"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginCreds.password}
                  onChange={(e) => setLoginCreds({ ...loginCreds, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center"
            >
              {loginLoading ? 'Signing In...' : 'Unlock Admin Panel'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
              ← Return to Portfolio Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ----------------------------------------------------
  // MAIN ADMIN DASHBOARD UI
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col pt-20">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-24 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl border text-sm font-medium flex items-center gap-3 backdrop-blur-md ${
              notification.type === 'error'
                ? 'bg-red-900/80 border-red-500/40 text-red-200'
                : 'bg-emerald-900/80 border-emerald-500/40 text-emerald-200'
            }`}
          >
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl flex-1">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Admin Control Center
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-600/30 border border-indigo-500/40 text-indigo-300">
                Admin Mode
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Logged in as <strong className="text-white">{currentUser.name || currentUser.username}</strong> ({currentUser.email})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={loadingData}
              className="p-2.5 bg-gray-900 hover:bg-gray-800 border border-gray-700/60 rounded-xl text-gray-300 hover:text-white transition-all text-sm flex items-center gap-2"
              title="Refresh Data"
            >
              <svg className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-700/60 rounded-xl text-gray-300 hover:text-white transition-all text-sm font-medium"
            >
              View Site
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-xl transition-all text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto space-x-2 py-4 border-b border-gray-800/80 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
            { id: 'projects', label: `Projects (${projects.length})`, icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
            { id: 'leads', label: `Leads & Inquiries (${leads.length})`, badge: stats.pendingLeads, icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
            { id: 'users', label: `Users (${users.length})`, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-gray-900/60 text-gray-400 hover:text-white hover:bg-gray-800/80 border border-gray-800'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
              </svg>
              <span>{tab.label}</span>
              {tab.badge > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-amber-500 text-gray-950 font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ---------------------------------------------------- */}
        {/* TAB 1: OVERVIEW */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'overview' && (
          <div className="py-6 space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div
                onClick={() => setActiveTab('users')}
                className="cursor-pointer bg-gradient-to-br from-gray-900 to-gray-800/80 border border-gray-800 hover:border-indigo-500/50 p-6 rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-sm font-medium">Total Registered Users</span>
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl group-hover:bg-indigo-500/20 transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-4xl font-bold text-white">{stats.totalUsers}</div>
                <p className="text-xs text-indigo-400 mt-2 flex items-center gap-1">Manage Users →</p>
              </div>

              <div
                onClick={() => setActiveTab('projects')}
                className="cursor-pointer bg-gradient-to-br from-gray-900 to-gray-800/80 border border-gray-800 hover:border-purple-500/50 p-6 rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-sm font-medium">Total Portfolio Projects</span>
                  <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl group-hover:bg-purple-500/20 transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
                <div className="text-4xl font-bold text-white">{stats.totalProjects}</div>
                <p className="text-xs text-purple-400 mt-2 flex items-center gap-1">Manage Projects →</p>
              </div>

              <div
                onClick={() => setActiveTab('leads')}
                className="cursor-pointer bg-gradient-to-br from-gray-900 to-gray-800/80 border border-gray-800 hover:border-blue-500/50 p-6 rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-sm font-medium">Total Contact Leads</span>
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl group-hover:bg-blue-500/20 transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="text-4xl font-bold text-white">{stats.totalLeads}</div>
                <p className="text-xs text-blue-400 mt-2 flex items-center gap-1">View Leads →</p>
              </div>

              <div
                onClick={() => {
                  setActiveTab('leads');
                  setLeadStatusFilter('pending');
                }}
                className="cursor-pointer bg-gradient-to-br from-amber-950/40 to-gray-900 border border-amber-500/30 hover:border-amber-500/60 p-6 rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-amber-300 text-sm font-medium">Pending Inquiries</span>
                  <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl group-hover:bg-amber-500/20 transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-4xl font-bold text-amber-400">{stats.pendingLeads}</div>
                <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">Review Pending →</p>
              </div>
            </div>

            {/* Quick Actions & Recent Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Leads */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    Recent Contact Inquiries
                  </h3>
                  <button
                    onClick={() => setActiveTab('leads')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    View All ({leads.length}) →
                  </button>
                </div>
                {leads.length === 0 ? (
                  <p className="text-gray-500 text-sm py-4">No contact inquiries received yet.</p>
                ) : (
                  <div className="space-y-3">
                    {leads.slice(0, 4).map((lead) => (
                      <div
                        key={lead.id || lead._id}
                        className="p-3.5 bg-gray-800/60 hover:bg-gray-800 rounded-xl border border-gray-700/50 flex items-center justify-between gap-3"
                      >
                        <div className="truncate">
                          <p className="text-sm font-semibold text-white truncate">{lead.name}</p>
                          <p className="text-xs text-gray-400 truncate">{lead.email}</p>
                          <p className="text-xs text-gray-300 mt-1 line-clamp-1 italic">&ldquo;{lead.message}&rdquo;</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              lead.status === 'resolved'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : lead.status === 'contacted'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {lead.status || 'pending'}
                          </span>
                          <button
                            onClick={() => {
                              setActiveItem(lead);
                              setModalType('view_lead');
                            }}
                            className="text-xs text-indigo-400 hover:underline"
                          >
                            Open Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Projects Quick Preview */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    Recent Projects
                  </h3>
                  <button
                    onClick={() => setActiveTab('projects')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Manage All ({projects.length}) →
                  </button>
                </div>
                {projects.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm mb-3">No projects uploaded yet.</p>
                    <button
                      onClick={openCreateProjectModal}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm"
                    >
                      + Add First Project
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {projects.slice(0, 4).map((project) => (
                      <div
                        key={project._id || project.id}
                        className="group relative bg-gray-800/80 rounded-xl overflow-hidden border border-gray-700/60"
                      >
                        <div className="h-24 w-full overflow-hidden bg-gray-950">
                          <img
                            src={project.imageUrl}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-2.5">
                          <p className="text-xs font-bold text-white truncate">{project.title}</p>
                          <div className="flex items-center justify-between mt-1">
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-indigo-400 hover:underline"
                            >
                              Visit Link ↗
                            </a>
                            <button
                              onClick={() => openEditProjectModal(project)}
                              className="text-[11px] text-gray-400 hover:text-white"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: PROJECTS CRUD */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'projects' && (
          <div className="py-6 space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={openCreateProjectModal}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Add New Project</span>
              </button>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-medium text-white">No projects found</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your search query or add a new project.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <div
                    key={project._id || project.id}
                    className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl overflow-hidden shadow-xl flex flex-col transition-all group"
                  >
                    <div className="h-48 w-full bg-gray-950 relative overflow-hidden">
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-80"></div>
                      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                        <span className="text-xs bg-indigo-600/80 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full font-medium border border-indigo-400/30">
                          Portfolio Project
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xl font-bold text-white mb-2">{project.title}</h4>
                        <p className="text-sm text-gray-400 line-clamp-3 mb-4">
                          {project.description || 'No description provided.'}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between">
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                        >
                          <span>Live Demo</span>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditProjectModal(project)}
                            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setActiveItem(project);
                              setModalType('delete_project_confirm');
                            }}
                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: LEADS / CONTACT INQUIRIES */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'leads' && (
          <div className="py-6 space-y-6">
            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search leads by name, email, message..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-medium">Status:</span>
                {['all', 'pending', 'contacted', 'resolved'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setLeadStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                      leadStatusFilter === st
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Leads Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
              {filteredLeads.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <p className="text-lg font-medium text-white">No leads match your filter.</p>
                  <p className="text-sm text-gray-500 mt-1">Check back later or change the status filter.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-800 text-xs font-semibold uppercase text-gray-400 bg-gray-950/60">
                        <th className="p-4">Sender</th>
                        <th className="p-4">Message Preview</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Received Date</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-sm">
                      {filteredLeads.map((lead) => (
                        <tr key={lead.id || lead._id} className="hover:bg-gray-800/40 transition-colors">
                          <td className="p-4">
                            <div className="font-semibold text-white">{lead.name}</div>
                            <div className="text-xs text-indigo-400">{lead.email}</div>
                            {lead.phone && <div className="text-xs text-gray-400">{lead.phone}</div>}
                          </td>
                          <td className="p-4 max-w-xs">
                            <p className="text-gray-300 line-clamp-2 text-xs italic">
                              &ldquo;{lead.message}&rdquo;
                            </p>
                          </td>
                          <td className="p-4">
                            <select
                              value={lead.status || 'pending'}
                              onChange={(e) => handleUpdateLeadStatus(lead.id || lead._id, e.target.value)}
                              className={`px-3 py-1 rounded-lg text-xs font-medium border focus:outline-none cursor-pointer ${
                                lead.status === 'resolved'
                                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700'
                                  : lead.status === 'contacted'
                                  ? 'bg-blue-950/70 text-blue-300 border-blue-700'
                                  : 'bg-amber-950/70 text-amber-300 border-amber-700'
                              }`}
                            >
                              <option value="pending" className="bg-gray-900 text-amber-300">Pending</option>
                              <option value="contacted" className="bg-gray-900 text-blue-300">Contacted</option>
                              <option value="resolved" className="bg-gray-900 text-emerald-300">Resolved</option>
                            </select>
                          </td>
                          <td className="p-4 text-xs text-gray-400 whitespace-nowrap">
                            {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'N/A'}
                          </td>
                          <td className="p-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setActiveItem(lead);
                                  setModalType('view_lead');
                                }}
                                className="px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded-lg text-xs font-medium transition-colors"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  setActiveItem(lead);
                                  setModalType('delete_lead_confirm');
                                }}
                                className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs transition-colors"
                                title="Delete Lead"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 4: USERS MANAGEMENT CRUD */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'users' && (
          <div className="py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search users by name, username, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={openCreateUserModal}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Add New User</span>
              </button>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
              {filteredUsers.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <p className="text-lg font-medium text-white">No users found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-800 text-xs font-semibold uppercase text-gray-400 bg-gray-950/60">
                        <th className="p-4">User</th>
                        <th className="p-4">Username</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Joined</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-sm">
                      {filteredUsers.map((user) => {
                        const isSelf = currentUser?._id === user._id || currentUser?.username === user.username;
                        return (
                          <tr key={user._id || user.id} className="hover:bg-gray-800/40 transition-colors">
                            <td className="p-4">
                              <div className="font-semibold text-white flex items-center gap-2">
                                <span>{user.name}</span>
                                {isSelf && (
                                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                                    You
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-4 font-mono text-xs text-gray-300">
                              @{user.username}
                            </td>
                            <td className="p-4 text-gray-300">{user.email}</td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                  user.role === 'admin'
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                    : 'bg-gray-800 text-gray-300 border border-gray-700'
                                }`}
                              >
                                {user.role || 'user'}
                              </span>
                            </td>
                            <td className="p-4 text-xs text-gray-400 whitespace-nowrap">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="p-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openEditUserModal(user)}
                                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium rounded-lg transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  disabled={isSelf}
                                  onClick={() => {
                                    setActiveItem(user);
                                    setModalType('delete_user_confirm');
                                  }}
                                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                    isSelf
                                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                      : 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                                  }`}
                                  title={isSelf ? 'Cannot delete yourself' : 'Delete user'}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODALS */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative my-8"
            >
              {/* Close Button */}
              <button
                onClick={() => setModalType(null)}
                className="absolute top-5 right-5 text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* 1. CREATE / EDIT PROJECT MODAL */}
              {(modalType === 'create_project' || modalType === 'edit_project') && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {modalType === 'create_project' ? 'Add New Project' : 'Edit Project'}
                  </h3>
                  <p className="text-sm text-gray-400 mb-6">
                    {modalType === 'create_project'
                      ? 'Upload a new project card for your portfolio.'
                      : 'Update the project details or replace its image.'}
                  </p>

                  <form onSubmit={handleProjectSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                        Project Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. 3D Interactive Portfolio"
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                        Live Demo / Project Link *
                      </label>
                      <input
                        type="url"
                        required
                        value={formData.link}
                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                        placeholder="https://example.com"
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                        Description
                      </label>
                      <textarea
                        rows="3"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Brief overview of technologies used and purpose..."
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                        {modalType === 'create_project' ? 'Project Thumbnail Image *' : 'Replace Image (Optional)'}
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        required={modalType === 'create_project'}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setFormData({ ...formData, image: file });
                            setImagePreview(URL.createObjectURL(file));
                          }
                        }}
                        className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                      />
                      {imagePreview && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-gray-700 h-36 bg-gray-950">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setModalType(null)}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={formSubmitting}
                        className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl text-sm shadow-lg shadow-indigo-600/30"
                      >
                        {formSubmitting ? 'Saving...' : modalType === 'create_project' ? 'Create Project' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* 2. CREATE / EDIT USER MODAL */}
              {(modalType === 'create_user' || modalType === 'edit_user') && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {modalType === 'create_user' ? 'Add New User' : `Edit User: ${activeItem?.username}`}
                  </h3>
                  <p className="text-sm text-gray-400 mb-6">
                    {modalType === 'create_user'
                      ? 'Create a new user account with role permissions.'
                      : 'Update user profile, credentials, or role.'}
                  </p>

                  <form onSubmit={handleUserSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. John Doe"
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                        Username *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="johndoe"
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                        {modalType === 'create_user' ? 'Password * (min 6 chars)' : 'New Password (Optional, min 6 chars)'}
                      </label>
                      <input
                        type="password"
                        required={modalType === 'create_user'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder={modalType === 'create_user' ? '••••••••' : 'Leave empty to keep unchanged'}
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                        Role
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="user">Regular User</option>
                        <option value="admin">Administrator (Full Access)</option>
                      </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setModalType(null)}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={formSubmitting}
                        className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl text-sm shadow-lg shadow-indigo-600/30"
                      >
                        {formSubmitting ? 'Saving...' : modalType === 'create_user' ? 'Create User' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* 3. VIEW LEAD DETAILS MODAL */}
              {modalType === 'view_lead' && activeItem && (
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-gray-800 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{activeItem.name}</h3>
                      <a href={`mailto:${activeItem.email}`} className="text-indigo-400 text-sm hover:underline">
                        {activeItem.email}
                      </a>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        activeItem.status === 'resolved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : activeItem.status === 'contacted'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {activeItem.status || 'pending'}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        Client Message:
                      </label>
                      <div className="p-4 bg-gray-950 border border-gray-800 rounded-xl text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">
                        {activeItem.message}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        Internal Admin Notes:
                      </label>
                      <textarea
                        rows="2"
                        defaultValue={activeItem.notes || ''}
                        onBlur={(e) => handleUpdateLeadStatus(activeItem.id || activeItem._id, activeItem.status, e.target.value)}
                        placeholder="Add notes about conversations, phone calls, or requirements..."
                        className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        Update Status:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {['pending', 'contacted', 'resolved'].map((st) => (
                          <button
                            key={st}
                            onClick={() => handleUpdateLeadStatus(activeItem.id || activeItem._id, st)}
                            className={`py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                              activeItem.status === st
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                                : 'bg-gray-800 text-gray-400 hover:text-white border-gray-700'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between items-center border-t border-gray-800">
                      <a
                        href={`mailto:${activeItem.email}?subject=Regarding your portfolio inquiry&body=Hi ${activeItem.name},%0D%0A%0D%0AThank you for reaching out!`}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>Reply by Email</span>
                      </a>

                      <button
                        onClick={() => setModalType(null)}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-medium"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. DELETE CONFIRMATION MODALS */}
              {modalType === 'delete_project_confirm' && activeItem && (
                <div className="text-center py-4">
                  <div className="w-14 h-14 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Delete Project</h3>
                  <p className="text-sm text-gray-400 mb-6">
                    Are you sure you want to delete <strong className="text-white">&ldquo;{activeItem.title}&rdquo;</strong>? This action cannot be undone.
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setModalType(null)}
                      className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteProject(activeItem._id || activeItem.id)}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-red-600/30"
                    >
                      Yes, Delete Project
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'delete_lead_confirm' && activeItem && (
                <div className="text-center py-4">
                  <div className="w-14 h-14 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Delete Inquiry</h3>
                  <p className="text-sm text-gray-400 mb-6">
                    Delete inquiry from <strong className="text-white">{activeItem.name}</strong> ({activeItem.email})?
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setModalType(null)}
                      className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteLead(activeItem.id || activeItem._id)}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-red-600/30"
                    >
                      Yes, Delete
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'delete_user_confirm' && activeItem && (
                <div className="text-center py-4">
                  <div className="w-14 h-14 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Delete User Account</h3>
                  <p className="text-sm text-gray-400 mb-6">
                    Are you sure you want to permanently delete user <strong className="text-white">@{activeItem.username}</strong> ({activeItem.name})?
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setModalType(null)}
                      className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteUser(activeItem._id || activeItem.id)}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-red-600/30"
                    >
                      Yes, Delete User
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
