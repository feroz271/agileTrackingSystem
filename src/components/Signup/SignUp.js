


import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const history = useHistory();

  const handleSignUp = async (e) => {
    e.preventDefault();
    // If HTML5 validation passes, we proceed with the POST request.
    try {
      await axios.post('http://localhost:4000/users', {
        name,
        email,
        password,
        role: 'employee'
      });
      history.push('/login');
    } catch (error) {
      console.error('Error signing up:', error);
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp}>

        {/* NAME FIELD */}
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            /* 
              pattern:  "^(?!\\s*$).+"
              This means: "the string cannot be empty or just whitespace"
            */
            pattern="^(?!\s*$).+"
            /* 
              When invalid, set a custom message:
            */
            onInvalid={(e) => e.target.setCustomValidity('Please enter your name.')}
            /* 
              Clear the message once the user starts typing again:
            */
            onInput={(e) => e.target.setCustomValidity('')}
          />
        </label>
        <br />

        {/* EMAIL FIELD */}
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <br />

        {/* PASSWORD FIELD */}
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <br />

        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;