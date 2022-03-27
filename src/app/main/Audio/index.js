import React, { createRef } from 'react';
import { Button, Row, Col, Modal, Form, SplitButton, Dropdown } from 'react-bootstrap';
import './styles.scss';

import adminApi from '../../../services/admin.service';
import session from '../../../services/session.service';
import helper from '../../../services/helper.service';

import Carousel from '../components/Carousel/index_audio';
import Content from '../../../components/content';

import { createBrowserHistory } from 'history';



class Audios extends React.Component {
    constructor(props) {
        super();
        const club = session.get('futureof-club');
        this.state = {
            data_list: [],
            club,
            loading: false,
            showModal: false,
            deleting: false,
            sorted: false,
            reordered: false,
            reordring: false,
            sort_type: 'NONE',
            updating: false,
            clubs: [],
            showRejectModal: false,
            selected: null,
            reject_reason: 'Not relevant',
            showReasonForm: false
        };
        this.deleteIdRef = createRef();
        this.deleteIdRef.current = null;
    }

    componentDidMount() {
        const currentUser = session.get('futureof-user');
        if (currentUser.user_role === 'manager') {
            const club = session.get('futureof-club');
            this.getAllAudios(club);
        } else if (currentUser.user_role === 'user' || currentUser.user_role === '') {
            this.getClubsWithUserId(currentUser.user_id);
        }
    }

    getClubsWithUserId = async (user_id) => {
        try {
            this.setState({
                loading: true,
            });
            const getClubsRes = await adminApi.getClubsWithUserId(user_id);
            if (getClubsRes.status) {
                const joinedClubs = getClubsRes.connect
                console.log('joinedClubs: ', joinedClubs);
                const club = session.get('audio-club') ? session.get('audio-club') : joinedClubs[0];
                const getAllAudiosRes = await adminApi.getDataWithClubId(club.club_id);
                let data_list = getAllAudiosRes.data.filter(
                    (a) => a.audio_id && a.audio_id !== '' && a.host_id === user_id
                );
                data_list.sort((a, b) => {
                    if (new Date(a.pinned_at).getTime() < new Date(b.pinned_at).getTime()) {
                        return 1;
                    }
                    if (new Date(a.pinned_at).getTime() > new Date(b.pinned_at).getTime()) {
                        return -1;
                    }
                    return 0;
                })
                if (getAllAudiosRes.status) {
                    session.set('audio-club', club);
                    this.setState({
                        clubs: joinedClubs,
                        club: club,
                        data_list: data_list,
                        loading: false,
                    });
                }
            }
        } catch (error) {
            console.log('err: ', error);
            this.setState({
                loading: false,
            });
        }
    };

    getAllAudios = async (club) => {
        const currentUser = session.get('futureof-user');
        try {
            this.setState({
                loading: true,
            });
            const getDataRes = await adminApi
                .getDataWithClubId(club.club_id);
            if (getDataRes.status) {
                let results = getDataRes.data;
                console.log('results: ', results);
                if (currentUser.user_role === 'manager') {
                    let data_list = results.filter(
                        (a) => a.audio_id && a.audio_id !== '' && a.audio_status !== 'rejected' && a.audio_status !== 'removed'
                    );
                    data_list.sort((a, b) => {
                        if (new Date(a.pinned_at).getTime() < new Date(b.pinned_at).getTime()) {
                            return 1;
                        }
                        if (new Date(a.pinned_at).getTime() > new Date(b.pinned_at).getTime()) {
                            return -1;
                        }
                        return 0;
                    })
                    let previous_list = data_list.filter(data => !data.hasOwnProperty('audio_status'));
                    let approved_list = data_list.filter(data => data.audio_status === 'approved');
                    let notApproved_list = data_list.filter(data => data.hasOwnProperty('audio_status') && data.audio_status !== 'approved');

                    this.setState({
                        data_list: previous_list.concat(approved_list, notApproved_list),
                        loading: false,
                    });
                } else if (currentUser.user_role === 'user' || currentUser.user_role === '') {
                    results.sort((a, b) => {
                        if (new Date(a.pinned_at).getTime() < new Date(b.pinned_at).getTime()) {
                            return 1;
                        }
                        if (new Date(a.pinned_at).getTime() > new Date(b.pinned_at).getTime()) {
                            return -1;
                        }
                        return 0;
                    })
                    this.setState({
                        data_list: results.filter(
                            (a) => a.audio_id && a.audio_id !== '' && a.host_id === currentUser.user_id
                        ),
                        loading: false,
                    });
                }
            }
        } catch (error) {
            console.log('err: ', error);
            this.setState({
                loading: false,
            });
        }
    };

