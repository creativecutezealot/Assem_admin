import React, { useEffect, useState, useRef } from 'react';
import './header.scss';
import { Row, Col, Navbar, Popover, Overlay, Modal, Image, Button } from 'react-bootstrap';
import { Link, useHistory, useLocation } from 'react-router-dom';

import adminApi from '../../../services/admin.service';
import session from '../../../services/session.service';
import helper from '../../../services/helper.service';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faBars } from '@fortawesome/free-solid-svg-icons';

const dashboardIcon = require('../../../assets/icon/dashboard_icon.png');
const dashboardIcon_dark = require('../../../assets/icon/dashboard_icon_dark.png');
const profileIcon = require('../../../assets/icon/profile_icon.png');
const profileIcon_dark = require('../../../assets/icon/profile_icon_dark.png');
const membresIcon = require('../../../assets/icon/members_icon.png');
const membresIcon_dark = require('../../../assets/icon/members_icon_dark.png');
const audioIcon = require('../../../assets/icon/audio_icon.png');
const audioIcon_dark = require('../../../assets/icon/audio_icon_dark.png');
const orderIcon = require('../../../assets/icon/order_icon.png');
const orderIcon_dark = require('../../../assets/icon/order_icon_dark.png');
const messagesIcon = require('../../../assets/icon/message_icon.png');
const messagesIcon_dark = require('../../../assets/icon/message_icon_dark.png');
const clubsIcon = require('../../../assets/icon/clubs_icon.png');
const clubsIcon_dark = require('../../../assets/icon/clubs_icon_dark.png');
const tiersIcon = require('../../../assets/icon/tiers_icon.png');
const tiersIcon_dark = require('../../../assets/icon/tiers_icon_dark.png');
const groupsIcon = require('../../../assets/icon/members_icon.png');
const groupsIcon_dark = require('../../../assets/icon/members_icon_dark.png');
const paymentIcon = require('../../../assets/icon/payment_icon.png');
const paymentIcon_dark = require('../../../assets/icon/payment_icon_dark.png');
const joinclubIcon = require('../../../assets/icon/joinclub_icon.png');
const joinclubIcon_dark = require('../../../assets/icon/joinclub_icon_dark.png');
const logoutIcon = require('../../../assets/icon/logout_icon.png');
const logoutIcon_dark = require('../../../assets/icon/logout_icon_dark.png');

const adminMenuList = [
    {
        name: 'DASHBOARD',
        link: '/',
        icon: dashboardIcon,
        darkIcon: dashboardIcon_dark,
    },
    {
        name: 'EDIT PROFILE',
        link: '/admin/profile',
        icon: profileIcon,
        darkIcon: profileIcon_dark,
    },
    {
        name: 'HELP AUDIO',
        link: '/admin/tutoraudio',
        icon: audioIcon,
        darkIcon: audioIcon_dark,
    },
    {
        name: 'CLUBS',
        link: '/admin/clubs',
        icon: clubsIcon,
        darkIcon: clubsIcon_dark,
    },
    {
        name: 'CLUB TIERS',
        link: '/admin/clubtiers',
        icon: tiersIcon,
        darkIcon: tiersIcon_dark,
    },
    {
        name: 'GROUPS',
        link: '/admin/groups',
        icon: groupsIcon,
        darkIcon: groupsIcon_dark,
    },
    {
        name: 'EMAIL TEMPLATES',
        link: '/admin/email-templates',
        icon: groupsIcon,
        darkIcon: groupsIcon_dark,
    },
    {
        name: 'DATABASE',
        link: '/admin/database',
        icon: orderIcon,
        darkIcon: orderIcon_dark,
    },
    {
        name: 'LOGOUT',
        link: '/login',
        icon: logoutIcon,
        darkIcon: logoutIcon_dark,
    },
];

const managerMenuList = [
    {
        name: 'DASHBOARD',
        link: '/',
        icon: dashboardIcon,
        darkIcon: dashboardIcon_dark,
    },
    {
        name: 'EDIT PROFILE',
        link: '/manager/profile',
        icon: profileIcon,
        darkIcon: profileIcon_dark,
    },
    {
        name: 'MEMBERS',
        link: '/manager/members',
        icon: membresIcon,
        darkIcon: membresIcon_dark,
    },
    {
        name: 'MESSAGES',
        link: '/manager/messages',
        icon: messagesIcon,
        darkIcon: messagesIcon_dark,
    },
    {
        name: 'ORDER',
        link: '/manager/sort',
        icon: orderIcon,
        darkIcon: orderIcon_dark,
    },
    {
        name: 'LOGOUT',
        link: '/login',
        icon: logoutIcon,
        darkIcon: logoutIcon_dark,
    },
];

