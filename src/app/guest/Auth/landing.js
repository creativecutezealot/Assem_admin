import React from 'react';
import './landing.scss';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

class Landing extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        return (
            <div className='landing'>
                <div className='logo'>
                    <div className='d-flex align-items-center justify-content-center'>
                        <img
                            className='auth-logo'
                            src={require('../../../assets/logo.svg')}
                            alt=''
                        />
                    </div>
                    <div className='d-flex align-items-center justify-content-center description'>
                        MAKE AN IMPACT
                    </div>

                </div>

                <div className='landing-form'>
                    <div className='d-flex align-items-center justify-content-center'>
                        <Button
                            type='button'
                            className='btn btn-primary signup-btn mr-2'
                            onClick={() => this.props.history.push('/signup')}
                        >
                            SIGN UP
                        </Button>
                        <Button
                            type='button'
                            variant='outline-light'
                            className='btn login-btn'
                            onClick={() => this.props.history.push('/login')}
                        >
                            LOGIN
                        </Button>
                    </div>
                </div>
                <div className='d-flex align-items-center justify-content-start footer'>
                    <Link to={'/'} className='items'>TERMS</Link>
                    <Link to={'/'} className='items'>PRIVACY</Link>
                    <Link to={'/'} className='items'>SUPPORT</Link>
                    <Link to={'/'} className='items'>CONTACT</Link>
                </div>
                <div className='background-overlay'></div>
                {/* <video className='video' autoPlay loop muted>
                    <source
                        src={require('../../../assets/video/background.mp4')}
                    />
                </video> */}
            </div>
        );
    }
}

export default Landing;
