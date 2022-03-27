import React from 'react';
import './login.scss';
import { Form, Button, Row, Col, Modal, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import adminApi from '../../../services/admin.service';
import session from '../../../services/session.service';
import helper from '../../../services/helper.service';

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: true,
            email: '',
            password: '',
            modalShow: false,
            loginRes: null,
            clubs: [],
            showMovingPopup: false
        };
    }

    handleInputChange = (event) => {
        let target = event.target;
        let name = target.name;
        let value = target.value;
        if (name === 'email') {
            let isEmailValid;
            if (!this.validateEmail(value)) {
                isEmailValid = false;
            } else {
                isEmailValid = true;
            }
            this.setState({
                isEmailValid: isEmailValid,
            });
        }
        this.setState({
            [name]: value,
        });
    };

    handleLogin = async () => {
        if (
            this.state.email === null ||
            this.state.email === '' ||
            this.state.password === null ||
            this.state.password === ''
        ) {
            helper.showToast(
                'Warning',
                'Please enter a valid user name and password.',
                2
            );
        } else {
            try {
                const loginRes = await adminApi.login(this.state);
                if (loginRes.status) {
                    if (loginRes.data.onboarding && loginRes.data.onboarding !== 'complete') {
                        this.setState({
                            loginRes: loginRes.data
                        });
                        this.handleShowMovingPopup();
                        return;
                    } else {
                        if (loginRes.data.user_role === 'manager') {
                            const managerRes = await adminApi.getClubByManager(
                                loginRes.data.user_id,
                                loginRes.data.api_token
                            );
                            if (
                                managerRes.status &&
                                Array.isArray(managerRes.data) &&
                                managerRes.data.length > 0
                            ) {
                                if (managerRes.data.length === 1) {
                                    session.set('futureof-user', loginRes.data);
                                    session.set(
                                        'futureof-club',
                                        managerRes.data[0]
                                    );
                                    window.location.href = '/manager';
                                } else {
                                    this.props.history.push({
                                        pathname: '/login/select-club',
                                        state: { clubs: managerRes.data, loginRes: loginRes.data }
                                    });
                                }
                            } else {
                                helper.showToast(
                                    'Error',
                                    'There is no club for which you are manager',
                                    3
                                );
                            }
                        } else if (loginRes.data.user_role === 'admin') {
                            session.set('futureof-user', loginRes.data);
                            window.location.href = '/admin';
                        } else {
                            const userRes = await adminApi.getClubsWithUserId(
                                loginRes.data.user_id
                            );
                            if (
                                userRes.status &&
                                Array.isArray(userRes.connect) &&
                                userRes.connect.length > 0
                            ) {
                                if (userRes.connect.length === 1) {
                                    session.set('futureof-user', loginRes.data);
                                    session.set(
                                        'audio-club',
                                        userRes.connect[0]
                                    );
                                    window.location.href = '/user';
                                } else {
                                    this.props.history.push({
                                        pathname: '/login/select-club',
                                        state: { clubs: userRes.connect, loginRes: loginRes.data }
                                    });
                                }
                            }
                        }
                    }
                } else {
                    helper.showToast('Error', loginRes.data, 3);
                }
            } catch (error) {
                helper.showToast('Error', 'Failed to log in.', 3);
            }
        }
    };

    handleChangeDropDown = () => {
        this.setState({
            showDropDown: !this.state.showDropDown,
        });
    };

    validateEmail = (email) => {
        const re =
            /^(([^<>()[\]\\.,;:\s@']+(\.[^<>()[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    goToDashboard = (club) => {
        if (!this.state.loginRes) {
            return;
        }
        session.set('futureof-user', this.state.loginRes);
        if (this.state.loginRes.user_role === 'manager') {
            session.set('futureof-club', club);
            window.location.href = '/manager';
        } else if (this.state.loginRes.user_role === '' || this.state.loginRes.user_role === 'user') {
            session.set('audio-club', club);
            window.location.href = '/user';
        }
    };

    onKeyPress = (event) => {
        if (event.charCode === 13) {
            this.btn.click();
        }
    }

    handleShowModal = () => {
        this.setState({
            modalShow: !this.state.modalShow,
        });
    }

    handleShowMovingPopup = () => {
        this.setState({
            showMovingPopup: !this.state.showMovingPopup,
        });
    }

    selectClubPopup = () => {
        const { modalShow, clubs } = this.state;
        return (
            <Modal
                show={modalShow}
                size='lg'
                aria-labelledby='contained-modal-title-vcenter'
                centered
                dialogClassName='select-club'
                onHide={this.handleShowModal}
            >
                <Modal.Header closeButton>
                    <Modal.Title id='contained-modal-title-vcenter'>
                        Select Club
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        {clubs.map((club) => (
                            <Col
                                xs={12}
                                md={12}
                                className='my-2'
                                key={club.club_id}
                            >
                                <Image
                                    src={club.banner_url}
                                    fluid
                                    onClick={() => this.goToDashboard(club)}
                                    style={{ cursor: 'pointer' }}
                                />
                            </Col>
                        ))}
                    </Row>
                </Modal.Body>
            </Modal>
        );
    };

    handleNext = () => {
        const { loginRes } = this.state;
        switch (loginRes.onboarding) {
            case 'email':
                this.props.history.push('/signup/confirm');
                break;
            case 'confirm':
                this.props.history.push('/signup/location');
                break;
            case 'location':
                this.props.history.push('/signup/birthday');
                break;
            case 'birthday':
                this.props.history.push('/signup/photo');
                break;
            case 'photo':
                this.props.history.push('/signup/profile');
                break;
            case 'profile':
                this.props.history.push('/signup/invitecode');
                break;
        }
    }

    MovingPopUp = () => {
        const { showMovingPopup } = this.state;
        return (
            <Modal
                show={showMovingPopup}
                size='md'
                aria-labelledby='contained-modal-title-vcenter'
                centered
                dialogClassName='select-club'
                onHide={this.handleShowMovingPopup}
            >
                <Modal.Header closeButton>
                    <Modal.Title id='contained-modal-title-vcenter'>
                        Please finish your member setup
                    </Modal.Title>
                </Modal.Header>
                {/* <Modal.Body>
                    <Row>
                        Please finish your member setup
                    </Row>
                </Modal.Body> */}
                <Modal.Footer>
                    <Button onClick={this.handleNext}>Next</Button>
                </Modal.Footer>
            </Modal>
        );
    };

    render() {
        const { email, password, isEmailValid } = this.state;
        return (
            <div className='login'>
                <Form className='login-form'>
                    <div className='d-flex align-content-center justify-content-center mb-4'>
                        <img
                            className='auth-logo'
                            src={require('../../../assets/logo.svg')}
                            alt=''
                        />
                    </div>
                    <Form.Group className='mb-2'>
                        <Form.Control
                            type='email'
                            className='login-form-input'
                            placeholder='USER EMAIL'
                            name='email'
                            required
                            value={email}
                            onChange={this.handleInputChange}
                            onKeyPress={this.onKeyPress}
                            isInvalid={email !== '' && !isEmailValid}
                        />
                    </Form.Group>
                    <Form.Group className='mb-0'>
                        <Form.Control
                            type='password'
                            className='login-form-input'
                            placeholder='PASSWORD'
                            name='password'
                            required
                            value={password}
                            onChange={this.handleInputChange}
                            onKeyPress={this.onKeyPress}
                        />
                    </Form.Group>
                    <div className='d-flex align-items-start justify-content-end mb-3 forgotPass-container'>
                        <Link to='/forgotpass'>
                            <span className='forgotPass'>FORGOT PASSWORD?</span>
                        </Link>
                    </div>
                    <div className='d-flex align-items-center justify-content-center'>
                        <Button
                            type='button'
                            className='btn btn-primary login-btn'
                            onClick={this.handleLogin}
                            ref={node => (this.btn = node)}
                        >
                            LOGIN
                        </Button>
                    </div>
                    {this.selectClubPopup()}
                    {this.MovingPopUp()}
                    <div className='d-flex align-items-center justify-content-center mt-3 join-now'>
                        NOT A MEMEBER YET?{' '}
                        <Link to='/signup' className='join-now-link'>
                            <span>&nbsp;JOIN NOW</span>
                        </Link>
                    </div>
                </Form>
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

export default Login;
