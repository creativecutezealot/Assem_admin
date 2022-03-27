import React from 'react';
import '../tbl-clubs.scss';

import { Form, Modal, Button } from 'react-bootstrap';

import adminApi from '../../../services/admin.service';
import helper from '../../../services/helper.service';

import { group as DataModel } from '../Model';

import Header from '../components/header';
import TableComp from '../components/table';

const model_keys = Object.keys(DataModel);
const filter_keys = model_keys.filter(
    (r) => DataModel[r] === 'String' && !`${r}`.includes('_url')
);
const main_key = 'group_id';
const edit_keys = ['access_code', 'memebership'];
const change_keys = ['is_private', 'is_connect_stripe'];
const link_paths = [
    '/database/connect/groups/',
    '/database/connect/groups/users/',
];
const link_keys = ['group_id', 'user_id'];
class Groups extends React.Component {
    constructor(props) {
        super();
        this.state = {
            data_list: [],
            loading: true,
            search: '',
            filterItem: filter_keys[0],
            showModal: false,
            edit_id: '',
            memebership: '',
            access_code: '',
            editied_key: '',
            sorted: {},
        };
    }

    componentDidMount() {
        this.getAllGroups();
    }

    getAllGroups = () => {
        adminApi
            .getAllGroups()
            .then((response) => {
                if (response.status === true) {
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

    handleChangeBoolVal = (event) => {
        const { data_list } = this.state;
        const group_id = event.target.id;
        const key = event.target.name;
        const value = event.target.checked;
        const obj = {};
        obj[key] = value;
        console.log(obj);
        adminApi
            .updateGroup(group_id, obj)
            .then((response) => {
                if (response.status === true) {
                    console.log(JSON.stringify(response.data));
                    var result = response.data;
                    const find_index = data_list.findIndex(
                        (r) => r.group_id === result.group_id
                    );
                    if (find_index !== -1) {
                        data_list[find_index] = {
                            ...data_list[find_index],
                            ...result,
                        };
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
    };

    handleUpdateTableItem = (event) => {
        console.log(event.target.id);
        console.log(event.target.dataset.recordId);
        console.log(event.target.name);
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
                [key]: event.target.value,
            });
        } else {
            helper.showToast('Warning', 'Please fill out the field', 2);
        }
    };

    handleSubmitModal = () => {
        const { data_list, edit_id, editied_key } = this.state;
        const value = this.state[editied_key];
        if (editied_key === 'access_code') {
            if (value !== '' && value.length > 4) {
            } else {
                helper.showToast(
                    'Warning',
                    'Hmm, the code should be more than 5 characters',
                    2
                );
                return;
            }
        }
        this.handleShowModal();
        if (edit_id !== '' && value !== '') {
            console.log('Ok');
            const obj = {};
            obj[editied_key] = value;
            adminApi
                .updateGroup(edit_id, obj)
                .then((response) => {
                    if (response.status === true) {
                        console.log(JSON.stringify(response.data));
                        var result = response.data;
                        const find_index = data_list.findIndex(
                            (r) => r.group_id === result.group_id
                        );
                        if (find_index !== -1) {
                            data_list[find_index] = {
                                ...data_list[find_index],
                                ...result,
                            };
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
        }
    };

    handleShowModal = () => {
        this.setState({
            showModal: !this.state.showModal,
        });
    };

    onDeleteItem = (del_id) => {
        console.log(del_id);
        if (del_id) {
            adminApi
                .deleteGroup(del_id)
                .then((response) => {
                    if (response.status === true) {
                        this.setState({
                            data_list: this.state.data_list.filter(
                                (data) => data.group_id !== del_id
                            ),
                        });
                        helper.showToast(
                            'Success',
                            'Group deleted successfully',
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
                            'There was an error while deleting the group.',
                        3
                    );
                });
        }
    };

    onDeleteBulk = async (delIds: [String], callBack = () => {}) => {
        const promiseList = [];
        for (const del_id of delIds) {
            promiseList.push(adminApi.deleteGroup(del_id));
        }
        await Promise.all(promiseList);
        this.getAllGroups();
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
        const modalTitle =
            editied_key === 'access_code'
                ? 'Edit Invite Code'
                : 'Edit Membership';
        const modalInputType =
            editied_key === 'access_code' ? 'number' : 'number';
        return (
            <div className="tbl-clus">
                <div className="content">
                    <Header
                        title="Groups"
                        filterItem={filterItem}
                        filter_keys={filter_keys}
                        handleChangeFilter={this.handleChangeFilter}
                        handleChangeSearch={this.handleChangeSearch}
                    />
                    <TableComp
                        data_list={data_list}
                        dataModel={DataModel}
                        filterItem={filterItem}
                        search={search}
                        loading={loading}
                        main_key={main_key}
                        change_keys={change_keys}
                        edit_keys={edit_keys}
                        link_keys={link_keys}
                        link_paths={link_paths}
                        perPage={5}
                        onChangeBoolValue={this.handleChangeBoolVal}
                        onChangeStrValue={this.handleUpdateTableItem}
                        onDeleteItem={this.onDeleteItem}
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
                                name={editied_key}
                                color="black"
                                maxLength={7}
                                type={modalInputType}
                                defaultValue={this.state[editied_key]}
                                placeholder={modalTitle}
                                onChange={this.handleChangeModalInput}
                            />
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
            </div>
        );
    }
}

export default Groups;
