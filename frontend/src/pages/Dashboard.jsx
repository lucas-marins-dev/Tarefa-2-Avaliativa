import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Edit3, Car, Bike, Shirt, X, Save, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('cars'); // 'cars' | 'motos' | 'brands'
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    
    // Feedback alerts
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null); // null for create, object for edit

    // Form inputs state
    const [carForm, setCarForm] = useState({ marca: '', modelo: '', ano: '', preco: '' });
    const [motoForm, setMotoForm] = useState({ marca: '', modelo: '', ano: '', preco: '', cilindrada: '' });
    const [brandForm, setBrandForm] = useState({ nome: '', pais: '', categoria: '' });

    // Fetch items based on active tab
    const fetchItems = async () => {
        setLoading(true);
        setError('');
        try {
            let endpoint = '';
            if (activeTab === 'cars') endpoint = '/cars';
            else if (activeTab === 'motos') endpoint = '/motos';
            else if (activeTab === 'brands') endpoint = '/clothing-brands';

            const res = await api.get(endpoint);
            setItems(res.data);
        } catch (err) {
            console.error(err);
            setError('Erro ao carregar os itens do servidor.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [activeTab]);

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
        setEditingItem(null);
        setCarForm({ marca: '', modelo: '', ano: '', preco: '' });
        setMotoForm({ marca: '', modelo: '', ano: '', preco: '', cilindrada: '' });
        setBrandForm({ nome: '', pais: '', categoria: '' });
        setModalOpen(true);
    };

    const handleOpenEdit = (item) => {
        setEditingItem(item);
        if (activeTab === 'cars') {
            setCarForm({ marca: item.marca, modelo: item.modelo, ano: item.ano, preco: item.preco });
        } else if (activeTab === 'motos') {
            setMotoForm({ marca: item.marca, modelo: item.modelo, ano: item.ano, preco: item.preco, cilindrada: item.cilindrada });
        } else if (activeTab === 'brands') {
            setBrandForm({ nome: item.nome, pais: item.pais, categoria: item.categoria });
        }
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja remover este item?')) return;
        setActionLoading(true);
        setError('');
        try {
            let endpoint = '';
            if (activeTab === 'cars') endpoint = `/cars/${id}`;
            else if (activeTab === 'motos') endpoint = `/motos/${id}`;
            else if (activeTab === 'brands') endpoint = `/clothing-brands/${id}`;

            await api.delete(endpoint);
            showMessage('success', 'Item removido com sucesso!');
            fetchItems();
        } catch (err) {
            console.error(err);
            showMessage('error', err.response?.data?.erro || 'Erro ao remover o item.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setError('');
        try {
            let endpoint = '';
            let payload = {};

            if (activeTab === 'cars') {
                endpoint = editingItem ? `/cars/${editingItem._id}` : '/cars';
                payload = { ...carForm, ano: Number(carForm.ano), preco: Number(carForm.preco) };
            } else if (activeTab === 'motos') {
                endpoint = editingItem ? `/motos/${editingItem._id}` : '/motos';
                payload = { ...motoForm, ano: Number(motoForm.ano), preco: Number(motoForm.preco), cilindrada: Number(motoForm.cilindrada) };
            } else if (activeTab === 'brands') {
                endpoint = editingItem ? `/clothing-brands/${editingItem._id}` : '/clothing-brands';
                payload = { ...brandForm };
            }

            if (editingItem) {
                await api.put(endpoint, payload);
                showMessage('success', 'Item atualizado com sucesso!');
            } else {
                await api.post(endpoint, payload);
                showMessage('success', 'Item criado com sucesso!');
            }
            setModalOpen(false);
            fetchItems();
        } catch (err) {
            console.error(err);
            showMessage('error', err.response?.data?.erro || 'Erro ao salvar o item. Verifique os dados inseridos.');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 via-slate-100 to-purple-200 bg-clip-text text-transparent">
                        Dashboard Corporativo
                    </h1>
                    <p className="text-slate-400 mt-1">Gerencie os catálogos de Carros, Motos e Marcas de Roupas em persistência NoSQL (MongoDB).</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-5 rounded-xl transition-all shadow-lg shadow-indigo-600/10 active:scale-[0.98] focus:outline-none"
                >
                    <Plus className="w-5 h-5" />
                    Adicionar Registro
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

            {/* Tab Navigation */}
            <div className="border-b border-slate-800 flex gap-4">
                <button
                    onClick={() => setActiveTab('cars')}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-all focus:outline-none ${
                        activeTab === 'cars' 
                            ? 'border-indigo-500 text-indigo-400' 
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                >
                    <Car className="w-5 h-5" />
                    Carros (NoSQL)
                </button>
                <button
                    onClick={() => setActiveTab('motos')}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-all focus:outline-none ${
                        activeTab === 'motos' 
                            ? 'border-indigo-500 text-indigo-400' 
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                >
                    <Bike className="w-5 h-5" />
                    Motos (NoSQL)
                </button>
                <button
                    onClick={() => setActiveTab('brands')}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-all focus:outline-none ${
                        activeTab === 'brands' 
                            ? 'border-indigo-500 text-indigo-400' 
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                >
                    <Shirt className="w-5 h-5" />
                    Marcas de Roupa (NoSQL)
                </button>
            </div>

            {/* Table / Grid list */}
            <div className="bg-slate-900/40 border border-slate-850 rounded-2xl overflow-hidden backdrop-blur-md">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
                        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                        <span className="text-sm">Buscando registros na base NoSQL...</span>
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">
                        <p className="text-lg">Nenhum registro encontrado para esta categoria.</p>
                        <p className="text-sm mt-1">Clique em "Adicionar Registro" para começar a popular a base.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/60">
                                    {activeTab === 'brands' ? (
                                        <>
                                            <th className="p-4 pl-6">Nome da Marca</th>
                                            <th className="p-4">País de Origem</th>
                                            <th className="p-4">Categoria</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="p-4 pl-6">Marca</th>
                                            <th className="p-4">Modelo</th>
                                            <th className="p-4">Ano</th>
                                            <th className="p-4">Preço</th>
                                            {activeTab === 'motos' && <th className="p-4">Cilindradas (cc)</th>}
                                        </>
                                    )}
                                    <th className="p-4 pr-6 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {items.map((item) => (
                                    <tr key={item._id} className="hover:bg-slate-800/20 transition-all">
                                        {activeTab === 'brands' ? (
                                            <>
                                                <td className="p-4 pl-6 font-medium text-slate-200">{item.nome}</td>
                                                <td className="p-4 text-slate-300">{item.pais}</td>
                                                <td className="p-4">
                                                    <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded text-xs font-semibold">
                                                        {item.categoria}
                                                    </span>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="p-4 pl-6 font-medium text-slate-200">{item.marca}</td>
                                                <td className="p-4 text-slate-300">{item.modelo}</td>
                                                <td className="p-4 text-slate-300">{item.ano}</td>
                                                <td className="p-4 font-semibold text-emerald-400">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco)}
                                                </td>
                                                {activeTab === 'motos' && (
                                                    <td className="p-4">
                                                        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-xs font-semibold">
                                                            {item.cilindrada} cc
                                                        </span>
                                                    </td>
                                                )}
                                            </>
                                        )}
                                        <td className="p-4 pr-6 text-right">
                                            <div className="inline-flex gap-2">
                                                <button
                                                    onClick={() => handleOpenEdit(item)}
                                                    className="p-2 rounded-lg bg-slate-850 hover:bg-indigo-500/15 border border-slate-800 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-400 transition-all focus:outline-none"
                                                    title="Editar"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    className="p-2 rounded-lg bg-slate-850 hover:bg-red-500/15 border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-all focus:outline-none"
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

            {/* Dynamic CRUD Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
                            <h3 className="text-xl font-bold text-slate-100">
                                {editingItem ? 'Editar Registro' : 'Adicionar Novo Registro'}
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
                                {activeTab === 'cars' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-slate-300 font-medium text-sm mb-1.5">Marca</label>
                                                <input
                                                    type="text"
                                                    value={carForm.marca}
                                                    onChange={(e) => setCarForm({ ...carForm, marca: e.target.value })}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                                                    placeholder="Ex: Chevrolet"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-slate-300 font-medium text-sm mb-1.5">Modelo</label>
                                                <input
                                                    type="text"
                                                    value={carForm.modelo}
                                                    onChange={(e) => setCarForm({ ...carForm, modelo: e.target.value })}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                                                    placeholder="Ex: Tracker"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-slate-300 font-medium text-sm mb-1.5">Ano</label>
                                                <input
                                                    type="number"
                                                    value={carForm.ano}
                                                    onChange={(e) => setCarForm({ ...carForm, ano: e.target.value })}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                                                    placeholder="Ex: 2023"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-slate-300 font-medium text-sm mb-1.5">Preço (R$)</label>
                                                <input
                                                    type="number"
                                                    value={carForm.preco}
                                                    onChange={(e) => setCarForm({ ...carForm, preco: e.target.value })}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                                                    placeholder="Ex: 110000"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'motos' && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-slate-300 font-medium text-sm mb-1.5">Marca</label>
                                                <input
                                                    type="text"
                                                    value={motoForm.marca}
                                                    onChange={(e) => setMotoForm({ ...motoForm, marca: e.target.value })}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                                                    placeholder="Ex: Yamaha"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-slate-300 font-medium text-sm mb-1.5">Modelo</label>
                                                <input
                                                    type="text"
                                                    value={motoForm.modelo}
                                                    onChange={(e) => setMotoForm({ ...motoForm, modelo: e.target.value })}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                                                    placeholder="Ex: MT-07"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-slate-300 font-medium text-sm mb-1.5">Ano</label>
                                                <input
                                                    type="number"
                                                    value={motoForm.ano}
                                                    onChange={(e) => setMotoForm({ ...motoForm, ano: e.target.value })}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                                                    placeholder="2022"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-slate-300 font-medium text-sm mb-1.5">Preço (R$)</label>
                                                <input
                                                    type="number"
                                                    value={motoForm.preco}
                                                    onChange={(e) => setMotoForm({ ...motoForm, preco: e.target.value })}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                                                    placeholder="45000"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-slate-300 font-medium text-sm mb-1.5">Cilindrada (cc)</label>
                                                <input
                                                    type="number"
                                                    value={motoForm.cilindrada}
                                                    onChange={(e) => setMotoForm({ ...motoForm, cilindrada: e.target.value })}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                                                    placeholder="689"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'brands' && (
                                    <>
                                        <div>
                                            <label className="block text-slate-300 font-medium text-sm mb-1.5">Nome da Marca</label>
                                            <input
                                                type="text"
                                                value={brandForm.nome}
                                                onChange={(e) => setBrandForm({ ...brandForm, nome: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                                                placeholder="Ex: Nike"
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-slate-300 font-medium text-sm mb-1.5">País de Origem</label>
                                                <input
                                                    type="text"
                                                    value={brandForm.pais}
                                                    onChange={(e) => setBrandForm({ ...brandForm, pais: e.target.value })}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                                                    placeholder="Ex: Estados Unidos"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-slate-300 font-medium text-sm mb-1.5">Categoria</label>
                                                <input
                                                    type="text"
                                                    value={brandForm.categoria}
                                                    onChange={(e) => setBrandForm({ ...brandForm, categoria: e.target.value })}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                                                    placeholder="Ex: Esportivo"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
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
