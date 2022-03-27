import React from 'react';
import './club.scss';
import { Link } from 'react-router-dom';
import Header from '../../../components/layout/Header';

import adminApi from '../../../services/admin.service';

class Club extends React.Component {
    constructor(props) {
        super();
        this.state = {
            name: '',
            club_id: '',
            user_id: '',
            bannerUrl: '',
            extraName: '',
            description: '',
            memebership: '',
            members: '',
            user_firstName: '',
            user_lastName: '',
            user_photo: '',
            user_job: '',
            user_company: '',
        };
    }
    componentDidMount() {
        const param = window.location.href.split('club/')[1];
        adminApi
            .clubDetail(param)
            .then((response) => {
                if (response.status === true) {
                    console.log(JSON.stringify(response.data));
                    var user = response.data.user;
                    var club = response.data.club;
                    this.setState({
                        club_id: club.club_id,
                        user_id: club.user_id,
                        name: club.club_name,
                        bannerUrl: club.banner_url,
                        extraName: club.extra_name,
                        description: club.description,
                        memebership:
                            club.memebership == null || club.memebership === ''
                                ? 'free'
                                : club.memebership + '/month dues',
                        members: club.members + ' members',
                        user_firstName: user.first_name,
                        user_lastName: user.last_name,
                        user_photo:
                            user.photo_url == null || user.photo_url === ''
                                ? require('../../../assets/avatar/admin.jpg')
                                : user.photo_url,
                        user_job: user.job,
                        user_company: user.company,
                    });
                }
            })
            .catch((error) => {
                console.log('err: ', error);
            });
    }

    render() {
        return (
            <div className="club">
                <Header />
                <div className="content">
                    <div className="row">
                        <div className="col-lg-8 col-md-8 col-sm-8 col-8 px-5">
                            <div className="row">
                                <div className="col-lg-7 col-md-7 col-sm-7 col-7">
                                    <div className="banner-img-wrapper">
                                        <img
                                            className="banner-img"
                                            src={this.state.bannerUrl}
                                            alt=""
                                        />
                                    </div>
                                </div>
                                <div className="col-lg-5 col-md-5 col-sm-5 col-5">
                                    <h5 className="my-4">{this.state.name}</h5>
                                    <h6 className="my-4">
                                        {this.state.members}
                                    </h6>
                                    <p className="my-4">
                                        {this.state.description}
                                    </p>
                                    <h6>Upcoming Rooms:</h6>
                                    <div>{this.state.extraName}</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-4 col-sm-4 col-4 border-left px-5">
                            <Link
                                className="btn btn-primary mt-4"
                                to={
                                    '/invitation-request/' +
                                    this.state.club_id +
                                    '/' +
                                    this.state.user_id
                                }
                            >
                                JOIN
                            </Link>
                            <p className="my-4">{this.state.memebership}</p>
                            <div className="profile my-4">
                                <div className="avatar-wrapper">
                                    <img
                                        className="avatar"
                                        src={this.state.user_photo}
                                        alt=""
                                    />
                                </div>
                                <div className="profile-info">
                                    <div className="profile-name">
                                        {this.state.user_firstName}{' '}
                                        {this.state.user_lastName}
                                    </div>
                                    <div className="profile-role">
                                        {this.state.user_job},{' '}
                                        {this.state.user_company}
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn btn-primary-outline mt-4"
                            >
                                MESSAGE
                            </button>
                        </div>
                        F
                    </div>
                    <h5 className="my-5 ml-3 pl-3">
                        UPCOMING ROOMS <span>Clean_Energy_Club</span>
                    </h5>
                    <div className="row mt-5 mx-0 px-3">
                        <div className="col-4">
                            <div className="club-card bg-wind-power">
                                <div className="text-center mt-4">
                                    <img
                                        className="avatar"
                                        src={require('../../../assets/avatar/profile.png')}
                                        alt=""
                                    />
                                </div>
                                <div className="card-text text-center mt-3">
                                    @Energy Club
                                </div>
                                <div className="card-text text-center">
                                    55 Members
                                </div>
                                <div className="text-center mt-4">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                    >
                                        INVITE
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="club-card bg-electricity-energy">
                                <div className="text-center mt-4">
                                    <img
                                        className="avatar"
                                        src={require('../../../assets/avatar/profile.png')}
                                        alt=""
                                    />
                                </div>
                                <div className="card-text text-center mt-3">
                                    @Energy Club
                                </div>
                                <div className="card-text text-center">
                                    55 Members
                                </div>
                                <div className="text-center mt-4">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                    >
                                        INVITE
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="club-card bg-solar-energy">
                                <div className="text-center mt-4">
                                    <img
                                        className="avatar"
                                        src={require('../../../assets/avatar/profile.png')}
                                        alt=""
                                    />
                                </div>
                                <div className="card-text text-center mt-3">
                                    @Energy Club
                                </div>
                                <div className="card-text text-center">
                                    55 Members
                                </div>
                                <div className="text-center mt-4">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                    >
                                        INVITE
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Club;
