import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User, Briefcase } from 'lucide-react';
import './Experts.css'; // We'll create this

const Experts = () => {
    const [experts, setExperts] = useState([]);

    // Dummy data for now if DB is empty
    const dummyExperts = [
        {
            _id: '1',
            name: 'Dr. Sarah Jones',
            designation: 'Financial Consultant',
            expertise: ['Finance', 'Taxation'],
            contact: 'sarah.j@example.com'
        },
        {
            _id: '2',
            name: 'Mr. Raj Patel',
            designation: 'Legal Advisor',
            expertise: ['Corporate Law', 'IPR'],
            contact: 'raj.p@example.com'
        }
    ];

    useEffect(() => {
        fetchExperts();
    }, []);

    const fetchExperts = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/experts');
            if (res.data.length > 0) {
                setExperts(res.data);
            } else {
                setExperts(dummyExperts);
            }
        } catch (err) {
            console.error('Experts Error:', err);
            setExperts(dummyExperts); // Fallback
        }
    };

    return (
        <div className="experts-container">
            <div className="experts-header">
                <h2 className="title">Our Experts</h2>
                <button className="btn btn-primary">Add New Expert</button>
            </div>

            <div className="experts-grid">
                {experts.map((expert) => (
                    <div key={expert._id} className="card expert-card">
                        <div className="expert-avatar">
                            <User size={40} />
                        </div>
                        <div className="expert-info">
                            <h3>{expert.name}</h3>
                            <p className="designation">{expert.designation}</p>
                            <div className="tags">
                                {expert.expertise.map((tag, idx) => (
                                    <span key={idx} className="tag">{tag}</span>
                                ))}
                            </div>
                            <p className="contact text-muted">{expert.contact}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Experts;
