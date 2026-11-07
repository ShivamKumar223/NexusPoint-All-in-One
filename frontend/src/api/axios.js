import axios from 'axios';

const API = axios.create({
  baseURL: 'https://nexuspoint-all-in-one.onrender.com/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

// const API = axios.create({
//   baseURL: 'http://localhost:5000/api',
//   withCredentials: true,
//   headers: { 'Content-Type': 'application/json' }
// });

export default API;
