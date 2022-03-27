import React from 'react';
import { Row } from 'react-bootstrap';

import './styles.scss';

import Content from '../../../components/content';
import ProfileCard from './ProfileCard';

function Dashboard() {
    return (
        <Content>
            <Row className="justify-content-md-start">
                <h4>DASHBOARD</h4>
            </Row>
            <ProfileCard />
        </Content>
    );
}

export default Dashboard;
