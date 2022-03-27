import React from 'react';
import './birthday.scss';
import { Form, Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Datetime from 'react-datetime';
import moment from 'moment';

import adminApi from '../../../services/admin.service';
import session from '../../../services/session.service';
import helper from '../../../services/helper.service';

class Birthday extends React.Component {
    constructor(props) {
        super();
        this.state = {
            showModal: true,
            birth: moment().format('YYYY-MM-DD'),
            birth_year: moment().format('YYYY'),
        };
    }

    componentDidMount() {
        const currentUser = session.get('currentUser');
        if (!currentUser) {
            this.props.history.push('/signup');
        } else {
            if (currentUser.birth === '') {
                this.setState({
                    birth: moment().format('YYYY-MM-DD'),
                    birth_year: moment().format('YYYY'),
                });
            } else {
                const date = new Date(currentUser.birth);
                this.setState({
                    birth: moment(date).format('YYYY-MM-DD'),
                    birth_year: moment(date).format('YYYY'),
                });
            }
        }
    }

    handleNext = async () => {
        const { birth, birth_year } = this.state;
        const currentUser = session.get('currentUser');
        const userid = currentUser.user_id;
        const current_year = moment().format('YYYY');
        const difference = Number(current_year) - Number(birth_year);
        if (difference < 18) {
            helper.showToast(
                'Error',
                'Members need to be over 18 years old',
                3
            );
            return;
        }
        let birth_data = {
            birth: birth,
            userid: userid,
            onboarding: 'birthday'
        };
        try {
            const updateRes = await adminApi.updateUser(birth_data);
            if (updateRes.status) {
                console.log('updateRes: ', updateRes.data);
                session.set('currentUser', updateRes.data);
                this.props.history.push('/signup/photo');
            } else {
                helper.showToast('Error', updateRes.data, 3);
            }
        } catch (error) {
            helper.showToast(
                'Error',
                'Failed to update birthday. Please try again',
                3
            );
        }
    };

    handleDateChange = (date) => {
        if (!date) {
            helper.showToast('Warning', 'Please choose valid date and time', 2);
        } else {
            if (Date.parse(date)) {
                this.setState({
                    birth: moment(date).format('YYYY-MM-DD'),
                    birth_year: moment(date).format('YYYY'),
                });
            } else {
                helper.showToast(
                    'Warning',
                    'Please choose valid date and time',
                    2
                );
            }
        }
    };

    goBack = (event) => {
        event.preventDefault();
        this.props.history.goBack();
    };

    render() {
        const { birth } = this.state;
        return (
            <div className='birthday'>
                <div className='stepper'>
                    <div className='container'>
                        <div className='title'>STEP 3/8</div>
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
                        <div className='step step-active step1'>
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
                        ADD YOUR BIRTHDAY
                    </h5>
                    <div className='d-flex align-items-center justify-content-center text-center mt-2 mb-4 description'>
                        THIS WON'T BE PART OF YOUR PUBLIC PROFILE
                    </div>
                    <div className='d-flex align-items-center justify-content-center mt-2'>
                        <Datetime
                            className='datetimepicker'
                            dateFormat='YYYY-MM-DD'
                            timeFormat={false}
                            initialValue={birth}
                            onChange={this.handleDateChange}
                            onClose={this.handleDateChange}
                            value={birth}
                            initialViewMode='years'
                            closeOnSelect={true}
                            onBeforeNavigate={this.onBeforeNavigate}
                        />
                    </div>

                    <div className='d-flex align-items-center justify-content-center mt-3'>
                        <Button
                            type='button'
                            className='btn btn-primary register-btn'
                            onClick={this.handleNext}
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

export default Birthday;
