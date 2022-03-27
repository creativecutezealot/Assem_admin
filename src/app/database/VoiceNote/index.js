import React from 'react';
import '../tbl-clubs.scss';

import adminApi from '../../../services/admin.service';
import helper from '../../../services/helper.service';

import { voice_note as DataModel } from '../Model';

import Header from '../components/header';
import TableComp from '../components/table';

const model_keys = Object.keys(DataModel);
const filter_keys = model_keys.filter(
    (r) => DataModel[r] === 'String' && !`${r}`.includes('_url')
);
const main_key = 'main_id';
class VoiceNote extends React.Component {
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
        this.getVoiceNotes();
    }

    getVoiceNotes = () => {
        adminApi
            .getVoiceNotes()
            .then((response) => {
                if (response.status === true) {
                    var results = response.data;
                    this.setState({
                        data_list: this.normalizeData(results),
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
        return `${obj.receiver_id}#${obj.voicenote_id}`;
    };

    normalizeId = (key) => {
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

    onDeleteItem = (del_id) => {
        console.log(del_id);
        if (del_id) {
            const receiver_id = this.normalizeId(del_id)[0];
            const voicenote_id = this.normalizeId(del_id)[1];
            console.log(receiver_id, voicenote_id);
            adminApi
                .deleteVoiceNote(receiver_id, voicenote_id)
                .then((response) => {
                    if (response.status === true) {
                        this.setState({
                            data_list: this.state.data_list.filter(
                                (data) => data.main_id !== del_id
                            ),
                        });
                        helper.showToast(
                            'Success',
                            'VoiceNote deleted successfully',
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
                            'There was an error while deleting the VoiceNote.',
                        3
                    );
                });
        }
    };

    onDeleteBulk = async (delIds: [String], callBack = () => {}) => {
        const promiseList = [];
        for (const del_id of delIds) {
            const receiver_id = this.normalizeId(del_id)[0];
            const voicenote_id = this.normalizeId(del_id)[1];
            console.log(receiver_id, voicenote_id);
            promiseList.push(
                adminApi.deleteVoiceNote(receiver_id, voicenote_id)
            );
        }
        await Promise.all(promiseList);
        this.getVoiceNotes();
        callBack();
    };

    render() {
        const { search, filterItem, data_list, loading } = this.state;
        return (
            <div className="tbl-clus">
                <div className="content">
                    <Header
                        title="VoiceNotes"
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

export default VoiceNote;
