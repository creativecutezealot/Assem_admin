import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.scss';
import './scss/main.scss';
import Router from './route/index';
import ReactNotification from 'react-notifications-component';

function App() {
    return (
        <div className="App">
            <ReactNotification />
            <Router />
        </div>
    );
}

export default App;
