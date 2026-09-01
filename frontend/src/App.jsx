import React from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Login } from './pages/login';
import { Signup } from './pages/signup';
import { ForgetPassword } from './pages/forgetPassword';
import { DashboardTeamOwner } from './components/Team-owner/dashboard';
import { HomeTeamOwner } from './pages/Team_Leader/Home';
import { MenuProvider } from './context/MenuContext';


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
    {
      path : '/team-owner-dashboard',
      element : <DashboardTeamOwner />,
      children: [
          {
            path:'',
            element: <HomeTeamOwner />
          }
        ]
      }
    
  ])
  
  return (
   <>
   <MenuProvider>
        <RouterProvider router={router}/>
        <ToastContainer />
   </MenuProvider>
   </>
  )
}
