import React from 'react';
import '../tbl-clubs.scss';

import adminApi from '../../../services/admin.service';

import { acode as DataModel } from '../Model';

import Header from '../components/header';
import TableComp from '../components/table';

const model_keys = Object.keys(DataModel);
const filter_keys = model_keys.filter(
    (r) => DataModel[r] === 'String' && !`${r}`.includes('_url')
);

class ACode extends React.Component {
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
        adminApi
            .getAllAcodes()
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

    render() {
        const { search, filterItem, data_list, loading } = this.state;
        return (
            <div className="tbl-clus">
                <div className="content">
                    <Header
                        title="Active Code"
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
                    />
                </div>
            </div>
        );
    }
}

export default ACode;
