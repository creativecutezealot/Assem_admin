import React, { useEffect, useState } from 'react';
import {
    BrowserRouter,
    Switch,
    Route,
    Redirect,
    useHistory,
} from 'react-router-dom';
import { Row, Col, Badge, Button, ListGroup } from 'react-bootstrap';

// API
import session from '../services/session.service';

import { UserMenu } from '../components/layout/MainMenu';
import Header from '../components/layout/Header';

import Login from '../app/guest/Auth';
import { UserDashboard, UserClubs, JoinClub } from '../app/main/Dashboard';
import Payment from '../app/main/Payment';
import Profile from '../app/main/Profile';
import MemberReferral from '../app/main/Referral';
import Messages from '../app/main/Messages';

import Assembles from '../app/main/Assembles';

import Audios from '../app/main/Audio';
import EditAudio from '../app/main/Audio/edit';
import CreateAudio from '../app/main/Audio/create';

import Events from '../app/main/Events';
import CreateEvent from '../app/main/Events/create';
import EditEvent from '../app/main/Events/edit';

import { Fab, Action } from 'react-tiny-fab';
import 'react-tiny-fab/dist/styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faTimes } from '@fortawesome/free-solid-svg-icons';
import './styles.scss';

import development from '../enviroments/development';

import { StreamChat } from 'stream-chat';
import adminApi from '../services/admin.service'

const client = StreamChat.getInstance(development.STREAM_API_KEY);
const sort = { last_message_at: -1 };

