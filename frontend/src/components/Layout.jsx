import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, LogOut, Menu, X, ShieldAlert, KeyRound, Sparkles } from 'lucide-react';

export default function Layout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Get current user info
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : { username: 'Convidado', role: 'user' };
    const isAdmin = user.role === 'admin';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard de Itens', path: '/', icon: Home },
        ...(isAdmin ? [{ name: 'Gerenciar Usuários', path: '/users', icon: Users }] : [])
    ];

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100">
            {/* Mobile Header */}
            <header className="md:hidden bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between z-20">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-indigo-400" />
                    <span className="font-bold text-lg bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent">Console Premium</span>
                </div>
                <button 
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 focus:outline-none"
                >
                    {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </header>

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:relative md:translate-x-0 transition-transform duration-300 ease-in-out
                w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between z-30 shrink-0
            `}>
                <div className="p-6">
                    {/* Brand Logo */}
                    <div className="hidden md:flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-lg bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent">
                            Console Premium
                        </span>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                                        ${isActive 
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}
                                    `}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* User Section & Logout */}
                <div className="p-6 border-t border-slate-800 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold text-sm">
                            {user.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate text-slate-200">{user.username}</p>
                            <span className={`
                                inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1
                                ${isAdmin ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-slate-800 text-slate-400'}
                            `}>
                                {isAdmin ? 'Administrador' : 'Operador'}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-sm font-medium text-slate-400 hover:text-red-400 hover:border-red-500/20 transition-all focus:outline-none"
                    >
                        <LogOut className="w-4 h-4" />
                        Sair do Console
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                <div className="p-6 md:p-10 max-w-7xl w-full mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
