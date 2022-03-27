import React, { useEffect } from 'react';
import {
    BrowserRouter,
    Switch,
    Route,
    Redirect,
    useHistory,
} from 'react-router-dom';

import { Row, Col } from 'react-bootstrap';

// API
import session from '../services/session.service';

import { AdminMenu } from '../components/layout/MainMenu';
import Header from '../components/layout/Header';

import Login from '../app/guest/Auth';
import { AdminDashboard } from '../app/main/Dashboard';
import Profile from '../app/main/Profile';
import Clubs from '../app/main/Clubs';
import EditClub from '../app/main/Clubs/edit';
import CreateClub from '../app/main/Clubs/create';

import TutorialAudio from '../app/main/TutorialAudio';

import Database from '../app/database';
import Groups from '../app/main/Groups';
import EmailTemplates from '../app/main/EmailTemplates'
import EditGroup from '../app/main/Groups/edit';
import CreateGroup from '../app/main/Groups/create';
import ClubTiers from '../app/main/ClubTiers';
import EditClubTier from '../app/main/ClubTiers/edit';
import CreateClubTier from '../app/main/ClubTiers/create';

const MainRouter = (props) => {
    return (
        <BrowserRouter>
            <Switch>
                <React.Fragment>
                    <div className="app-main">
                        <Header isManager={false} />
                        <div className="main">
                            <Row sm={3} md={3}>
                                <Col
                                    sm={'auto'}
                                    md={'auto'}
                                    lg={'auto'}
                                    xl={'auto'}
                                >
                                    <AdminMenu />
                                </Col>
                                <Col
                                    sm={8}
                                    md={8}
                                    lg={8}
                                    xl={8}
                                    className="main-body"
                                >
                                    <Switch>
                                        <Route
                                            exact
                                            path="/"
                                            render={() => (
                                                <Redirect to="/admin" />
                                            )}
                                        />
                                        <Route
                                            exact
                                            path="/admin"
                                            component={AdminDashboard}
                                        />
                                        <Route
                                            exact
                                            path="/admin/clubs"
                                            component={Clubs}
                                        />
                                        <Route
                                            exact
                                            path="/admin/clubs/edit/:clubid"
                                            component={EditClub}
                                        />
                                        <Route
                                            exact
                                            path="/admin/clubs/create"
                                            component={CreateClub}
                                        />
                                        <Route
                                            exact
                                            path="/admin/clubtiers"
                                            component={ClubTiers}
                                        />
                                        <Route
                                            exact
                                            path="/admin/clubtiers/edit/:id"
                                            component={EditClubTier}
                                        />
                                        <Route
                                            exact
                                            path="/admin/clubtiers/create"
                                            component={CreateClubTier}
                                        />
                                        <Route
                                            exact
                                            path="/admin/groups"
                                            component={Groups}
                                        />
                                        <Route
                                            exact
                                            path="/admin/groups/edit/:groupid"
                                            component={EditGroup}
                                        />
                                        <Route
                                            exact
                                            path="/admin/groups/create"
                                            component={CreateGroup}
                                        />
                                        <Route
                                            exact
                                            path="/admin/email-templates"
                                            component={EmailTemplates}
                                        />
                                        <Route
                                            exact
                                            path="/admin/login"
                                            component={Login}
                                        />
                                        <Route
                                            exact
                                            path="/admin/tutoraudio"
                                            component={TutorialAudio}
                                        />
                                        <Route
                                            exact
                                            path="/admin/profile"
                                            component={Profile}
                                        />
                                        <Route
                                            exact
                                            path="/admin/logout"
                                            component={Logout}
                                        />
                                        <Route
                                            exact
                                            path="/admin/database"
                                            component={Database}
                                        />
                                    </Switch>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </React.Fragment>
            </Switch>
        </BrowserRouter>
    );
};

export default MainRouter;

function Logout() {
    const history = useHistory();
    useEffect(() => {
        session.clear();
        history.push('/');
        window.location.reload();
    });
    return <div className="logout"></div>;
}
