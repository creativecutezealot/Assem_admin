import React, { useState, useEffect, useMemo } from 'react';
import {
    Button,
    Row,
    Col,
    Modal,
    Form,
    SplitButton,
    Dropdown,
    Image,
    ListGroup,
    InputGroup,
    FormControl,
} from 'react-bootstrap';
import Content from '../../../components/content';
import adminApi from '../../../services/admin.service';
import session from '../../../services/session.service';

import './styles.scss';
import development from '../../../enviroments/development';

import { StreamChat } from 'stream-chat';
import {
    Chat,
    Channel,
    ChannelHeader,
    ChannelList,
    MessageInput,
    MessageList,
    Thread,
    Window,
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/index.css';

const client = StreamChat.getInstance(development.STREAM_API_KEY);
const sort = { last_message_at: -1 };
const club = session.get('futureof-club');

const Messages = () => {
    const user = session.get('futureof-user');
    const [chatClient, setChatClient] = useState(null);
    const [newChat, setNewChat] = useState(false);
    const [newGroupChat, setNewGroupChat] = useState(false);
    const [activeMembers, setActiveMembers] = useState([]);
    const [isAllChecked, setIsAllChecked] = useState(false);
    const [checkedState, setCheckedState] = useState();
    const [clubs, setClubs] = useState([]);
    const [selectedClub, setSelectedClub] = useState();
    const [groupName, setGroupName] = useState('');

    const darkModeTheme = {
        '--bg-gradient-end': '#101214',
        '--bg-gradient-start': '#070a0d',
        '--black': '#ffffff',
        '--blue-alice': '#00193d',
        '--border': '#141924',
        '--button-background': '#ffffff',
        '--button-text': '#005fff',
        '--grey': '#7a7a7a',
        '--grey-gainsboro': '#2d2f2f',
        '--grey-whisper': '#1c1e22',
        '--modal-shadow': '#000000',
        '--overlay': '#00000066',
        '--overlay-dark': '#ffffffcc',
        '--shadow-icon': '#00000080',
        '--targetedMessageBackground': '#302d22',
        '--transparent': 'transparent',
        '--white': '#101418',
        '--white-smoke': '#13151b',
        '--white-snow': '#070a0d',
    };

    useEffect(() => {
        if (club) {
            initChat(club);
            getActiveMembers(club.club_id);
        } else {
            getClubsWithUserId();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getClubsWithUserId = async () => {
        try {
            const response = await adminApi.getClubsWithUserId(user.user_id);
            if (response.status) {
                const results = response.connect;
                console.log('results: ', results);
                setClubs(results);
            }
        } catch (error) {
            console.error('error: ', error);
        }
    };

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
        } catch (error) {
            console.error('initChat Error: ', error);
        }
    };

    const getActiveMembers = async (club_id) => {
        try {
            const response = await adminApi.getUsersWithClubId(club_id);
            if (response.status) {
                const results = response.connect;
                const filtered = results.filter(
                    (result) => result.user_id !== user.user_id && result.user_role !== 'admin'
                );
                setActiveMembers(filtered);
                setCheckedState(new Array(filtered.length).fill(false));
            }
        } catch (error) {
            console.error('getActiveMembers Error: ', error);
        }
    };

    const onNewSingleChat = async (member) => {
        try {
            console.log('onNewSingleChat: ', member, club, selectedClub);
            let id;
            if (club) {
                id = member.user_id + '-' + club.club_id;
            } else {
                id = member.user_id + '-' + selectedClub.club_id;
            }

            const members = [chatClient?.user?.id, id];
            const channel = chatClient.channel('messaging', {
                members: members,
            });
            await channel.create();
            setNewChat(false);
        } catch (error) {
            console.error('errror: ', error);
        }
    };

    const onNewGroupChat = async () => {
        try {
            const groupMembers = activeMembers.filter(
                (member, index) => isAllChecked || checkedState[index]
            );
            console.log('groupMembers: ', groupMembers);
            const groupChatMemberIds = groupMembers.map(
                (member) => member.user_id + '-' + club.club_id
            );
            const members = [chatClient?.user?.id, ...groupChatMemberIds];
            console.log('groupChatMembers: ', members);
            const channel = chatClient.channel('messaging', {
                members: members,
                name: groupName,
            });
            await channel.create();
            setIsAllChecked(false);
            setNewGroupChat(false);
        } catch (error) {
            console.error('errror: ', error);
        }
    };

    const handleOnChange = async (position) => {
        const updatedCheckedState = checkedState.map((item, index) =>
            index === position ? !item : item
        );

        setCheckedState(updatedCheckedState);
    };

    const onSelectClub = async (club) => {
        try {
            setSelectedClub(club);
            await initChat(club);
            await getActiveMembers(club.club_id);
        } catch (error) {
            console.error('error: ', error);
        }
    };

    const newChatModal = () => {
        return (
            <Modal
                show={newChat}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                dialogClassName="popup"
                onHide={() => setNewChat(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>New Chat</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ListGroup>
                        {activeMembers.map((member) => {
                            return (
                                <ListGroup.Item
                                    action
                                    variant="dark"
                                    key={member.user_id}
                                    onClick={() => onNewSingleChat(member)}
                                >
                                    <Row className="justify-content-center align-items-center my-1">
                                        <Col xs={4} md={2}>
                                            <Image
                                                src={member.photo_url}
                                                style={{
                                                    width: '60px',
                                                    height: '60px',
                                                }}
                                                roundedCircle
                                            />
                                        </Col>
                                        <Col xs={7} md={9}>
                                            <b>
                                                {member.first_name +
                                                    ' ' +
                                                    member.last_name}
                                            </b>
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                            );
                        })}
                    </ListGroup>

                    <Row className="align-items-center justify-content-center my-3">
                        <Button
                            type="button"
                            className="btn btn-primary login-btn"
                            onClick={() => setNewChat(false)}
                        >
                            Cancel
                        </Button>
                    </Row>
                </Modal.Body>
            </Modal>
        );
    };

    const newGroupChatModal = () => {
        return (
            <Modal
                show={newGroupChat}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                dialogClassName="popup"
                onHide={() => setNewGroupChat(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>New Group Chat</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="align-items-center justify-content-center my-3">
                        <InputGroup className="mb-3" size="lg">
                            <FormControl
                                placeholder="Group name"
                                aria-label="Default"
                                aria-describedby="inputGroup-sizing-default"
                                onChange={(e) => setGroupName(e.target.value)}
                                className="text-white"
                            />
                        </InputGroup>
                    </Row>

                    <ListGroup>
                        <ListGroup.Item action variant="dark">
                            <Row className="justify-content-center align-items-center my-1">
                                <Col xs={11} md={11}>
                                    <h3>All Members</h3>
                                </Col>
                                <Col xs={1} md={1}>
                                    <Form.Check
                                        inline
                                        type="checkbox"
                                        onChange={(e) =>
                                            setIsAllChecked(e.target.checked)
                                        }
                                    />
                                </Col>
                            </Row>
                        </ListGroup.Item>
                        {activeMembers.map((member, index) => {
                            return (
                                <ListGroup.Item
                                    action
                                    variant="dark"
                                    key={member.user_id}
                                >
                                    <Row className="justify-content-center align-items-center my-1">
                                        <Col xs={4} md={2}>
                                            <Image
                                                src={member.photo_url}
                                                style={{
                                                    width: '60px',
                                                    height: '60px',
                                                }}
                                                roundedCircle
                                            />
                                        </Col>
                                        <Col xs={7} md={9}>
                                            <b>
                                                {member.first_name +
                                                    ' ' +
                                                    member.last_name}
                                            </b>
                                        </Col>
                                        <Col xs={1} md={1}>
                                            <Form.Check
                                                inline
                                                type="checkbox"
                                                checked={
                                                    isAllChecked ||
                                                    (checkedState &&
                                                        checkedState[index])
                                                }
                                                onChange={() =>
                                                    handleOnChange(index)
                                                }
                                            />
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                            );
                        })}
                    </ListGroup>

                    <Row className="align-items-center justify-content-center my-3">
                        <Button
                            type="button"
                            className="btn btn-primary login-btn"
                            onClick={() => onNewGroupChat()}
                        >
                            Ok
                        </Button>
                    </Row>
                </Modal.Body>
            </Modal>
        );
    };

    const renderMessageHeder = () => {
        if (club) {
            return (
                <Row className="justify-content-start mb-2">
                    <SplitButton
                        id="dropdown-button-drop-down"
                        drop="down"
                        variant="dark"
                        title="New Message"
                        onClick={() => setNewChat(true)}
                        className="mx-2"
                    >
                        <Dropdown.Item
                            eventKey="1"
                            onClick={() => setNewChat(true)}
                        >
                            New Message
                        </Dropdown.Item>
                        <Dropdown.Item
                            eventKey="2"
                            onClick={() => setNewGroupChat(true)}
                        >
                            New Group Message
                        </Dropdown.Item>
                    </SplitButton>
                </Row>
            );
        } else {
            return (
                <Row className="justify-content-start mb-2">
                    <SplitButton
                        id="dropdown-button-drop-down"
                        drop="down"
                        variant="dark"
                        title="Select Club"
                        className="mx-2"
                    >
                        {clubs.map((item) => (
                            <Dropdown.Item
                                key={item.club_id}
                                eventKey="1"
                                onClick={() => onSelectClub(item)}
                            >
                                {item.club_name}
                            </Dropdown.Item>
                        ))}
                    </SplitButton>
                    {selectedClub && (
                        <SplitButton
                            id="dropdown-button-drop-down"
                            drop="down"
                            variant="dark"
                            title="New Message"
                            onClick={() => setNewChat(true)}
                            className="mx-2"
                        >
                            <Dropdown.Item
                                eventKey="1"
                                onClick={() => setNewChat(true)}
                            >
                                New Message
                            </Dropdown.Item>
                        </SplitButton>
                    )}
                </Row>
            );
        }
    };

    const filters = useMemo(
        () => ({
            type: 'messaging',
            members: {
                $in: [chatClient?.user?.id],
            },
        }),
        [chatClient]
    );

    return (
        <Content>
            <div className="messages">
                <Row className="justify-content-start">
                    <h4>MESSAGES</h4>
                </Row>
                <div className="messages-container">
                    {renderMessageHeder()}
                    {newChatModal()}
                    {newGroupChatModal()}
                    {selectedClub && (
                        <Row className="justify-content-center my-2">
                            <h4>{selectedClub.club_name}</h4>
                        </Row>
                    )}
                    {chatClient?.user && (
                        <Chat client={chatClient} customStyles={darkModeTheme}>
                            <ChannelList
                                showChannelSearch
                                additionalChannelSearchProps={{
                                    searchForChannels: true,
                                }}
                                filters={filters}
                                sort={sort}
                            />
                            <Channel>
                                <Window>
                                    <ChannelHeader />
                                    <MessageList />
                                    <MessageInput />
                                </Window>
                                <Thread />
                            </Channel>
                        </Chat>
                    )}
                </div>
            </div>
        </Content>
    );
};

export default Messages;
