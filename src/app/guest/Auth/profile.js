import React from 'react';
import './profile.scss';
import { Form, Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import adminApi from '../../../services/admin.service';
import session from '../../../services/session.service';
import helper from '../../../services/helper.service';

class Profile extends React.Component {
    constructor(props) {
        super();
        this.state = {
            showModal: true,
            short_bio: '',
            job: '',
            company: '',
        };
    }

    componentDidMount() {
        const currentUser = session.get('currentUser');
        if (!currentUser) {
            this.props.history.push('/signup');
        } else {
            const isValidForm =
                currentUser.short_bio !== '' &&
                currentUser.job !== '' &&
                currentUser.company !== '';
            this.setState({
                short_bio: currentUser.short_bio,
                job: currentUser.job,
                company: currentUser.company,
                isValidForm: isValidForm,
            });
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
        const { short_bio, job, company } = this.state;
        const currentUser = session.get('currentUser');
        const userid = currentUser.user_id;
        const data = {
            short_bio: short_bio,
            job: job,
            company: company,
            userid: userid,
            onboarding: 'profile'
        };
        for (const key in data) {
            if (data[key] === '') {
                return;
            }
        }
        try {
            const updateRes = await adminApi.updateUser(data);
            if (updateRes.status) {
                console.log('updateRes: ', updateRes.data);
                session.set('currentUser', updateRes.data);
                this.props.history.push('/signup/invitecode');
            } else {
                helper.showToast('Error', updateRes.data, 3);
            }
        } catch (error) {
            helper.showToast(
                'Error',
                'Failed to update profile. Please try again',
                3
            );
        }
    };

    validateForm = () => {
        const { short_bio, job, company } = this.state;

        if (short_bio === '') {
            this.setState({
                isValidForm: false,
            });
            return;
        }
        if (job === '') {
            this.setState({
                isValidForm: false,
            });
            return;
        }
        if (company === '') {
            this.setState({
                isValidForm: false,
            });
            return;
        }
        if (short_bio !== '' && job !== '' && company !== '') {
            this.setState({
                isValidForm: true,
            });
            return;
        }
    };

    goBack = (event) => {
        event.preventDefault();
        this.props.history.goBack();
    };

    render() {
        const { short_bio, job, company, isValidForm } = this.state;
        return (
            <div className='profile'>
                <div className='stepper'>
                    <div className='container'>
                        <div className='title'>STEP 5/8</div>
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
                        <div className='step step-active step2'>
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
                        COMPLETE A PROFILE
                    </h5>
                    <div className='d-flex align-items-center justify-content-center text-center mt-2 mb-4 description'>
                        TELL US ABOUT YOURSELF
                    </div>
                    <div className='d-flex align-content-center justify-content-center'>
                        <Form.Group className='form-group mb-2'>
                            <Form.Control
                                as='textarea'
                                className='register-form-input'
                                placeholder='BIO'
                                name='short_bio'
                                value={short_bio}
                                onChange={this.handleInputChange}
                            />
                        </Form.Group>
                    </div>
                    <div className='d-flex align-content-center justify-content-center'>
                        <Form.Group className='form-group mb-2'>
                            <Form.Control
                                type='text'
                                className='register-form-input'
                                placeholder='JOB TITLE'
                                name='job'
                                value={job}
                                onChange={this.handleInputChange}
                            />
                        </Form.Group>
                    </div>
                    <div className='d-flex align-content-center justify-content-center'>
                        <Form.Group className='form-group'>
                            <Form.Control
                                type='text'
                                className='register-form-input'
                                placeholder='COMPANY'
                                name='company'
                                value={company}
                                onChange={this.handleInputChange}
                            />
                        </Form.Group>
                    </div>

                    <div className='d-flex align-items-center justify-content-center'>
                        <Button
                            type='submit'
                            className='btn btn-primary register-btn'
                            onClick={this.handleNext}
                            disabled={!isValidForm}
                        >
                            NEXT
                        </Button>
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
                <video className='video' autoPlay loop muted>
                    <source
                        src={require('../../../assets/video/background.mp4')}
                    />
                </video>
            </div>
        );
    }
}

export default Profile;
