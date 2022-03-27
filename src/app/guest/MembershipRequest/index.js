import React from 'react';
import { Form, Button } from 'react-bootstrap';

import './membership-request.scss';
import Header from '../../../components/layout/Header';
import publishApi from '../../../services/publish.service';
import helper from '../../../services/helper.service';

class MembershipRequest extends React.Component {
    constructor(props) {
        super();
        this.state = {
            step: 1,
            first_name: '',
            last_name: '',
            bio: '',
            email: '',
            phone: '',
            club_id: '',
            owner_id: '',
        };
    }

    handleInputChange = (event) => {
        let target = event.target;
        let name = target.name;
        let value = target.value;
        this.setState({
            [name]: value,
        });
    };
    handleLogin = () => {
        const params = window.location.href.split('invitation-request/')[1];
        console.log(params);
        const param_lists = params.split('/');
        console.log(param_lists);
        this.setState({
            club_id: param_lists[0],
            owner_id: param_lists[1],
        });
        if (this.state.first_name == null || this.state.first_name == '') {
            helper.showToast('Warning', 'Please input your First Name', 2);
            return false;
        }
        if (this.state.last_name == null || this.state.last_name == '') {
            helper.showToast('Warning', 'Please input your Last Name', 2);
            return false;
        }
        if (this.state.email == null || this.state.email == '') {
            helper.showToast('Warning', 'Please input your email', 2);
            return false;
        }
        if (this.state.phone == null || this.state.phone == '') {
            helper.showToast('Warning', 'Please input your Phone Number', 2);
            return false;
        }
        publishApi
            .clubrequest(this.state)
            .then((response) => {
                console.log(response);
                if (response.status === true) {
                    console.log('faileeeee');
                    this.setState({ step: 2 });
                    helper.showToast(
                        'Success',
                        'Successfully sent your request.',
                        1
                    );
                } else {
                    console.log('faile');
                    helper.showToast('Error', 'Failed to send request.', 3);
                }
            })
            .catch((error) => {
                console.log('failedfdfd');
                console.log('err: ', error);
                helper.showToast('Error', 'Failed to send request.', 3);
            });
    };

    render() {
        return (
            <div className="club">
                <Header />
                <div className="content row">
                    <div className="col-md-3"></div>
                    <div className="col-md-6">
                        <Form
                            className={
                                this.state.step === 1 ? 'login-form' : 'hidden'
                            }
                        >
                            <h4 className="text-center mb-5">
                                {' '}
                                MEMBER REQUEST{' '}
                            </h4>
                            <Form.Group className="form-group">
                                <label> First Name </label>
                                <Form.Control
                                    type="text"
                                    placeholder="First Name"
                                    name="first_name"
                                    value={this.state.first_name}
                                    onChange={this.handleInputChange}
                                />
                            </Form.Group>
                            <Form.Group className="form-group">
                                <label> Last Name </label>
                                <Form.Control
                                    type="text"
                                    placeholder="Last Name"
                                    name="last_name"
                                    value={this.state.last_name}
                                    onChange={this.handleInputChange}
                                />
                            </Form.Group>
                            <Form.Group className="form-group">
                                <label> Bio </label>
                                <textarea
                                    className="form-control"
                                    rows="5"
                                    name="bio"
                                    value={this.state.bio}
                                    onChange={this.handleInputChange}
                                ></textarea>
                            </Form.Group>
                            <Form.Group className="form-group">
                                <label> Email </label>
                                <Form.Control
                                    type="email"
                                    placeholder="Email"
                                    name="email"
                                    value={this.state.email}
                                    onChange={this.handleInputChange}
                                />
                            </Form.Group>
                            <Form.Group className="form-group">
                                <label> Phone Number </label>
                                <Form.Control
                                    type="text"
                                    placeholder="Phone Number"
                                    name="phone"
                                    value={this.state.phone}
                                    onChange={this.handleInputChange}
                                />
                            </Form.Group>
                            <Button
                                type="button"
                                className="btn btn-primary w-100 mt-3"
                                onClick={this.handleLogin}
                            >
                                REQUEST
                            </Button>
                        </Form>
                        <div className={this.state.step != 1 ? '' : 'hidden'}>
                            <br></br>
                            <br></br>
                            <h5 className="text-center">
                                Thank you for your membership request!
                            </h5>
                            <br></br>
                            <h6>
                                We will get back to you shortly. In the mean
                                time, please download the mobile app.
                            </h6>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default MembershipRequest;
