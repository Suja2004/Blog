import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState('');

    // Function to check password strength
    const checkPasswordStrength = (password) => {
        const minLength = password.length >= 8;
        const hasNumber = /\d/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const strength = [minLength, hasNumber, hasUpper, hasLower, hasSpecial].filter(Boolean).length;

        if (strength === 5) return 'Strong';
        if (strength >= 3) return 'Medium';
        return 'Weak';
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        setPasswordStrength(checkPasswordStrength(newPassword));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setError('');
            await axios.post('http://localhost:5000/api/register', { username, password, email });
            alert('Registration successful! You can now log in.');
            navigate('/login');
        } catch (error) {
            console.error('Error registering:', error); // Log error for debugging
            if (error.response && error.response.data) {
                setError(error.response.data.message); // Display specific error message
            } else {
                setError('Registration failed. Please try again.');
            }
        }
    };


    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Register</h2>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Password"
                    required
                />
                <p className={`password-strength ${passwordStrength.toLowerCase()}`}>
                    Password strength: {passwordStrength}
                </p>
                <button type="submit">Register</button>
                {error && <p className='error-message'>{error}</p>}
                <p>
                    Already have an account? <span className="link" onClick={() => navigate('/login')}>Login here</span>
                </p>
            </form>
        </div>
    );
};

export default Register;
