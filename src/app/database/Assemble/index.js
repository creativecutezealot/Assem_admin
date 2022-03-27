import React from 'react';
import '../tbl-clubs.scss';

import adminApi from '../../../services/admin.service';
import helper from '../../../services/helper.service';

import { assemble as DataModel } from '../Model';

import Header from '../components/header';
import TableComp from '../components/table';

const model_keys = Object.keys(DataModel);
const filter_keys = model_keys.filter(
    (r) => DataModel[r] === 'String' && !`${r}`.includes('_url')
);
const main_key = 'assemble_id';

class Assemble extends React.Component {
    constructor(props) {
        super();
        this.state = {
            data_list: [],
            loading: true,
            search: '',
            filterItem: filter_keys[0],
            sorted: {},
        };
    }

    componentDidMount() {
        this.onGetAllAssemblies();
    }

    onGetAllAssemblies = () => {
        adminApi
            .getAllAssembles()
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

    onDeleteItem = (del_id) => {
        if (del_id) {
            adminApi
                .deleteAssemble(del_id)
                .then((response) => {
                    if (response.status === true) {
                        this.setState({
                            data_list: this.state.data_list.filter(
                                (data) => data.assemble_id !== del_id
                            ),
                        });
                        helper.showToast(
                            'Success',
                            'Room deleted successfully',
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
                            'There was an error while deleting the room.',
                        3
                    );
                });
        }
    };

    onDeleteBulk = async (delIds: [String], callBack = () => {}) => {
        const promiseList = [];
        for (const del_id of delIds) {
            promiseList.push(adminApi.deleteAssemble(del_id));
        }
        await Promise.all(promiseList);
        this.onGetAllAssemblies();
        callBack();
    };

    render() {
        const { search, filterItem, data_list, loading } = this.state;
        return (
            <div className="tbl-clus">
                <div className="content">
                    <Header
                        title="Rooms"
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
                        perPage={5}
                        main_key={main_key}
                        onDeleteItem={this.onDeleteItem}
                        onDeleteBulk={this.onDeleteBulk}
                    />
                </div>
            </div>
        );
    }
}

export default Assemble;
