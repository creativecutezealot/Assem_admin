import React, { createRef } from 'react';
import { Button, Row, Col, Modal, Form } from 'react-bootstrap';
import './styles.scss';

import adminApi from '../../../services/admin.service';
import session from '../../../services/session.service';
import helper from '../../../services/helper.service';
import Content from '../../../components/content';

import Carousel from '../components/Carousel/index_event';

import ApiCalendar from 'react-google-calendar-api';

class Events extends React.Component {
    constructor(props) {
        super();
        this.state = {
            data_list: [],
            loading: false,
            showModal: false,
            deleting: false,
            sorted: false,
            reordered: false,
            reordring: false,
            sort_type: 'NONE',
        };
        this.deleteIdRef = createRef();
        this.deleteIdRef.current = null;
    }

    componentDidMount() {
        this.getAllEvents();
    }

    getAllEvents = () => {
        const currentUser = session.get('futureof-user');
        const club = (currentUser.user_role === 'user' || currentUser.user_role === '') ? session.get('audio-club') : session.get('futureof-club');
        this.setState({
            loading: true,
        });
        adminApi
            .getAllEvents()
            .then((response) => {
                if (response.status === true) {
                    var results = response.data;
                    let data_list = currentUser.user_role === 'manager' ? results.filter(a => a.enter_club_id === club.club_id) : results.filter(a => a.enter_club_id === club.club_id)
                    this.setState({
                        data_list: data_list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
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

    handleEdit = (id) => {
        this.props.history.push(`/manager/event/edit/${id}`);
    };

    handleCreate = () => {
        this.props.history.push('/manager/events/create');
    };

    handleDelete = (id) => {
        this.deleteIdRef.current = id;
        this.handleShowModal();
    };

    handleShowModal = () => {
        this.setState({
            showModal: !this.state.showModal,
        });
    };

    handleSortByClub = (event) => {
        const sort_type = event.target.value;
        console.log('sort_type', sort_type);
        const { data_list } = this.state;
        this.setState({
            sort_type,
        });
        if (sort_type === 'CLUB') {
            this.setState({
                data_list: data_list.sort((a, b) => {
                    return a.enter_club_name > b.enter_club_name;
                }),
            });
        } else if (sort_type === 'DATE') {
            this.setState({
                data_list: data_list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
            });
        } else {

        }
    };

    handleReorderItems = async (data_list) => {
        if (data_list !== this.state.data_list) {
            this.setState({
                reordered: true,
            });
        }
        await this.setState({
            data_list,
        });
    };

    handleSaveReorder = () => {
        if (this.state.data_list.length > 0) {
            this.setState({
                reordring: true,
            });
            const assembles = this.state.data_list.map((item) => {
                return {
                    assemble_id: item.assemble_id,
                    item_order: item.item_order,
                };
            });
            adminApi
                .updateAssembleOrder({ assembles })
                .then((response) => {
                    console.log('reordering responese', response);
                    this.setState({ reordered: false, reordring: false });
                })
                .catch((error) => {
                    this.setState({ reordered: true, reordring: false });
                });
        }
    };

    handleUpdateAllAccess = (assemble_id, is_allow_all) => {
        adminApi
            .updateAssemble(assemble_id, { is_allow_all })
            .then((response) => {
                if (response.status === true) {
                    const updatedAssemble = response.data;
                    const { data_list } = this.state;
                    const assembles = data_list.map((item) => {
                        if (item.assemble_id === updatedAssemble.assemble_id) {
                            item = updatedAssemble;
                        }
                        return item;
                    });
                    this.setState({ data_list: assembles });
                }
            })
            .catch((error) => {
                helper.showToast(
                    'Error',
                    error.message || 'Failed to update the audio',
                    3
                );
            });
    };

    deleteEvent = () => {
        console.log(this.deleteIdRef.current);
        if (this.deleteIdRef.current) {
            this.setState({ deleting: true });
            adminApi
                .deleteEvent(this.deleteIdRef.current)
                .then((response) => {
                    this.setState({ deleting: false });
                    this.handleShowModal();
                    if (response.status === true) {
                        this.setState({
                            data_list: this.state.data_list.filter(
                                (data) =>
                                    data.event_id !==
                                    this.deleteIdRef.current
                            ),
                        });
                        helper.showToast(
                            'Success',
                            'Event deleted successfully',
                            1
                        );
                        this.deleteIdRef.current = null;
                    } else {
                        helper.showToast('Error', response.data, 3);
                    }
                })
                .catch((error) => {
                    console.log('err: ', error);
                    helper.showToast(
                        'Error',
                        error.message ||
                        'There was an error while deleting the event.',
                        3
                    );
                    this.setState({ deleting: false });
                });
        }
    };

    handleCalendarEvent = async (item) => {
        try {
            console.log('handleCalendarEvent: ', item, ApiCalendar.sign);
            const authResponse = await ApiCalendar.handleAuthClick();
            if (authResponse) {
                console.log('sign in succesful!', authResponse);
                const event = {
                    summary: item.event_name,
                    // location: '800 Howard St., San Francisco, CA 94103',
                    description: item.description,
                    start: {
                        dateTime: item.event_time,
                        timeZone: 'America/Los_Angeles'
                    },
                    // end: {
                    //     dateTime: '2015-05-28T17:00:00-07:00',
                    //     timeZone: 'America/Los_Angeles'
                    // },
                    // recurrence: [
                    //     'RRULE:FREQ=DAILY;COUNT=2'
                    // ],
                    // attendees: [
                    //     { email: 'lpage@example.com' },
                    //     { email: 'sbrin@example.com' }
                    // ],
                    reminders: {
                        useDefault: false,
                        overrides: [
                            { method: 'email', minutes: 24 * 60 },
                            { method: 'popup', minutes: 10 }
                        ]
                    }
                };

                const createResponse = await ApiCalendar.createEvent(event);
                console.log('createResponse: ', createResponse);
            }
        } catch (error) {
            console.error(error);
        }
    }

    render() {
        const currentUser = session.get('futureof-user');
        const { data_list, loading, showModal, deleting } = this.state;
        return (
            <Content>
                <div className='assemble-list'>
                    <Row className='justify-content-start'>
                        <h4>EVENTS</h4>
                    </Row>
                    <div className='assemble-list-container'>
                        <Col>
                            <Row className='justify-content-start'>
                                <h5>{data_list.length} EVENTS</h5>
                            </Row>
                        </Col>

                        <Row className='justify-content-space-between align-items-center assemble-list-create-section'>
                            {currentUser.user_role === 'manager' && <Col
                                md='auto'
                                className='btn-section create'
                                onClick={this.handleCreate}
                            >
                                CREATE EVENT
                            </Col>}
                            <Col md='auto'>SORT:</Col>
                            <Col md='auto' className='btn-section'>
                                <Form.Control
                                    className='sort'
                                    as='select'
                                    onChange={(value) => {
                                        this.handleSortByClub(value);
                                    }}
                                >
                                    <option>NONE</option>
                                    <option>DATE</option>
                                </Form.Control>
                            </Col>
                        </Row>

                        <Row className='justify-content-start'></Row>

                        <Carousel
                            data={data_list}
                            loading={loading}
                            handleEdit={this.handleEdit}
                            handleDelete={this.handleDelete}
                            handleReorderItems={this.handleReorderItems}
                            handleCalendarEvent={this.handleCalendarEvent}
                            handleUpdateAllAccess={this.handleUpdateAllAccess}
                        />
                        <Modal
                            show={showModal}
                            size='sm'
                            aria-labelledby='contained-modal-title-vcenter'
                            centered
                            onHide={this.handleShowModal}
                            dialogClassName={'primaryModal'}
                        >
                            <Modal.Body>
                                <Row className='justify-content-center'>
                                    Do you really want to delete this Event?
                                </Row>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button
                                    variant='primary'
                                    onClick={this.handleShowModal}
                                >
                                    CANCEL
                                </Button>
                                <Button
                                    variant='danger'
                                    onClick={
                                        !deleting ? this.deleteEvent : null
                                    }
                                >
                                    {deleting ? 'Deleting...' : 'DELETE'}
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </div>
                </div>
            </Content>
        );
    }
}

export default Events;
