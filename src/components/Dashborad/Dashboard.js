import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import ScrumDetails from '../Scrum Details/ScrumDetails';  
import { UserContext } from '../../context/UserContext';

const Dashboard = () => {
  const [scrums, setScrums] = useState([]);
  const [selectedScrum, setSelectedScrum] = useState(null);

 
  const [showForm, setShowForm] = useState(false);

  const [newScrumName, setNewScrumName] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('To Do');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');


  const [users, setUsers] = useState([]);

 
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchScrums = async () => {
      try {
        const response = await axios.get('http://localhost:4000/scrums');
        setScrums(response.data);
      } catch (error) {
        console.error('Error fetching scrums:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:4000/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchScrums();
    fetchUsers();
  }, []);


  const handleGetDetails = async (scrumId) => {
    try {
      const response = await axios.get(`http://localhost:4000/scrums/${scrumId}`);
      setSelectedScrum(response.data);
    } catch (error) {
      console.error('Error fetching scrum details:', error);
    }
  };


  const handleAddScrum = async (event) => {
    event.preventDefault();
    try {
      
      const newScrumResponse = await axios.post('http://localhost:4000/scrums', {
        name: newScrumName
      });
      const newScrum = newScrumResponse.data; 

     
      await axios.post('http://localhost:4000/tasks', {
        title: newTaskTitle,
        description: newTaskDescription,
        status: newTaskStatus,
        scrumId: newScrum.id,
        assignedTo: newTaskAssignedTo,
        history: [
          {
            status: newTaskStatus,
            date: new Date().toISOString().split('T')[0] 
          }
        ]
      });

    
      const updatedScrums = await axios.get('http://localhost:4000/scrums');
      setScrums(updatedScrums.data);

      
      setShowForm(false);
      setNewScrumName('');
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskStatus('To Do');
      setNewTaskAssignedTo('');
    } catch (error) {
      console.error('Error adding scrum:', error);
    }
  };

  
  const handleCancel = () => {
    setShowForm(false);
    setNewScrumName('');
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskStatus('To Do');
    setNewTaskAssignedTo('');
  };

  return (
    <div>
      <h2>Scrum Teams</h2>

      {/* If the logged-in user is an admin, show "Add New Scrum" */}
      {user?.role === 'admin' && (
        <div>
          <button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add New Scrum'}
          </button>

          {/* The form appears when showForm === true */}
          {showForm && (
            <form onSubmit={handleAddScrum} style={{ marginTop: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
              <div>
                <label>Scrum Name: </label>
                <input
                  type="text"
                  value={newScrumName}
                  onChange={(e) => setNewScrumName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Task Title: </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Task Description: </label>
                <input
                  type="text"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Task Status: </label>
                <select
                  value={newTaskStatus}
                  onChange={(e) => setNewTaskStatus(e.target.value)}
                  required
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <div>
                <label>Assign To: </label>
                <select
                  value={newTaskAssignedTo}
                  onChange={(e) => setNewTaskAssignedTo(e.target.value)}
                  required
                >
                  <option value="">-- Select a user --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit">Create Scrum</button>
              <button type="button" onClick={handleCancel} style={{ marginLeft: '1rem' }}>
                Cancel
              </button>
            </form>
          )}
        </div>
      )}

      {/* List all scrums */}
      <ul style={{ marginTop: '1rem' }}>
        {scrums.map((scrum) => (
          <li key={scrum.id} style={{ marginBottom: '0.5rem' }}>
            {scrum.name}{' '}
            <button onClick={() => handleGetDetails(scrum.id)}>Get Details</button>
          </li>
        ))}
      </ul>

      {/* If a scrum is selected, show its details below */}
      {selectedScrum && <ScrumDetails scrum={selectedScrum} />}
    </div>
  );
};

export default Dashboard;