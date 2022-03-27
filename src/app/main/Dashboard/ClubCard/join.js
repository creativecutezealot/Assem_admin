import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import helper from '../../../../services/helper.service';
import adminApi from '../../../../services/admin.service';
import userApi from '../../../../services/user.service';
import session from '../../../../services/session.service';
import './styles.scss';
import development from '../../../../enviroments/development';
import { StreamChat } from 'stream-chat';

const chatClient = StreamChat.getInstance(development.STREAM_API_KEY);

function UserClubCard({ club, joined }) {
    const user = session.get('futureof-user');
    const [inviteCode, setInviteCode] = React.useState('');
    const [isJoined, setIsJoined] = React.useState(joined);
    const [price, setPrice] = React.useState(10);
    const [priceId, setPriceId] = React.useState('');
    const [clubTiers, setClubTiers] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    useEffect(() => {
        console.log(clubTiers, loading);
        setIsJoined(joined);
        getAllClubTiers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [joined]);

    const initChat = async (config) => {
        try {
            const chatUser = {
                id: user.user_id + '-' + club.club_id,
                image: user.photo_url,
                name: user.first_name + ' ' + user.last_name,
            };
            await chatClient.disconnectUser();
            const userToken = chatClient.devToken(chatUser.id);
            console.log('userToken: ', userToken);
            await chatClient.connectUser(chatUser, userToken);
        } catch (error) {
            console.error('Here: ', error);
        }
    };

    const getAllClubTiers = () => {
        adminApi
            .getAllClubTiers()
            .then((response) => {
                if (response.status === true) {
                    const results = response.data;
                    console.log('getAllClubTiers: ', results);
                    setClubTiers(results);
                    const tier = results.find(
                        (item) => item.clubtier_name === club.memebership
                    );
                    setPriceId(tier.price_id);
                    setPrice(tier.price);
                }
            })
            .catch((error) => {
                console.log('err: ', error);
                setLoading(false);
            });
    };

    const connectClub = () => {
        if (club.is_private && !isJoined) {
            if (inviteCode !== club.access_code) {
                helper.showToast('Error', 'Invite Code not valid.', 3);
                return;
            }
        }
        if (isJoined) {
            // helper.showToast('Warning', 'Do you really want to cancel your Membership', 2);
            cancelMembership();
        } else {
            joinClub();
        }
    };

    const joinClub = async () => {
        if (club.memebership === 'General' || club.memebership === 'Group') {
            connectClubRequest();
        } else {
            try {
                const body = {
                    userid: user.user_id,
                    price: priceId,
                };
                const res = await userApi.createSubscribeItem(body);
                if (res.status) {
                    connectClubRequest();
                } else {
                    helper.showToast('Error', res.data, 3);
                }
            } catch (error) {
                helper.showToast('Error', error.message, 3);
            }
        }
    };

    const connectClubRequest = async () => {
        const connectClubRequestRes = await userApi.connectClubRequest({
            club_id: club.club_id,
            isJoined: true,
            userid: user.user_id,
        });
        if (connectClubRequestRes.status) {
            setIsJoined(true);
            initChat();
        } else {
            helper.showToast('Error', connectClubRequestRes.data, 3);
        }
    };

    const cancelMembership = async () => {
        if (club.memebership === 'General' || club.memebership === 'Group') {
            delConnectClubRequest();
        } else {
            try {
                const res = await userApi.cancelSubscribeItem(
                    user.user_id,
                    priceId
                );
                if (res.status) {
                    delConnectClubRequest();
                } else {
                    helper.showToast('Error', 'Member must belong to at least one club. Contact help@assembly.us for assistance.', 3);
                }
            } catch (error) {
                console.log('Error: ', error.message);
                helper.showToast('Error', error.message, 3);
            }
        }
    };

    const delConnectClubRequest = async () => {
        const delConnectClubRequestRes = await userApi.delConnectClubRequest({
            club_id: club.club_id,
            userid: user.user_id,
        });

        if (delConnectClubRequestRes.status) {
            setIsJoined(false);
        } else {
            helper.showToast('Error', delConnectClubRequestRes.data, 3);
        }
    };

    const requestInviteCode = async (e) => {
        console.log(e);
        e.preventDefault();
        try {
            const payload = {
                club_id: club.club_id,
                userid: user.user_id,
            };
            const res = await adminApi.createClubReq(payload);
            if (res.status) {
                helper.showToast(
                    'Success',
                    'Thank you for requesting an invite code for this club. We will be in touch shortly.',
                    1
                );
            } else {
                helper.showToast('Error', res.data, 3);
            }
        } catch (error) {
            helper.showToast('Error', error.message, 3);
        }
    };

    const handleInviteCode = (e) => {
        let target = e.target;
        let name = target.name;
        let value = target.value;
        setInviteCode(value);
        console.log('name, value: ', name, value);
    };

    const onKeyPress = (event) => {
        if (event.charCode === 13) {
            connectClub();
        }
    }

    return (
        <div className="club-card" key={club.club_id}>
            <Col className="justify-content-md-start club-wrapper">
                <div
                    className="club-img"
                >
                    {
                        club?.banner_url && (
                            <img src={club?.banner_url} style={{width: '100%'}}></img>
                        )
                    }
                </div>
                {isJoined && (
                    <Row
                        className="justify-content-center"
                        style={{ backgroundColor: 'gray' }}
                    >
                        YOU ARE A MEMBER
                    </Row>
                )}
                <Row>
                    <Col className="club-container">
                        <div className="club-name">{club?.club_name}</div>
                        <div className="club-bio">{club?.description}</div>
                    </Col>
                    <Col className="club-container">
                        {/* <div className='club-name'>
                            Membership Dues
                        </div>
                        <div className='club-role'>
                            ${club?.memebership}/month
                        </div> */}
                        <div className="club-name">Club Tier</div>
                        <div className="club-role">{club?.memebership}</div>
                        {club.memebership !== 'General' &&
                            club.memebership !== 'Group' && (
                                isJoined ? <div className="mt-4">
                                    You are a memeber of this club and dues are ${price}/month.
                                </div> : <div className="mt-4">
                                    Access to this club is not included in your
                                    current subscription and will incur an
                                    additional monthly charge of ${price}/month.
                                </div>
                            )}
                    </Col>
                </Row>
                <Row
                    className="justify-content-end"
                    style={{ padding: '0px 20px' }}
                >
                    {club.is_private && !isJoined ? (
                        <div className="flex-column">
                            <Row
                                className="justify-content-end mb-2"
                                style={{ padding: '0px 15px' }}
                            >
                                This is a private club that requires an invite
                                code &nbsp;
                                <Link to="#" onClick={requestInviteCode}>
                                    REQUEST INVITE CODE
                                </Link>
                            </Row>
                            <Form.Group as={Row}>
                                <Col sm="6">
                                    <Form.Control
                                        type="text"
                                        placeholder="ENTER INVITE CODE"
                                        onChange={(e) => handleInviteCode(e)}
                                        onKeyPress={onKeyPress}
                                    />
                                </Col>
                                <Col sm="6">
                                    <Button
                                        onClick={connectClub}
                                        className="btn btn-primary"
                                        block
                                    >
                                        JOIN
                                    </Button>
                                </Col>
                            </Form.Group>
                        </div>
                    ) : (
                        <Col sm={{ span: 4, offset: 8 }}>
                            <Button
                                className="btn btn-primary"
                                onClick={connectClub}
                                block
                            >
                                {isJoined ? 'CANCEL MEMBERSHIP' : 'JOIN'}
                            </Button>
                        </Col>
                    )}
                </Row>
            </Col>
        </div>
    );
}
export default UserClubCard;
