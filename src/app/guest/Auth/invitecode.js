import React from 'react';
import './invitecode.scss';
import { Form, Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import adminApi from '../../../services/admin.service';
import session from '../../../services/session.service';
import helper from '../../../services/helper.service';

class Invitecode extends React.Component {
    constructor(props) {
        super();
        this.state = {
            showModal: true,
            code: '',
            privateClubs: []
        };
    }

    componentDidMount() {
        const currentUser = session.get('currentUser');
        if (!currentUser) {
            this.props.history.push('/signup');
        } else {
            this.getAllClubs()
        }
    }

    componentDidUpdate() {
        const currentUser = session.get('currentUser');
        if (!currentUser) {
            this.props.history.push('/signup')
        }
    }

    getAllClubs = () => {
        adminApi
            .getAllClubs()
            .then((response) => {
                if (response.status === true) {
                    var results = response.data;
                    console.log('results: ', results);
                    let privateClubs = results.filter(club => club.is_private);
                    this.setState({
                        privateClubs
                    })
                }
            })
            .catch((error) => {
                console.log('err: ', error);
            });
    };

    handleInputChange = (event) => {
        let target = event.target;
        let name = target.name;
        let value = target.value;
        this.setState({
            [name]: value,
        });
        this.setState({
            [name]: value,
        });
        setTimeout(() => {
            this.validateForm();
        }, 500);
    };

    handleNext = async (event) => {
        event.preventDefault();
        const { code, privateClubs } = this.state;
        console.log('code: ', code);
        let filteredPrivateClubs = privateClubs.filter(club => club.access_code == code);
        if (filteredPrivateClubs.length > 0) {
            this.props.history.push({
                pathname: '/signup/subscription',
                state: { code }
            });
        } else {
            helper.showToast(
                'Error',
                'Access code not valid',
                3
            );
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

    requestCode = async (e) => {
        try {
            e.preventDefault();
            const currentUser = session.get('currentUser');
            const fullName = currentUser.first_name + ' ' + currentUser.last_name;
            const body = {
                email: currentUser.email,
                name: fullName
            }
            const response = await adminApi.inviteCodeRequest(body);
            if (response.status) {
                helper.showToast(
                    'Success',
                    'Invite code request was sent successfully',
                    1
                );
            } else {
                helper.showToast(
                    'Error',
                    'Invite code request was failed',
                    3
                );
            }
        } catch (error) {
            console.log('error: ', error);
            helper.showToast(
                'Error',
                error.message || 'Invite code request was failed',
                3
            );
        }
    }

    render() {
        const { isValidForm } = this.state;
        const currentUser = session.get('currentUser');
        const email = currentUser ? currentUser.email : '';
        return (
            <div className='invitecode'>
                <div className='stepper'>
                    <div className='container'>
                        <div className='title'>STEP 6/8</div>
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
                        ENTER CLUB INVITE CODE
                    </h5>
                    <div className='d-flex align-items-center justify-content-center'>
                        <Form.Group>
                            <Form.Control
                                type='text'
                                className='register-form-input'
                                placeholder='CODE'
                                name='code'
                                required
                                value={this.state.code}
                                onChange={this.handleInputChange}
                            />
                            <div className='d-flex align-items-start justify-content-end requestCode-container'>
                                <Link onClick={this.requestCode}>
                                    <span className='requestCode'>REQUEST INVITE CODE</span>
                                </Link>
                            </div>
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

export default Invitecode;
