import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { Form, Button, Image, Row, Col, Spinner, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import adminApi from '../../../services/admin.service';
import userApi from '../../../services/user.service';
import session from '../../../services/session.service';
import helper from '../../../services/helper.service';
import './subscription.scss';
import development from '../../../enviroments/development';
import { StreamChat } from 'stream-chat';

const chatClient = StreamChat.getInstance(development.STREAM_API_KEY);

const ClubCard = ({ club, joined, clubTiers, onDetail }) => {
    const currentUser = session.get('currentUser');
    const [inviteCode, setInviteCode] = React.useState('');
    const [isJoined, setIsJoined] = React.useState(joined);
    const [priceId, setPriceId] = React.useState();
    const history = useHistory();

    useEffect(() => {
        setPriceId('');
        setIsJoined(joined);
    }, [joined]);

    const connectClub = () => {
        // if (club.is_private && !isJoined) {
        //     if (inviteCode !== club.access_code) {
        //         helper.showToast('Error', 'Invite Code not valid.', 3);
        //         return;
        //     }
        // }
        if (isJoined) {
            cancelMembership();
        } else {
            joinClub();
        }
    };

    const initChat = async () => {
        try {
            const chatUser = {
                id: currentUser.user_id + '-' + club.club_id,
                image: currentUser.photo_url,
                name: currentUser.first_name + ' ' + currentUser.last_name,
            };
            await chatClient.disconnectUser();
            const userToken = chatClient.devToken(chatUser.id);
            console.log('userToken: ', userToken);
            await chatClient.connectUser(chatUser, userToken);
        } catch (error) {
            console.error('Here: ', error);
        }
    };

    const joinClub = async () => {
        const tier = clubTiers.find(
            (item) => item.clubtier_name === club.memebership
        );
        await initChat();
        history.push('/signup/payment', {
            club: club,
            priceId: tier.price_id,
            price: tier.price,
        });
    };

    const cancelMembership = async () => {
        if (club.memebership === 'General' || club.memebership === 'Group') {
            userApi
                .delConnectClubRequest({
                    club_id: club.club_id,
                    userid: currentUser.user_id,
                })
                .then((response) => {
                    if (response.status) {
                        // let results = response.connect;
                        console.log('response: ', response);
                        setIsJoined(false);
                    } else {
                        helper.showToast('Error', response.data, 3);
                    }
                })
                .catch((error) => {
                    console.log('err: ', error);
                    helper.showToast('Error', error, 3);
                });
        } else {
            try {
                const res = await userApi.cancelSubscribeItem(
                    currentUser.user_id,
                    priceId
                );
                if (res.status) {
                    userApi
                        .delConnectClubRequest({
                            club_id: club.club_id,
                            userid: currentUser.use_id,
                        })
                        .then((response) => {
                            if (response.status) {
                                // let results = response.connect;
                                console.log('response: ', response);
                                setIsJoined(false);
                            } else {
                                helper.showToast('Error', response.data, 3);
                            }
                        })
                        .catch((error) => {
                            console.log('Error: ', error.message);
                            helper.showToast('Error', error.message, 3);
                        });
                } else {
                    helper.showToast('Error', res.data, 3);
                }
            } catch (error) {
                console.error('Error: ', error.message);
                // helper.showToast('Error', error.message, 3);
            }
        }
    };

    const requestInviteCode = async (e) => {
        console.log(e);
        e.preventDefault();
        const userid = currentUser.user_id;
        try {
            const payload = {
                club_id: club.club_id,
                userid: userid,
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

    return (
        <div className='club-card pb-4'>
            <Col className='justify-content-md-start club-wrapper'>
                {isJoined && (
                    <Row
                        className='justify-content-center'
                        style={{ backgroundColor: 'gray' }}
                    >
                        YOU ARE A MEMBER
                    </Row>
                )}
                <Row>
                    <Col className='club-container'
                        style={{
                            backgroundImage: `url(${club?.banner_url})`,
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: 'cover',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'column',
                            borderTopLeftRadius: 6,
                            // borderTopRightRadius: 6,
                        }}
                    >
                        <div className='club-name'>#{club?.club_name}</div>
                        {/* <div className='club-bio'>{club?.description}</div> */}
                    </Col>
                    <Col sm={{ span: 3 }} className='d-flex flex-column align-items-center justify-content-center'>
                        <Button
                            className='btn btn-primary register-btn'
                            size='sm'
                            onClick={connectClub}
                            block
                        >
                            {isJoined ? 'CANCEL MEMBERSHIP' : 'JOIN'}
                        </Button>
                        <Button
                            variant='outline-light'
                            className='btn learnmore-btn'
                            size='sm'
                            onClick={() => onDetail(club)}
                            block
                        >
                            LEARN MORE
                        </Button>
                    </Col>
                </Row>
            </Col>
        </div>
    );
};

const Subscription = () => {
    const currentUser = session.get('currentUser');
    const history = useHistory();
    const [clubs, setClubs] = useState([]);
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(false);
    const [clubTiers, setClubTiers] = useState([]);
    const [modalShow, setModalShow] = useState(false);
    const [clubDetail, setClubDetail] = useState();
    const [price, setPrice] = useState(0);
    const code = history.location.state ? history.location.state.code : '';
    useEffect(() => {
        if (!currentUser) {
            history.push('/signup');
            return;
        } else {
            getAllClubs();
            getAllClubTiers();
            getClubsWithUserId();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getAllClubTiers = () => {
        adminApi
            .getAllClubTiers()
            .then((response) => {
                if (response.status === true) {
                    const results = response.data;
                    setClubTiers(results);
                }
            })
            .catch((error) => {
                console.log('err: ', error);
                setLoading(false);
            });
    };

    const initSelected = (data) => {
        var selected = [];
        for (const idx in data) {
            const club = data[idx];
            selected.push(club.club_id);
        }
        setSelected(selected);
    };

    const getJoinItem = (item) => {
        const itemIndex = selected.findIndex((r) => r === item.club_id);
        return itemIndex >= 0;
    };

    const getClubsWithUserId = () => {
        adminApi
            .getClubsWithUserId(currentUser.user_id)
            .then((response) => {
                if (response.status === true) {
                    let results = response.connect;
                    initSelected(results);
                } else {
                    initSelected([]);
                }
            })
            .catch((error) => {
                console.log('err: ', error);
            });
    };

    const getAllClubs = () => {
        setLoading(true);
        adminApi
            .getAllClubs()
            .then((response) => {
                setLoading(false);
                if (response.status === true) {
                    var results = response.data;
                    console.log('results: ', results);
                    let privateClubs = results.filter(club => club.is_private);
                    if (code !== '') {
                        let filteredPrivateClubs = privateClubs.filter(club => club.access_code == code);
                        if (filteredPrivateClubs.length > 0) {
                            setClubs(filteredPrivateClubs);
                        } else {
                            helper.showToast(
                                'Error',
                                'Access code not valid',
                                3
                            );
                        }
                    }
                }
            })
            .catch((error) => {
                console.log('err: ', error);
                setLoading(false);
            });
    };

    // const handleNext = async () => {
    //     history.push('/signup/payment');
    // }

    const goBack = (event) => {
        event.preventDefault();
        history.goBack();
    };

    const onClubDetailPopup = () => {
        if (!clubDetail) {
            return;
        }
        const joined = getJoinItem(clubDetail);
        return (
            <Modal
                show={modalShow}
                size='lg'
                aria-labelledby='contained-modal-title-vcenter'
                centered
                dialogClassName='select-club'
                onHide={() => setModalShow(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title id='contained-modal-title-vcenter'>
                        Club Detail
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col
                            xs={12}
                            md={12}
                            className='my-2'
                            key={clubDetail.club_id}
                        >
                            <Image
                                src={clubDetail.banner_url}
                                fluid
                                style={{ cursor: 'pointer' }}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} md={6} className='club-container text-white my-2'>
                            <div className='club-name'>{clubDetail?.club_name}</div>
                            <div className='club-bio'>{clubDetail?.description}</div>
                        </Col>
                        <Col xs={12} md={6} className='club-container text-white my-2'>
                            <div className='club-name'>Club Tier</div>
                            <div className='club-role'>{clubDetail?.memebership}</div>
                            {clubDetail.memebership !== 'General' &&
                                clubDetail.memebership !== 'Group' && (
                                    joined ? <div className='mt-4'>
                                        You are a memeber of this club and dues are <strong>${price}/month</strong>.
                                    </div> : <div className='mt-4'>
                                        Access to this club is not included in your
                                        current subscription and will incur an
                                        additional monthly charge of <strong>${price}/month</strong>.
                                    </div>
                                )}
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        );
    };

    const onDetail = (club) => {
        console.log(club);
        setModalShow(true);
        setClubDetail(club);
        const tier = clubTiers.find(
            (item) => item.clubtier_name === club.memebership
        );
        setPrice(tier.price);
    }

    return (
        <div className='subscription overflow-hidden'>
            <div className='stepper'>
                <div className='container'>
                    <div className='title'>STEP 7/8</div>
                    <div className='step step1'>
                        <div>
                            <div className='circle'></div>
                        </div>
                    </div>
                    <div className='step step1'>
                        <div>
                            <div className='circle'></div>
                        </div>
                    </div>
                    <div className='step step1'>
                        <div>
                            <div className='circle'></div>
                        </div>
                    </div>
                    <div className='step step2'>
                        <div>
                            <div className='circle'></div>
                        </div>
                    </div>
                    <div className='step step2'>
                        <div>
                            <div className='circle'></div>
                        </div>
                    </div>
                    <div className='step step2'>
                        <div>
                            <div className='circle'></div>
                        </div>
                    </div>
                    <div className='step step-active step2'>
                        <div>
                            <div className='circle'></div>
                        </div>
                    </div>
                    <div className='step step2'>
                        <div>
                            <div className='circle'></div>
                        </div>
                    </div>
                </div>

            </div>
            <Form
                className='signup-form'
                style={{ maxWidth: '800px', width: '800px' }}
            >
                <div className='d-flex align-content-center justify-content-center'>
                    <img
                        className='auth-logo'
                        src={require('../../../assets/logo.svg')}
                        alt=''
                    />
                </div>
                <h5 className='d-flex align-items-center justify-content-center text-center mt-1 mb-2 title'>
                    JOIN CLUBS
                </h5>
                <div
                    className='d-flex align-items-center justify-content-center mt-2 p-2 border border-white rounded'
                    style={{ height: '500px', overflowY: 'auto' }}
                >
                    {loading && (
                        <Row
                            className='justify-content-center align-items-center my-auto'
                            style={{ height: '50px' }}
                        >
                            <Spinner animation='border' />
                        </Row>
                    )}
                    {
                        clubs && clubs.length > 0 && <div
                            style={{
                                display: 'block',
                                width: '100%',
                                height: '100%',
                            }}
                        >
                            {clubs.map((club) => {
                                const joined = getJoinItem(club);
                                return (
                                    <ClubCard
                                        key={club.club_id}
                                        club={club}
                                        joined={joined}
                                        clubTiers={clubTiers}
                                        onDetail={onDetail}
                                    />
                                );
                            })}
                        </div>
                    }
                </div>

                {onClubDetailPopup()}

                {/* <div className='d-flex align-items-center justify-content-center mt-3'>
                    <Button type='button'
                        className='btn btn-primary register-btn'
                        onClick={handleNext} >
                        NEXT
                    </Button>
                </div> */}
                <div className='d-flex align-items-center justify-content-center mt-4 join-now'>
                    <Link to='#' onClick={goBack} className='join-now-link'>
                        <span>{'< '}GO BACK</span>
                    </Link>
                </div>
                {/* <div className='d-flex align-items-center justify-content-center mt-3'>
                    Get the app.
                </div>
                <div className='d-flex align-items-center justify-content-center mt-3'>
                    <Link to='' target='_blank'>
                        <Image
                            src={require('../../../assets/img/appstore.png')}
                            style={{ width: '120px' }}
                        ></Image>
                    </Link>
                </div> */}
            </Form>
            <div className='background-overlay'></div>
            {/* <video className='video' autoPlay loop muted>
                <source src={require('../../../assets/video/background.mp4')} />
            </video> */}
        </div>
    );
};

export default Subscription;
