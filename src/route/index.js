import React from 'react';
// API
import session from '../services/session.service';

import GestureRouter from './Gesture';
import UserRouter from './User';
import ManagerRouter from './Manager';
import AdminRouter from './Admin';

class Admin extends React.Component {
    constructor(props) {
        super();
    }

    render() {
        const user = session.get('futureof-user');
        if (user) {
            if (user.user_role === 'admin') {
                return <AdminRouter />;
            } else if (user.user_role === 'manager') {
                return <ManagerRouter />;
            } else {
                return <UserRouter />;
            }
        } else {
            return <GestureRouter />;
        }
    }
}

export default Admin;
