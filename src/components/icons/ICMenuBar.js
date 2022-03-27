import React from 'react';

const icon = {
    cursor: 'pointer',
};

const bar = {
    width: '30px',
    height: '3px',
    backgroundColor: 'white',
    margin: '7px 0',
    pointerEvents: 'none',
};

function ICMenuBar() {
    return (
        <div style={icon}>
            <div style={bar}></div>
            <div style={bar}></div>
            <div style={bar}></div>
        </div>
    );
}

export default ICMenuBar;
