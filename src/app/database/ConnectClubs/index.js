import React from 'react';
import '../tbl-clubs.scss';

import adminApi from '../../../services/admin.service';
import helper from '../../../services/helper.service';

import { manager as DataModel } from '../Model';
import { Form, Modal, Button } from 'react-bootstrap';

import Header from '../components/header';
import TableComp from '../components/table';
const model_keys = Object.keys(DataModel);
const filter_keys = model_keys.filter(
    (r) => DataModel[r] === 'String' && !`${r}`.includes('_url')
);
class ConnectClubs extends React.Component {
    constructor(props) {
        super();
        this.state = {
            data_list: [],
            manager_list: [],
            loading: true,
            search: '',
            filterItem: filter_keys[0],
            sorted: {},
            club_id: '',
            club: null,
            showModal: false,
            edit_id: '',
            user_role: '',
            editied_key: '',
            normalizedData: [],
        };
    }

    componentDidMount() {
        const club_id = this.props.id;
        const club = this.props.club;
        if (club_id && club_id !== '') {
            this.setState({
                club_id,
                club,
            });
            this.getConnectedUsers(club_id);
        }
    }

    getConnectedUsers = async (club_id) => {
        try {
            const getUsersRes = await adminApi.getUsersWithClubId(club_id);
            if (getUsersRes.status) {
                const results = getUsersRes.connect;
                this.setState({
                    data_list: results,
                });
                const getManagersRes = await adminApi.getManagersByClub(
                    club_id
                );
                if (getManagersRes.status) {
                    const managerResults = getManagersRes.data;
                    this.setState({
                        manager_list: managerResults,
                    });
                    await this.setNormalizeData(results, managerResults);
                } else {
                    helper.showToast('Error', getManagersRes.data, 3);
                }
            } else {
                helper.showToast('Error', getUsersRes.data, 3);
            }
        } catch (error) {
            this.setState({
                loading: false,
            });
            helper.showToast('Error', error.message, 3);
        }
    };

    getClubByManager = async (user) => {
        try {
            const res = await adminApi.getClubByManager(user.user_id);
            if (res.status) {
                const results = res.data;
                const show_club_name = results.map(
                    (result) => result.club_name
                );
                return show_club_name;
            } else {
                console.error('err: ', res.data);
                return '';
            }
        } catch (error) {
            console.error('err: ', error);
            return '';
        }
    };

    handleChangeFilter = (event) => {
        const filterItem = event.target.value;
        this.setState({
            filterItem,
        });
    };

    handleChangeSearch = (event) => {
        const search = event.target.value;
        this.setState({
            search,
        });
    };

    handleShowModal = () => {
        this.setState({
            showModal: !this.state.showModal,
        });
    };

    handleChangeModalInput = (event) => {
        console.log(event.target.value);
        const key = event.target.name;
        const value = event.target.value;
        if (value !== '') {
            this.setState({
                [key]: event.target.value.toLowerCase(),
            });
        } else {
            helper.showToast('Warning', 'Please fill out the field', 2);
        }
    };

    handleUpdateTableItem = async (event) => {
        const key = event.target.getAttribute('name');
        const value = event.target.dataset.recordId;
        const edit_id = event.target.id;
        console.log('edit_id', edit_id, key, value);
        if (key === 'user_role') {
            if (value === 'admin') {
                helper.showToast(
                    'Warning',
                    "You don't have permission to edit this user role",
                    2
                );
                return;
            } else {
                // const confirmRes = await this.checkIsUserClubManager(edit_id)
                // if (!confirmRes) {
                //     return
                // }
                this.setState({
                    edit_id,
                    [key]: value,
                    editied_key: key,
                });
                this.handleShowModal();
            }
        }
    };

    checkIsUserClubManager = async (userid) => {
        try {
            const res = await adminApi.getClubByManager(userid);
            if (res.status && Array.isArray(res.data) && res.data.length > 0) {
                const club_id = this.props.id;
                if (res.data.filter((a) => a.club_id === club_id).length > 0) {
                    return true;
                }
                console.log('Here: ', res.data);
                helper.showToast(
                    'Warning',
                    `This user is manager of ${helper.getDisplayName(
                        res.data[0].club_name,
                        '#'
                    )}`,
                    2
                );
                return false;
            }
            return true;
        } catch (error) {
            helper.showToast('Error', error.message, 3);
        }
    };

    checkClubExistInClubManager = async (userid) => {
        try {
            const res = await adminApi.getClubByManager(userid);
            if (res.status && Array.isArray(res.data) && res.data.length > 1) {
                console.log('aaaaa', res.status, res.data);
                return true;
            } else {
                console.log('bbbbb', res.status, res.data);
                return false;
            }
        } catch (error) {
            helper.showToast('Error', error.message, 3);
        }
    };

