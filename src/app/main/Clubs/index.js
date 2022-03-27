import React, { createRef } from 'react';
import { Button, Row, Col, Modal, Form } from 'react-bootstrap';
import './styles.scss';

import adminApi from '../../../services/admin.service';
import helper from '../../../services/helper.service';

import Carousel from '../components/Carousel/index_club';
import Content from '../../../components/content';

class Clubs extends React.Component {
    constructor(props) {
        super();
        this.state = {
            data_list: [],
            loading: false,
            showModal: false,
            deleting: false,
            sort_type: 'NONE',
        };
        this.deleteIdRef = createRef();
        this.deleteIdRef.current = null;
    }

    componentDidMount() {
        this.getAllClubs();
    }

    getAllClubs = () => {
        this.setState({
            loading: true,
        });
        adminApi
            .getAllClubs()
            .then((response) => {
                if (response.status) {
                    console.log(response.data);
                    var results = response.data;
                    this.setState({
                        data_list: results,
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
        this.props.history.push(`/admin/clubs/edit/${id}`);
    };

    handleCreate = () => {
        this.props.history.push('/admin/clubs/create');
    };

    handleSort = (id) => {
        this.props.history.push(`/admin/sort/${id}`);
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
        if (sort_type === 'NAME') {
            this.setState({
                data_list: data_list.sort((a, b) => {
                    if (a.club_name < b.club_name) {
                        return -1;
                    }
                    if (a.club_name > b.club_name) {
                        return 1;
                    }
                    return 0;
                }),
            });
        } else if (sort_type === 'DATE CREATED') {
            this.setState({
                data_list: data_list.sort((a, b) => {
                    if (a.created_at > b.created_at) {
                        return -1;
                    }
                    if (a.created_at < b.created_at) {
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

    deleteClub = () => {
        console.log(this.deleteIdRef.current);
        if (this.deleteIdRef.current) {
            this.setState({ deleting: true });
            adminApi
                .deleteClub(this.deleteIdRef.current)
                .then((response) => {
                    this.setState({ deleting: false });
                    this.handleShowModal();
                    if (response.status === true) {
                        this.setState({
                            data_list: this.state.data_list.filter(
                                (data) =>
                                    data.club_id !== this.deleteIdRef.current
                            ),
                        });
                        helper.showToast(
                            'Success',
                            'Club deleted successfully',
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
                            'There was an error while deleting the club.',
                        3
                    );
                    this.setState({ deleting: false });
                });
        }
    };

    render() {
        const { data_list, loading, showModal, deleting } = this.state;
        return (
            <Content>
                <div className="club-list">
                    <Row className="justify-content-start">
                        <h4>CLUBS</h4>
                    </Row>
                    <div className="club-list-container">
                        <Col>
                            <Row className="justify-content-start">
                                <h5>{data_list.length} CLUBS</h5>
                            </Row>
                        </Col>
                        <Row className="justify-content-space-between align-items-center club-list-create-section">
                            <Col
                                md="auto"
                                className="btn-section create"
                                onClick={this.handleCreate}
                            >
                                CREATE CLUB
                            </Col>
                            <Col md="auto">SORT:</Col>
                            <Col md="auto" className="btn-section">
                                <Form.Control
                                    className="sort"
                                    as="select"
                                    onChange={(value) => {
                                        this.handleSortByClub(value);
                                    }}
                                >
                                    <option>NONE</option>
                                    <option>NAME</option>
                                    <option>DATE CREATED</option>
                                </Form.Control>
                            </Col>
                        </Row>

                        <Row className="justify-content-start"></Row>
                        <Carousel
                            data={data_list}
                            loading={loading}
                            main_key="club_id"
                            title_key={'club_name'}
                            subtitle_key={''}
                            handleEdit={this.handleEdit}
                            handleDelete={this.handleDelete}
                            handleSort={this.handleSort}
                        />
                        <Modal
                            show={showModal}
                            size="sm"
                            aria-labelledby="contained-modal-title-vcenter"
                            centered
                            onHide={this.handleShowModal}
                            dialogClassName={'primaryModal'}
                        >
                            <Modal.Body>
                                <Row className="justify-content-center">
                                    Do you really want to delete this Club?
                                </Row>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button
                                    variant="primary"
                                    onClick={this.handleShowModal}
                                >
                                    CANCEL
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={!deleting ? this.deleteClub : null}
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

export default Clubs;
