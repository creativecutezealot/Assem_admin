import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';

import session from '../../../../services/session.service';
import adminApi from '../../../../services/admin.service';

import './styles.scss';

function ClubCard() {
    const club_info = session.get('futureof-club');

    const [club, setClub] = useState(club_info);
    const user = session.get('futureof-user');

    useEffect(() => {
        if (club_info == null || club_info.club_id === null) {
            getClubInfo();
        } else {
            setClub(club_info);
        }
    }, []);

    const getClubInfo = async () => {
        try {
            const managerRes = await adminApi.getClubByManager(user.user_id);
            if (managerRes.status &&
                Array.isArray(managerRes.data) &&
                managerRes.data.length > 0) {
                session.set('futureof-club', managerRes.data[0]);
                setClub(managerRes.data[0]);
            }
        } catch (error) {
            console.log('err: ', error);
        }
    };

    return (
        <div className="club-card">
            <Row className="justify-content-md-start">
                <h5>CLUB INFORMATION</h5>
            </Row>
            <Col className="justify-content-md-start club-wrapper">
                <div
                    className="club-img"
                >
                    {
                        club?.banner_url && (
                            <img src={club?.banner_url} style={{ width: '100%' }}></img>
                        )
                    }
                </div>
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
                        <div className="club-name" style={{ marginTop: 34 }}>
                            Invite Code
                        </div>
                        <div className="club-role">{club?.access_code}</div>
                    </Col>
                </Row>
            </Col>
        </div>
    );
}
export default ClubCard;
