import React from 'react';
import '../tbl-clubs.scss';

import adminApi from '../../../services/admin.service';
import helper from '../../../services/helper.service';

import { vcode as DataModel } from '../Model';

import Header from '../components/header';
import TableComp from '../components/table';

const model_keys = Object.keys(DataModel);
const filter_keys = model_keys.filter(
    (r) => DataModel[r] === 'String' && !`${r}`.includes('_url')
);
const main_key = 'phone';

class VCode extends React.Component {
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
        this.getVcodes();
    }
    getVcodes = () => {
        adminApi
            .getAllVcodes()
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

    onDeleteVCode = (del_id) => {
        if (del_id) {
            adminApi
                .deleteVcode(del_id)
                .then((response) => {
                    if (response.status === true) {
                        this.setState({
                            data_list: this.state.data_list.filter(
                                (data) => data.phone !== del_id
                            ),
                        });
                        helper.showToast(
                            'Success',
                            'Verification code deleted successfully',
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
                            'There was an error while deleting the verification code.',
                        3
                    );
                });
        }
    };

    onDeleteBulk = async (delIds: [String], callBack = () => {}) => {
        const promiseList = [];
        for (const del_id of delIds) {
            promiseList.push(adminApi.deleteVcode(del_id));
        }
        await Promise.all(promiseList);
        this.getVcodes();
        callBack();
    };

    render() {
        const { search, filterItem, data_list, loading } = this.state;
        return (
            <div className="tbl-clus">
                <div className="content">
                    <Header
                        title="Verification Code"
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
                        main_key={main_key}
                        loading={loading}
                        onDeleteItem={this.onDeleteVCode}
                        onDeleteBulk={this.onDeleteBulk}
                    />
                </div>
            </div>
        );
    }
}

export default VCode;
