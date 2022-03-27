import React from 'react';
import './confirm.scss';
import { Form, Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import adminApi from '../../../services/admin.service';
import session from '../../../services/session.service';
import helper from '../../../services/helper.service';

class Confirm extends React.Component {
    constructor(props) {
        super();
        this.state = {
            showModal: true,
            code: '',
        };
    }

    componentDidMount() {
        const currentUser = session.get('currentUser');
        if (!currentUser) {
            this.props.history.push('/signup');
        }
    }

    componentDidUpdate() {
        const currentUser = session.get('currentUser');
        if (!currentUser) {
            this.props.history.push('/signup');
        }
    }

    handleInputChange = (event) => {
        let target = event.target;
        let name = target.name;
        let value = target.value;
        this.setState({
            [name]: value,
        });
        setTimeout(() => {
            this.validateForm();
        }, 500);
    };

    handleNext = async (event) => {
        event.preventDefault();
        const { code } = this.state;
        console.log('code: ', code);
        if (code === '') {
            helper.showToast(
                'Error',
                'Email verification is incorrect. Put a link below the box allowing the user to Resend the email with a new code.',
                3
            );
            return;
        }
        const currentUser = session.get('currentUser');
        if (currentUser) {
            const email = currentUser.email;
            const body = {
                email: email,
                code: code,
            };
            const checkResult = await adminApi.checkEmailCode(body);
            console.log('checkResult: ', checkResult);
            if (checkResult.status) {
                const verified_data = {
                    userid: currentUser.user_id,
                    verified: true,
                    onboarding: 'confirm'
                };
                try {
                    const updateRes = await adminApi.updateUser(verified_data);
                    if (updateRes.status) {
                        console.log('updateRes: ', updateRes.data);
                        session.set('currentUser', updateRes.data);
                        this.props.history.push('/signup/birthday');
                    } else {
                        helper.showToast('Error', updateRes.data, 3);
                    }
                } catch (error) {
                    helper.showToast(
                        'Error',
                        'Failed to update location. Please try again',
                        3
                    );
                }
            } else {
                helper.showToast(
                    'Error',
                    'Email verification is incorrect.',
                    3
                );
            }
        } else {
            this.props.history.push('/signup');
        }
    };

    validateForm = () => {
        const { code } = this.state;

        if (code === '') {
            this.setState({
                isValidForm: false,
            });
        } else {
            this.setState({
                isValidForm: true,
            });
        }
    };

    goBack = (event) => {
        event.preventDefault();
        this.props.history.goBack();
    };

    resendCode = async (event) => {
        event.preventDefault();
        const currentUser = session.get('currentUser');
        const email = currentUser.email;
        const body = {
            email: email,
        };
        const sendResult = await adminApi.sendEmailCode(body);
        if (sendResult.status) {
            if (sendResult.data) {
                console.log('data exist: ', sendResult.data);
                helper.showToast('Success', 'Verification code sent.', 1);
            } else {
                console.log('data does not exist: ', sendResult.data);
            }
        } else {
            helper.showToast('Error', 'Email verification is incorrect.', 3);
        }
    };

    onKeyPress = (event) => {
        if (event.charCode === 13) {
            this.btn.click();
        }
    }

    render() {
        const { isValidForm } = this.state;
        const currentUser = session.get('currentUser');
        const email = currentUser ? currentUser.email : '';
        return (
            <div className='confirm'>
                <div className='stepper'>
                    <div className='container'>
                        <div className='title'>STEP 2/8</div>
                        <div className='step step1'>
                            <div>
                                <div className='circle'></div>
                            </div>
                        </div>
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
                <Form className='signup-form'>
                    <div className='d-flex align-content-center justify-content-center'>
                        <img
                            className='auth-logo'
                            src={require('../../../assets/logo.svg')}
                            alt=''
                        />
                    </div>
                    <h5 className='d-flex align-items-center justify-content-center text-center mt-2 mb-2 title'>
                        CONFIRM YOUR EMAIL
                    </h5>
                    <div className='d-flex align-items-center justify-content-center text-center mt-2 mb-4 description'>
                        TYPE IN THE CODE WE SENT TO {email}
                    </div>
                    <div className='d-flex align-items-center justify-content-center'>
                        <Form.Group className='form-group'>
                            <Form.Control
                                type='text'
                                className='register-form-input'
                                placeholder='CODE'
                                name='code'
                                required
                                value={this.state.code}
                                onChange={this.handleInputChange}
                                onKeyPress={this.onKeyPress}
                            />
                        </Form.Group>
                    </div>
                    <div className='d-flex align-items-center justify-content-center'>
                        <Button
                            type='submit'
                            className='btn btn-primary register-btn'
                            onClick={this.handleNext}
                            disabled={!isValidForm}
                            ref={node => (this.btn = node)}
                        >
                            NEXT
                        </Button>
                    </div>
                    <div className='d-flex align-items-center justify-content-center mt-3 join-now'>
                        <Link to='#' onClick={this.resendCode} className='join-now-link'>
                            <span>RESEND VERIFICATION CODE</span>
                        </Link>
                    </div>
                    <div className='d-flex align-items-center justify-content-center mt-4 join-now'>
                        <Link to='#' onClick={this.goBack} className='join-now-link'>
                            <span>{'< '}GO BACK</span>
                        </Link>
                    </div>
                    {/* <div className='d-flex align-items-center justify-content-center mt-3'>
                        Get the app.
                    </div>
                    <div className='d-flex align-items-center justify-content-center mt-3'>
                        <Link to='' target='_blank'>
                            <Image
                                src={require('../../../assets/img/appstore.png')}
                                style={{ width: '120px' }}
                            ></Image>
                        </Link>
                    </div> */}
                </Form>
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

export default Confirm;
