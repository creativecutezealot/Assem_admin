import React, { useState } from 'react';
import './home.scss';
import { Link } from 'react-router-dom';
import ICMenuBar from '../../components/icons/ICMenuBar';
import backgroundVideo from '../../assets/video/background.mp4';

function Home() {
    const [menuState, setMenuState] = useState(false);

    return (
        <div className="home">
            <div className="nav-wrapper">
                <div
                    className="icon-menu"
                    onClick={() => setMenuState(!menuState)}
                >
                    <ICMenuBar />
                </div>
                <div className={menuState ? 'menu open' : 'menu'}>
                    <div className="nav">
                        <Link className="nav-item" to={'/login'}>
                            Login
                        </Link>
                    </div>
                </div>
            </div>
            <video className="video" autoPlay loop muted>
                <source src={require('../../assets/video/background.mp4')} />
            </video>
            <div className="logo-wrapper">
                <img
                    className="logo-img"
                    src={require('../../assets/logo.svg')}
                    alt="logo"
                />
            </div>
        </div>
    );
}

export default Home;
