import { createContext } from "react";
import axios from 'axios';

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
axios.defaults.baseURL = isLocalhost 
  ? 'http://localhost:5000/api' 
  : 'https://attendzen.onrender.com/api';

  export const AuthContext = createContext();

  export const AuthProvider = ({ children }) =>{
    
  }