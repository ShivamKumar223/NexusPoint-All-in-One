import React, { useContext, useState } from 'react';
import { MdOutlineMenuBook } from "react-icons/md";
import { FaUserTie } from "react-icons/fa6";

import { FaBook } from "react-icons/fa6";

import "./css/navbar.css";
import { MenuContext } from '../../../context/MenuContext';


export const NavBar = () => {
     
    const { isOpenMenu, setIsOpenMenu } = useContext(MenuContext);

    const handleMenu = () =>{
        setIsOpenMenu(!isOpenMenu);
    }

  return (
    <div className='navbar-container'>

             <div onClick={handleMenu}> {isOpenMenu?<MdOutlineMenuBook /> : <FaBook />}</div>
             <div><FaUserTie /></div>

    </div>
  )
}
