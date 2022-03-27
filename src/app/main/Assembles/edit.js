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
        name: 'assemble_name',
        label: 'TOPIC',
    },
    {
        name: 'description',
        label: 'DESCRIPTION',
        type: 'textarea',
    },
    {
        name: 'photo_url',
        label: 'PHOTO (OR THE CLUB DEFAULT IMAGE WILL BE USED)',
        type: 'image',
        aspect: 4 / 3,
    },
    {
        name: 'is_immediately',
        label: 'START THE ROOM NOW',
        type: 'check',
    },
    {
        name: 'start_time',
        label: 'WHEN',
        type: 'date',
    },
    {
        name: '',
        label: 'GUESTS',
        type: 'label',
    },
    {
        name: 'is_enter_stage',
        label: 'MEMBERS JOIN ON STAGE',
        type: 'check',
    },
];

const assembleKeys = [
    'assemble_name',
    'description',
    'start_time',
    'host_id',
    'host_name',
    'photo_url',
    'is_immediately',
    'is_allow_all',
    'is_enter_stage',
    'enter_club_id',
    'enter_club_name',
];

class EditAssembly extends React.Component {
    constructor(props) {
        super();
        const club = session.get('futureof-club');
        this.state = {
            assemble_name: '',
            description: '',
            photo_url: '',
            is_immediately: true,
            is_allow_all: true,
            is_enter_stage: true,
            start_time: null,
            start_time_date: null,
            start_time_hour: null,
            host_id: '',
            host_name: '',
            enter_club_id: club.club_id,
            enter_club_name: club.club_name,
            validated: false,
            loading: false,
            imgFileSrc: null,
            users: [],
            submitTitle: 'Submit',
            pagenumber: 0,
        };
        this.assembleyIdRef = createRef();
        this.assembleyIdRef.current = null;
        this.createRefs();
    }

    componentDidMount() {
        const club = session.get('futureof-club');
        this.createRefs();
        this.getAssembleDetails();
        this.getAllUsers(club.club_id);
    }

    createRefs = () => {
        form_attries.map((attr) => {
            this[`${attr.name}Ref`] = createRef();
            return 0;
        });
    };

    getAssembleDetails = () => {
        this.setState({ loading: true });
        const assemble_id = window.location.href.split(
            '/manager/assemblies/edit/'
        )[1];
        this.assembleyIdRef.current = assemble_id;
        console.log('assemble_id edit ==>', this.assembleyIdRef.current);
        adminApi
            .getAssemble(assemble_id)
            .then((response) => {
                this.setState({ loading: false });
                console.log('assemble_id edit res ==>', response);
                if (response.status === true) {
                    const assemble = response.data;
                    assembleKeys.map((attr) => {
                        this.setState({
                            [attr]: assemble[attr],
                        });
                        return 0;
                    });
                    if (
                        assemble.start_time &&
                        moment(assemble.start_time).isValid()
                    ) {
                        this.setState({
                            start_time: assemble.start_time,
                            start_time_date: moment(assemble.start_time).format(
                                'YYYY-MM-DD'
                            ),
                            start_time_hour: moment(assemble.start_time).format(
                                'HH:mm A'
                            ),
                        });
                    } else {
                        this.setState({
                            start_time: new Date().toISOString(),
                            start_time_date: moment().format('YYYY-MM-DD'),
                            start_time_hour: moment().format('HH:mm A'),
                        });
                    }
                } else {
                    helper.showToast('Error', response.data, 3);
                }
            })
            .catch((error) => {
                this.setState({ loading: false });
                helper.showToast(
                    'Error',
                    error.message || 'There is an error while getting club.',
                    3
                );
                console.log('err: ', error);
            });
    };

    getAllUsers = (club_id) => {
        adminApi
            .getUsersWithClubId(club_id)
            .then((response) => {
                if (response.status === true) {
                    var results = response.connect;
                    this.setState({
                        users: results.filter((b) => b.user_id),
                        loading: false,
                    });
                }
            })
            .catch((error) => {
                console.log('err: ', error);
                this.setState({
                    loading: false,
                });
            });
    };

    handleBack = () => {
        this.props.history.push('/manager/assemblies');
    };

