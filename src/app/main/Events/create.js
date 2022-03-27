import React, { createRef } from 'react';
import { Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import Datetime from 'react-datetime';
import moment from 'moment';
import './styles.scss';

import adminApi from '../../../services/admin.service';
import session from '../../../services/session.service';
import helper from '../../../services/helper.service';
import { handleUploadToS3 } from '../../../services/upload.service';
import environment from '../../../enviroments';
import Content from '../../../components/content';

import UserCarousel from '../components/Carousel/users';
import { ImageForm } from '../components/ImageForm';

const form_attries = [
    {
        name: 'event_name',
        label: 'NAME',
    },
    {
        name: 'description',
        label: 'DESCRIPTION',
        type: 'textarea',
    },
    {
        name: 'link',
        label: 'LINK',
    },
    {
        name: 'photo_url',
        label: 'PHOTO (OR THE CLUB DEFAULT IMAGE WILL BE USED)',
        type: 'image',
        aspect: 4 / 3,
    },
    {
        name: 'event_time',
        label: 'WHEN',
        type: 'date',
    }
];

const eventKeys = [
    'event_name',
    'description',
    'link',
    'photo_url',
    'event_time',
    'host_id',
    'host_name',
    'enter_club_id',
    'enter_club_name',
];

class CreateEvent extends React.Component {
    constructor(props) {
        super();
        const currentUser = session.get('futureof-user');
        const club = (currentUser.user_role === 'user' || currentUser.user_role === '') ? session.get('audio-club') : session.get('futureof-club');
        this.state = {
            event_name: '',
            description: '',
            photo_url: '',
            event_time: new Date().toISOString(),
            event_time_date: moment().format('YYYY-MM-DD'),
            event_time_hour: moment().format('HH:mm:ss'),
            host_id: currentUser.user_id,
            host_name: `${currentUser.first_name} ${currentUser.last_name}`,
            enter_club_id: club.club_id,
            enter_club_name: club.club_name,
            validated: false,
            loading: false,
            imgFileSrc: null,
            users: []
        };
        this.createRefs();
    }

    componentDidMount() {
        let date = new Date();
        console.log(date.toISOString());
        console.log(date.getTimezoneOffset());
        this.createRefs();
    }

    createRefs = () => {
        form_attries.map((attr) => {
            this[`${attr.name}Ref`] = createRef();
            return 0;
        });
    };

    handleBack = () => {
        this.props.history.push('/manager/events');
    };

    handleCancel = () => {
        this.props.history.push('/manager/events');
    };

    handleSwitchChange = (event) => {
        const target = event.target;
        const value = target.checked;
        const name = target.name;
        console.log(name, value);
        this.setState({
            [name]: value,
        });
    };

    handleDateChange = async (date) => {
        try {
            if (!date) {
                helper.showToast('Warning', 'Please choose valid date and time', 2);
            } else {
                if (Date.parse(date)) {
                    if (moment(date).format('YYYY-MM-DD') === 'Invalid date') {
                        helper.showToast(
                            'Warning',
                            'Please choose valid date and time',
                            2
                        );
                        return;
                    } else {
                        this.setState(
                            {
                                event_time_date: moment(date).format('YYYY-MM-DD'),
                                event_time: `${moment(date).format('YYYY-MM-DD')}T${this.state.event_time_hour}`
                            }
                        );
                    }

                } else {
                    helper.showToast(
                        'Warning',
                        'Please choose valid date and time',
                        2
                    );
                }
            }
        } catch (error) {
            helper.showToast(
                'Warning',
                'Please choose valid date and time',
                2
            );
        }
    };

    handleTimeChange = async (date) => {
        try {
            if (!date) {
                helper.showToast('Warning', 'Please choose valid date and time', 2);
            } else {
                if (Date.parse(date)) {
                    if (moment(date).format('HH:mm:ss') === 'Invalid date') {
                        helper.showToast(
                            'Warning',
                            'Please choose valid date and time',
                            2
                        );
                        return;
                    } else {
                        this.setState(
                            {
                                event_time_hour: moment(date).format('HH:mm:ss'),
                                event_time: `${this.state.event_time_date}T${moment(date).format('HH:mm:ss')}`
                            }
                        );
                    }

                } else {
                    helper.showToast(
                        'Warning',
                        'Please choose valid date and time',
                        2
                    );
                }
            }
        } catch (error) {
            console.log('error: ', error);
            helper.showToast(
                'Warning',
                'Please choose valid date and time',
                2
            );
        }
    };

    handleFileChange = (blob, name) => {
        // const previewUrl = window.URL.createObjectURL(blob);
        this.setState({
            imgFileSrc: blob,
        });
    };

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value,
        });
    };

    handleNext = async () => {
        for (const idx in form_attries) {
            const attr = form_attries[idx];
            if (
                attr.name !== '' &&
                attr.type !== 'check' &&
                attr.type !== 'image'
            ) {
                const value = this.state[attr.name];
                if (value !== undefined && value !== '') {
                    this.setState({ validated: true });
                } else {
                    if (
                        attr.name === 'photo_url' &&
                        this.state.imgFileSrc !== null
                    ) {
                        continue;
                    }
                    if (
                        attr.name === 'link'
                    ) {
                        continue;
                    }
                    this.setState({ validated: true });
                    console.log(attr.name, value);
                    helper.showToast(
                        'Warning',
                        'Please fill out all info',
                        2
                    );
                    return;
                }
            }
        }
        await this.handleSubmit();
    };

    handleSubmit = async (event) => {
        const user = session.get('futureof-user');
        if (this.state.imgFileSrc != null) {
            const photo_url = await handleUploadToS3(
                this.state.imgFileSrc,
                Date.now().toString(),
                environment.ratio4_3
            );
            console.log('upload res', photo_url);
            await this.setState({
                photo_url,
            });
        }
        const updateObj = {};
        for (const idx in eventKeys) {
            const key = eventKeys[idx];
            const value = this.state[key];
            if (value !== undefined && value !== '') {
                updateObj[key] = value;
            } else {
                // Either both of one
                if (key === 'photo_url') {
                    continue;
                }
                if (key === 'link') {
                    continue;
                }
                console.log(key, value);
                this.setState({ validated: true });
                helper.showToast('Warning', 'Please fill out all info', 2);
                return;
            }
        }
        console.log('this.state.event_time: ', this.state.event_time, this.state.event_time_hour);
        if (helper.getCurrentLocalTime(this.state.event_time) === 'Invalid date') {
            helper.showToast(
                'Warning',
                'Please choose valid date and time',
                2
            );
            return;
        }
        updateObj['event_time'] = helper.getCurrentLocalTime(
            this.state.event_time
        );
        console.log('update obj ==> ', updateObj);
        updateObj['host_id'] = user.user_id;
        updateObj['host_name'] = `${user.first_name} ${user.last_name}`;
        this.createEvent(updateObj);
    };

    createEvent = (updateObj) => {
        console.log('create objec', updateObj);
        adminApi
            .createEvent(updateObj)
            .then((response) => {
                if (response.status === true && response.data) {
                    helper.showToast(
                        'Success',
                        'Event created successfully.',
                        1
                    );
                    this.handleBack();
                } else {
                    helper.showToast('Error', 'Failed to create the event', 3);
                }
            })
            .catch((error) => {
                console.log('err: ', error);
                helper.showToast(
                    'Error',
                    error.message || 'Failed to create the event',
                    3
                );
            });
    };

    onKeyPress = (event) => {
        if (event.charCode === 13) {
            this.btn.click();
        }
    }

    renderRow = (form_attr) => {
        return (
            <Form.Group
                key={form_attr.name}
                as={Col}
                controlId={`${form_attr.name}`}
                className='justify-content-md-center input-row'
                style={{ maxWidth: '40vw' }}
            >
                {form_attr.type !== 'check' && (
                    <Form.Label as={Col}>{form_attr.label}</Form.Label>
                )}

                <InputGroup as={Col} className='input-area'>
                    {form_attr.type === 'image' ? (
                        <ImageForm
                            ref={this[`${form_attr.name}Ref`]}
                            previewSrc={this.state.imgFileSrc}
                            name={form_attr.name}
                            initWidth={80}
                            aspect={form_attr.aspect}
                            changeFileSrc={this.handleFileChange}
                        />
                    ) : form_attr.type === 'label' ? null : form_attr.type ===
                        'check' ? (
                        <Form.Check
                            ref={this[`${form_attr.name}Ref`]}
                            inline
                            type='checkbox'
                            id={form_attr.name}
                            name={form_attr.name}
                            checked={this.state[form_attr.name]}
                            onChange={this.handleSwitchChange}
                            label={form_attr.label}
                        />
                    ) : form_attr.type === 'date' ? (
                        <>
                            <Datetime
                                className='datetimepicker'
                                dateFormat='YYYY-MM-DD'
                                timeFormat={false}
                                initialValue={moment(
                                    this.state.event_time
                                ).format('YYYY-MM-DD')}
                                onChange={this.handleDateChange}
                                onClose={this.handleDateChange}
                            />
                            <div style={{ width: 20 }}></div>
                            <Datetime
                                className='datetimepicker'
                                dateFormat={false}
                                timeFormat='HH:mm A'
                                initialValue={moment(
                                    this.state.event_time
                                ).format('HH:mm A')}
                                onChange={this.handleTimeChange}
                                onClose={this.handleTimeChange}
                            />
                        </>
                    ) : form_attr.type === 'textarea' ? (
                        <Form.Control
                            ref={this[`${form_attr.name}Ref`]}
                            as='textarea'
                            rows={5}
                            maxLength={1000}
                            required
                            defaultValue={this.state[form_attr.name]}
                            name={form_attr.name}
                            onChange={this.handleInputChange}
                        />
                    ) : (
                        <Form.Control
                            ref={this[`${form_attr.name}Ref`]}
                            required
                            type='text'
                            defaultValue={this.state[form_attr.name]}
                            name={form_attr.name}
                            onChange={this.handleInputChange}
                            onKeyPress={this.onKeyPress}
                        />
                    )}
                </InputGroup>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
        );
    };

    render() {
        const { loading, users, host_id } = this.state;
        const currentUser = session.get('futureof-user');
        const selectedUsers = users.filter(
            (user) =>
                user.user_id === host_id && user.user_id !== currentUser.user_id
        );
        const deselectedUsers = users.filter(
            (user) =>
                user.user_id !== host_id && user.user_id !== currentUser.user_id
        );
        const reorderedUsers = [
            currentUser,
            ...selectedUsers,
            ...deselectedUsers,
        ];

        return (
            <Content>
                <div className='assemble-list'>
                    <Row className='justify-content-start'>
                        <h4>EVENTS</h4>
                    </Row>
                    <div className='assemble-list-container'>
                        <Row className='justify-content-start'>
                            <h5>CREATE EVENT</h5>
                        </Row>
                        <Col>
                            {!loading ? (
                                <div>
                                    {form_attries.map((attr) =>
                                        this.renderRow(attr)
                                    )}
                                    <Row className='justify-content-start'>
                                        <Button
                                            variant={'primary'}
                                            type='submit'
                                            className='btn mt-5'
                                            onClick={() => {
                                                this.handleNext();
                                            }}
                                            ref={node => (this.btn = node)}
                                        >
                                            Submit
                                        </Button>
                                        <Button
                                            type='button'
                                            className='btn btn-primary mt-5'
                                            style={{
                                                marginLeft: 30,
                                                backgroundColor:
                                                    'white',
                                                color: '#3B75B4',
                                            }}
                                            onClick={this.handleCancel}
                                        >
                                            Cancel
                                        </Button>
                                    </Row>
                                </div>
                            ) : (
                                <p className='text-center'>Loading...</p>
                            )}
                        </Col>
                    </div>
                </div>
            </Content>
        );
    }
}

export default CreateEvent;
