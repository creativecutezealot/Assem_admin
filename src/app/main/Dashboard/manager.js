import React from 'react';
import { Row } from 'react-bootstrap';

import './styles.scss';

import Content from '../../../components/content';
import ProfileCard from './ProfileCard';
import ClubCard from './ClubCard';
import MemberCard from './MemberCard';

function Dashboard() {
    return (
        <Content>
            <Row className="justify-content-md-start">
                <h4>MANAGER DASHBOARD</h4>
            </Row>
            <ProfileCard />
            <ClubCard />
            <MemberCard />
        </Content>
    );
}

export default Dashboard;
