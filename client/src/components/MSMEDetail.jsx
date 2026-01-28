
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Pencil, Save, X, Trash2 } from 'lucide-react';
import './Layout.css';

const MSMEDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [msme, setMsme] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        fetchMSME();
    }, [id]);

    const fetchMSME = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const res = await axios.get(`${API_URL}/api/msme/${id}`);
            setMsme(res.data);
            setEditForm(res.data);
        } catch (err) {
            console.error('Error fetching detail:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('photos', files[i]);
        }

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            await axios.post(`${API_URL}/api/msme/${id}/photos`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchMSME(); // Refresh
            alert('Photos uploaded successfully!');
        } catch (err) {
            console.error('Upload failed:', err);
            alert('Upload failed');
        }
    };

    const handleDeletePhoto = async (photoUrl) => {
        if (!window.confirm('Are you sure you want to delete this photo?')) return;
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            await axios.delete(`${API_URL}/api/msme/${id}/photos`, {
                data: { photoUrl }
            });
            fetchMSME(); // Refresh
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Delete failed');
        }
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            await axios.put(`${API_URL}/api/msme/${id}`, editForm);
            setMsme(editForm);
            setIsEditing(false);
            alert('Saved successfully!');
        } catch (err) {
            console.error('Save failed:', err);
            alert('Save failed');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!msme) return <div>MSME Not Found</div>;

    // Parse photos
    const photoArray = msme.photos ? msme.photos.split(',') : [];
    const validPhotos = photoArray.filter(p => p.trim().startsWith('/uploads'));
    const photoText = photoArray.filter(p => !p.trim().startsWith('/uploads')).length > 0 ? msme.photos : '';

    const InputField = ({ label, name, value }) => (
        <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '0.2rem' }}>{label}</label>
            <input
                type="text"
                name={name}
                value={value || ''}
                onChange={handleEditChange}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
        </div>
    );

    const SelectField = ({ label, name, value, options }) => (
        <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '0.2rem' }}>{label}</label>
            <select
                name={name}
                value={value || ''}
                onChange={handleEditChange}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
            >
                <option value="">Select</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    );

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '1rem', cursor: 'pointer', padding: '0.5rem 1rem', border: '1px solid #ddd', background: 'white', borderRadius: '4px' }}>&larr; Back</button>
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>

                    {isEditing ? (
                        <div style={{ width: '100%' }}>
                            <InputField label="Business Name" name="businessName" value={editForm.businessName} />
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={handleSave} className="btn-save" style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Save size={16} /> Save
                                </button>
                                <button onClick={() => setIsEditing(false)} className="btn-cancel" style={{ background: '#64748b', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <X size={16} /> Cancel
                                </button>
                                <button onClick={async () => {
                                    if (window.confirm('Are you sure you want to delete this MSME record? This action cannot be undone.')) {
                                        try {
                                            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
                                            await axios.delete(`${API_URL}/api/msme/${id}`);
                                            alert('Record deleted successfully');
                                            navigate('/list');
                                        } catch (err) {
                                            alert('Error deleting record');
                                            console.error(err);
                                        }
                                    }
                                }} className="btn-delete" style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
                                    <Trash2 size={16} /> Delete Record
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div>
                                <h1 className="title" style={{ marginBottom: '0.25rem', fontSize: '1.5rem' }}>{msme.businessName || msme.visitorName}</h1>
                                <span style={{ color: '#64748b' }}>Sr No: {msme.serialNo || 'N/A'} | Visited on {new Date(msme.dateOfVisit).toLocaleDateString()}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                {/* Edit Button */}
                                <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6' }}>
                                    <Pencil size={20} />
                                </button>

                                <span className={`badge ${msme.status === 'Resolved' ? 'bg-green' : 'bg-orange'}`} style={{ color: 'white', padding: '0.5rem 1rem' }}>
                                    {msme.status || 'Pending'}
                                </span>
                                <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ background: '#ef4444', color: 'white', border: 'none' }}>Close</button>
                            </div>
                        </>
                    )}
                </div>

                {isEditing ? (
                    <div className="grid-2">
                        <div>
                            <h3 className="section-header">Business Info</h3>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '0.2rem' }}>Date of Visit</label>
                                <input
                                    type="date"
                                    name="dateOfVisit"
                                    value={editForm.dateOfVisit ? new Date(editForm.dateOfVisit).toISOString().split('T')[0] : ''}
                                    onChange={handleEditChange}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <SelectField label="Type" name="enterpriseType" value={editForm.enterpriseType} options={['Micro', 'Small', 'Medium']} />
                            <SelectField label="Sector" name="sector" value={editForm.sector} options={['Manufacturing', 'Service', 'Retail Trade']} />
                            <InputField label="Udyam No" name="udyamRegistrationNo" value={editForm.udyamRegistrationNo} />
                            <InputField label="Address" name="address" value={editForm.address} />
                            <SelectField label="Area" name="area" value={editForm.area} options={['North Goa', 'South Goa', 'Unknown']} />
                        </div>
                        <div>
                            <h3 className="section-header">Visitor Details</h3>
                            <InputField label="Visitor Name" name="visitorName" value={editForm.visitorName} />
                            <SelectField label="Category" name="visitorCategory" value={editForm.visitorCategory} options={['Existing MSME', 'Aspiring MSME', 'SHG Member', 'Others']} />
                            <InputField label="Visitor Category (Other)" name="visitorCategoryOther" value={editForm.visitorCategoryOther} />
                            <SelectField label="Gender" name="gender" value={editForm.gender} options={['Male', 'Female', 'Other']} />
                            <SelectField label="Caste" name="caste" value={editForm.caste} options={['General', 'SC', 'ST', 'OBC']} />
                            <InputField label="Contact" name="contactNumber" value={editForm.contactNumber} />
                            <InputField label="Email" name="email" value={editForm.email} />
                        </div>
                        <div>
                            <h3 className="section-header">Visit Info</h3>
                            <InputField label="Assisted By" name="assistedBy" value={editForm.assistedBy} />
                            <InputField label="Expert" name="expertName" value={editForm.expertName} />
                            <InputField label="Purpose" name="purposeOfVisit" value={editForm.purposeOfVisit} />
                        </div>
                        <div>
                            <h3 className="section-header">Support & Action</h3>
                            <InputField label="Support Rendered" name="supportDetails" value={editForm.supportDetails} />
                            <InputField label="Query Resolution" name="queryResolutionRequired" value={editForm.queryResolutionRequired} />
                            <InputField label="Follow-up" name="followUpAction" value={editForm.followUpAction} />
                            <SelectField label="Status" name="status" value={editForm.status} options={['Pending', 'Resolved']} />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid-2">
                            <div>
                                <h3 className="section-header">Business Info</h3>
                                <p><strong>Business Name:</strong> {msme.businessName || '-'}</p>
                                <p><strong>Type:</strong> {msme.enterpriseType || '-'}</p>
                                <p><strong>Sector:</strong> {msme.sector || '-'}</p>
                                <p><strong>Udyam No:</strong> {msme.udyamRegistrationNo || 'N/A'}</p>
                                <p><strong>Address:</strong> {msme.address || '-'}</p>
                                <p><strong>Area:</strong> {msme.area || 'Unknown'}</p>
                            </div>
                            <div>
                                <h3 className="section-header">Visitor Details</h3>
                                <p><strong>Name:</strong> {msme.visitorName}</p>
                                <p><strong>Category:</strong> {msme.visitorCategory} {msme.visitorCategoryOther ? `(${msme.visitorCategoryOther})` : ''}</p>
                                <p><strong>Gender:</strong> {msme.gender || '-'}</p>
                                <p><strong>Caste:</strong> {msme.caste || '-'}</p>
                                <p><strong>Contact:</strong> {msme.contactNumber || '-'}</p>
                                <p><strong>Email:</strong> {msme.email || '-'}</p>
                            </div>
                        </div>

                        <div className="grid-2" style={{ marginTop: '2rem' }}>
                            <div>
                                <h3 className="section-header">Visit Info</h3>
                                <p><strong>Assisted By:</strong> {msme.assistedBy || '-'}</p>
                                <p><strong>Expert:</strong> {msme.expertName || '-'}</p>
                                <p><strong>Purpose:</strong> {msme.purposeOfVisit || '-'}</p>
                            </div>
                            <div>
                                <h3 className="section-header">Support & Action</h3>
                                <p><strong>Support Rendered:</strong> {msme.supportDetails || '-'}</p>
                                <p><strong>Query Resolution:</strong> {msme.queryResolutionRequired || '-'}</p>
                                <p><strong>Follow-up:</strong> {msme.followUpAction || '-'}</p>
                            </div>
                        </div>
                    </>
                )}

                <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="section-header" style={{ marginBottom: 0 }}>Photos</h3>
                        <label className="btn" style={{ cursor: 'pointer', background: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px' }}>
                            Upload Photos
                            <input type="file" multiple hidden onChange={handleUpload} />
                        </label>
                    </div>

                    {/* If there is text in photos that isn't a path, show it as note */}
                    {photoText && !validPhotos.length && <p style={{ marginTop: '0.5rem', color: '#666' }}>{photoText}</p>}

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '1rem',
                        marginTop: '1rem'
                    }}>
                        {validPhotos.map((photo, idx) => {
                            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
                            return (
                                <div key={idx} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                                    <a href={`${API_URL}${photo.trim()}`} target="_blank" rel="noreferrer">
                                        <img
                                            src={`${API_URL}${photo.trim()}`}
                                            alt={`Upload ${idx}`}
                                            style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
                                        />
                                    </a>
                                    <button
                                        onClick={() => handleDeletePhoto(photo)}
                                        style={{
                                            position: 'absolute', top: '10px', right: '10px',
                                            background: 'rgba(220, 38, 38, 0.9)', color: 'white', border: 'none',
                                            borderRadius: '50%', width: '32px', height: '32px',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                        title="Delete Photo"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MSMEDetail;
