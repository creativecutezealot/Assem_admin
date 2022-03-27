import React from 'react';
import { Row } from 'react-bootstrap';
import './styles.scss';

import adminApi from '../../../services/admin.service';
import session from '../../../services/session.service';
import environment from '../../../enviroments';
import Content from '../../../components/content';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';

const stripePromise = loadStripe(environment.STRIPE_PUBLIC);

class Payment extends React.Component {
    constructor(props) {
        super();
        this.state = {
            customer: null,
        };
    }

    componentDidMount() {
        this.getCustomer();
    }

    getCustomer = async () => {
        const user = session.get('futureof-user');
        try {
            const res = await adminApi.getCustomer(user.user_id);
            if (res.status) {
                console.log('customer: ', res.data);
                this.setState({
                    customer: res.data,
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    render() {
        const user = session.get('futureof-user');
        return (
            <Content>
                <div className="payment-list">
                    <Row className="justify-content-start">
                        <h4>PAYMENT INFORMATION</h4>
                    </Row>
                    <div className="payment-list-container">
                        <Elements stripe={stripePromise}>
                            <CheckoutForm
                                user={user}
                                customerObj={this.state.customer}
                            />
                        </Elements>
                    </div>
                </div>
            </Content>
        );
    }
}

export default Payment;
