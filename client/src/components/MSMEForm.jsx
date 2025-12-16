import React, { useState } from 'react';
import axios from 'axios';
import './MSMEForm.css';

const MSMEForm = () => {
    const [formData, setFormData] = useState({
        dateOfVisit: new Date().toISOString().split('T')[0],
        assistedBy: 'BFC',
        visitorName: '',
        visitorCategory: 'Existing MSME',
        visitorCategoryOther: '',
        gender: 'Male',
        caste: 'General',
        contactNumber: '',
        email: '',
        address: '',
        businessName: '',
        udyamRegistrationNo: '',
        enterpriseType: 'Micro',
        sector: 'Manufacturing',
        purposeOfVisit: '',
        // expertName handled separately
        supportDetails: '',
        followUpAction: '',
        queryResolutionRequired: '',
        status: 'Pending'
    });

    const [experts, setExperts] = useState(['']); // Start with one empty expert field
    const [photos, setPhotos] = useState([]); // File objects
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Expert Handlers
    const handleExpertChange = (index, value) => {
        const newExperts = [...experts];
        newExperts[index] = value;
        setExperts(newExperts);
    };

    const addExpertField = () => {
        setExperts([...experts, '']);
    };

    const removeExpertField = (index) => {
        const newExperts = experts.filter((_, i) => i !== index);
        setExperts(newExperts);
    };

    // File Handler
    const handleFileChange = (e) => {
        setPhotos(e.target.files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        // Append simple fields
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });

        // Append Experts
        experts.forEach(expert => {
            if (expert.trim()) data.append('expertName', expert);
        });

        // Append Photos
        for (let i = 0; i < photos.length; i++) {
            data.append('photos', photos[i]);
        }

        try {
            await axios.post('http://localhost:5001/api/msme', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess(true);
            // Reset Form (Simplified reset)
            setFormData(prev => ({
                ...prev,
                visitorName: '', contactNumber: '', email: '',
                address: '', businessName: '', udyamRegistrationNo: '',
                purposeOfVisit: '', supportDetails: '', followUpAction: '',
                queryResolutionRequired: ''
            }));
            setExperts(['']);
            setPhotos([]);
        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data?.error || err.response?.data?.message || 'Error submitting form';
            alert(`Failed: ${errMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <div className="card">
                <h2 className="title">Visitor Entry Form (BFC & WEFC)</h2>

                {/* Success Modal */}
                {success && (
                    <div className="modal-overlay" style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}>
                        <div className="modal-content" style={{
                            backgroundColor: 'white',
                            padding: '2rem',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            textAlign: 'center',
                            maxWidth: '400px',
                            width: '90%'
                        }}>
                            <div className="modal-icon">🎉</div>
                            <h3>Entry Submitted!</h3>
                            <p>The visitor details have been recorded successfully.</p>
                            <button onClick={() => setSuccess(false)} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Done</button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    {/* Section 1: Visit Basics */}
                    <div className="section-header">Visit Details</div>
                    <div className="grid-3">
                        <div className="input-group">
                            <label className="input-label">Date of Visit</label>
                            <input type="date" name="dateOfVisit" value={formData.dateOfVisit} onChange={handleChange} className="input-field" required />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Assisted By</label>
                            <select name="assistedBy" value={formData.assistedBy} onChange={handleChange} className="input-field">
                                <option value="BFC">BFC</option>
                                <option value="WEFC">WEFC</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="input-field">
                                <option value="Pending">Pending</option>
                                <option value="Resolved">Resolved</option>
                            </select>
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Experts Met</label>
                        {experts.map((expert, index) => (
                            <div key={index} className="expert-input-row">
                                <input
                                    type="text"
                                    value={expert}
                                    onChange={(e) => handleExpertChange(index, e.target.value)}
                                    className="input-field"
                                    placeholder={`Expert Name ${index + 1}`}
                                />
                                {experts.length > 1 && (
                                    <button type="button" onClick={() => removeExpertField(index)} className="btn-remove">X</button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={addExpertField} className="btn-add-expert">+ Add Another Expert</button>
                    </div>

                    {/* Section 2: Visitor Information */}
                    <div className="section-header">Visitor Information</div>
                    <div className="grid-2">
                        <div className="input-group">
                            <label className="input-label">Name of Visitor</label>
                            <input type="text" name="visitorName" value={formData.visitorName} onChange={handleChange} className="input-field" required />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Contact Number</label>
                            <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="input-field" required />
                        </div>
                    </div>

                    <div className="grid-3">
                        <div className="input-group">
                            <label className="input-label">Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="input-field">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Caste</label>
                            <select name="caste" value={formData.caste} onChange={handleChange} className="input-field">
                                <option value="General">General</option>
                                <option value="SC">SC</option>
                                <option value="ST">ST</option>
                                <option value="OBC">OBC</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Email ID</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" />
                        </div>
                    </div>

                    <div className="grid-2">
                        <div className="input-group">
                            <label className="input-label">Category</label>
                            <select name="visitorCategory" value={formData.visitorCategory} onChange={handleChange} className="input-field">
                                <option value="Existing MSME">Existing MSME</option>
                                <option value="Aspiring MSME">Aspiring MSME</option>
                                <option value="SHG Member">SHG Member</option>
                                <option value="Others">Others</option>
                            </select>
                        </div>
                        {formData.visitorCategory === 'Others' && (
                            <div className="input-group">
                                <label className="input-label">Specify Category</label>
                                <input type="text" name="visitorCategoryOther" value={formData.visitorCategoryOther} onChange={handleChange} className="input-field" />
                            </div>
                        )}
                    </div>

                    {/* Section 3: Business Details */}
                    <div className="section-header">Business Details</div>
                    <div className="grid-2">
                        <div className="input-group">
                            <label className="input-label">Name of Business Unit</label>
                            <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} className="input-field" />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Udyam Registration No.</label>
                            <input type="text" name="udyamRegistrationNo" value={formData.udyamRegistrationNo} onChange={handleChange} className="input-field" />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Address (Business Unit)</label>
                        <textarea name="address" value={formData.address} onChange={handleChange} className="input-field" rows="2"></textarea>
                    </div>

                    <div className="grid-2">
                        <div className="input-group">
                            <label className="input-label">Type of Business</label>
                            <select name="enterpriseType" value={formData.enterpriseType} onChange={handleChange} className="input-field">
                                <option value="Micro">Micro</option>
                                <option value="Small">Small</option>
                                <option value="Medium">Medium</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Sector</label>
                            <select name="sector" value={formData.sector} onChange={handleChange} className="input-field">
                                <option value="Manufacturing">Manufacturing</option>
                                <option value="Service">Service</option>
                                <option value="Retail Trade">Retail Trade</option>
                            </select>
                        </div>
                    </div>

                    {/* Section 4: Purpose & Support */}
                    <div className="section-header">Purpose & Support</div>

                    <div className="input-group">
                        <label className="input-label">Purpose of Visit</label>
                        <textarea name="purposeOfVisit" value={formData.purposeOfVisit} onChange={handleChange} className="input-field" rows="2"></textarea>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Details of Support Rendered</label>
                        <textarea name="supportDetails" value={formData.supportDetails} onChange={handleChange} className="input-field" rows="3"></textarea>
                    </div>

                    <div className="grid-2">
                        <div className="input-group">
                            <label className="input-label">Follow-up Action Required</label>
                            <input type="text" name="followUpAction" value={formData.followUpAction} onChange={handleChange} className="input-field" />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Photos (Direct Upload)</label>
                            <input type="file" multiple onChange={handleFileChange} className="input-field file-input" />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Assistance Required by Expert (Query Resolution)</label>
                        <textarea name="queryResolutionRequired" value={formData.queryResolutionRequired} onChange={handleChange} className="input-field" rows="3"></textarea>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Entry'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MSMEForm;
