import React, { useState, useEffect } from 'react';

export default function UserDashboard({ userId }) {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        // Fetching user data including a user-generated 'bio' profile section
        fetch(`/api/v1/users/${userId}`)
            .then(res => res.json())
            .then(data => setUserData(data))
            .catch(err => console.error(err));
    }, [userId]);

    if (!userData) return <div>Loading dashboard...</div>;

    return (
        <div className="dashboard-container">
            <h1>Welcome back, {userData.email}</h1>
            
            <div className="profile-section">
                <h2>Your Profile Bio</h2>
                {/* HIGH: Cross-Site Scripting (XSS) Vulnerability */}
                {/* Rendering raw, unsanitized database content directly into the DOM */}
                <div 
                    className="bio-content" 
                    dangerouslySetInnerHTML={{ __html: userData.bio }} 
                />
            </div>

            <div className="account-actions">
                <button onClick={() => window.location.href = '/settings'}>
                    Account Settings
                </button>
            </div>
        </div>
    );
}
