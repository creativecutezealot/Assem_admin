import React from 'react';
import '../tbl-clubs.scss';

import adminApi from '../../../services/admin.service';

import { user as DataModel } from '../Model';

import Header from '../components/header';
import TableComp from '../components/table';

const model_keys = Object.keys(DataModel);
const filter_keys = model_keys.filter(
    (r) => DataModel[r] === 'String' && !`${r}`.includes('_url')
);
const main_key = 'user_id';
class ConnectAssembles extends React.Component {
    constructor(props) {
        super();
        this.state = {
            data_list: [],
            loading: true,
            search: '',
            filterItem: filter_keys[0],
            sorted: {},
            assembleId: '',
        };
    }

    componentDidMount() {
        const assembleId = this.props.id;
        if (assembleId && assembleId !== '') {
            this.setState({
                assembleId,
            });
            adminApi
                .getUsersWithAssembleId(assembleId)
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
        const { search, filterItem, data_list, loading, assembleId } =
            this.state;
        return (
            <div className="tbl-clus">
                <div className="content">
                    <Header
                        title={`Connected users with ${assembleId}`}
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
                        deleting={false}
                        onDeleteItem={this.onDeleteItem}
                    />
                </div>
            </div>
        );
    }
}

export default ConnectAssembles;