const UserRouter = (props) => {
    const club = session.get('audio-club');
    const user = session.get('futureof-user');
    const [chatClient, setChatClient] = useState(null);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [firstCheck, setFirstCheck] = useState(false);

    useEffect(() => {
        if (club) {
            initChat(club);
            // getManagers(club.club_id);
        }
    }, []);


    if (club === null) {
        return null;
    }

    const initChat = async (club) => {
        try {
            const chatUser = {
                id: user.user_id + '-' + club.club_id,
                image: user.photo_url,
                name: user.first_name + ' ' + user.last_name,
            };
            await client.disconnectUser();
            const userToken = client.devToken(chatUser.id);
            console.log('userToken: ', userToken);
            await client.connectUser(chatUser, userToken);
            setChatClient(client);
            const response = await adminApi.getUsersWithClubId(club.club_id);
            if (response.status) {
                const results = response.connect;
                const filtered = results.filter(
                    (result) => result.user_id !== user.user_id && result.user_role === 'manager'
                );
                const managerIds = filtered.map(member => member.user_id + '-' + club.club_id);
                const filters = { members: { $in: [client?.user?.id] } };
                const sort = { last_message_at: -1 };
                const channels = await client.queryChannels(filters, sort, {
                    limit: 10
                });

                const channelMembers = channels.map(channel => Object.values(channel.state.members));
                let aa = channelMembers.filter(m => Array.isArray(m) && managerIds.some(id => m.findIndex(n => n.user_id === id) !== -1));
                let messages = channels.map(channel => getMessages(channel, managerIds)).flat();
                console.log('messages: ', messages);
                setMessages(messages);
            }

        } catch (error) {
            console.error('initChat Error: ', error);
        }
    };

    const getMessages = (channel, managerIds) => {
        let m = Object.values(channel.state.members);
        if (Array.isArray(m) && managerIds.some(id => m.findIndex(n => n.user_id === id) !== -1)) {
            return channel.state.messages
        } else {
            return [];
        }
    }

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        setFirstCheck(true)
    }

    const NotificationBar = ({ isMenuOpen, onToggleMenu }) => {
        return (
            <div className={`sidebar-menu${isMenuOpen === true ? ' open' : ''}`}>
                <div style={{ height: '100px', backgroundColor: '#007bff', borderRadius: '16px' }}>
                    <Row style={{ height: '100%' }}>
                        <Col md={10} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><p style={{ fontSize: 'large', fontWeight: 'bold' }}>#{club.club_name} News</p></Col>
                        <Col md={2} style={{ display: 'flex', alignItems: 'flex-start', padding: 0 }}>
                            <Button variant='outline-light' className='button small float-right toggle' onClick={onToggleMenu}><FontAwesomeIcon icon={faTimes} /></Button>
                        </Col>
                    </Row>
                </div>

                <ListGroup className='sidebar-news'>
                    {
                        messages.map((message, index) => {
                            return (
                                <ListGroup.Item key={index} style={{ background: 'transparent' }}>{message.text}</ListGroup.Item>
                            )
                        })
                    }

                </ListGroup>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <Switch>
                <React.Fragment>
                    <div className='app-main'>
                        <Header isManager={false} club={club} />
                        <div className='main'>
                            <Row sm={3} md={3}>
                                <Col
                                    sm={'auto'}
                                    md={'auto'}
                                    lg={'auto'}
                                    xl={'auto'}
                                >
                                    <UserMenu />
                                </Col>
                                <Col
                                    sm={8}
                                    md={8}
                                    lg={8}
                                    xl={8}
                                    className='main-body'
                                >
                                    <Switch>
                                        <Route
                                            exact
                                            path='/'
                                            render={() => (
                                                <Redirect to='/user' />
                                            )}
                                        />
                                        <Route
                                            exact
                                            path='/user'
                                            component={UserDashboard}
                                        />
                                        <Route
                                            exact
                                            path='/user/payment'
                                            component={Payment}
                                        />
                                        <Route
                                            exact
                                            path='/user/clubs'
                                            component={UserClubs}
                                        />
                                        <Route
                                            exact
                                            path='/user/joinclub'
                                            component={JoinClub}
                                        />
                                        <Route
                                            exact
                                            path="/user/assemblies"
                                            component={Assembles}
                                        />
                                        <Route
                                            exact
                                            path='/user/audios'
                                            component={Audios}
                                        />
                                        <Route
                                            exact
                                            path='/user/audios/edit/:assembly_id'
                                            component={EditAudio}
                                        />
                                        <Route
                                            exact
                                            path='/user/audios/create'
                                            component={CreateAudio}
                                        />
                                        <Route
                                            exact
                                            path='/user/login'
                                            component={Login}
                                        />
                                        <Route
                                            exact
                                            path='/user/profile'
                                            component={Profile}
                                        />
                                        <Route
                                            exact
                                            path='/user/referral'
                                            component={MemberReferral}
                                        />
                                        <Route
                                            exact
                                            path='/user/messages'
                                            component={Messages}
                                        />
                                        <Route
                                            exact
                                            path='/user/events'
                                            component={Events}
                                        />
                                        <Route
                                            exact
                                            path='/user/event/edit/:event_id'
                                            component={EditEvent}
                                        />
                                        <Route
                                            exact
                                            path='/user/events/create'
                                            component={CreateEvent}
                                        />
                                        <Route
                                            exact
                                            path='/user/logout'
                                            component={Logout}
                                        />
                                    </Switch>
                                </Col>
                            </Row>
                            {
                                isMenuOpen && <Fab
                                    mainButtonStyles={{ backgroundColor: '#3498db', width: 60, borderRadius: 48 }}
                                    style={{
                                        bottom: '50px',
                                        right: '50px',
                                    }}
                                    icon={
                                        <>
                                            <FontAwesomeIcon icon={faBell} />
                                            <Badge pill bg='danger' style={{
                                                position: 'absolute',
                                                bottom: '36px',
                                                right: '0px',
                                                backgroundColor: 'red',
                                                color: 'white'
                                            }}>{firstCheck ? '' : messages.length}</Badge>
                                        </>
                                    }
                                    event='hover'
                                    alwaysShowTitle={true}
                                    onClick={toggleMenu}
                                >
                                </Fab>
                            }
                            <NotificationBar isMenuOpen={isMenuOpen} onToggleMenu={toggleMenu} />
                        </div>
                    </div>
                </React.Fragment>
            </Switch>
        </BrowserRouter>
    );
};

export default UserRouter;

function Logout() {
    const history = useHistory();
    useEffect(() => {
        session.clear();
        history.push('/');
        window.location.reload();
    });
    return <div className='logout'></div>;
}
