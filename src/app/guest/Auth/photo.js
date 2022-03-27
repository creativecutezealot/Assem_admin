import React from 'react';
import './photo.scss';
import { Form, Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import adminApi from '../../../services/admin.service';
import session from '../../../services/session.service';
import helper from '../../../services/helper.service';

import { ImageForm } from '../../main/components/ImageForm';
import { handleUploadToS3 } from '../../../services/upload.service';
import environment from '../../../enviroments';

class Photo extends React.Component {
    constructor(props) {
        super();
        this.state = {
            showModal: true,
            photoFileSrc: null,
            photo_name: '',
        };
    }

    componentDidMount() {
        const currentUser = session.get('currentUser');
        if (!currentUser) {
            this.props.history.push('/signup');
        } else {
        }
    }

    handleNext = async (event) => {
        event.preventDefault();
        const { photoFileSrc, photo_name } = this.state;
        const currentUser = session.get('currentUser');
        const userid = currentUser.user_id;
        if (photoFileSrc) {
            const photo_url = await handleUploadToS3(
                photoFileSrc,
                photo_name,
                environment.ratio1_1
            );
            const data = {
                photo_url: photo_url,
                userid: userid,
                onboarding: 'photo'
            };
            try {
                const updateRes = await adminApi.updateUser(data);
                if (updateRes.status) {
                    console.log('updateRes: ', updateRes.data);
                    session.set('currentUser', updateRes.data);
                    // const currentUser = updateRes.data;
                    this.props.history.push('/signup/profile');
                } else {
                    helper.showToast('Error', updateRes.data, 3);
                }
            } catch (error) {
                helper.showToast(
                    'Error',
                    'Failed to update user photo. Please try again',
                    3
                );
            }
        }
    };

    handleFileChange = (blob, name) => {
        const photo_name = Date.now().toString();
        this.setState({
            photoFileSrc: blob,
            photo_name: photo_name,
        });
        setTimeout(() => {
            this.validateForm();
        }, 500);
    };

    validateForm = () => {
        const { photoFileSrc } = this.state;
        if (!photoFileSrc) {
            this.setState({
                isValidForm: false,
            });
            return;
        } else {
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
        const { isValidForm } = this.state;
        return (
            <div className='photo'>
                <div className='stepper'>
                    <div className='container'>
                        <div className='title'>STEP 4/8</div>
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
                        ADD A PHOTO
                    </h5>
                    <div className='d-flex align-items-center justify-content-center text-center mt-2 mb-4 description'>
                        ADDING A PHOTO HELPS MEMBERS RECOGNIZE YOU
                    </div>
                    <div className='mt-2 mb-2 d-flex image-form-wrapper align-items-center justify-content-center'>
                        <ImageForm
                            // previewSrc={this.state[form_attr.name]}
                            name='photo'
                            initWidth={80}
                            aspect={4 / 4}
                            changeFileSrc={this.handleFileChange}
                        />
                    </div>
                    <div className='d-flex align-items-center justify-content-center mt-3'>
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

export default Photo;
