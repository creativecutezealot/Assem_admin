import React from 'react';
import './forgotpass.scss';
import { Form, Button } from 'react-bootstrap';

import adminApi from '../../../services/admin.service';
import helper from '../../../services/helper.service';

class ForgotPass extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            loginRes: null,
            clubs: [],
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

    onForgotPass = async () => {
        const { email } = this.state;
        if (!this.validateEmail(email))
            helper.showToast(
                'Warning',
                'Please enter a valid email.',
                2
            );
        else {
            this.forgotPass();
        }
    };

    forgotPass = async () => {
        const { email } = this.state;
        try {
            const forgotPassRes = await adminApi.forgotPass({ email: email });
            if (forgotPassRes.status) {
                this.goVerify();
            } else {
                helper.showToast('Error', forgotPassRes.data, 3);
            }
        } catch (error) {
            helper.showToast('Error', 'Failed to forgot password. Please try again.', 3);
        }
    }

    goVerify = () => {
        const { email } = this.state;
        this.props.history.push({
            pathname: '/passcode',
            state: { email: email }
        });
    };

    validateEmail = (email) => {
        const re =
            /^(([^<>()[\]\\.,;:\s@']+(\.[^<>()[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    onKeyPress = (event) => {
        if (event.charCode === 13) {
            this.btn.click();
        }
    }

    render() {
        const { email, isEmailValid } = this.state;
        return (
            <div className='forgot'>
                <Form className='login-form'>
                    <div className='d-flex align-items-center justify-content-center text-center mt-2 mb-2 title'>
                        TROUBLE LOGGING IN?
                    </div>
                    <div className='d-flex align-items-center justify-content-center text-center mt-2 mb-4 description'>ENTER YOUR EMAIL AND WE'LL SEND YOU A CODE TO GET BACK INTO YOUR ACCOUNT</div>
                    <div className='d-flex align-items-center justify-content-center'>
                        <Form.Group className='form-group'>
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
                    </div>

                    <div className='d-flex align-items-center justify-content-center'>
                        <Button
                            type='button'
                            className='btn btn-primary login-btn'
                            onClick={this.onForgotPass}
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

export default ForgotPass;
