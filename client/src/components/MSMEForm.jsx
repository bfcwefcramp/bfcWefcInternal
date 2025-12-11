import React, { useState } from 'react';
import axios from 'axios';
import './MSMEForm.css'; // We'll create this

const MSMEForm = () => {
    const [formData, setFormData] = useState({
        entrepreneurName: '',
        businessName: '',
        address: '',
        businessType: 'Manufacturing',
        yearStarted: '',
        mobile: '',
        udyam: false,
        udyamNo: '',
        gst: false,
        gstNo: '',
        pan: false,
        panNo: '',
        enquiryType: [],
        remarks: '',
        assistedExperts: ''
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const enquiryOptions = [
        'Business Transformation', 'Finance', 'Technology', 'Legal', 'ESG & Compliance'
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEnquiryChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            if (checked) {
                return { ...prev, enquiryType: [...prev.enquiryType, value] };
            } else {
                return { ...prev, enquiryType: prev.enquiryType.filter(item => item !== value) };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            console.log('Submitting to http://localhost:5001/api/msme');
            await axios.post('http://localhost:5001/api/msme', formData);
            setSuccess(true);
            setFormData({
                entrepreneurName: '', businessName: '', address: '', businessType: 'Manufacturing',
                yearStarted: '', mobile: '', udyam: false, udyamNo: '', gst: false,
                gstNo: '', pan: false, panNo: '', enquiryType: [], remarks: '', assistedExperts: ''
            });
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Submission Error Log:', err);
            if (err.response) {
                alert(`Server Error: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
            } else if (err.request) {
                alert('Network Error: No response received from server. Is it running on port 5001?');
            } else {
                alert(`Error: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <div className="card">
                <h2 className="title">New Assistance Entry</h2>

                {success && <div className="alert-success">Entry Submitted Successfully!</div>}

                <form onSubmit={handleSubmit}>
                    <div className="grid-2">
                        <div className="input-group">
                            <label className="input-label">Entrepreneur Name</label>
                            <input type="text" name="entrepreneurName" value={formData.entrepreneurName} onChange={handleChange} className="input-field" required />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Business Name</label>
                            <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} className="input-field" required />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Address</label>
                        <textarea name="address" value={formData.address} onChange={handleChange} className="input-field" rows="3"></textarea>
                    </div>

                    <div className="grid-3">
                        <div className="input-group">
                            <label className="input-label">Type of Business</label>
                            <select name="businessType" value={formData.businessType} onChange={handleChange} className="input-field">
                                <option value="Manufacturing">Manufacturing</option>
                                <option value="Services">Services</option>
                                <option value="Trading">Trading</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Year Started</label>
                            <input type="number" name="yearStarted" value={formData.yearStarted} onChange={handleChange} className="input-field" />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Mobile Number</label>
                            <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} className="input-field" />
                        </div>
                    </div>

                    <div className="grid-3">
                        {/* Udyam */}
                        <div className="input-group checkbox-group-container">
                            <label className="input-label">
                                <input type="checkbox" name="udyam" checked={formData.udyam} onChange={handleChange} />
                                <span className="ml-2">Udyam Registration?</span>
                            </label>
                            {formData.udyam && (
                                <input type="text" name="udyamNo" placeholder="Udyam No" value={formData.udyamNo} onChange={handleChange} className="input-field mt-2" />
                            )}
                        </div>

                        {/* GST */}
                        <div className="input-group checkbox-group-container">
                            <label className="input-label">
                                <input type="checkbox" name="gst" checked={formData.gst} onChange={handleChange} />
                                <span className="ml-2">GST Registration?</span>
                            </label>
                            {formData.gst && (
                                <input type="text" name="gstNo" placeholder="GST No" value={formData.gstNo} onChange={handleChange} className="input-field mt-2" />
                            )}
                        </div>

                        {/* PAN */}
                        <div className="input-group checkbox-group-container">
                            <label className="input-label">
                                <input type="checkbox" name="pan" checked={formData.pan} onChange={handleChange} />
                                <span className="ml-2">PAN Card?</span>
                            </label>
                            {formData.pan && (
                                <input type="text" name="panNo" placeholder="PAN No" value={formData.panNo} onChange={handleChange} className="input-field mt-2" />
                            )}
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Type of Enquiry</label>
                        <div className="checkbox-grid">
                            {enquiryOptions.map(opt => (
                                <label key={opt} className="checkbox-item">
                                    <input
                                        type="checkbox"
                                        value={opt}
                                        checked={formData.enquiryType.includes(opt)}
                                        onChange={handleEnquiryChange}
                                    />
                                    <span>{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Assisted Experts</label>
                        <input type="text" name="assistedExperts" value={formData.assistedExperts} onChange={handleChange} className="input-field" placeholder="Enter expert names..." />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Additional Remarks</label>
                        <textarea name="remarks" value={formData.remarks} onChange={handleChange} className="input-field" rows="3"></textarea>
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
