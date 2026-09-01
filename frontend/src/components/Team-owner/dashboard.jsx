import React from 'react'
import { Outlet } from 'react-router-dom';

import { NavBar } from './layout/NavBar.jsx'
import { MenuTeamOwner } from './layout/Menu.jsx';

export const DashboardTeamOwner = () => {
    return (
        <div>
            <NavBar />
            <MenuTeamOwner/>
            <Outlet />
        </div>
    )
}
