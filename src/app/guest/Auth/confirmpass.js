import React from 'react';
import './confirmpass.scss';
import { Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import adminApi from '../../../services/admin.service';
import helper from '../../../services/helper.service';

const errorCode = 'Hmm, that’s not the right code. Please try again.';
const resendMsg =
    'We just re-sent a verification code to your email. If you don’t see our email, check your spam folder.';

class ConfirmPass extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            code: ''
        };
    }

    handleInputChange = (event) => {
        let target = event.target;
        let name = target.name;
        let value = target.value;
        this.setState({
            [name]: value,
        });
    };

    goResetPass = (user_id) => {
        this.props.history.push({
            pathname: '/resetpass',
            state: { user_id: user_id }
        });
    };

    onConfirmPass = async () => {
        const { code } = this.state;
        if (code.length < 4) {
            helper.showToast('Error', errorCode, 3);
        } else {
            this.setState({
                loading: true,
            });
            this.confirmPass();
        }
    };

    confirmPass = async () => {
        const { code } = this.state;
        try {
            const confirmPassRes = await adminApi.confirmPass({ token: code });
            if (confirmPassRes.status) {
                const user_id = confirmPassRes.data;
                this.goResetPass(user_id);
            } else {
                helper.showToast('Error', confirmPassRes.data, 3);
            }
        } catch (error) {
            helper.showToast('Error', 'Failed to confirm password. Please try again.', 3);
        }
    };

    onForgotPass = async (e) => {
        e.preventDefault();
        const email = this.props.location.state.email;
        if (!this.validateEmail(email))
            helper.showToast(
                'Error',
                'This Email is not valid.',
                3
            );
        else {
            this.forgotPass();
        }
    };

    forgotPass = async () => {
        const email = this.props.location.state.email;
        try {
            const forgotPassRes = await adminApi.forgotPass({ email: email });
            if (forgotPassRes.status) {
                helper.showToast('Success', resendMsg, 1);
            } else {
                helper.showToast('Error', forgotPassRes.data, 3);
            }
        } catch (error) {
            helper.showToast('Error', 'Failed to send confirmation code. Please try again.', 3);
        }
    }

    onKeyPress = (event) => {
        if (event.charCode === 13) {
            this.btn.click();
        }
    }

    render() {
        const { code } = this.state;
        return (
            <div className='confirmPass'>
                <Form className='login-form'>
                    <div className='d-flex align-items-center justify-content-center mt-2 mb-2 title'>
                        ENTER VERIFICATION CODE
                    </div>
                    <div className='d-flex align-items-center justify-content-center text-center mt-2 mb-4 description'>WE SENT A VERIFICATION CODE VIA EMAIL. IF YOU DON'T SEE OUR EMAIL. CHECK YOUR SPAM FOLDER.</div>
                    <div className='d-flex align-items-center justify-content-center'>
                        <Form.Group className='form-group'>
                            <Form.Control
                                type='text'
                                className='login-form-input'
                                placeholder='ENTER CODE'
                                name='code'
                                required
                                value={code}
                                onChange={this.handleInputChange}
                                onKeyPress={this.onKeyPress}
                            />
                        </Form.Group>
                    </div>

                    <div className='d-flex align-items-center justify-content-center mb-2 join-now'>
                        DIDN'T RECEIVE THE CODE?
                        <Link to='/' onClick={this.onForgotPass} className='join-now-link d-inline-block'>
                            <span>&nbsp;RESEND</span>
                        </Link>
                    </div>
                    <div className='d-flex align-items-center justify-content-center'>
                        <Button
                            type='button'
                            className='btn btn-primary login-btn'
                            onClick={this.onConfirmPass}
                            ref={node => (this.btn = node)}
                        >
                            NEXT
                        </Button>
                    </div>
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

export default ConfirmPass;
