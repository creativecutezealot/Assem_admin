import React, { createRef } from 'react';
import { Button, Row, Col, Modal, Form } from 'react-bootstrap';
import './styles.scss';

import adminApi from '../../../services/admin.service';
import session from '../../../services/session.service';
import helper from '../../../services/helper.service';
import Content from '../../../components/content';

import Carousel from '../components/Carousel';

class Assembles extends React.Component {
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
        this.getAllAssembles();
    }

    getAllAssembles = () => {
        const currentUser = session.get('futureof-user');
        const club = (currentUser.user_role === 'user' || currentUser.user_role === '') ? session.get('audio-club') : session.get('futureof-club');
        this.setState({
            loading: true,
        });
        adminApi
            .getDataWithClubId(club.club_id)
            .then((response) => {
                if (response.status === true) {
                    var results = response.data;
                    console.log(
                        'assembles',
                        results.filter(
                            (a) => a.assemble_id && a.assemble_id !== ''
                        )
                    );
                    this.setState({
                        data_list: results.filter(
                            (a) => a.assemble_id && a.assemble_id !== ''
                        ),
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
        this.props.history.push(`/manager/assemblies/edit/${id}`);
    };

    handleCreate = () => {
        this.props.history.push('/manager/assembles/create');
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
        } else if (sort_type === 'HOST') {
            this.setState({
                data_list: data_list.sort((a, b) => {
                    if (a.host_name < b.host_name) {
                        return -1;
                    }
                    if (a.host_name > b.host_name) {
                        return 1;
                    }
                    return 0;
                }),
            });
        } else {
            var pinnedData = data_list.filter((a) => a.is_pinned);
            pinnedData = pinnedData.sort((a, b) => {
                return (
                    new Date(b.pinned_at).getTime() -
                    new Date(a.pinned_at).getTime()
                );
            });
            var unPinnedData = data_list.filter((a) => !a.is_pinned);
            unPinnedData = unPinnedData.sort((a, b) => {
                return (
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                );
            });
            this.setState({
                data_list: [...pinnedData, ...unPinnedData],
            });
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

    deleteAssemble = () => {
        console.log(this.deleteIdRef.current);
        if (this.deleteIdRef.current) {
            this.setState({ deleting: true });
            adminApi
                .deleteAssemble(this.deleteIdRef.current)
                .then((response) => {
                    this.setState({ deleting: false });
                    this.handleShowModal();
                    if (response.status === true) {
                        this.setState({
                            data_list: this.state.data_list.filter(
                                (data) =>
                                    data.assemble_id !==
                                    this.deleteIdRef.current
                            ),
                        });
                        helper.showToast(
                            'Success',
                            'Room deleted successfully',
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
                        'There was an error while deleting the room.',
                        3
                    );
                    this.setState({ deleting: false });
                });
        }
    };

    render() {
        const { data_list, loading, showModal, deleting } = this.state;
        const live_assemblies = data_list.filter((item) =>
            helper.assembleStarted(item)
        );
        const live_schedules = data_list.filter(
            (item) => !helper.assembleStarted(item)
        );
        return (
            <Content>
                <div className='assemble-list'>
                    <Row className='justify-content-start'>
                        <h4>ROOMS</h4>
                    </Row>
                    <div className='assemble-list-container'>
                        <Col>
                            <Row className='justify-content-start'>
                                <h5>{live_assemblies.length} LIVE ROOMS</h5>
                            </Row>
                            <Row className='justify-content-start'>
                                <h5>{live_schedules.length} SCHEDULED ROOMS</h5>
                            </Row>
                        </Col>

                        <Row className='justify-content-space-between align-items-center assemble-list-create-section'>
                            <Col
                                md='auto'
                                className='btn-section create'
                                onClick={this.handleCreate}
                            >
                                CREATE ROOM
                            </Col>
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
                                    <option>HOST</option>
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
                                    Do you really want to delete this Club?
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
                                        !deleting ? this.deleteAssemble : null
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

export default Assembles;
