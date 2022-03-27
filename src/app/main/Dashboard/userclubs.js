import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Row, Card, Image, Spinner } from 'react-bootstrap';
import adminApi from '../../../services/admin.service';
import session from '../../../services/session.service';
import './styles.scss';

import Content from '../../../components/content';
import UserClubCard from './ClubCard/join';

function UserClubs() {
    const user = session.get('futureof-user');
    const history = useHistory();
    const [clubs, setClubs] = useState([]);
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getAllClubs();
        getClubsWithUserId();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            .getClubsWithUserId(user.user_id)
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
                    setClubs(results);
                    setLoading(false);
                }
            })
            .catch((error) => {
                console.log('err: ', error);
                setLoading(false);
            });
    };

    const joinClub = () => {
        console.log('joinClub: ');
        history.push('/user/joinclub');
    };

    // const renderClubBanners = (club) => {
    //     return (
    //         <div
    //             onClick={() => {
    //                 history.push('/user/clubs')
    //             }}
    //             key={club.club_id}
    //             className='club-card'>
    //             <Col className='justify-content-md-start'>
    //                 <div className='club-img'
    //                     style={{
    //                         backgroundImage: `url(${club?.banner_url})`,
    //                         backgroundPosition: 'center',
    //                         backgroundRepeat: 'no-repeat',
    //                         backgroundSize: 'cover',
    //                         display: 'flex',
    //                         justifyContent: 'center',
    //                         alignItems: 'center',
    //                         flexDirection: 'column',
    //                         borderRadius: 6,
    //                         cursor: 'pointer'
    //                     }}>
    //                 </div>
    //             </Col>
    //         </div>
    //     )
    // }

    const renderClubs = (clubs) => {
        const joinedClubs = clubs.filter((club) => getJoinItem(club));
        return joinedClubs.length > 0
            ? joinedClubs.map((club) => (
                  <UserClubCard
                      key={club.club_id}
                      club={club}
                      joined={getJoinItem(club)}
                  />
              ))
            : noClubBanner();
    };

    const noClubBanner = () => {
        return (
            <Card
                className="mt-2 text-center border-0 rounded"
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
                className="justify-content-center align-items-center my-auto"
                style={{ height: '50px' }}
            >
                <Spinner animation="border" />
            </Row>
        );
    };

    return (
        <Content>
            <Row className="justify-content-md-start">
                <h4>MY CLUBS</h4>
            </Row>
            {loading
                ? spinner()
                : clubs.length > 0
                ? renderClubs(clubs)
                : noClubBanner()}
        </Content>
    );
}

export default UserClubs;
