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

import { ManagerMenu } from '../components/layout/MainMenu';
import Header from '../components/layout/Header';

import Login from '../app/guest/Auth';
import { ManagerDashboard } from '../app/main/Dashboard';
import Members from '../app/main/Members';
import Profile from '../app/main/Profile';

import Assembles from '../app/main/Assembles';
import EditAssembles from '../app/main/Assembles/edit';
import CreateAssembles from '../app/main/Assembles/create';

import Events from '../app/main/Events';
import CreateEvent from '../app/main/Events/create';
import EditEvent from '../app/main/Events/edit';

import Audios from '../app/main/Audio';
import EditAudios from '../app/main/Audio/edit';
import CreateAudios from '../app/main/Audio/create';

import SortManage from '../app/main/SortManage';
import Messages from '../app/main/Messages';

const ManagerRouter = (props) => {
    const club = session.get('futureof-club');

    if (club == null) {
        return null;
    }

    return (
        <BrowserRouter>
            <Switch>
                <React.Fragment>
                    <div className="app-main">
                        <Header isManager={true} club={club} />
                        <div className="main">
                            <Row sm={3} md={3}>
                                <Col
                                    sm={'auto'}
                                    md={'auto'}
                                    lg={'auto'}
                                    xl={'auto'}
                                >
                                    <ManagerMenu />
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
                                                <Redirect to="/manager" />
                                            )}
                                        />
                                        <Route
                                            exact
                                            path="/manager"
                                            component={ManagerDashboard}
                                        />
                                        <Route
                                            exact
                                            path="/manager/members"
                                            component={Members}
                                        />
                                        <Route
                                            exact
                                            path="/manager/assemblies"
                                            component={Assembles}
                                        />
                                        <Route
                                            exact
                                            path="/manager/assemblies/edit/:assembly_id"
                                            component={EditAssembles}
                                        />
                                        <Route
                                            exact
                                            path="/manager/assembles/create"
                                            component={CreateAssembles}
                                        />

                                        <Route
                                            exact
                                            path="/manager/events"
                                            component={Events}
                                        />
                                        <Route
                                            exact
                                            path="/manager/event/edit/:event_id"
                                            component={EditEvent}
                                        />
                                        <Route
                                            exact
                                            path="/manager/events/create"
                                            component={CreateEvent}
                                        />

                                        <Route
                                            exact
                                            path="/manager/audios"
                                            component={Audios}
                                        />
                                        <Route
                                            exact
                                            path="/manager/audios/edit/:assembly_id"
                                            component={EditAudios}
                                        />
                                        <Route
                                            exact
                                            path="/manager/audios/create"
                                            component={CreateAudios}
                                        />

                                        <Route
                                            exact
                                            path="/manager/messages"
                                            component={Messages}
                                        />

                                        <Route
                                            exact
                                            path="/manager/sort"
                                            component={SortManage}
                                        />

                                        <Route
                                            exact
                                            path="/manager/login"
                                            component={Login}
                                        />
                                        <Route
                                            exact
                                            path="/manager/profile"
                                            component={Profile}
                                        />
                                        <Route
                                            exact
                                            path="/manager/logout"
                                            component={Logout}
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

export default ManagerRouter;

function Logout() {
    const history = useHistory();
    useEffect(() => {
        session.clear();
        history.push('/');
        window.location.reload();
    });
    return <div className="logout"></div>;
}
