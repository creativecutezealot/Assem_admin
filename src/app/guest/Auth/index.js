import React from 'react';
import './style.scss';
import { Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faBars } from '@fortawesome/free-solid-svg-icons';

class HomeScreen extends React.Component {
    constructor(props) {
        super();
        this.state = {
            showLoginForm: false,
            showDropDown: false,
        };
    }
    handleChangeDropDown = () => {
        this.setState({
            showDropDown: !this.state.showDropDown,
        });
    };

    render() {
        const { showDropDown } = this.state;
        return (
            <div className="onboarding">
                <div className="login-menu-container">
                    <div
                        className="login-menu"
                        onClick={this.handleChangeDropDown}
                    >
                        <FontAwesomeIcon
                            className="login-memu-icon"
                            icon={showDropDown ? faTimes : faBars}
                        />
                    </div>
                    {showDropDown && (
                        <Link to="/login" className="login-items">
                            Login
                        </Link>
                    )}
                </div>
                <Form className="login-main-form">
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <img
                            className="logo"
                            src={require('../../../assets/logo.svg')}
                            alt=""
                        />
                    </div>
                </Form>
                <div className="background-overlay"></div>
                <video className="video" autoPlay loop muted>
                    <source
                        src={require('../../../assets/video/background.mp4')}
                    />
                </video>
            </div>
        );
    }
}

export default HomeScreen;
