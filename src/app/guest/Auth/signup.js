import React from 'react';
import './signup.scss';
import { Form, Button, Image, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import adminApi from '../../../services/admin.service';
import session from '../../../services/session.service';
import helper from '../../../services/helper.service';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFan } from '@fortawesome/free-solid-svg-icons';

class Signup extends React.Component {
    constructor(props) {
        super();
        this.state = {
            showModal: true,
            validated: false,
            email: '',
            firstname: '',
            lastname: '',
            username: '',
            password: '',
            repassword: '',
            allusers: [],
        };
        this.pop = false;
    }

    componentDidMount() {
        this.getAuthAllUsers();
    }

    getAuthAllUsers = async () => {
        try {
            const allusers = await adminApi.getAuthAllUsers();
            if (allusers.status) {
                if (allusers) {
                    this.setState({
                        allusers: allusers.data,
                    });
                    const currentUser = session.get('currentUser');
                    if (currentUser) {
                        const email = currentUser.email
                            ? currentUser.email
                            : '';
                        const firstname = currentUser.first_name
                            ? currentUser.first_name
                            : '';
                        const lastname = currentUser.last_name
                            ? currentUser.last_name
                            : '';
                        const username = currentUser.username
                            ? currentUser.username
                            : '';
                        const users = allusers.data.filter(
                            (user) => user.approved === true
                        );
                        let isEmailValid;
                        let isValid;
                        for (let i = 0; i < users.length; i++) {
                            if (users[i]) {
                                if (users[i].email === email || email === '') {
                                    isEmailValid = false;
                                    break;
                                } else {
                                    isEmailValid = true;
                                }
                            }
                        }
                        for (let i = 0; i < users.length; i++) {
                            if (users[i]) {
                                if (
                                    users[i].username === username ||
                                    username === ''
                                ) {
                                    isValid = false;
                                    break;
                                } else {
                                    isValid = true;
                                }
                            }
                        }
                        this.setState({
                            email: email,
                            firstname: firstname,
                            lastname: lastname,
                            username: username,
                            isEmailValid: isEmailValid,
                            isValid: isValid,
                        });
                    }
                }
            } else {
                helper.showToast('Error', allusers.data, 3);
            }
        } catch (error) {
            helper.showToast('Error', 'Getting All User Failed', 3);
        }
    };

    handleInputChange = (event) => {
        const { allusers, firstname, lastname } = this.state;
        let target = event.target;
        let name = target.name;
        let value = target.value;
        let isValid = false;
        let isEmailValid = false;

        if (name === 'email') {
            if (!this.validateEmail(value)) {
                isEmailValid = false;
                this.setState({
                    isEmailValid: isEmailValid,
                    email: value,
                });
                setTimeout(() => {
                    this.validateForm();
                }, 500);
                return;
            }
            let users = allusers.filter((user) => user.approved === true);
            for (let i = 0; i < users.length; i++) {
                if (users[i]) {
                    if (users[i].email === value || value === '') {
                        isEmailValid = false;
                        helper.showToast(
                            'Error',
                            'This email address is already being used',
                            3
                        );
                        break;
                    } else {
                        isEmailValid = true;
                    }
                }
            }

            this.setState({
                isEmailValid: isEmailValid,
                email: value,
            });
            setTimeout(() => {
                this.validateForm();
            }, 500);
        }
        if (name === 'firstname') {
            const username = value.replace(/\s/g, '') + lastname.replace(/\s/g, '');
            let users = allusers.filter((user) => user.approved === true);
            for (let i = 0; i < users.length; i++) {
                if (users[i]) {
                    if (users[i].username === username || value === '') {
                        isValid = false;
                        break;
                    } else {
                        isValid = true;
                    }
                }
            }

            this.setState({
                isValid: isValid,
                username: username.toLowerCase(),
            });
            setTimeout(() => {
                this.validateForm();
            }, 500);
        }
        if (name === 'lastname') {
            const username = firstname.replace(/\s/g, '') + value.replace(/\s/g, '');
            let users = allusers.filter((user) => user.approved === true);
            for (let i = 0; i < users.length; i++) {
                if (users[i]) {
                    if (users[i].username === username || value === '') {
                        isValid = false;
                        break;
                    } else {
                        isValid = true;
                    }
                }
            }

            this.setState({
                isValid: isValid,
                username: username.toLowerCase(),
            });
            setTimeout(() => {
                this.validateForm();
            }, 500);
        }
        this.setState({
            [name]: value,
        });
        setTimeout(() => {
            this.validateForm();
        }, 500);
    };

