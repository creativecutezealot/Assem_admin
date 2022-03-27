import React from 'react';
import './rightbar.scss';
import { Link } from 'react-router-dom';
import session from '../../../services/session.service';
const menuList = [
    {
        name: 'CLUBS',
        link: '/database/clubs',
    },
    {
        name: 'CLUB REQUESTS',
        link: '/database/clubreq',
    },
    {
        name: 'ROOMS',
        link: '/database/assemblies',
    },
    {
        name: 'AUDIO',
        link: '/database/audios',
    },
    {
        name: 'VOICENOTES',
        link: '/database/voicenotes',
    },
    {
        name: 'USERS',
        link: '/database/users',
    },
    {
        name: 'ACTIVE CODE',
        link: '/database/acode',
    },
    {
        name: 'VERIFY CODE',
        link: '/database/vcode',
    },
];
class DatabaseMenu extends React.Component {
    constructor(props) {
        super();
        this.state = {
            isLoggedIn: false,
            user: null,
            selectedMenu: 'CLUBS',
        };
    }

    componentDidMount() {
        const url = window.location.href.split('/database/')[1];
        menuList.map((menu) => {
            if (menu.link.includes(url)) {
                this.setState({
                    selectedMenu: menu.name,
                });
            }
        });
        const user = session.get('futureof-user');
        const isLoggedIn = user ? true : false;
        this.setState({ isLoggedIn: isLoggedIn });
    }

    handleSelect = (menu) => {
        this.setState({
            selectedMenu: menu.name,
        });
    };

    render() {
        const { selectedMenu } = this.state;
        return (
            <div className="right-tbl-bar">
                <div className="nav-tbl-wrapper">
                    <nav className="nav">
                        {menuList.map((menu) => (
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
                                {menu.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        );
    }
}

export default DatabaseMenu;
