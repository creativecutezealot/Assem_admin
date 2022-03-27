import React from 'react';
import '../tbl-clubs.scss';

import { Form, Modal, Button } from 'react-bootstrap';

import adminApi from '../../../services/admin.service';
import helper from '../../../services/helper.service';

import { user as DataModel } from '../Model';

import Header from '../components/header';
import TableComp from '../components/table';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';

import CreateUser from './createUser';

const model_keys = Object.keys(DataModel);
const filter_keys = model_keys.filter(
    (r) => DataModel[r] === 'String' && !`${r}`.includes('_url')
);
const link_keys = ['user_id', 'club_id'];
const link_paths = [
    '/database/connect/users/',
    '/database/connect/clubs/',
    '/database/connect/clubs/users/',
];
const main_key = 'user_id';
const edit_keys = ['user_role'];
class Users extends React.Component {
    constructor(props) {
        super();
        this.state = {
            data_list: [],
            loading: true,
            search: '',
            filterItem: filter_keys[0],
            sorted: {},
            showModal: false,
            deleting: false,
            edit_id: '',
            del_id: '',
            user_role: '',
            editied_key: '',
            showAddUserModal: false,
            clubs: [],
        };
    }

    componentDidMount() {
        this.getAllUsers();
    }

    getAllUsers = () => {
        adminApi
            .getAllUsers()
            .then((response) => {
                if (response.status === true) {
                    var results = response.data;
                    this.setState({
                        data_list: results,
                    });
                    this.getClubByManager(results);
                }
            })
            .catch((error) => {
                console.log('err: ', error);
                this.setState({
                    loading: false,
                });
            });
    };

    getClubByManager = async (users) => {
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            if (user.user_role === 'manager') {
                await adminApi
                    .getClubByManager(user.user_id)
                    .then((response) => {
                        if (response.status === true) {
                            var results = response.data;
                            user.show_club_name = results.map(
                                (result) => result.club_name
                            );
                            this.setState({
                                loading: false,
                            });
                        }
                    })
                    .catch((error) => {
                        console.error('err: ', error);
                        this.setState({
                            loading: false,
                        });
                    });
            }
        }

        this.setState({
            data_list: users,
        });
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

    handleUpdateTableItem = (event) => {
        const key = event.target.name;
        const value = event.target.dataset.recordId;
        const edit_id = event.target.id;
        this.setState({
            edit_id,
            [key]: value,
            editied_key: key,
        });
        this.handleShowModal();
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
    handleSubmitModal = () => {
        const { data_list, edit_id, editied_key } = this.state;
        const value = this.state[editied_key];
        this.handleShowModal();
        if (edit_id !== '' && value !== '') {
            if (value === 'admin' || value === 'user' || value === 'manager') {
                console.log('Ok');
                const obj = {};
                obj[editied_key] = value;
                adminApi
                    .updateUserWithId(edit_id, obj)
                    .then((response) => {
                        if (response.status === true) {
                            console.log(JSON.stringify(response.data));
                            var result = response.data;
                            const find_index = data_list.findIndex(
                                (r) => r.user_id === result.user_id
                            );
                            if (find_index !== -1) {
                                data_list[find_index] = result;
                                this.setState({ data_list });
                            }
                        }
                    })
                    .catch((error) => {
                        console.log('err: ', error);
                        this.setState({
                            loading: false,
                        });
                    });
            } else {
                helper.showToast(
                    'Warning',
                    'Please input one of them Admin or User',
                    2
                );
            }
        }
    };

    handleShowModal = () => {
        this.setState({
            showModal: !this.state.showModal,
        });
    };

    handleShowAddUserModal = () => {
        this.setState({
            showAddUserModal: !this.state.showAddUserModal,
        });
    };

    deleteUser = (del_id) => {
        console.log('del_id', del_id);
        if (del_id !== '') {
            adminApi
                .deleteUser(del_id)
                .then((response) => {
                    if (response.status === true) {
                        this.setState({
                            data_list: this.state.data_list.filter(
                                (data) => data.user_id !== del_id
                            ),
                        });
                        helper.showToast(
                            'Success',
                            'User deleted successfully',
                            1
                        );
                    } else {
                        helper.showToast('Error', response.data, 3);
                    }
                })
                .catch((error) => {
                    console.log('err: ', error);
                    helper.showToast(
                        'Error',
                        error.message ||
                            'There was an error while deleting the user info.',
                        3
                    );
                });
        }
    };

    onDeleteBulk = async (delIds, callBack = () => {}) => {
        const promiseList = [];
        for (const del_id of delIds) {
            promiseList.push(adminApi.deleteUser(del_id));
        }
        await Promise.all(promiseList);
        this.getAllUsers();
        callBack();
    };

    render() {
        const {
            search,
            filterItem,
            data_list,
            loading,
            showModal,
            editied_key,
        } = this.state;
        const modalTitle = 'Edit User Role';
        return (
            <div className="tbl-clus">
                <div className="content">
                    <Header
                        title="Users"
                        filterItem={filterItem}
                        filter_keys={filter_keys}
                        handleChangeFilter={this.handleChangeFilter}
                        handleChangeSearch={this.handleChangeSearch}
                    />
                    <Button
                        style={{ marginBottom: 16 }}
                        onClick={this.handleShowAddUserModal}
                    >
                        <FontAwesomeIcon icon={faPlusCircle} /> ADD USER
                    </Button>
                    <TableComp
                        data_list={data_list}
                        dataModel={DataModel}
                        filterItem={filterItem}
                        search={search}
                        loading={loading}
                        main_key={main_key}
                        edit_keys={edit_keys}
                        link_keys={link_keys}
                        link_paths={link_paths}
                        perPage={5}
                        onChangeStrValue={this.handleUpdateTableItem}
                        onDeleteItem={this.deleteUser}
                        onDeleteBulk={this.onDeleteBulk}
                    />
                    <Modal
                        show={showModal}
                        size="sm"
                        aria-labelledby="contained-modal-title-vcenter"
                        centered
                        onHide={this.handleShowModal}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title id="contained-modal-title-vcenter">
                                {modalTitle}
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
                                <option key="manager" value={'manager'}>
                                    manager
                                </option>
                                <option key="admin" value={'admin'}>
                                    admin
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
                    <CreateUser
                        showModal={this.state.showAddUserModal}
                        handleShowModal={this.handleShowAddUserModal}
                        getAllUsers={this.getAllUsers}
                    />
                </div>
            </div>
        );
    }
}

export default Users;