    handleUsername = async (event) => {
        const { allusers } = this.state;
        let target = event.target;
        let name = target.name;
        let value = target.value;

        let isValid = false;
        let users = allusers.filter((user) => user.approved === true);
        for (let i = 0; i < users.length; i++) {
            if (users[i]) {
                if (users[i].username === value || value === '') {
                    isValid = false;
                    break;
                } else {
                    isValid = true;
                }
            }
        }

        this.setState({
            isValid: isValid,
            [name]: value.toLowerCase(),
        });
        setTimeout(() => {
            this.validateForm();
        }, 500);
    };

    handleSignup = async (event) => {
        event.preventDefault();
        const { email, firstname, lastname, username, password, repassword, allusers } =
            this.state;
        const data = {
            email: email,
            firstname: firstname,
            lastname: lastname,
            username: username,
            password: password,
        };
        const form = event.currentTarget;

        this.setState({ validated: true });
        if (form.checkValidity() === false) {
            event.stopPropagation();
            this.setState({ validated: false });
            return;
        }
        if (!this.validatePassword(password)) {
            helper.showToast(
                'Error',
                'Password must contain 8 characters including one number and one special character',
                3
            );
            return;
        }
        if (password !== repassword) {
            this.setState({
                isPasswordValid: false
            });
            helper.showToast('Error', 'Passwords do not match.', 3);
            return;
        }

        for (const key in data) {
            if (data[key] === '') {
                return;
            }
        }
        try {
            const registerRes = await adminApi.signup(this.state);
            if (registerRes.status) {
                session.set('currentUser', registerRes.data);
                this.props.history.push('/signup/confirm');
            } else {
                helper.showToast('Error', registerRes.data, 3);
            }
        } catch (error) {
            helper.showToast('Error', 'Failed to register.', 3);
        }
    };

    generateUsername = () => {
        const { username, allusers, email } = this.state;
        let name =
            username.replace(/[0-9]/g, '') +
            Math.floor(Math.random() * (999 - 100 + 1) + 100);

        let isValid = false;
        let users = allusers.filter((user) => user.email !== email);
        for (let i = 0; i < users.length; i++) {
            if (users[i]) {
                if (users[i].username === name || name === '') {
                    isValid = false;
                    break;
                } else {
                    isValid = true;
                }
            }
        }

        this.setState({
            isValid: isValid,
            username: name,
        });
        this.validateForm();
    };

