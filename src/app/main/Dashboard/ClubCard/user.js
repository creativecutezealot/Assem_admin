import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Container, Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faLinkedin,
    faTwitterSquare,
} from '@fortawesome/free-brands-svg-icons';
import { faExternalLinkSquareAlt } from '@fortawesome/free-solid-svg-icons';

import session from '../../../../services/session.service';
import helper from '../../../../services/helper.service';
import adminApi from '../../../../services/admin.service';

import './styles.scss';
const club_icon = require('../../../../assets/img/club.png');

function UserClubCard({ club }) {
    const history = useHistory();
    return (
        <div className="club-card" key={club.club_id}>
            <Col className="justify-content-md-start club-wrapper">
                <div
                    className="club-img"
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
                        borderTopRightRadius: 6,
                    }}
                ></div>
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
                    </Col>
                </Row>
                <Row
                    className="justify-content-end"
                    style={{ padding: '0px 20px' }}
                >
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                            history.push({
                                pathname: '/user/referral',
                                state: {
                                    club,
                                },
                            });
                        }}
                    >
                        MEMBER REFERRALS
                    </Button>
                </Row>
            </Col>
        </div>
    );
}
export default UserClubCard;
