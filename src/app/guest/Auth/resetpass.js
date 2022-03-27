import React from 'react';
import './resetpass.scss';
import { Form, Button } from 'react-bootstrap';

import adminApi from '../../../services/admin.service';
import helper from '../../../services/helper.service';

const errorPassword =
    'Password must include at least 8 characters including 1 number or 1 special character';
const errorMatch = 'Passwords do not match';

class ResetPass extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            password: '',
            confirmPassword: '',
        };
    }

    isPassword = password => {
        const pattern = /^(?=.*[a-z])((?=.*[0-9])|(?=.*[!@#$%^&*]))(?=.{8,})/;
        return pattern.test(password);
    }

    handleInputChange = (event) => {
        let target = event.target;
        let name = target.name;
        let value = target.value;
        this.setState({
            [name]: value,
        });
    };

    onUpdatePass = async () => {
        const { password, confirmPassword } = this.state;
        if (!this.isPassword(password) || !this.isPassword(confirmPassword)) {
            helper.showToast('Error', errorPassword, 3);
            return;
        }

        if (password !== confirmPassword) {
            helper.showToast('Error', errorMatch, 3);
            return;
        }

        this.updatePass(password);
    };

    updatePass = async (password) => {
        const { user_id } = this.props.location.state.user_id;
        try {
            const updatePassRes = await adminApi.updatePass(user_id, { password });
            if (updatePassRes.status) {
                this.goNext();
            } else {
                helper.showToast('Error', updatePassRes.data, 3);
            }
        } catch (error) {
            helper.showToast('Error', 'Failed to reset password. Please try again.', 3);
        }
    };

    goNext = () => {
        this.props.history.push('/completeresetpass');
    };

    onKeyPress = (event) => {
        if (event.charCode === 13) {
            this.btn.click();
        }
    }

    render() {
        const { password, confirmPassword } = this.state;
        return (
            <div className='resetPass'>
                <Form className='login-form'>
                    <div className='d-flex align-items-center justify-content-center mt-2 title'>
                        FINALLY, CHOOSE
                    </div>
                    <div className='d-flex align-items-center justify-content-center mb-2 title'>
                        A NEW PASSWORD
                    </div>
                    <div className='d-flex align-items-center justify-content-center text-center mt-2 mb-4 description'>PASSWORD MUST INCLUDE AT LEAST 8 CHARACTERS INCLUDING 1 NUMBER OR 1 SPECIAL CHARACTER.</div>
                    <div className='d-flex align-items-center justify-content-center'>
                        <Form.Group className='form-group'>
                            <Form.Control
                                type='password'
                                className='login-form-input'
                                placeholder='NEW PASSWORD'
                                name='password'
                                required
                                value={password}
                                onChange={this.handleInputChange}
                                onKeyPress={this.onKeyPress}
                            />
                        </Form.Group>
                    </div>
                    <div className='d-flex align-items-center justify-content-center'>
                        <Form.Group className='form-group'>
                            <Form.Control
                                type='password'
                                className='login-form-input'
                                placeholder='RE-ENTER PASSWORD'
                                name='confirmPassword'
                                required
                                value={confirmPassword}
                                onChange={this.handleInputChange}
                                onKeyPress={this.onKeyPress}
                            />
                        </Form.Group>
                    </div>

                    <div className='d-flex align-items-center justify-content-center'>
                        <Button
                            type='button'
                            className='btn btn-primary login-btn'
                            onClick={this.onUpdatePass}
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

export default ResetPass;
