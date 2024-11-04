import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError(''); 
            const response = await axios.post('https://blog-backend-vert.vercel.app/api/login', { usernameOrEmail, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userId', response.data.userId); 
            navigate('/'); 
        } catch (error) {
            if (error.response) {
                setError(error.response.data.message);
            } else {
                setError('Login failed. Please try again.');
            }
            console.error('Error logging in:', error);
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Login</h2>
                <input
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="Username or Email"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                <button type="submit">Login</button>
                {error && <p className='error-message'>{error}</p>}
                <p>
                    Don't have an account? <span className="link" onClick={() => navigate('/register')}>Register here</span>
                </p>
            </form>
        </div>
    );
};

export default Login;

