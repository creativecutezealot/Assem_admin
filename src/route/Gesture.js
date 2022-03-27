import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

import HomeScreen from '../app/guest/Auth/index';
import Landing from '../app/guest/Auth/landing';
import Login from '../app/guest/Auth/login';
import Verify from '../app/guest/Verify';
import Signup from '../app/guest/Auth/signup';
import Location from '../app/guest/Auth/location';
import Birthday from '../app/guest/Auth/birthday';
import Profile from '../app/guest/Auth/profile';
import Photo from '../app/guest/Auth/photo';
import Confirm from '../app/guest/Auth/confirm';
import Subscription from '../app/guest/Auth/subscription';
import Payment from '../app/guest/Auth/payment';
import Invitecode from '../app/guest/Auth/invitecode';
import ForgotPass from '../app/guest/Auth/forgotpass';
import ConfirmPass from '../app/guest/Auth/confirmpass';
import ResetPass from '../app/guest/Auth/resetpass';
import CompleteResetPass from '../app/guest/Auth/completeresetpass';
import Clubs from '../app/guest/Auth/selectclubs';

const GuestRouter = (props) => {
    // const { pathname } = useLocation();
    return (
        <BrowserRouter>
            <div className="app-main">
                <Switch>
                    <Route exact path="/" component={Landing}/>
                    <Route exact path="/home" component={HomeScreen} />
                    <Route exact path="/login" component={Login} />
                    <Route exact path="/forgotpass" component={ForgotPass} />
                    <Route exact path="/passcode" component={ConfirmPass} />
                    <Route exact path="/resetpass" component={ResetPass} />
                    <Route exact path="/completeresetpass" component={CompleteResetPass} />
                    <Route exact path="/signup" component={Signup} />
                    <Route exact path="/signup/location" component={Location} />
                    <Route exact path="/signup/birthday" component={Birthday} />
                    <Route exact path="/signup/profile" component={Profile} />
                    <Route exact path="/signup/photo" component={Photo} />
                    <Route exact path="/signup/confirm" component={Confirm} />
                    <Route exact path="/signup/invitecode" component={Invitecode} />
                    <Route
                        exact
                        path="/signup/subscription"
                        component={Subscription}
                    />
                    <Route exact path="/signup/payment" component={Payment} />
                    <Route exact path="/verify/:code" component={Verify} />
                    <Route exact path="/login/select-club" component={Clubs}/>
                </Switch>
            </div>
        </BrowserRouter>
    );
};

export default GuestRouter;