    handleSubmitModal = async () => {
        const { data_list, edit_id, editied_key } = this.state;
        const value = this.state[editied_key];
        this.handleShowModal();
        console.log(
            'change role',
            data_list.findIndex(
                (a) =>
                    a.user_id === edit_id &&
                    (a.user_role === 'user' || a.user_role === '')
            )
        );
        if (edit_id !== '' && value !== '') {
            if (value === 'user' || value === 'manager') {
                const obj = {};
                obj[editied_key] = value;
                console.log('Ok', obj);

                try {
                    if (value === 'manager') {
                        if (
                            data_list.findIndex(
                                (a) =>
                                    a.user_id === edit_id &&
                                    (a.user_role === 'user' ||
                                        a.user_role === '')
                            ) !== -1
                        ) {
                            const updateUserResult =
                                await adminApi.updateUserWithId(edit_id, obj);
                            if (updateUserResult.status) {
                                console.log(
                                    JSON.stringify(updateUserResult.data)
                                );
                                const result = updateUserResult.data;
                                const find_index = data_list.findIndex(
                                    (r) => r.user_id === result.user_id
                                );
                                if (find_index !== -1) {
                                    data_list[find_index] = result;
                                    this.setState({ data_list });
                                }

                                this.clubManager(edit_id, value);
                            } else {
                                helper.showToast(
                                    'Error',
                                    updateUserResult.data,
                                    3
                                );
                            }
                        } else {
                            this.clubManager(edit_id, value);
                        }
                    } else {
                        const checkClubExistInClubManager =
                            await this.checkClubExistInClubManager(edit_id);
                        console.log(
                            'checkClubExistInClubManager',
                            checkClubExistInClubManager
                        );
                        if (checkClubExistInClubManager) {
                            console.log('asdfasdf: ');
                            this.clubManager(edit_id, value);
                        } else {
                            const updateUserResult =
                                await adminApi.updateUserWithId(edit_id, obj);
                            if (updateUserResult.status) {
                                console.log(
                                    'response: ',
                                    updateUserResult.data
                                );
                                this.clubManager(edit_id, value);
                            } else {
                                console.log('Here: ', updateUserResult.data);
                                helper.showToast(
                                    'Error',
                                    updateUserResult.data,
                                    3
                                );
                            }
                        }
                    }
                } catch (error) {
                    console.error(error);
                    helper.showToast('Error', error.message, 3);
                }
            } else {
                helper.showToast(
                    'Warning',
                    'Please input one of them Admin or User',
                    2
                );
            }
        }
    };

    clubManager = async (edit_id, value) => {
        const response = await adminApi.clubManager({
            club_id: this.props.id,
            user_id: edit_id,
            user_role: value,
        });
        if (response.status) {
            helper.showToast('Success', 'User Role updated successfully', 1);
        } else {
            helper.showToast('Error', 'User Role failed to update', 3);
        }
    };

    normalizedData = async (data_list, manager_list) => {
        if (manager_list.length > 0) {
            let new_list = [];
            for (let i = 0; i < data_list.length; i++) {
                let newVal = data_list[i];
                if (
                    manager_list.findIndex((a) =>
                        a.sort_key.includes(newVal.user_id)
                    ) < 0
                ) {
                    if (newVal.user_role === 'manager') {
                        newVal.user_role = 'user';
                    }
                    newVal.show_club_name = [];
                } else {
                    if (newVal.user_role === 'user') {
                        newVal.user_role = 'manager';
                    }
                    newVal.show_club_name = await this.getClubByManager(newVal);
                }
                new_list.push(newVal);
            }
            return new_list;
        } else {
            return data_list;
        }
    };

    setNormalizeData = async (data_list, manager_list) => {
        const data = await this.normalizedData(data_list, manager_list);
        this.setState({
            normalizedData: data,
        });
    };

    onDeleteItem = (del_id) => {
        const { data_list } = this.state;
        const club_id = this.props.id;
        console.log(del_id);
        console.log(data_list);
        adminApi
            .deleteClubConnect(club_id, del_id)
            .then((response) => {
                if (response.status === true) {
                    this.setState({
                        data_list: data_list.filter(
                            (a) => a.user_id !== del_id
                        ),
                    });
                }
            })
            .catch((error) => {
                console.log('err: ', error);
            });
    };

    onDeleteBulk = async (delIds, callBack = () => {}) => {
        const promiseList = [];
        const club_id = this.props.id;
        for (const del_id of delIds) {
            promiseList.push(adminApi.deleteClubConnect(club_id, del_id));
        }
        await Promise.all(promiseList);
        this.getConnectedUsers(club_id);
        callBack();
    };

    render() {
        const {
            search,
            filterItem,
            loading,
            club_id,
            showModal,
            editied_key,
            normalizedData,
        } = this.state;
        return (
            <div className="tbl-clus">
                <div className="content">
                    <Header
                        title={`Connected users with ${club_id}`}
                        filterItem={filterItem}
                        filter_keys={filter_keys}
                        handleChangeFilter={this.handleChangeFilter}
                        handleChangeSearch={this.handleChangeSearch}
                    />
                    <TableComp
                        data_list={normalizedData}
                        dataModel={DataModel}
                        filterItem={filterItem}
                        search={search}
                        loading={loading}
                        main_key={'user_id'}
                        perPage={5}
                        deleting={true}
                        edit_keys={['user_role']}
                        onChangeStrValue={this.handleUpdateTableItem}
                        onDeleteItem={this.onDeleteItem}
                        onDeleteBulk={this.onDeleteBulk}
                    />
                </div>
                <Modal
                    show={showModal}
                    size="sm"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    onHide={this.handleShowModal}
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Edit User Role
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Control
                            as="select"
                            name={editied_key}
                            defaultValue={this.state[editied_key]}
                            onChange={this.handleChangeModalInput}
                        >
                            <option key="user" value="user">
                                user
                            </option>
                            <option key="manager" value="manager">
                                manager
                            </option>
                        </Form.Control>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={this.handleShowModal}
                        >
                            Close
                        </Button>
                        <Button
                            variant="primary"
                            onClick={this.handleSubmitModal}
                        >
                            Save
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

export default ConnectClubs;
