import React, { useEffect, useState } from 'react';
import session from '../../../services/session.service';
import Content from '../../../components/content';
import { Row, Spinner } from 'react-bootstrap';
import adminApi from '../../../services/admin.service';
import UserClubCard from './ClubCard/join';

const JoinClub = () => {
    const user = session.get('futureof-user');
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
                    console.log('results: ', results);
                    setClubs(results);
                }
            })
            .catch((error) => {
                console.log('err: ', error);
                setLoading(false);
            });
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
                <h4>JOIN CLUBS</h4>
            </Row>
            {loading
                ? spinner()
                : clubs.map((club) => {
                      const joined = getJoinItem(club);
                      return (
                          !joined && (
                              <UserClubCard
                                  key={club.club_id}
                                  club={club}
                                  joined={joined}
                              />
                          )
                      );
                  })}
        </Content>
    );
};

export default JoinClub;
