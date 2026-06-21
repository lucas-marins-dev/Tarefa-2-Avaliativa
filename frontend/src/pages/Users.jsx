import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Edit3, X, Save, ShieldAlert, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Alerts feedback
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null); // null for create, object for edit

    // Form inputs state
    const [userForm, setUserForm] = useState({ username: '', password: '', role: 'user' });

    // Client-side role check
    const currentUserStr = localStorage.getItem('user');
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : { role: 'user' };
    const isAdmin = currentUser.role === 'admin';

    const fetchUsers = async () => {
        if (!isAdmin) return;
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
            setError('Erro ao carregar os usuários do banco SQL.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const showMessage = (type, text) => {
        if (type === 'success') {
            setSuccess(text);
            setTimeout(() => setSuccess(''), 4000);
        } else {
            setError(text);
            setTimeout(() => setError(''), 5000);
        }
    };

    const handleOpenCreate = () => {
        setEditingUser(null);
        setUserForm({ username: '', password: '', role: 'user' });
        setModalOpen(true);
    };

    const handleOpenEdit = (user) => {
        setEditingUser(user);
        setUserForm({ username: user.username, password: '', role: user.role });
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (id === currentUser.id) {
            showMessage('error', 'Você não pode remover a si mesmo.');
            return;
        }
        if (!window.confirm('Tem certeza que deseja remover este usuário?')) return;

        setActionLoading(true);
        setError('');
        try {
            await api.delete(`/users/${id}`);
            showMessage('success', 'Usuário removido com sucesso!');
            fetchUsers();
        } catch (err) {
            console.error(err);
            showMessage('error', err.response?.data?.erro || 'Erro ao remover o usuário.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setError('');

        try {
            if (editingUser) {
                // For update, check if username is filled
                if (!userForm.username.trim()) {
                    showMessage('error', 'O nome de usuário é obrigatório.');
                    setActionLoading(false);
                    return;
                }
                const payload = { username: userForm.username, role: userForm.role };
                if (userForm.password.trim()) {
                    payload.password = userForm.password;
                }
                await api.put(`/users/${editingUser.id}`, payload);
                showMessage('success', 'Usuário atualizado com sucesso!');
            } else {
                // For create, check username and password
                if (!userForm.username.trim() || !userForm.password.trim()) {
                    showMessage('error', 'Usuário e senha são obrigatórios.');
                    setActionLoading(false);
                    return;
                }
                await api.post('/users', userForm);
                showMessage('success', 'Usuário cadastrado com sucesso!');
            }
            setModalOpen(false);
            fetchUsers();
        } catch (err) {
            console.error(err);
            showMessage('error', err.response?.data?.erro || 'Erro ao salvar o usuário. Verifique se o nome já existe.');
        } finally {
            setActionLoading(false);
        }
    };

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center">
                    <ShieldAlert className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-slate-100">Acesso Restrito</h1>
                <p className="text-slate-400 max-w-md">
                    Seu usuário atual não possui permissões administrativas para gerenciar contas de usuários na base de dados SQL.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 via-slate-100 to-purple-200 bg-clip-text text-transparent">
                        Gerenciar Usuários (SQL)
                    </h1>
                    <p className="text-slate-400 mt-1">Cadastre, edite e remova credenciais de acesso corporativas armazenadas no MySQL.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-5 rounded-xl transition-all shadow-lg shadow-indigo-600/10 active:scale-[0.98] focus:outline-none"
                >
                    <Plus className="w-5 h-5" />
                    Novo Usuário
                </button>
            </div>

            {/* Notifications */}
            {error && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}
            {success && (
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <span>{success}</span>
                </div>
            )}

            {/* Users Grid */}
            <div className="bg-slate-900/40 border border-slate-850 rounded-2xl overflow-hidden backdrop-blur-md">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
                        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                        <span className="text-sm">Buscando contas no banco MySQL...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/60">
                                    <th className="p-4 pl-6">ID SQL</th>
                                    <th className="p-4">Nome de Usuário</th>
                                    <th className="p-4">Nível de Permissão</th>
                                    <th className="p-4 pr-6 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-800/20 transition-all">
                                        <td className="p-4 pl-6 text-slate-400">#{user.id}</td>
                                        <td className="p-4 font-semibold text-slate-200">{user.username}</td>
                                        <td className="p-4">
                                            <span className={`
                                                inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border
                                                ${user.role === 'admin' 
                                                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                                                    : 'bg-slate-850 text-slate-400 border-slate-800'}
                                            `}>
                                                {user.role === 'admin' ? 'Administrador' : 'Operador'}
                                            </span>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <div className="inline-flex gap-2">
                                                <button
                                                    onClick={() => handleOpenEdit(user)}
                                                    className="p-2 rounded-lg bg-slate-850 hover:bg-indigo-500/15 border border-slate-800 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-400 transition-all focus:outline-none"
                                                    title="Editar"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    disabled={user.id === currentUser.id}
                                                    className="p-2 rounded-lg bg-slate-850 hover:bg-red-500/15 border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-slate-800 disabled:hover:text-slate-400 focus:outline-none"
                                                    title="Excluir"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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

            {/* User Form Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
                            <h3 className="text-xl font-bold text-slate-100">
                                {editingUser ? 'Editar Usuário SQL' : 'Criar Novo Usuário SQL'}
                            </h3>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="text-slate-400 hover:text-slate-200 transition-all focus:outline-none"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-slate-300 font-medium text-sm mb-1.5">Nome de Usuário</label>
                                    <input
                                        type="text"
                                        value={userForm.username}
                                        onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                                        placeholder="Ex: joao_silva"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-300 font-medium text-sm mb-1.5">
                                        Senha {editingUser && <span className="text-slate-500 font-normal">(Deixe em branco para não alterar)</span>}
                                    </label>
                                    <input
                                        type="password"
                                        value={userForm.password}
                                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                                        placeholder={editingUser ? "••••••••" : "Insira a senha do usuário"}
                                        required={!editingUser}
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-300 font-medium text-sm mb-1.5">Permissão</label>
                                    <select
                                        value={userForm.role}
                                        onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                                    >
                                        <option value="user">Operador (Leitura e Escrita de Itens)</option>
                                        <option value="admin">Administrador (Controle Total de Usuários + Itens)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-3 border-t border-slate-800 px-6 py-4 bg-slate-900/50">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 border border-slate-850 hover:bg-slate-800 rounded-xl text-sm font-semibold transition-all text-slate-400 hover:text-slate-200 focus:outline-none"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-xl transition-all shadow-lg hover:shadow-indigo-600/10 active:scale-[0.98] disabled:opacity-50 text-sm focus:outline-none"
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
