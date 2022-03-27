import React from 'react';
import { Button, Row, Col, Form } from 'react-bootstrap';
import useClipboard from 'react-use-clipboard';

import './styles.scss';

import adminApi from '../../../services/admin.service';
import session from '../../../services/session.service';
import helper from '../../../services/helper.service';
import Content from '../../../components/content';
import TableComp from '../../database/components/table';

const activeMemberModel = {
    Email: 'String',
    FirstName: 'String',
    LastName: 'String',
    Phone: 'String',
    Photo: 'String',
    ShortBio: 'String',
    Country: 'String',
    City: 'String',
    State: 'String',
    Address: 'String',
    UserRole: 'String',
    Job: 'String',
    Company: 'String',
};

const memberShipModel = {
    FirstName: 'String',
    LastName: 'String',
    Email: 'String',
    Phone: 'String',
    Photo: 'String',
    Approved: 'Boolean',
    AccessCode: 'String',
};

const change_keys = ['Approved'];

const nomalizeMember = (user) => {
    return {
        ID: user.user_id,
        Email: user.email,
        FirstName: user.first_name,
        LastName: user.last_name,
        Phone: user.phone_number,
        Photo: user.photo_url,
        ShortBio: user.short_bio,
        Country: user.country,
        City: user.city,
        State: user.location_state,
        Address: user.address,
        UserRole: user.user_role === '' ? 'user' : user.user_role,
        Job: user.job,
        Company: user.company,
    };
};
const normalizeKey = (obj) => {
    return `${obj.club_id}#${obj.user_id}`;
};

const normalizeClubId = (key) => {
    return `${key}`.split('#');
};
const nomalizeRequest = (request) => {
    return {
        ID: normalizeKey(request),
        FirstName: request.first_name,
        LastName: request.last_name,
        Email: request.email,
        Phone: request.phone_number,
        Photo: request.photo_url,
        Approved: request.is_approved,
        AccessCode: request.access_code,
    };
};

const ClipboardButton = ({ content }) => {
    const [isCopied, setCopied] = useClipboard(content);
    return (
        <Button
            style={{ width: '20%', marginTop: 30 }}
            variant={'primary'}
            type={'button'}
            className="btn mt-5"
            onClick={setCopied}
        >
            {isCopied ? 'COPIED TO CLIPBOARD' : 'COPY TO CLIPBOARD'}
        </Button>
    );
};

class Members extends React.Component {
    constructor(props) {
        super();
        const club = session.get('futureof-club');
        this.state = {
            active_members: [],
            memberships: [],
            tabNum: 0,
            search: '',
            club,
            filterItem: 'Email',
            loading: false,
        };
    }

    componentDidMount() {
        const club = session.get('futureof-club');
        this.setState({
            loading: true,
        });
        this.getActiveMembers(club.club_id);
        this.getMemberShips(club.club_id);
    }

