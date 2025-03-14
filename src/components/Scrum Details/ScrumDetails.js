import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import { useHistory } from 'react-router-dom';

const ScrumDetails = ({ scrum }) => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const { user } = useContext(UserContext);
  const history = useHistory();

  // If no user is logged in, redirect to /login
  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    if (!loggedInUser) {
      history.push('/login');
    }
  }, [history]);

  
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/tasks?scrumId=${scrum.id}`);
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    fetchTasks();
  }, [scrum.id]);

  // Fetch the users assigned to tasks in this scrum
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:4000/users');
        // Filter to only those who appear in tasks.assignedTo
        const scrumUsers = response.data.filter((u) =>
          tasks.some((task) => task.assignedTo === u.id)
        );
        setUsers(scrumUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    if (tasks.length > 0) {
      fetchUsers();
    }
  }, [tasks]);

  // Handle status change if admin
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // Find the current task
      const currentTask = tasks.find((t) => t.id === taskId);
      if (!currentTask) return;

      // Build updated history
      const updatedHistory = [
        ...currentTask.history,
        {
          status: newStatus,
          date: new Date().toISOString().split('T')[0]
        }
      ];

      // PATCH the task
      await axios.patch(`http://localhost:4000/tasks/${taskId}`, {
        status: newStatus,
        history: updatedHistory
      });

      // Update local tasks state
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: newStatus, history: updatedHistory }
            : t
        )
      );
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <h3>Scrum Details for {scrum.name}</h3>

      <h4>Tasks</h4>
      <ul>
        {tasks.map((task) => (
          <li key={task.id} style={{ marginBottom: '0.5rem' }}>
            <strong>Title:</strong> {task.title} <br />
            <strong>Description:</strong> {task.description} <br />
            <strong>Status:</strong>{' '}
            {user?.role === 'admin' ? (
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(task.id, e.target.value)}
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            ) : (
              <em>{task.status}</em>
            )}
          </li>
        ))}
      </ul>

      <h4>Users</h4>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.name} ({u.email})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ScrumDetails;




// import React, { useState, useContext } from 'react';
// import axios from 'axios';
// import { useHistory } from 'react-router-dom';
// import { UserContext } from '../../context/UserContext';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   // We'll store validation errors in an object, e.g. { email: 'Error', password: 'Error', general: 'Error' }
//   const [errors, setErrors] = useState({});

//   const history = useHistory();
//   const { login } = useContext(UserContext);

//   // Simple regex to test email format
//   const isValidEmail = (testEmail) => {
//     const re = /\S+@\S+\.\S+/;
//     return re.test(testEmail);
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     const newErrors = {};

//     // 1) Validate Email
//     if (!email.trim()) {
//       newErrors.email = 'Email is required';
//     } else if (!isValidEmail(email)) {
//       newErrors.email = 'Invalid email format (e.g., user@example.com)';
//     }

//     // 2) Validate Password
//     if (!password.trim()) {
//       newErrors.password = 'Password is required';
//     }

//     // If we have any errors, show them and stop
//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }

//     // If validation passes, attempt login via JSON server
//     try {
//       // Attempt to find user with matching email/password
//       const response = await axios.get(
//         `http://localhost:4000/users?email=${email}&password=${password}`
//       );

//       // If no user found, show an error
//       if (response.data.length === 0) {
//         setErrors({ general: 'Invalid email or password' });
//         return;
//       }

//       // Otherwise, we have a valid user
//       const foundUser = response.data[0];
//       login(foundUser);

//       // If admin, go to dashboard; if employee, go to profiles (or wherever you want)
//       if (foundUser.role === 'admin') {
//         history.push('/');
//       } else {
//         history.push('/profiles');
//       }
//     } catch (error) {
//       console.error('Error logging in:', error);
//       // Optionally set a general error
//       setErrors({ general: 'Something went wrong. Please try again.' });
//     }
//   };

//   return (
//     <div>
//       <h2>Login</h2>
//       {/* Show a top-level error if present */}
//       {errors.general && <div style={{ color: 'red' }}>{errors.general}</div>}

//       <form onSubmit={handleLogin} style={{ marginTop: '1rem' }}>
//         <div style={{ marginBottom: '1rem' }}>
//           <label>Email: </label>
//           <input
//             type="text" 
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />
//           {errors.email && (
//             <div style={{ color: 'red' }}>{errors.email}</div>
//           )}
//         </div>

//         <div style={{ marginBottom: '1rem' }}>
//           <label>Password: </label>
//           <input
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />
//           {errors.password && (
//             <div style={{ color: 'red' }}>{errors.password}</div>
//           )}
//         </div>

//         <button type="submit">Login</button>
//       </form>

//       <button onClick={() => history.push('/signup')} style={{ marginTop: '1rem' }}>
//         Sign Up
//       </button>
//     </div>
//   );
// };

// export default Login;