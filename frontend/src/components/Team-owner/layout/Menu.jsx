import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { MenuContext } from '../../../context/MenuContext';

import "./css/menu.css";
export const MenuTeamOwner = () => {
      const { isOpenMenu } = useContext(MenuContext);
  return (
    <div className={`menu-container ${isOpenMenu? "" : "closeMenu"}`}>
            <NavLink>+ New team</NavLink>
            <NavLink>Members</NavLink>
            <NavLink>Teams</NavLink>
            <NavLink>Add members</NavLink>
            <NavLink>Remove member</NavLink>
            <NavLink>Team Performance</NavLink>
            <NavLink>Chat</NavLink>
    </div>
  )
}
