import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { Form, Button, Image, Row, Col, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import session from '../../../services/session.service';
import './selectclubs.scss';

const ClubCard = ({ club, loginRes }) => {
    const history = useHistory();
    console.log('club: ', club);

    const joinClub = async () => {
        if (!loginRes) {
            return;
        }
        session.set('futureof-user', loginRes);
        if (loginRes.user_role === 'manager') {
            session.set('futureof-club', club);
            window.location.href = '/manager';
        } else if (loginRes.user_role === '' || loginRes.user_role === 'user') {
            session.set('audio-club', club);
            window.location.href = '/user';
        }
    };

    return (
        <div className='club-card pb-4'>
            <Col className='justify-content-md-start club-wrapper'>
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
                    </Col>
                    <Col sm={{ span: 3 }} className='d-flex align-items-center justify-content-center'>
                        <Button
                            className='btn btn-primary join'
                            size="sm"
                            onClick={joinClub}
                            block
                        >
                            JOIN
                        </Button>
                    </Col>
                </Row>
            </Col>
        </div>
    );
};

const SelectClubs = () => {
    const history = useHistory();
    const loginRes = history.location.state ? history.location.state.loginRes : {};
    const clubs = history.location.state ? history.location.state.clubs : [];

    const goBack = (event) => {
        event.preventDefault();
        history.goBack();
    };

    return (
        <div className='select-clubs overflow-hidden'>
            <div className='d-flex align-content-center justify-content-start logo'>
                <img
                    className='auth-logo'
                    src={require('../../../assets/logo.svg')}
                    alt=''
                />
            </div>
            <div className='d-flex align-content-center justify-content-center'>
                <Form
                    className='signup-form'
                    style={{ maxWidth: '800px', width: '800px' }}
                >

                    <h5 className='d-flex align-items-center justify-content-center text-center mt-2 mb-4 title'>
                        SELECT A CLUB
                    </h5>
                    <div
                        className='d-flex align-items-center justify-content-center mt-2 p-2 border border-white rounded'
                        style={{ height: '500px', overflowY: 'auto' }}
                    >
                        {
                            clubs && clubs.length > 0 && <div
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    height: '100%',
                                }}
                            >
                                {clubs.map((club) => {
                                    return (
                                        <ClubCard
                                            key={club.club_id}
                                            club={club}
                                            loginRes={loginRes}
                                        />
                                    );
                                })}
                            </div>
                        }
                    </div>

                    <div className='d-flex align-items-center justify-content-center mt-4 join-now'>
                        <Link to='#' onClick={goBack} className='join-now-link'>
                            <span>{'<'}Go Back</span>
                        </Link>
                    </div>
                </Form>
            </div>

            <div className='background-overlay'></div>
            {/* <video className='video' autoPlay loop muted>
                <source src={require('../../../assets/video/background.mp4')} />
            </video> */}
        </div>
    );
};

export default SelectClubs;