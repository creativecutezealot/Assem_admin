import React from 'react';
import '../tbl-clubs.scss';

import adminApi from '../../../services/admin.service';
import helper from '../../../services/helper.service';

import { memberReferral as DataModel } from '../Model';

import Header from '../components/header';
import TableComp from '../components/table';

const model_keys = Object.keys(DataModel);
const filter_keys = model_keys.filter(
    (r) => DataModel[r] === 'String' && !`${r}`.includes('_url')
);
const main_key = 'referral_id';
const link_keys = ['referral_user_id', 'referral_club_id'];
const link_paths = [
    '/database/connect/referrals/user',
    '/database/connect/referrals/club',
];

class Referrals extends React.Component {
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
        this.getAllReferrals();
    }

    getAllReferrals = () => {
        adminApi
            .getReferrals()
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

    onDeleteReferral = (del_id) => {
        if (del_id) {
            adminApi
                .deleteReferral(del_id)
                .then((response) => {
                    if (response.status === true) {
                        this.setState({
                            data_list: this.state.data_list.filter(
                                (data) => data.referral_id !== del_id
                            ),
                        });
                        helper.showToast(
                            'Success',
                            'Referral deleted successfully',
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
                            'There was an error while deleting the Referral.',
                        3
                    );
                });
        }
    };

    onDeleteBulk = async (delIds: [String], callBack = () => {}) => {
        const promiseList = [];
        for (const del_id of delIds) {
            promiseList.push(adminApi.deleteReferral(del_id));
        }
        await Promise.all(promiseList);
        this.getAllReferrals();
        callBack();
    };

    render() {
        const { search, filterItem, data_list, loading } = this.state;
        return (
            <div className="tbl-clus">
                <div className="content">
                    <Header
                        title="Member Referrals"
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
                        link_keys={link_keys}
                        link_paths={link_paths}
                        loading={loading}
                        onDeleteItem={this.onDeleteReferral}
                        onDeleteBulk={this.onDeleteBulk}
                    />
                </div>
            </div>
        );
    }
}

export default Referrals;
