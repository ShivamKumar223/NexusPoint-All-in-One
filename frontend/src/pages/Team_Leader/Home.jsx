import React, { useContext } from 'react';
import { MenuContext } from '../../context/MenuContext';

import "./css/home.css";
export const HomeTeamOwner = () => {
  const { isOpenMenu } = useContext(MenuContext);

  return (
    <div className={`page ${isOpenMenu? "small-screen" : "full-screen"}`}>
      <div className='home-greeting-container'>
           <h2 className='home-greeting'>
               Welcome Shivam
           </h2>
      </div>
    </div>
  )
}