const userMenuList = [
    {
        name: 'DASHBOARD',
        link: '/',
        icon: dashboardIcon,
        darkIcon: dashboardIcon_dark,
    },
    {
        name: 'EDIT PROFILE',
        link: '/user/profile',
        icon: profileIcon,
        darkIcon: profileIcon_dark,
    },
    {
        name: 'PAYMENT',
        link: '/user/payment',
        icon: paymentIcon,
        darkIcon: paymentIcon_dark,
    },
    {
        name: 'MANAGE CLUBS',
        link: '/user/clubs',
        icon: clubsIcon,
        darkIcon: clubsIcon_dark,
    },
    {
        name: 'JOIN CLUBS',
        link: '/user/joinclub',
        icon: joinclubIcon,
        darkIcon: joinclubIcon_dark,
    },
    {
        name: 'LOGOUT',
        link: '/login',
        icon: logoutIcon,
        darkIcon: logoutIcon_dark,
    },
];

function Header({ isSub = false, isManager = false, club = null }) {
    const history = useHistory();
    const location = useLocation();
    const [show, setShow] = useState(false);
    const [target, setTarget] = useState(null);
    const [clubs, setClubs] = useState([]);
    const [modalShow, setModalShow] = useState(false);
    const [modalShow1, setModalShow1] = useState(false);
    const ref = useRef(null);
    const user = session.get('futureof-user');
    const [selectedMenu, setSelectedMenu] = useState('DASHBOARD');
    const [menuList, setMenuList] = useState([]);

    useEffect(() => {
        getClubs();
    }, []);

    useEffect(() => {
        if (user) {
            let url;
            switch (user.user_role) {
                case 'admin':
                    setMenuList(adminMenuList);
                    url = location.pathname.split('/admin/')[1];
                    if (url && url !== '') {
                        adminMenuList.map((menu) => {
                            if (menu.link.includes(url)) {
                                setSelectedMenu(menu.name);
                            }
                            return 0;
                        });
                    }
                    break;
                case 'manager':
                    setMenuList(managerMenuList);
                    url = location.pathname.split('/manager/')[1];
                    if (url && url !== '') {
                        managerMenuList.map((menu) => {
                            if (menu.link.includes(url)) {
                                setSelectedMenu(menu.name);
                            }
                            return 0;
                        });
                    }
                    break;
                default:
                    setMenuList(userMenuList);
                    url = location.pathname.split('/user/')[1];
                    if (url && url !== '') {
                        userMenuList.map((menu) => {
                            if (menu.link.includes(url)) {
                                setSelectedMenu(menu.name);
                            }
                            return 0;
                        });
                    }
                    break;
            }
        }

    }, [location]);

    const getClubs = async () => {
        try {
            if (user && user.user_role === 'manager') {
                const managerRes = await adminApi.getClubByManager(
                    user.user_id,
                    user.api_token
                );
                if (
                    managerRes.status &&
                    Array.isArray(managerRes.data) &&
                    managerRes.data.length > 0
                ) {
                    setClubs(managerRes.data);
                } else {
                    helper.showToast(
                        'Error',
                        'There is no club for which you are manager',
                        3
                    );
                }
            } else if (user && (user.user_role === '' || user.user_role === 'user')) {
                const userRes = await adminApi.getClubsWithUserId(
                    user.user_id
                );
                if (
                    userRes.status &&
                    Array.isArray(userRes.connect) &&
                    userRes.connect.length > 0
                ) {
                    setClubs(userRes.connect);
                } else {
                    helper.showToast(
                        'Error',
                        'There is no club for which you are member',
                        3
                    );
                }
            }
        } catch (error) {
            console.log('getClubs error: ', error);
            helper.showToast('Error', 'Failed to get clubs.', 3);
        }
    }

    const getClubs1 = async () => {
        try {
            if (user && user.user_role === 'manager') {
                const managerRes = await adminApi.getClubByManager(
                    user.user_id,
                    user.api_token
                );
                if (
                    managerRes.status &&
                    Array.isArray(managerRes.data) &&
                    managerRes.data.length > 0
                ) {
                    setClubs(managerRes.data);
                    if (managerRes.data.length === 1) {
                        setModalShow1(true);
                    } else if (managerRes.data.length > 1) {
                        setModalShow(true);
                    }
                } else {
                    helper.showToast(
                        'Error',
                        'There is no club for which you are manager',
                        3
                    );
                }
            } else if (user && (user.user_role === '' || user.user_role === 'user')) {
                const userRes = await adminApi.getClubsWithUserId(
                    user.user_id
                );
                if (
                    userRes.status &&
                    Array.isArray(userRes.connect) &&
                    userRes.connect.length > 0
                ) {
                    setClubs(userRes.connect);
                    if (userRes.connect.length === 1) {
                        setModalShow1(true);
                    } else if (userRes.connect.length > 1) {
                        setModalShow(true);
                    }
                } else {
                    helper.showToast(
                        'Error',
                        'There is no club for which you are member',
                        3
                    );
                }
            }
        } catch (error) {
            console.log('getClubs error: ', error);
            helper.showToast('Error', 'Failed to get clubs.', 3);
        }
    }

    const handleClick = (event) => {
        setShow(!show);
        setTarget(event.target);
    };

    const handleLogout = (e) => {
        e.preventDefault();
        session.clear();
        history.replace('/login');
        window.location.href = '/login';
    };

    let profileHref = '/admin/profile';
    let dashboardHref = '/admin';
    let title = `WELCOME @${user && user.username ? user.username : ''}`;
    let description =
        'You are a global admin user that can create clubs, assign club managers, and view and manage database records';
    if (user) {
        if (user.user_role === 'admin') {
            profileHref = '/admin/profile';
            dashboardHref = '/admin';
            title = `WELCOME @${user && user.username ? user.username : ''}`;
            description =
                'You are a global admin user that can create clubs, assign club managers, and view and manage database records';
        } else if (user.user_role === 'manager') {
            profileHref = '/manager/profile';
            dashboardHref = '/manager';
            title = `WELCOME TO ${helper.getDisplayName(club?.club_name, '#')}`;
            description = `You are a manager of ${helper.getDisplayName(
                club?.club_name,
                '#'
            )}. Schedule talks and events, load podcasts and audio and manage your members.`;
        } else {
            profileHref = '/user/profile';
            dashboardHref = '/user';
            title = `WELCOME ${helper.getDisplayName(
                `${user.first_name}${user.last_name}`
            )}`;
            description =
                'Here you can edit your profile, change your payment information, and manage your Clubs. \n\n See you back on the Assembly App for discussions, audios and more!';
        }
    }

    const handleShowModal = () => {
        setModalShow(!modalShow);
    }

    const handleShowModal1 = () => {
        setModalShow1(!modalShow1);
    }

    const onlyOneClubPopup = () => {
        return (
            <Modal
                show={modalShow1}
                size='md'
                aria-labelledby='contained-modal-title-vcenter'
                centered
                dialogClassName='popup'
                onHide={handleShowModal1}
            >
                <Modal.Body>
                    <Row className='text-center my-3 mx-3'>
                        <h5>
                            You are a member of only one Club. You may request access to other Clubs by selecting Join Clubs
                        </h5>
                    </Row>

                    <Row className='align-items-center justify-content-center my-3'>
                        <Button
                            type='button'
                            className='btn btn-primary login-btn'
                            onClick={() => setModalShow1(false)}
                        >
                            OK
                        </Button>
                    </Row>
                </Modal.Body>
            </Modal>
        );
    };

    const selectClubPopup = () => {
        return (
            <Modal
                show={modalShow}
                size='lg'
                aria-labelledby='contained-modal-title-vcenter'
                centered
                dialogClassName='select-club'
                onHide={handleShowModal}
            >
                <Modal.Header closeButton>
                    <Modal.Title id='contained-modal-title-vcenter'>
                        Select Club
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        {clubs.map((club) => (
                            <Col
                                xs={12}
                                md={12}
                                className='my-2'
                                key={club.club_id}
                            >
                                <Image
                                    src={club.banner_url}
                                    fluid
                                    onClick={() => goToDashboard(club)}
                                    style={{ cursor: 'pointer' }}
                                />
                            </Col>
                        ))}
                    </Row>
                </Modal.Body>
            </Modal>
        );
    };

    const goToDashboard = (club) => {
        if (user.user_role === 'manager') {
            session.set('futureof-club', club);
            window.location.href = '/manager';
        } else if (user.user_role === '' || user.user_role === 'user') {
            session.set('audio-club', club);
            window.location.href = '/user';
        }

    };

    const showMyClubs = async (e) => {
        await getClubs1();
    }

    const handleSelect = (menu) => {
        setSelectedMenu(menu.name);
        history.replace(menu.link);
        if (menu.name === 'LOGOUT') {
            session.clear();
            history.replace('/login');
            window.location.href = '/login';
        }
    };

    if (!user) {
        return null;
    }

    return (
        <>
            <Navbar className='nav-header'>
                <Navbar.Brand href={dashboardHref}>
                    <img
                        className='logo'
                        src={require('../../../assets/icon/logo_icon.png')}
                        alt=''
                    />
                </Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse className='justify-content-end'>
                    {user.user_role !== 'admin' && <Navbar.Text style={{ marginLeft: 30 }}>
                        <a href='#'>
                            <span
                                className='font-weight-bold text-white'
                                onClick={showMyClubs}
                            >
                                My Clubs
                            </span>
                        </a>
                    </Navbar.Text>}
                    <Navbar.Text style={{ marginLeft: 30 }}>
                        <a href={'mailto:help@assembly.us'}>
                            <span
                                className='font-weight-bold text-white'
                            >
                                Help
                            </span>
                        </a>
                    </Navbar.Text>
                    <Navbar.Text style={{ marginLeft: 30 }}>
                        <a
                            target='_blank'
                            href='https://testflight.apple.com/'
                            rel='noopener noreferrer'
                        >
                            <span
                                className='font-weight-bold text-white'
                            >
                                Download
                            </span>
                        </a>
                    </Navbar.Text>
                    {selectClubPopup()}
                    {onlyOneClubPopup()}
                    <div
                        style={{
                            width: 1,
                            height: 42,
                            backgroundColor: '#3B75B4',
                            marginLeft: 30,
                        }}
                    ></div>
                    <a style={{ marginLeft: 30 }} href={profileHref}>
                        <img
                            src={
                                user.photo_url && user.photo_url !== ''
                                    ? user.photo_url
                                    : require('../../../assets/avatar/profile.png')
                            }
                            alt=''
                            style={{ width: 60, height: 51, borderRadius: 10 }}
                        ></img>
                    </a>
                    <div ref={ref} style={{ marginLeft: 20, marginRight: 30 }}>
                        <div
                            style={{
                                width: 40,
                                height: 80,
                                alignItems: 'center',
                                justifyContent: 'center',
                                display: 'flex',
                                cursor: 'pointer',
                            }}
                            onClick={handleClick}
                        >
                            <FontAwesomeIcon icon={show ? faTimes : faBars} />
                        </div>
                        <Overlay
                            show={show}
                            target={target}
                            placement='bottom'
                            containerPadding={50}
                        >
                            <Popover id='popover-contained'>
                                {menuList.map((menu, index) => (
                                    <Popover.Content key={index}>
                                        <Link
                                            key={menu.name}
                                            onClick={() => {
                                                handleSelect(menu);
                                            }}
                                            to={menu.link}
                                        >
                                            <div
                                                className={
                                                    selectedMenu === menu.name
                                                        ? 'nav-item select-item'
                                                        : 'nav-item'
                                                }
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'flex-start',
                                                    alignItems: 'center',
                                                    borderRadius: 6,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 24,
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <img
                                                        src={
                                                            selectedMenu === menu.name
                                                                ? menu.darkIcon
                                                                : menu.icon
                                                        }
                                                        alt="icon"
                                                        style={{
                                                            maxWidth: 24,
                                                            height: 16,
                                                            resize: 'inherit',
                                                        }}
                                                    ></img>
                                                </div>
                                                <div style={{ marginLeft: 10 }}>
                                                    {menu.name}
                                                </div>
                                            </div>
                                        </Link>
                                    </Popover.Content>

                                ))}
                            </Popover>
                        </Overlay>
                    </div>
                </Navbar.Collapse>
            </Navbar>
            {user.user_role === 'admin' ? <Row
                style={{
                    backgroundColor: '#3B75B4',
                    height: 300,
                    paddingTop: 30,
                }}
            >
                <Col
                    xs={12}
                    md={8}
                    style={{ paddingLeft: '5vw', height: '100%' }}
                >
                    <Row
                        style={{
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            marginTop: 80,
                        }}
                    >
                        <h3>{title}</h3>
                        <h5>{description}</h5>
                    </Row>
                </Col>
                <Col xs={6} md={4}>
                    <img
                        className='screenshot'
                        src={require('../../../assets/img/app_screenshot.png')}
                        alt=''
                    />
                </Col>
            </Row> : <Row
                style={{
                    backgroundColor: '#3B75B4',
                    height: 300
                }}
            >
                <Col className='justify-content-md-start'>
                    <div
                        className='club-img'
                    >
                        {
                            club.web_banner_url && (
                                <img src={club.web_banner_url} style={{ width: '100%', height: '300px' }}></img>
                            )
                        }
                    </div>
                </Col>
            </Row>}
        </>
    );
}

export default Header;
