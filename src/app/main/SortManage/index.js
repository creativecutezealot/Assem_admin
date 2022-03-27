import React from 'react';
import { Row, Col, Tabs, Tab } from 'react-bootstrap';
import './styles.scss';

import adminApi from '../../../services/admin.service';
import session from '../../../services/session.service';

import Carousel from '../components/Carousel/index_sort';
import Content from '../../../components/content';

const R = require('ramda');

class SortManager extends React.Component {
    constructor(props) {
        super();
        this.state = {
            data_list: [],
            loading: false,
            deleting: false,
            sorted: false,
            reordered: false,
            reordring: false,
            activeKey: 'assembly',
        };
    }

    componentDidMount() {
        this.getDataList();
    }

    getClubId = () => {
        const club = session.get('futureof-club');
        return club.club_id;
    };

    getDataList = () => {
        this.setState({
            loading: true,
        });
        adminApi
            .getDataWithClubId(this.getClubId())
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

    getPinnedCount = (data = []) => {
        const pinnedcount = data.filter((a) => a.is_pinned);
        return pinnedcount.length || 0;
    };

    handlePinnedReorder = async (item, is_pinned) => {
        this.setState({
            reordered: true,
        });
        const data_list = R.clone(this.state.data_list);
        let currentIdx;
        // let curPinCount = this.getPinnedCount(data_list);
        if (item.audio_id) {
            currentIdx = data_list.findIndex(
                (a) => a.audio_id === item.audio_id
            );
        } else if (item.assemble_id) {
            currentIdx = data_list.findIndex(
                (a) => a.assemble_id === item.assemble_id
            );
        }
        if (currentIdx > -1) {
            const currentItem = data_list[currentIdx];
            currentItem.is_pinned = is_pinned;
            currentItem.pinned_at = new Date().toISOString();
            data_list[currentIdx] = currentItem;
        }

        this.setState({ data_list });
    };

    handleSaveReorder = () => {
        if (this.state.data_list.length > 0) {
            this.setState({
                reordring: true,
            });
            const club_id = this.getClubId();
            const audios = this.state.data_list
                .filter((item) => item.audio_id && item.audio_id !== '')
                .map((audio) => {
                    return {
                        audio_id: audio.audio_id,
                        pinned_at: audio.pinned_at
                            ? audio.pinned_at
                            : new Date().toISOString(),
                        is_pinned: audio.is_pinned ? audio.is_pinned : false,
                    };
                });
            console.log({ audios });
            adminApi
                .updateAudioOrder({ audios, club_id })
                .then((response) => {
                    console.log('reordering responese', response);
                    this.setState({ reordered: false, reordring: false });
                })
                .catch((error) => {
                    this.setState({ reordered: true, reordring: false });
                });

            const assembles = this.state.data_list
                .filter((item) => item.assemble_id && item.assemble_id !== '')
                .map((assemble) => {
                    return {
                        assemble_id: assemble.assemble_id,
                        pinned_at: assemble.pinned_at
                            ? assemble.pinned_at
                            : new Date().toISOString(),
                        is_pinned: assemble.is_pinned
                            ? assemble.is_pinned
                            : false,
                    };
                });
            console.log({ assembles });
            adminApi
                .updateAssembleOrder({ assembles, club_id })
                .then((response) => {
                    console.log('reordering responese', response);
                    this.setState({ reordered: false, reordring: false });
                })
                .catch((error) => {
                    this.setState({ reordered: true, reordring: false });
                });
        }
    };

    sortData = (data = []) => {
        const { activeKey } = this.state;
        var activeData = [];
        if (activeKey === 'assembly') {
            activeData = data.filter(
                (a) => a.assemble_id && a.assemble_id !== ''
            );
        } else {
            activeData = data.filter((a) => a.audio_id && a.audio_id !== '');
        }
        var pinnedData = activeData.filter((a) => a.is_pinned);
        pinnedData = pinnedData.sort((a, b) => {
            return (
                new Date(b.pinned_at).getTime() -
                new Date(a.pinned_at).getTime()
            );
        });
        var unPinnedData = activeData.filter((a) => !a.is_pinned);
        unPinnedData = unPinnedData.sort((a, b) => {
            return (
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            );
        });
        return [...pinnedData, ...unPinnedData];
    };

    handleChangeTab = (key) => {
        this.setState({
            activeKey: key,
        });
    };

    render() {
        const { data_list, loading, reordered, reordring } = this.state;
        const club = session.get('futureof-club');
        return (
            <Content>
                <div className="sort-order-list">
                    <Row className="justify-content-start">
                        <h4>ORDER</h4>
                    </Row>
                    <div className="sort-order-container">
                        <Row className="justify-content-space-between align-items-center sort-order-create-section">
                            <Col
                                md="auto"
                                className="btn-section create"
                                onClick={
                                    reordered
                                        ? this.handleSaveReorder
                                        : () => {}
                                }
                            >
                                {reordring ? 'UPDATING...' : 'SAVE'}
                            </Col>
                        </Row>
                        <Row className="justify-content-start">
                            <h5>CHANGE ORDER</h5>
                        </Row>
                        <div className="order-tab">
                            <Tabs
                                activeKey={this.state.activeKey}
                                onSelect={(k) => this.handleChangeTab(k)}
                            >
                                <Tab eventKey="assembly" title="ROOM">
                                    <div style={{ paddingTop: 16 }}>
                                        <Carousel
                                            club_data={club}
                                            data={this.sortData(data_list)}
                                            loading={loading}
                                            handlePinnedReorder={
                                                this.handlePinnedReorder
                                            }
                                        />
                                    </div>
                                </Tab>
                                <Tab eventKey="audio" title="AUDIO">
                                    <div style={{ paddingTop: 16 }}>
                                        <Carousel
                                            club_data={club}
                                            data={this.sortData(data_list)}
                                            loading={loading}
                                            handlePinnedReorder={
                                                this.handlePinnedReorder
                                            }
                                        />
                                    </div>
                                </Tab>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </Content>
        );
    }
}

export default SortManager;
