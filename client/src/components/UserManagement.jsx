import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Trash2, UserPlus, Shield } from 'lucide-react';

const UserManagement = () => {
    const { user } = useAuth(); // Logged in user
    const [users, setUsers] = useState([]);
    const [experts, setExperts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'expert',
        expertId: ''
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

    useEffect(() => {
        fetchUsers();
        fetchExperts();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchExperts = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/experts`);
            setExperts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.filter(u => u._id !== userId));
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/users`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('User created successfully');
            setFormData({ username: '', password: '', role: 'expert', expertId: '' });
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create user');
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Shield size={32} /> User Management
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '2rem' }}>

                {/* Create User Form */}
                <div className="card" style={{ height: 'fit-content' }}>
                    <h3>Create New User</h3>
                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '0.2rem' }}>Username</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '0.2rem' }}>Password</label>
                            <input
                                type="text"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '0.2rem' }}>Role</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                            >
                                <option value="expert">Expert</option>
                                <option value="admin">Admin</option>
                                <option value="sudo_admin">Sudo Admin</option>
                            </select>
                        </div>

                        {formData.role === 'expert' && (
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '0.2rem' }}>Link to Expert Profile</label>
                                <select
                                    value={formData.expertId}
                                    onChange={(e) => setFormData({ ...formData, expertId: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                >
                                    <option value="">-- Select Expert --</option>
                                    {experts.map(ex => (
                                        <option key={ex._id} value={ex._id}>{ex.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <UserPlus size={18} /> Create User
                        </button>
                    </form>
                </div>

                {/* User List */}
                <div className="card">
                    <h3>All Users</h3>
                    {loading ? <p>Loading...</p> : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                    <th style={{ padding: '0.5rem' }}>Username</th>
                                    <th style={{ padding: '0.5rem' }}>Role</th>
                                    <th style={{ padding: '0.5rem' }}>Linked Profile</th>
                                    <th style={{ padding: '0.5rem' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '0.8rem 0.5rem' }}>{u.username}</td>
                                        <td style={{ padding: '0.8rem 0.5rem' }}>
                                            <span className={`badge ${u.role === 'sudo_admin' ? 'bg-purple' : u.role === 'admin' ? 'bg-blue' : 'bg-green'}`}
                                                style={{ color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.8rem 0.5rem', fontSize: '0.9rem', color: '#666' }}>
                                            {u.expertId ? experts.find(e => e._id === u.expertId)?.name || 'Unknown' : '-'}
                                        </td>
                                        <td style={{ padding: '0.8rem 0.5rem' }}>
                                            {u.role !== 'sudo_admin' && ( // Cannot delete sudo admin easily
                                                <button
                                                    onClick={() => handleDelete(u._id)}
                                                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