    validateEmail = (email) => {
        const re =
            /^(([^<>()[\]\\.,;:\s@']+(\.[^<>()[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    validatePassword = (password) => {
        const re =
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        return re.test(String(password));
    };

    validateForm = () => {
        const {
            isEmailValid,
            firstname,
            lastname,
            isValid,
            password,
            repassword,
            isPasswordValid
        } = this.state;
        if (!isEmailValid) {
            this.setState({
                isValidForm: false,
            });
            return;
        }
        if (firstname === '') {
            this.setState({
                isValidForm: false,
            });
            return;
        }
        if (lastname === '') {
            this.setState({
                isValidForm: false,
            });
            return;
        }
        if (!isValid) {
            this.setState({
                isValidForm: false,
            });
            return;
        }
        if (password === '') {
            return false;
        }
        if (repassword === '') {
            this.setState({
                isValidForm: false,
            });
            return;
        }
        if (
            isValid === true &&
            isEmailValid === true &&
            firstname !== '' &&
            lastname !== '' &&
            password !== '' &&
            repassword !== ''
        ) {
            this.setState({
                isValidForm: true,
            });
            return;
        }
    };

    onKeyPress = (event) => {
        if (event.charCode === 13) {
            this.btn.click();
        }
    }

    render() {
        const {
            validated,
            email,
            firstname,
            lastname,
            username,
            password,
            repassword,
            isEmailValid,
            isValid,
            isValidForm,
            isPasswordValid
        } = this.state;
        return (
            <div className='signup'>
                <div className='stepper'>
                    <div className='container'>
                    <div className='title'>STEP 1/8</div>
                    <div className='step step-active step1'>
                        <div>
                            <div className='circle'></div>
                        </div>
                    </div>
                    <div className='step step1'>
                        <div>
                            <div className='circle'></div>
                        </div>
                    </div>
                    <div className='step step1'>
                        <div>
                            <div className='circle'></div>
                        </div>
                    </div>
                    <div className='step step2'>
                        <div>
                            <div className='circle'></div>
                        </div>
                    </div>
                    <div className='step step2'>
                        <div>
                            <div className='circle'></div>
                        </div>
                    </div>
                    <div className='step step2'>
                        <div>
                            <div className='circle'></div>
                        </div>
                    </div>
                    <div className='step step2'>
                        <div>
                            <div className='circle'></div>
                        </div>
                    </div>
                    <div className='step step2'>
                        <div>
                            <div className='circle'></div>
                        </div>
                    </div>
                    </div>
                    
                </div>
                <Form
                    className='signup-form'
                    noValidate
                    validated={validated}
                    onSubmit={this.handleSignup}
                >
                    <div className='d-flex align-content-center justify-content-center mb-4'>
                        <img
                            className='auth-logo'
                            src={require('../../../assets/logo.svg')}
                            alt=''
                        />
                    </div>
                    <Form.Group className='form-group mb-2'>
                        <Form.Control
                            type='email'
                            className='register-form-input'
                            placeholder='USER EMAIL'
                            name='email'
                            // pattern='[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$'
                            required
                            value={email}
                            onChange={this.handleInputChange}
                            onKeyPress={this.onKeyPress}
                            isInvalid={email !== '' && !isEmailValid}
                        // isValid={isEmailValid}
                        />
                    </Form.Group>
                    <Form.Group className='form-group mb-2'>
                        <Form.Control
                            type='text'
                            className='register-form-input'
                            placeholder='FIRST NAME'
                            name='firstname'
                            required
                            value={firstname}
                            onChange={this.handleInputChange}
                            onKeyPress={this.onKeyPress}
                        // isValid={firstname !== ''}
                        />
                    </Form.Group>
                    <Form.Group className='form-group mb-2'>
                        <Form.Control
                            type='text'
                            className='register-form-input'
                            placeholder='LAST NAME'
                            name='lastname'
                            required
                            value={lastname}
                            onChange={this.handleInputChange}
                            onKeyPress={this.onKeyPress}
                        // isValid={lastname !== ''}
                        />
                    </Form.Group>
                    <Form.Group className='form-group mb-2'>
                        <InputGroup>
                            <Form.Control
                                type='text'
                                className='register-form-input'
                                placeholder='USER NAME'
                                name='username'
                                required
                                value={username}
                                onChange={this.handleUsername}
                                onKeyPress={this.onKeyPress}
                                isInvalid={username !== '' && !isValid}
                            // isValid={isValid}
                            />
                            {username === '' ? (
                                <></>
                            ) : (
                                <InputGroup.Append>
                                    <InputGroup.Text
                                        style={{
                                            backgroundColor: 'transparent',
                                        }}
                                        onClick={() => {
                                            this.generateUsername();
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faFan} />
                                    </InputGroup.Text>
                                </InputGroup.Append>
                            )}
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className='form-group mb-2'>
                        <Form.Control
                            type='password'
                            className='register-form-input'
                            placeholder='PASSWORD'
                            name='password'
                            pattern='^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$'
                            required
                            value={password}
                            onChange={this.handleInputChange}
                            onKeyPress={this.onKeyPress}
                        // isInvalid={password === ''}
                        // isValid={password !== ''}
                        />
                    </Form.Group>
                    <Form.Group className='form-group mb-2'>
                        <Form.Control
                            type='password'
                            className='register-form-input'
                            placeholder='RE-ENTER PASSWORD'
                            name='repassword'
                            required
                            value={repassword}
                            onChange={this.handleInputChange}
                            onKeyPress={this.onKeyPress}
                            isInvalid={isPasswordValid === false}
                        />
                    </Form.Group>
                    <div className='d-flex align-items-center justify-content-center'>
                        <Button
                            type='submit'
                            className='btn btn-primary register-btn'
                            onClick={this.handleSignup}
                            disabled={!isValidForm}
                            ref={node => (this.btn = node)}
                        >
                            SIGN UP
                        </Button>
                    </div>
                    <div className='mt-3 text-center align-items-center join-now'>
                        BY SIGNING UP, YOU AGREE TO OUR
                        <Link to='/login' className='join-now-link d-inline-block'>
                            <span>&nbsp;TERMS</span>
                        </Link>
                        ,
                        <Link to='/login' className='join-now-link d-inline-block'>
                            <span>&nbsp;DATA POLICY&nbsp;</span>
                        </Link>
                        and
                        <Link to='/login' className='join-now-link d-inline-block'>
                            <span>&nbsp;COOKIES POLICY</span>
                        </Link>
                    </div>
                    <div className='mt-3 d-flex align-items-center justify-content-center join-now'>
                        HAVE AN ACCOUNT?{' '}
                        <Link to='/login' className='join-now-link d-inline-block'>
                            <span>&nbsp;LOG IN</span>
                        </Link>
                    </div>
                    {/* <div className='mt-3 d-flex align-items-center justify-content-center'>
                        Get the app.
                    </div>
                    <div className='mt-3 d-flex align-items-center justify-content-center'>
                        <Link to='' target='_blank'>
                            <Image
                                src={require('../../../assets/img/appstore.png')}
                                style={{ width: '120px' }}
                            ></Image>
                        </Link>
                    </div> */}
                </Form>
                <div className='background-overlay'></div>
                <video className='video' autoPlay loop muted>
                    <source
                        src={require('../../../assets/video/background.mp4')}
                    />
                </video>
            </div>
        );
    }
}

export default Signup;
