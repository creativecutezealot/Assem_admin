import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Row, Col } from 'react-bootstrap';
import adminApi from '../../../../services/admin.service';
import session from '../../../../services/session.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import './styles.scss';
const placeHolderPng = require('../../../../assets/avatar/admin.jpg');

function ProfileCard() {
    const currentUser = session.get('futureof-user');

    const history = useHistory();

    const [customer, setCustomer] = useState(null);
    const [likeGains, setLikeGains] = useState();

    useEffect(() => {
        getCustomer();
        if (currentUser.user_role === 'manager') {
            const club = session.get('futureof-club');
            getAllAudios(club);
        } else if (currentUser.user_role === 'user' || currentUser.user_role === '') {
            const club = session.get('audio-club');
            getAllAudios(club);
        }
    }, []);

    const getCustomer = async () => {
        try {
            const res = await adminApi.getCustomer(currentUser.user_id);
            if (res.status) {
                setCustomer(res.data);
            }
        } catch (error) { }
    };

    const getAllAudios = async (club) => {
        try {
            const getDataRes = await adminApi
                .getDataWithClubId(club.club_id);
            if (getDataRes.status) {
                let results = getDataRes.data;
                console.log('results: ', results);
                let data_list = results.filter(
                    (a) => a.audio_id && a.audio_id !== '' && a.host_id === currentUser.user_id
                );
                const likes = data_list.map(data => data.likes_gained).reduce((partialSum, a) => partialSum + a, 0);
                console.log('likes: ', likes);
                setLikeGains(likes);
            }
        } catch (error) {
            console.log('err: ', error);
        }
    };

    return (
        <div className="profile-card">
            <Row className="justify-content-md-start">
                <h5>PROFILE</h5>
            </Row>
            <Row className="justify-content-md-start profile-wrapper">
                <img
                    className="profile-img"
                    src={
                        currentUser?.photo_url !== ''
                            ? currentUser?.photo_url
                            : placeHolderPng
                    }
                    alt="profile"
                />
                <Col
                    style={{
                        paddingLeft: 30,
                        paddingTop: 20,
                        paddingBottom: 50,
                    }}
                >
                    <div className="profile-name">
                        {currentUser?.first_name} {currentUser?.last_name}
                    </div>
                    <div className="profile-role">
                        {currentUser?.job} {currentUser?.company}
                    </div>
                    <div className="profile-bio">{currentUser?.short_bio}</div>
                    <div className='mt-3'>
                        <FontAwesomeIcon icon={faThumbsUp} /><span className='ml-2 font-weight-bold'>{likeGains} likes for audios you have submitted</span>
                    </div>
                    <Row className="justify-content-end profile-btn">

                        {currentUser?.user_role !== 'admin' &&
                            currentUser?.user_role !== 'manager' && (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    style={{ marginRight: 16 }}
                                    onClick={() => {
                                        history.push('/currentUser/payment');
                                    }}
                                >
                                    {customer
                                        ? 'UPDATE PAYMENT INFO'
                                        : 'ADD PAYMENT INFO'}
                                </Button>
                            )}

                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                                if (currentUser.user_role === 'admin') {
                                    history.push('/admin/profile');
                                } else if (currentUser.user_role === 'manager') {
                                    history.push('/manager/profile');
                                } else {
                                    history.push('/currentUser/profile');
                                }
                            }}
                        >
                            EDIT PROFILE
                        </Button>
                    </Row>
                </Col>
            </Row>
        </div>
    );
}

export default ProfileCard;
