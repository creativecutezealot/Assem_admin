import React from 'react';
import './leftbar.scss';
import { Link, withRouter } from 'react-router-dom';
import session from '../../../services/session.service';

const dashboardIcon = require('../../../assets/icon/dashboard_icon.png');
const dashboardIcon_dark = require('../../../assets/icon/dashboard_icon_dark.png');
const profileIcon = require('../../../assets/icon/profile_icon.png');
const profileIcon_dark = require('../../../assets/icon/profile_icon_dark.png');
const assemblyIcon = require('../../../assets/icon/assembly_icon.png');
const assemblyIcon_dark = require('../../../assets/icon/assembly_icon_dark.png');
const audioIcon = require('../../../assets/icon/audio_icon.png');
const audioIcon_dark = require('../../../assets/icon/audio_icon_dark.png');
const joinclubIcon = require('../../../assets/icon/joinclub_icon.png');
const joinclubIcon_dark = require('../../../assets/icon/joinclub_icon_dark.png');
const paymentIcon = require('../../../assets/icon/payment_icon.png');
const paymentIcon_dark = require('../../../assets/icon/payment_icon_dark.png');
const clubsIcon = require('../../../assets/icon/clubs_icon.png');
const clubsIcon_dark = require('../../../assets/icon/clubs_icon_dark.png');
const orderIcon = require('../../../assets/icon/order_icon.png');
const orderIcon_dark = require('../../../assets/icon/order_icon_dark.png');
const logoutIcon = require('../../../assets/icon/logout_icon.png');
const logoutIcon_dark = require('../../../assets/icon/logout_icon_dark.png');

const userMenuList = [
    // {
    //     name: 'DASHBOARD',
    //     link: '/',
    //     icon: dashboardIcon,
    //     darkIcon: dashboardIcon_dark,
    // },
    // {
    //     name: 'EDIT PROFILE',
    //     link: '/user/profile',
    //     icon: profileIcon,
    //     darkIcon: profileIcon_dark,
    // },
    // {
    //     name: 'PAYMENT',
    //     link: '/user/payment',
    //     icon: paymentIcon,
    //     darkIcon: paymentIcon_dark,
    // },
    // {
    //     name: 'MANAGE CLUBS',
    //     link: '/user/clubs',
    //     icon: clubsIcon,
    //     darkIcon: clubsIcon_dark,
    // },
    // {
    //     name: 'JOIN CLUBS',
    //     link: '/user/joinclub',
    //     icon: joinclubIcon,
    //     darkIcon: joinclubIcon_dark,
    // },
    {
        name: 'ROOMS',
        link: '/user/assemblies',
        icon: assemblyIcon,
        darkIcon: assemblyIcon_dark,
    },
    {
        name: 'SUBMIT AUDIO',
        link: '/user/audios',
        icon: audioIcon,
        darkIcon: audioIcon_dark
    },
    {
        name: 'EVENTS',
        link: '/user/events',
        icon: orderIcon,
        darkIcon: orderIcon_dark,
    },
    // {
    //     name: 'LOGOUT',
    //     link: '/login',
    //     icon: logoutIcon,
    //     darkIcon: logoutIcon_dark,
    // },
];

class UserMenu extends React.Component {
    constructor(props) {
        super();
        this.state = {
            isLoggedIn: false,
            user: null,
            selectedMenu: 'DASHBOARD',
        };
    }

    componentDidMount() {
        let url = window.location.href.split('/user/')[1];
        console.log('mainmenu', url, window.location.href);
        if (url && url !== '') {
            userMenuList.map((menu) => {
                if (menu.link.includes(url)) {
                    this.setState({
                        selectedMenu: menu.name,
                    });
                }
                return 0;
            });
        }

        const user = session.get('futureof-user');
        const isLoggedIn = user ? true : false;
        this.setState({ isLoggedIn: isLoggedIn });
        if (user) {
            this.setState({ user });
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) {
            let url = this.props.location.pathname.split('/user/')[1];
            if (url && url !== '') {
                userMenuList.map((menu) => {
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
                        {userMenuList.map((menu) => (
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

export default withRouter(UserMenu);
