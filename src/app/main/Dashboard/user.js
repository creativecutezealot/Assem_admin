import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Button, Row, Col, Card, Image, Spinner, Modal } from 'react-bootstrap';
import adminApi from '../../../services/admin.service';
import userApi from '../../../services/user.service';
import session from '../../../services/session.service';
import './styles.scss';

import Content from '../../../components/content';
import ProfileCard from './ProfileCard';

function Dashboard(props) {
    const user = session.get('futureof-user');
    const history = useHistory();
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalShow, setModalShow] = useState(false);

    window.onload = function () {
        getUser();
    };

    useEffect(() => {
        getAllClubs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getUser = async () => {
        try {
            const getUserRes = await userApi.getUser(user.user_id);
            if (getUserRes.status) {
                const results = getUserRes.data;
                console.log('results: ', results);
                session.set('futureof-user', results);
                if (results.phone_number === '') {
                    setModalShow(true);
                }
            } else {
                console.log('error: ', getUserRes.data);
            }
        } catch (error) {
            console.error('getUser: ', error);
        }
    };

    const getAllClubs = async () => {
        try {
            setLoading(true);
            const getClubsRes = await adminApi.getClubsWithUserId(user.user_id);
            if (getClubsRes.status) {
                const results = getClubsRes.connect;
                console.log('getClubsWithUserId results: ', results);
                setClubs(results);
                setLoading(false);
            } else {
                setLoading(false);
                console.log('error: ', getClubsRes.data);
            }
        } catch (error) {
            console.log('error: ', error);
            setLoading(false);
        }
    };

    const joinClub = () => {
        history.push('/user/joinclub');
    };

    const renderClubBanners = (club) => {
        return (
            <div
                onClick={() => {
                    history.push('/user/clubs');
                }}
                key={club.club_id}
                className='club-card'
            >
                <Col className='justify-content-md-start'>
                    <div
                        className='club-img'
                    >
                        {
                            club?.banner_url && (
                                <img src={club.banner_url} style={{ width: '100%' }}></img>
                            )
                        }
                    </div>
                </Col>
            </div>
        );
    };

    const noClubBanner = () => {
        return (
            <Card
                className='mt-2 text-center border-0 rounded'
                style={{ cursor: 'pointer' }}
                onClick={joinClub}
            >
                <Image
                    src={require('../../../assets/img/banner-join-clubs.jpg')}
                />
            </Card>
        );
    };

    const spinner = () => {
        return (
            <Row
                className='justify-content-center align-items-center my-auto'
                style={{ height: '50px' }}
            >
                <Spinner animation='border' />
            </Row>
        );
    };

    const Popup = () => {
        return (
            <Modal
                show={modalShow}
                size='md'
                aria-labelledby='contained-modal-title-vcenter'
                centered
                dialogClassName='popup'
            >
                <Modal.Body>
                    <Row className='text-center my-3 mx-3'>
                        <h5>
                            Thank you for joining Assembly. You can enter and
                            participate in your club(s) on the mobile app.
                        </h5>
                    </Row>

                    <Row className='text-center my-3 mx-3'>
                        <h5>
                            Please download the app and login now from the Apple
                            App Store.
                        </h5>
                    </Row>

                    <Row className='align-items-center justify-content-center my-3'>
                        <Link to='' target='_blank'>
                            <Image
                                src={require('../../../assets/img/appstore.png')}
                                style={{ width: '120px' }}
                            ></Image>
                        </Link>
                    </Row>

                    <Row className='align-items-center justify-content-center my-3'>
                        <Button
                            type='button'
                            className='btn btn-primary login-btn'
                            onClick={() => setModalShow(false)}
                        >
                            OK
                        </Button>
                    </Row>
                </Modal.Body>
            </Modal>
        );
    };

    return (
        <Content>
            <Row className='justify-content-md-start'>
                <h4>MEMBER DASHBOARD</h4>
            </Row>
            <ProfileCard />
            <Row
                className='justify-content-md-start'
                style={{ paddingLeft: 15 }}
            >
                {/* <h5>@{user.username}'s Clubs</h5> */}
            </Row>
            {Popup()}
            {/* {loading
                ? spinner()
                : clubs.length > 0
                ? clubs.map((club) => renderClubBanners(club))
                : noClubBanner()} */}
        </Content>
    );
}

export default Dashboard;