    selectClub = (club) => {
        if (typeof club === 'string') {
            for (let i = 0; i < this.state.clubs.length; i++) {
                const ele = this.state.clubs[i];
                if (ele.club_name === club) {
                    club = ele;
                    break;
                }
            }
        }
        session.set('audio-club', club);
        this.setState({ club });
        this.getAllAudios(club);
    }

    handleEdit = (id) => {
        const currentUser = session.get('futureof-user');
        if (currentUser.user_role === 'manager') {
            this.props.history.push(`/manager/audios/edit/${id}`);
        } else if (currentUser.user_role === 'user' || currentUser.user_role === '') {
            this.props.history.push({
                pathname: `/user/audios/edit/${id}`,
                state: { club: this.state.club }
            });
        }
    };

    handleReject = (id) => {
        console.log('handleReject: ', id);
        this.setState({ selected: id });
        this.handleShowRejectModal();
    }

    processReject = () => {
        const currentUser = session.get('futureof-user');
        let body = currentUser.user_role === 'manager' ? { audio_status: 'rejected', reject_reason: this.state.reject_reason, manager_id: currentUser.user_id } : { audio_status: 'rejected', reject_reason: this.state.reject_reason };
        this.updateAudio(this.state.selected, body);
    }

    handleRemove = (id) => {
        console.log('handleRemove: ', id);
        this.updateAudio(id, { audio_status: 'removed' });
    }

    handleApprove = (id) => {
        console.log('handleApprove: ', id);
        const currentUser = session.get('futureof-user');
        let body = currentUser.user_role === 'manager' ? { audio_status: 'approved', manager_id: currentUser.user_id } : { audio_status: 'approved' };
        this.updateAudio(id, body);
    }

