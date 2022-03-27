import React from 'react';
import '../tbl-clubs.scss';

import adminApi from '../../../services/admin.service';
import helper from '../../../services/helper.service';

import { club_tier as DataModel } from '../Model';

import Header from '../components/header';
import TableComp from '../components/table';
const main_key = 'clubtier_id';
const change_keys = ['is_approved'];
const model_keys = Object.keys(DataModel);
const filter_keys = model_keys.filter(
    (r) => DataModel[r] === 'String' && !`${r}`.includes('_url')
);

class ClubTiers extends React.Component {
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
        this.onGetAllReq();
    }

    onGetAllReq = () => {
        adminApi
            .getAllClubTiers()
            .then((response) => {
                if (response.status === true) {
                    var results = response.data;
                    this.setState({
                        data_list: this.normalizeData(results).sort((a, b) => {
                            if (a.price < b.price) {
                                return -1;
                            }
                            if (a.price > b.price) {
                                return 1;
                            }
                            return 0;
                        }),
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

    normalizeData = (list = []) => {
        const newList = list.map((a) => {
            return {
                ...a,
                main_id: this.normalizeKey(a),
            };
        });
        return newList;
    };

    normalizeKey = (obj) => {
        return `${obj.club_id}#${obj.user_id}`;
    };

    normalizeClubId = (key) => {
        return `${key}`.split('#');
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
        const main_id = event.target.id;
        if (main_id === '') {
            return;
        }
        const obj = {
            club_id: this.normalizeClubId(main_id)[0],
            user_id: this.normalizeClubId(main_id)[1],
            is_approved: event.target.checked,
        };
        this.updateDataList(main_id, event.target.checked);
        adminApi
            .updateClubTier(obj)
            .then((response) => {
                if (!response.status) {
                    this.updateDataList(main_id, !event.target.checked);
                }
            })
            .catch((error) => {
                console.log('err: ', error);
                this.setState({
                    loading: false,
                });
                this.updateDataList(main_id, !event.target.checked);
            });
    };

    updateDataList = (main_id, value) => {
        const { data_list } = this.state;
        const find_index = data_list.findIndex(
            (r) => this.normalizeKey(r) === main_id
        );
        if (find_index !== -1) {
            data_list[find_index].is_approved = value;
            this.setState({ data_list });
        }
    };

    onDeleteItem = (del_id) => {
        console.log(del_id);
        if (del_id) {
            const clubtier_id = this.normalizeClubId(del_id)[0];
            console.log(clubtier_id);
            adminApi
                .deleteClubTier(clubtier_id)
                .then((response) => {
                    if (response.status === true) {
                        this.setState({
                            data_list: this.state.data_list.filter(
                                (data) => data.clubtier_id !== del_id
                            ),
                        });
                        helper.showToast(
                            'Success',
                            'Club tier deleted successfully',
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
                            'There was an error while deleting the club tier.',
                        3
                    );
                });
        }
    };

    onDeleteBulk = async (delIds: [String], callBack = () => {}) => {
        console.log('delIds: ', delIds);
        const promiseList = [];
        for (const del_id of delIds) {
            const clubtier_id = this.normalizeClubId(del_id)[0];
            promiseList.push(adminApi.deleteClubTier(clubtier_id));
        }
        await Promise.all(promiseList);
        this.onGetAllReq();
        callBack();
    };

    render() {
        const { search, filterItem, data_list, loading } = this.state;
        return (
            <div className="tbl-clus">
                <div className="content">
                    <Header
                        title="Club Tiers"
                        filterItem={filterItem}
                        filter_keys={filter_keys}
                        handleChangeFilter={this.handleChangeFilter}
                        handleChangeSearch={this.handleChangeSearch}
                    />
                    <TableComp
                        data_list={data_list}
                        dataModel={DataModel}
                        main_key={main_key}
                        change_keys={change_keys}
                        filterItem={filterItem}
                        search={search}
                        loading={loading}
                        perPage={5}
                        onChangeBoolValue={this.handleChangeBoolVal}
                        onDeleteItem={this.onDeleteItem}
                        onDeleteBulk={this.onDeleteBulk}
                    />
                </div>
            </div>
        );
    }
}

export default ClubTiers;
