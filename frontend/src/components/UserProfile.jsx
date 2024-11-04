import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
    const [user, setUser] = useState({ username: '', email: '', isAnonymous: false });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('https://blog-backend-vert.vercel.app/api/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser(response.data);
            } catch (error) {
                setError('Error fetching user details.');
                console.error(error);
            }
        };

        fetchUserDetails();
    }, []);



    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            
            const token = localStorage.getItem('token');
            await axios.put('https://blog-backend-vert.vercel.app/api/profile', user, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Profile updated successfully!');
        } catch (error) {
            setError('Error updating profile.');
            console.error(error);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <div className="user-profile">
            <h2>User Profile</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={user.username}
                    onChange={(e) => setUser({ ...user, username: e.target.value })}
                    placeholder="Username"
                    readOnly
                />
                <input
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    placeholder="Email"
                    readOnly
                />
                <label>
                    <input
                        type="checkbox"
                        checked={user.isAnonymous}
                        onChange={() => setUser({ ...user, isAnonymous: !user.isAnonymous })}
                    />
                    Set blog privacy to anonymous
                </label>
                <button type="submit">Update Profile</button>
            </form>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default UserProfile;
