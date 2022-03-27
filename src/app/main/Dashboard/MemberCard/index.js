import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Row, Col } from 'react-bootstrap';
import adminApi from '../../../../services/admin.service';
import session from '../../../../services/session.service';
import './styles.scss';
const member_bg = require('../../../../assets/img/member-bg.png');
const member_icon = require('../../../../assets/img/member.png');

function MemberShipCard() {
    // const user = session.get('futureof-user');
    const club = session.get('futureof-club');

    const history = useHistory();

    const [activeMembers, setActiveMembers] = useState([]);
    const [memberships, setMemberships] = useState([]);

    useEffect(() => {
        getActiveMembers(club.club_id);
        getMemberShips(club.club_id);
        getThisMonthMembers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getActiveMembers = async (club_id) => {
        adminApi
            .getUsersWithClubId(club_id)
            .then((response) => {
                if (response.status === true) {
                    const results = response.connect;
                    setActiveMembers(results.filter((b) => b.user_id));
                }
            })
            .catch((error) => {
                console.log('err: ', error);
            });
    };

    const getMemberShips = async (club_id) => {
        adminApi
            .getClubReqsByClubId(club_id)
            .then((response) => {
                if (response.status === true) {
                    const results = response.data;
                    setMemberships(results.filter((a) => !a.is_approved));
                }
            })
            .catch((error) => {
                console.log('err: ', error);
            });
    };

    const getThisMonthMembers = () => {
        const year = new Date().getFullYear();
        const month = new Date().getMonth();
        const startDateOfMonth = new Date(`${year}-${month + 1}-1`).getTime();
        return startDateOfMonth;
    };

    const monthMembers = activeMembers.filter(
        (a) => new Date(a.created_at).getTime() > getThisMonthMembers()
    );

    return (
        <div className="member-card">
            <Row className="justify-content-md-start">
                <h5>MEMBERS</h5>
            </Row>
            <Col className="justify-content-md-start member-wrapper">
                <div
                    className="member-img"
                    style={{
                        backgroundImage: `url(${member_bg})`,
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                        borderTopLeftRadius: 6,
                        borderTopRightRadius: 6,
                    }}
                >
                    <img
                        style={{ height: 61, width: 61, objectFit: 'contain' }}
                        src={member_icon}
                        alt=""
                    />
                    <h5 style={{ marginTop: 10 }}>Members</h5>
                </div>
                <Col
                    className="justify-content-center align-items-center"
                    style={{ marginTop: 30 }}
                >
                    <Row className="justify-content-center">
                        <span>{activeMembers.length} ACTIVE MEMBERS</span>
                    </Row>
                    <Row className="justify-content-center">
                        <span>
                            {monthMembers.length} NEW MEMBERS THIS MONTH
                        </span>
                    </Row>
                    <Row className="justify-content-center">
                        <span>
                            {memberships.length} NEW MEMBERSHIP REQUESTS
                        </span>
                    </Row>
                </Col>
                <Row className="justify-content-end">
                    <Button
                        variant="primary"
                        size="sm"
                        className="member-btn"
                        onClick={() => {
                            history.push('/manager/members');
                        }}
                    >
                        MEMBERS
                    </Button>
                </Row>
            </Col>
        </div>
    );
}
export default MemberShipCard;
