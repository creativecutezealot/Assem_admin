import React from 'react';
import './leftbar.scss';
import { Link, withRouter } from 'react-router-dom';

import session from '../../../services/session.service';
const profileIcon = require('../../../assets/icon/profile_icon.png');
const audioIcon = require('../../../assets/icon/audio_icon.png');
const dashboardIcon = require('../../../assets/icon/dashboard_icon.png');
const orderIcon = require('../../../assets/icon/order_icon.png');
const logoutIcon = require('../../../assets/icon/logout_icon.png');
const profileIcon_dark = require('../../../assets/icon/profile_icon_dark.png');
const audioIcon_dark = require('../../../assets/icon/audio_icon_dark.png');
const dashboardIcon_dark = require('../../../assets/icon/dashboard_icon_dark.png');
const orderIcon_dark = require('../../../assets/icon/order_icon_dark.png');
const logoutIcon_dark = require('../../../assets/icon/logout_icon_dark.png');
const clubsIcon = require('../../../assets/icon/clubs_icon.png');
const clubsIcon_dark = require('../../../assets/icon/clubs_icon_dark.png');
const tiersIcon = require('../../../assets/icon/tiers_icon.png');
const tiersIcon_dark = require('../../../assets/icon/tiers_icon_dark.png');
const groupsIcon = require('../../../assets/icon/members_icon.png');
const groupsIcon_dark = require('../../../assets/icon/members_icon_dark.png');


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

class AdminMenu extends React.Component {
    constructor(props) {
        super();
        this.state = {
            isLoggedIn: false,
            user: null,
            selectedMenu: 'DASHBOARD',
        };
    }

    componentDidMount() {
        let url = window.location.href.split('/admin/')[1];
        console.log('mainmenu', url, window.location.href);
        if (url && url !== '') {
            adminMenuList.map((menu) => {
                if (menu.link.includes(url)) {
                    this.setState({
                        selectedMenu: menu.name,
                    });
                }
                return 0;
            });
        }

        const user = session.get('futureof-user');
        console.log('user: ', user);
        const isLoggedIn = user ? true : false;
        this.setState({ isLoggedIn: isLoggedIn });
        if (user) {
            this.setState({ user });
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) {
            let url = this.props.location.pathname.split('/admin/')[1];
            if (url && url !== '') {
                adminMenuList.map((menu) => {
                    if (menu.link.includes(url)) {
                        this.setState({
                            selectedMenu: menu.name,
                        });
                    }
                    return 0;
                });
            }
        }
    }

    handleSelect = (menu) => {
        this.setState({
            selectedMenu: menu.name,
        });
        if (menu.name === 'LOGOUT') {
            session.clear();
            this.props.history.replace('/login');
            window.location.href = '/login';
        }
    };

    getUri = (uri = '') => {
        if (uri.includes('http')) {
            return uri;
        } else {
            return `http://${uri}`;
        }
    };

    render() {
        const { selectedMenu } = this.state;
        return (
            <div className='right-bar'>
                <div className='nav-wrapper'>
                    <nav className='nav'>
                        {adminMenuList.map((menu) => (
                            <Link
                                key={menu.name}
                                className={
                                    selectedMenu === menu.name
                                        ? 'nav-item select-item'
                                        : 'nav-item'
                                }
                                onClick={() => {
                                    this.handleSelect(menu);
                                }}
                                to={menu.link}
                            >
                                <div
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
                                            alt='icon'
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
                        ))}
                    </nav>
                </div>
            </div>
        );
    }
}

export default withRouter(AdminMenu);