    handleCreate = () => {
        const currentUser = session.get('futureof-user');
        if (currentUser.user_role === 'manager') {
            this.props.history.push('/manager/audios/create');
        } else if (currentUser.user_role === 'user' || currentUser.user_role === '') {
            this.props.history.push({
                pathname: '/user/audios/create',
                state: { club: this.state.club }
            });
        }
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

    handleShowRejectModal = () => {
        this.setState({
            showRejectModal: !this.state.showRejectModal,
            showReasonForm: false,
            reject_reason: ''
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
                    if (a.audio_name < b.audio_name) {
                        return -1;
                    }
                    if (a.audio_name > b.audio_name) {
                        return 1;
                    }
                    return 0;
                }),
            });
        } else if (sort_type === 'STATUS') {
            this.setState({
                data_list: data_list.sort((a, b) => {
                    if (a.audio_status < b.audio_status) {
                        return -1;
                    }
                    if (a.audio_status > b.audio_status) {
                        return 1;
                    }
                    return 0;
                }),
            });
        } else {
            var pinnedData = data_list.filter((a) => a.is_pinned);
            pinnedData = pinnedData.sort((a, b) => {
                if (new Date(a.pinned_at).getTime() < new Date(b.pinned_at).getTime()) {
                    return 1;
                }
                if (new Date(a.pinned_at).getTime() > new Date(b.pinned_at).getTime()) {
                    return -1;
                }
                return 0;
            })
            var unPinnedData = data_list.filter((a) => !a.is_pinned);
            unPinnedData = unPinnedData.sort((a, b) => {
                if (new Date(a.pinned_at).getTime() < new Date(b.pinned_at).getTime()) {
                    return 1;
                }
                if (new Date(a.pinned_at).getTime() > new Date(b.pinned_at).getTime()) {
                    return -1;
                }
                return 0;
            })
            let list = [...pinnedData, ...unPinnedData];
            // list.sort((a, b) => {

            // });
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
            const audios = this.state.data_list.map((audio) => {
                return {
                    audio_id: audio.audio_id,
                    item_order: audio.item_order,
                };
            });
            adminApi
                .updateAudioOrder({ audios })
                .then((response) => {
                    console.log('reordering responese', response);
                    this.setState({ reordered: false, reordring: false });
                })
                .catch((error) => {
                    this.setState({ reordered: true, reordring: false });
                });
        }
    };

    deleteAudio = () => {
        console.log(this.deleteIdRef.current);
        if (this.deleteIdRef.current) {
            this.setState({ deleting: true });
            adminApi
                .deleteAudio(this.deleteIdRef.current)
                .then((response) => {
                    this.setState({ deleting: false });
                    this.handleShowModal();
                    if (response.status === true) {
                        this.setState({
                            data_list: this.state.data_list.filter(
                                (data) =>
                                    data.audio_id !== this.deleteIdRef.current
                            ),
                        });
                        helper.showToast(
                            'Success',
                            'Audio deleted successfully',
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
                        'There was an error while deleting the audio.',
                        3
                    );
                    this.setState({ deleting: false });
                });
        }
    };

    handleUpdateHelloAudio = (audio, is_sent_message) => {
        if (is_sent_message) {
            const obj = {
                description: audio.description,
                audio_url: audio.audio_url,
                audio_duration: audio.audio_duration,
                audio_file_name: audio.audio_file_name,
                hello_audio_id: audio.audio_id,
                enter_club_id: this.state.club.club_id,
                enter_club_name: this.state.club.club_name,
                from_manager: true,
                host_name: 'ClubManager',
            };
            this.setState({
                updating: true,
            });
            adminApi
                .createVoiceNotes(obj)
                .then((response) => {
                    this.setState({
                        updating: false,
                    });
                    if (response.status === true) {
                        this.updateAudio(audio.audio_id, { is_sent_message });
                    }
                })
                .catch((error) => {
                    this.setState({
                        updating: false,
                    });
                    console.log('err: ', error);
                });
        } else {
            adminApi
                .deleteVoiceNotes(audio.audio_id)
                .then((response) => {
                    this.setState({
                        updating: false,
                    });
                    if (response.status === true) {
                        this.updateAudio(audio.audio_id, { is_sent_message });
                    }
                })
                .catch((error) => {
                    this.setState({
                        updating: false,
                    });
                    console.log('err: ', error);
                });
        }
    };

    handleUpdateAllAccess = (audio_id, is_allow_all) => {
        this.updateAudio(audio_id, { is_allow_all });
    };

    updateAudio = (audio_id, params) => {
        this.setState({
            updating: true,
            showRejectModal: false
        });
        adminApi
            .updateAudio(audio_id, params)
            .then((response) => {
                if (response.status === true) {
                    const updatedAudio = response.data;
                    const { data_list } = this.state;
                    const audios = data_list.map((audio) => {
                        if (audio.audio_id === updatedAudio.audio_id) {
                            audio = updatedAudio;
                        }
                        return audio;
                    });
                    let list = audios.filter(audio => audio.audio_status !== 'rejected' && audio.audio_status !== 'removed');
                    let previous_list = list.filter(data => !data.hasOwnProperty('audio_status'));
                    let approved_list = list.filter(data => data.audio_status === 'approved');
                    let notApproved_list = list.filter(data => data.hasOwnProperty('audio_status') && data.audio_status !== 'approved');

                    this.setState({
                        data_list: previous_list.concat(approved_list, notApproved_list),
                        loading: false,
                        updating: false,
                    });
                }
            })
            .catch((error) => {
                helper.showToast(
                    'Error',
                    error.message || 'Failed to update the audio',
                    3
                );
                this.setState({ updating: false });
            });
    };

    handleSelectReasonForRejection = (e) => {
        var reason = e.target.value;
        if (reason !== "Other") {
            this.setState({
                reject_reason: reason,
                showReasonForm: false
            });
        } else {
            this.setState({ showReasonForm: true });
        }
    }

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value,
        });
    };

    render() {
        const { data_list, club, loading, updating, showModal, deleting, clubs, showRejectModal, showReasonForm } =
            this.state;
        const currentUser = session.get('futureof-user');
        return (
            <Content>
                <div className="assemble-list">
                    <Row className="justify-content-start">
                        {currentUser.user_role === 'manager' && <h4>AUDIOS</h4>}
                        {(currentUser.user_role === 'user' || currentUser.user_role === '') && <h4>SUBMIT AUDIOS</h4>}
                    </Row>
                    {/* {
                        (currentUser.user_role === 'user' || currentUser.user_role === '') && (
                            <Row className="justify-content-space-between align-items-center">
                                <Col md="auto">CHOOSE CLUB:</Col>
                                <Col md="auto" className="btn-section">
                                    <Form.Control
                                        className="sort"
                                        as="select"
                                        onChange={(event) => {
                                            this.selectClub(event.target.value);
                                        }}
                                    >
                                        {club && <option key={club.club_id}>{club.club_name}</option>}
                                        {clubs.map((item) => item.club_id !== club.club_id && (
                                            <option
                                                key={item.club_id}
                                            >{item.club_name}</option>
                                        ))}
                                    </Form.Control>
                                </Col>
                            </Row>
                        )
                    } */}

                    <div className="assemble-list-container">
                        <Col>
                            <Row className="justify-content-start">
                                <h5>{data_list.length} AUDIOS</h5>
                            </Row>
                        </Col>

                        <Row className="justify-content-space-between align-items-center assemble-list-create-section">
                            <Col
                                md="auto"
                                className="btn-section create"
                                onClick={this.handleCreate}
                            >
                                CREATE AUDIO
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
                                    <option>STATUS</option>
                                </Form.Control>
                            </Col>
                        </Row>

                        <Row className="justify-content-start"></Row>

                        <Carousel
                            data={data_list}
                            club_data={club}
                            loading={loading}
                            updating={updating}
                            handleEdit={this.handleEdit}
                            handleDelete={this.handleDelete}
                            handleReject={this.handleReject}
                            handleRemove={this.handleRemove}
                            handleApprove={this.handleApprove}
                            handleReorderItems={this.handleReorderItems}
                            handleUpdateHelloAudio={this.handleUpdateHelloAudio}
                            handleUpdateAllAccess={this.handleUpdateAllAccess}
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
                                    Do you really want to delete this Audio?
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
                                    onClick={
                                        !deleting ? this.deleteAudio : null
                                    }
                                >
                                    {deleting ? 'Deleting...' : 'DELETE'}
                                </Button>
                            </Modal.Footer>
                        </Modal>
                        <Modal
                            show={showRejectModal}
                            size="sm"
                            aria-labelledby="contained-modal-title-vcenter"
                            centered
                            onHide={this.handleShowRejectModal}
                            dialogClassName={'primaryModal'}
                        >
                            <Modal.Body>
                                <Row className="justify-content-center">
                                    Please select a reason for rejection
                                </Row>
                                <Form.Control
                                    className="sort"
                                    as="select"
                                    onChange={(value) => {
                                        this.handleSelectReasonForRejection(value);
                                    }}
                                >
                                    <option>Not relevant</option>
                                    <option>Needs indexing</option>
                                    <option>Add better description</option>
                                    <option>Please check messages</option>
                                    <option>Other</option>
                                </Form.Control>
                                {
                                    showReasonForm && (
                                        <Form.Control
                                            as="textarea"
                                            rows={5}
                                            maxLength={1000}
                                            defaultValue={''}
                                            name={'reject_reason'}
                                            style={{ marginTop: 10 }}
                                            placeholder='Please describe a reason here'
                                            onChange={this.handleInputChange}
                                        />
                                    )
                                }
                            </Modal.Body>
                            <Modal.Footer>
                                <Button
                                    variant="primary"
                                    onClick={this.handleShowRejectModal}
                                >
                                    CANCEL
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={
                                        !updating ? this.processReject : null
                                    }
                                >
                                    {updating ? 'Rejecting...' : 'REJECT'}
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </div>
                </div>
            </Content>
        );
    }
}

export default Audios;
