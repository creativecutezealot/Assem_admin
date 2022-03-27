import React from 'react';
import '../tbl-clubs.scss';

import adminApi from '../../../services/admin.service';

import { user as UserDataModel } from '../Model';

import Header from '../components/header';
import TableComp from '../components/table';

const model_keys = Object.keys(UserDataModel);
const filter_keys = model_keys.filter(
    (r) => UserDataModel[r] === 'String' && !`${r}`.includes('_url')
);
const main_key = 'user_id';
class ConnectUsers extends React.Component {
    constructor(props) {
        super();
        this.state = {
            data_list: [],
            loading: true,
            search: '',
            filterItem: filter_keys[0],
            sorted: {},
            userId: '',
        };
    }

    componentDidMount() {
        const userId = this.props.id;
        if (userId && userId !== '') {
            this.setState({
                userId,
            });
            adminApi
                .getUsersWithOppositeId(userId)
                .then((response) => {
                    if (response.status === true) {
                        var results = response.connect;
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
        }
    }

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

    onDeleteItem = (del_id) => {};

    render() {
        const { search, filterItem, data_list, loading, userId } = this.state;
        return (
            <div className="tbl-clus">
                <div className="content">
                    <Header
                        title={`Connected users with ${userId}`}
                        filterItem={filterItem}
                        filter_keys={filter_keys}
                        handleChangeFilter={this.handleChangeFilter}
                        handleChangeSearch={this.handleChangeSearch}
                    />
                    <TableComp
                        data_list={data_list}
                        dataModel={UserDataModel}
                        filterItem={filterItem}
                        search={search}
                        loading={loading}
                        main_key={main_key}
                        deleting={false}
                        perPage={5}
                        onDeleteItem={this.onDeleteItem}
                    />
                </div>
            </div>
        );
    }
}

export default ConnectUsers;