    getActiveMembers = async (club_id) => {
        adminApi
            .getUsersWithClubId(club_id)
            .then((response) => {
                if (response.status === true) {
                    var results = response.connect;
                    console.log(results);
                    this.setState({
                        active_members: results,
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

    getMemberShips = async (club_id) => {
        adminApi
            .getClubReqsByClubId(club_id)
            .then((response) => {
                if (response.status === true) {
                    var results = response.data;
                    console.log(results);
                    this.setState({
                        memberships: results.filter((a) => !a.is_approved),
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

    handleSwitchTabs = (tabNum) => {
        this.setState({
            tabNum,
            filterItem: tabNum === 0 ? 'Email' : 'FirstName',
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
        const main_id = event.target.id;
        if (main_id === '') {
            return;
        }
        const is_approved = event.target.checked;

        const obj = {
            club_id: normalizeClubId(main_id)[0],
            user_id: normalizeClubId(main_id)[1],
            is_approved,
        };
        console.log('change val', obj, main_id, is_approved);
        this.updateDataList(main_id, is_approved);
        adminApi
            .updateClubReq(obj)
            .then((response) => {
                if (!response.status) {
                    this.updateDataList(main_id, !is_approved);
                }
            })
            .catch((error) => {
                console.log('err: ', error);
                this.setState({
                    loading: false,
                });
                this.updateDataList(main_id, !is_approved);
            });
    };

    updateDataList = (main_id, value) => {
        const { memberships } = this.state;
        const find_index = memberships.findIndex(
            (r) => normalizeKey(r) === main_id
        );
        if (find_index !== -1) {
            memberships[find_index].is_approved = value;
            this.setState({ memberships });
        }
    };

    render() {
        const {
            active_members,
            memberships,
            loading,
            filterItem,
            search,
            tabNum,
            club,
        } = this.state;

        let dataList = [];
        let dataModel = [];
        let filter_keys = [];

        if (tabNum === 0) {
            dataList = active_members
                .filter((b) => b.user_id)
                .map((a) => nomalizeMember(a));
            dataModel = activeMemberModel;
            filter_keys = Object.keys(activeMemberModel).filter(
                (r) =>
                    activeMemberModel[r] === 'String' &&
                    !`${r}`.includes('_url')
            );
        } else if (tabNum === 1) {
            dataList = memberships.map((a) => nomalizeRequest(a));
            dataModel = memberShipModel;
            filter_keys = Object.keys(memberShipModel).filter(
                (r) =>
                    memberShipModel[r] === 'String' && !`${r}`.includes('_url')
            );
        }

        let label = 'ACTIVE MEMBERS';

        if (tabNum === 0) {
            label = 'ACTIVE MEMBERS';
        } else if (tabNum === 1) {
            label = 'MEMBERSHIP REQUESTS';
        } else if (tabNum === 2) {
            label = 'INVITE NEW MEMBERS';
        }

        const inviewNewContent = `
            ${helper.getDisplayName(
                club.club_name,
                '#'
            )} would like to invite your to join! \n\n
            ${club.description} \n\n
            To sign up download TestFlight and then FutureOf.\n\n
            When you get to the Club Selection screen during sign up,\n
            choose ${helper.getDisplayName(
                club.club_name,
                '#'
            )} and your access code is: ${club.access_code}
        `;

        return (
            <Content>
                <div className="members-list">
                    <Row className="justify-content-start">
                        <h4>MEMBERS</h4>
                    </Row>
                    <div className="members-list-container">
                        <Col>
                            <Row className="justify-content-start">
                                <h5>
                                    {
                                        active_members.filter((b) => b.user_id)
                                            .length
                                    }{' '}
                                    ACTIVE MEMBERS
                                </h5>
                            </Row>
                            <Row className="justify-content-start">
                                <h5>
                                    {memberships.length} MEMBERSHIP REQUESTS
                                </h5>
                            </Row>
                        </Col>

                        <Row className="justify-content-space-between align-items-center members-list-create-section">
                            <Col
                                md="auto"
                                className={`btn-section create ${
                                    tabNum === 0 ? 'selected' : 'deselected'
                                }`}
                                onClick={() => {
                                    this.handleSwitchTabs(0);
                                }}
                            >
                                ACTIVE MEMBERS
                            </Col>
                            <Col
                                md="auto"
                                className={`btn-section create ${
                                    tabNum === 1 ? 'selected' : 'deselected'
                                }`}
                                onClick={() => {
                                    this.handleSwitchTabs(1);
                                }}
                            >
                                MEMBERSHIP REQUESTS
                            </Col>
                            {/* <Col md="auto"
                                className={`btn-section create ${tabNum == 2 ? 'selected' : 'deselected'}`}
                                onClick={() => {
                                    this.handleSwitchTabs(2)
                                }}>
                                INVITE NEW MEMBERS
                            </Col> */}
                        </Row>

                        <Row
                            style={{ marginTop: 60 }}
                            className="justify-content-start align-items-center"
                        >
                            <h5>{label}</h5>
                            {tabNum !== 2 && (
                                <Col
                                    md="auto"
                                    style={{ width: '30%', marginLeft: '5%' }}
                                >
                                    <Form.Control
                                        className="form-control"
                                        onChange={this.handleChangeSearch}
                                        placeholder={`Search with ${
                                            filterItem || filter_keys[0]
                                        }`}
                                    />
                                </Col>
                            )}
                            {tabNum !== 2 && (
                                <Col md="auto" style={{ width: '20%' }}>
                                    <Form.Control
                                        as="select"
                                        onChange={this.handleChangeFilter}
                                    >
                                        {filter_keys.map((k, index) => (
                                            <option key={index}>{k}</option>
                                        ))}
                                    </Form.Control>
                                </Col>
                            )}
                        </Row>
                        <div style={{ marginTop: 40 }}>
                            {tabNum !== 2 ? (
                                <TableComp
                                    data_list={dataList}
                                    dataModel={dataModel}
                                    main_key={'ID'}
                                    change_keys={change_keys}
                                    filterItem={filterItem}
                                    search={search}
                                    loading={loading}
                                    perPage={5}
                                    hover={false}
                                    deleting={false}
                                    onChangeBoolValue={
                                        tabNum === 1
                                            ? this.handleChangeBoolVal
                                            : null
                                    }
                                />
                            ) : (
                                <div className="invite-msg-form">
                                    <span style={{ maxWidth: '40%' }}>
                                        {`${helper.getDisplayName(
                                            club.club_name,
                                            '#'
                                        )} would like to invite your to join!`}
                                    </span>
                                    <span
                                        style={{
                                            maxWidth: '40%',
                                            marginTop: 16,
                                        }}
                                    >
                                        {`${club.description}`}
                                    </span>
                                    <span
                                        style={{
                                            maxWidth: '40%',
                                            marginTop: 16,
                                        }}
                                    >
                                        {
                                            'To sign up download TestFlight and then FutureOf.'
                                        }
                                    </span>
                                    <span
                                        style={{
                                            maxWidth: '40%',
                                            marginTop: 16,
                                        }}
                                    >
                                        {`When you get to the Club Selection screen during sign up,\n
                                            choose ${helper.getDisplayName(
                                                club.club_name,
                                                '#'
                                            )} and your access code is: ${
                                            club.access_code
                                        }`}
                                    </span>
                                    <ClipboardButton
                                        content={inviewNewContent}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Content>
        );
    }
}

export default Members;
