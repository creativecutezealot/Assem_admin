import React from 'react';
import { Tab, Tabs } from 'react-bootstrap';

import Clubs from './Clubs';
import ClubReq from './ClubReq';
import Assmeblies from './Assemble';
import Audios from './Audio';
import Referrals from './Referrals';
import Groups from './Groups';
import Users from './Users';
import VerifyCode from './VCode';
import Content from '../../components/content';
import './tbl-clubs.scss';
import ClubTiers from './ClubTiers';

function DatabaseTabs() {
    const [key, setKey] = React.useState('club');

    return (
        <Content>
            <div className="database-tab">
                <Tabs activeKey={key} onSelect={(k) => setKey(k)}>
                    <Tab eventKey="club" title="CLUB">
                        <Clubs />
                    </Tab>
                    <Tab eventKey="club_request" title="CLUB REQUEST">
                        <ClubReq />
                    </Tab>
                    <Tab eventKey="club_tiers" title="CLUB TIERS">
                        <ClubTiers />
                    </Tab>
                    <Tab eventKey="assmeblies" title="ROOMS">
                        <Assmeblies />
                    </Tab>
                    <Tab eventKey="audio" title="AUDIOS">
                        <Audios />
                    </Tab>
                    {/* <Tab eventKey="voicenote" title="VOICENOTES">
                        <VoiceNotes />
                    </Tab> */}
                    <Tab eventKey="users" title="USERS">
                        <Users />
                    </Tab>
                    <Tab eventKey="referral" title="REFERRALS">
                        <Referrals />
                    </Tab>
                    <Tab eventKey="group" title="GROUPS">
                        <Groups />
                    </Tab>
                    <Tab eventKey="verify_code" title="VERIFY CODE">
                        <VerifyCode />
                    </Tab>
                </Tabs>
            </div>
        </Content>
    );
}

export default DatabaseTabs;