    handleSwitchChange = (event) => {
        const target = event.target;
        const value = target.checked;
        const name = target.name;
        this.setState({
            [name]: value,
        });
    };

    handleFileChange = (blob, name) => {
        this.setState({
            imgFileSrc: blob,
        });
    };

    handleDateChange = (date) => {
        if (typeof date === String || !date) {
            helper.showToast('Warning', 'Please choose valid date and time', 2);
        } else {
            this.setState(
                {
                    start_time_date: date.format('YYYY-MM-DD'),
                },
                () => {
                    this.setState({
                        start_time: `${this.state.start_time_date}T${this.state.start_time_hour}`,
                    });
                }
            );
        }
    };

    handleTimeChange = (date) => {
        if (typeof date === String || !date) {
            helper.showToast('Warning', 'Please choose valid date and time', 2);
        } else {
            this.setState(
                {
                    start_time_hour: date.format('HH:mm:ss'),
                },
                () => {
                    this.setState({
                        start_time: `${this.state.start_time_date}T${this.state.start_time_hour}`,
                    });
                }
            );
        }
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
        console.log(this.state.pagenumber, this.state);
        if (this.state.pagenumber === 0) {
            for (const idx in form_attries) {
                const attr = form_attries[idx];
                if (attr.name !== '' && !attr.type === 'check') {
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
        }

        if (this.state.pagenumber === 1) {
            if (this.state.host_id === '') {
                helper.showToast('Warning', 'Please choose a host', 2);
                return;
            }
        }

        this.setState(
            {
                pagenumber: this.state.pagenumber + 1,
            },
            async () => {
                console.log('page nummber', this.state.pagenumber);
                if (this.state.pagenumber > 1) {
                    await this.handleSubmit();
                }
            }
        );
    };

    handlePrev = () => {
        this.setState({
            pagenumber:
                this.state.pagenumber < 0 ? 0 : this.state.pagenumber - 1,
        });
    };

    handleSelectHost = (item, selected) => {
        if (selected) {
            this.setState({
                host_id: '',
                host_name: '',
            });
        } else {
            this.setState({
                host_id: item.user_id,
                host_name: `${item.first_name} ${item.last_name}`,
            });
        }
    };

    handleSubmit = async (event) => {
        const { submitTitle } = this.state;
        console.log(submitTitle);
        if (submitTitle !== 'Submit') {
            return;
        }
        this.setState({ submitTitle: 'Uploading...' });
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
        this.setState({ submitTitle: 'Updating...' });
        const updateObj = {};
        for (const idx in assembleKeys) {
            const key = assembleKeys[idx];
            const value = this.state[key];
            if (value !== undefined && value !== '') {
                updateObj[key] = value;
            } else {
                // Either both of one
                if (key === 'photo_url') {
                    continue;
                }
                this.setState({ validated: true });
                helper.showToast('Warning', 'Please fill out all info', 2);
                return;
            }
        }
        console.log('update obj ==> ', updateObj);
        updateObj['start_time'] = helper.getCurrentLocalTime(
            this.state.start_time
        );
        this.updateAssembly(updateObj);
    };

    updateAssembly = (updateObj) => {
        if (this.assembleyIdRef.current) {
            adminApi
                .updateAssemble(this.assembleyIdRef.current, updateObj)
                .then((response) => {
                    this.setState({ submitTitle: 'Success' });
                    setTimeout(() => {
                        this.setState({ submitTitle: 'Submit' });
                    }, 2000);
                    if (response.status === true && response.data) {
                        helper.showToast(
                            'Success',
                            'Room updated successfully.',
                            1
                        );
                        this.handleBack();
                    } else {
                        helper.showToast(
                            'Error',
                            'Failed to update the room',
                            3
                        );
                    }
                })
                .catch((error) => {
                    this.setState({ submitTitle: 'Failed' });
                    setTimeout(() => {
                        this.setState({ submitTitle: 'Submit' });
                    }, 2000);
                    console.log('err: ', error);
                    helper.showToast(
                        'Error',
                        error.message || 'Failed to update the room',
                        3
                    );
                });
        }
    };

    renderRow = (form_attr) => {
        // console.log(this.state.start_time)
        // console.log(moment(this.state.start_time).format('YYYY-MM-DD'))
        // console.log(moment(this.state.start_time).format('HH:mm A'))
        return (
            <Form.Group
                key={form_attr.name}
                as={Col}
                controlId={`${form_attr.name}`}
                className="justify-content-md-center input-row"
                style={{ maxWidth: '40vw' }}
            >
                {form_attr.type !== 'check' && (
                    <Form.Label as={Col}>{form_attr.label}</Form.Label>
                )}

                <InputGroup as={Col} className="input-area">
                    {form_attr.type === 'image' ? (
                        <ImageForm
                            ref={this[`${form_attr.name}Ref`]}
                            previewSrc={this.state[form_attr.name]}
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
                            type="checkbox"
                            id={form_attr.name}
                            name={form_attr.name}
                            checked={this.state[form_attr.name]}
                            onChange={this.handleSwitchChange}
                            label={form_attr.label}
                        />
                    ) : form_attr.type === 'date' ? (
                        <>
                            {this.state.start_time_date && (
                                <Datetime
                                    className="datetimepicker"
                                    dateFormat="YYYY-MM-DD"
                                    timeFormat={false}
                                    initialValue={moment(
                                        this.state.start_time
                                    ).format('YYYY-MM-DD')}
                                    onChange={this.handleDateChange}
                                    onClose={this.handleDateChange}
                                />
                            )}
                            <div style={{ width: 20 }}></div>
                            {this.state.start_time_hour && (
                                <Datetime
                                    className="datetimepicker"
                                    dateFormat={false}
                                    timeFormat="HH:mm A"
                                    initialValue={moment(
                                        this.state.start_time
                                    ).format('HH:mm A')}
                                    onChange={this.handleTimeChange}
                                    onClose={this.handleTimeChange}
                                />
                            )}
                        </>
                    ) : form_attr.type === 'textarea' ? (
                        <Form.Control
                            ref={this[`${form_attr.name}Ref`]}
                            as="textarea"
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
                            type="text"
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

    onKeyPress = (event) => {
        console.log('Here: ');
        if (event.charCode === 13) {
            this.btn.click();
        }
    }

    render() {
        const { submitTitle, loading, pagenumber, users, host_id } = this.state;
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
        let pageOrder = pagenumber + 1;
        if (pageOrder > 2) {
            pageOrder = 2;
        }
        return (
            <Content>
                <div className="assemble-list">
                    <Row className="justify-content-start">
                        <h4>ROOMS</h4>
                    </Row>

                    <div className="assemble-list-container">
                        <Row className="justify-content-start">
                            <h5>EDIT ROOM (STEP {pageOrder} OF 2)</h5>
                        </Row>
                        {pagenumber === 1 && (
                            <Row className="justify-content-start">
                                <h6>SELECT HOST</h6>
                            </Row>
                        )}
                        <Col>
                            {!loading ? (
                                <div>
                                    {pagenumber === 0 ? (
                                        form_attries.map((attr) =>
                                            this.renderRow(attr)
                                        )
                                    ) : pagenumber === 1 ? (
                                        <UserCarousel
                                            data={reorderedUsers}
                                            selected_id={host_id}
                                            onSelect={this.handleSelectHost}
                                        />
                                    ) : (
                                        <p className="text-center">
                                            Updating...
                                        </p>
                                    )}

                                    {pagenumber < 2 && (
                                        <Row className="justify-content-start">
                                            <Button
                                                variant={'primary'}
                                                type={
                                                    pagenumber === 1
                                                        ? 'submit'
                                                        : 'button'
                                                }
                                                className="btn mt-5"
                                                onClick={() => {
                                                    this.handleNext();
                                                }}
                                                ref={node => (this.btn = node)}
                                            >
                                                {pagenumber === 1
                                                    ? submitTitle
                                                    : 'Next'}
                                            </Button>
                                            <Button
                                                type="button"
                                                className="btn btn-primary mt-5"
                                                style={{
                                                    marginLeft: 30,
                                                    backgroundColor: 'white',
                                                    color: '#3B75B4',
                                                }}
                                                onClick={this.handleBack}
                                            >
                                                Cancel
                                            </Button>
                                        </Row>
                                    )}
                                </div>
                            ) : (
                                <p className="text-center">Loading...</p>
                            )}
                        </Col>
                    </div>
                </div>
            </Content>
        );
    }
}

export default EditAssembly;
