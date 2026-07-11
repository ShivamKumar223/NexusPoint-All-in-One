import React from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Login } from './pages/login';
import { Signup } from './pages/signup';
import { ForgetPassword } from './pages/forgetPassword';


export const App = () => {

  const router = createBrowserRouter([
    {
      path : '/',
      element: <Login/>
    },
    {
      path : '/signup',
      element: <Signup/>
    },
    {
      path : '/forgetpassword',
      element: <ForgetPassword/>
    },
  ])
  
  return (
   <>
    <RouterProvider router={router}/>
    <ToastContainer />
   </>
  )
}
