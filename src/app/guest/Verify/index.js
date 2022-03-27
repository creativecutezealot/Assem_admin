import React from 'react';
import './verify.scss';
import { Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import adminApi from '../../../services/admin.service';

class Verify extends React.Component {
    constructor(props) {
        super();
        this.state = {
            code: '',
            password: '',
        };
    }

    componentDidMount() {
        const param = window.location.href.split('verify/')[1];
        this.handleVerify(param);
    }

    handleVerify = (code = '') => {
        adminApi
            .getConfirmVcode(code)
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.log('failedfdfd');
            });
    };

    render() {
        return (
            <div className="verify">
                <div className="verify-header">
                    <div className="row">
                        <div className="col-md-8 mx-auto">
                            <div className="d-flex justify-content-center">
                                <Link to={'/'}>
                                    <img
                                        className="logo"
                                        src={require('../../../assets/logo.svg')}
                                        alt=""
                                    />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <Form className="verify-form">
                    <h4 className="text-center mb-5">
                        Thank you for your verifying your email{' '}
                    </h4>
                </Form>
            </div>
        );
    }
}

export default Verify;
