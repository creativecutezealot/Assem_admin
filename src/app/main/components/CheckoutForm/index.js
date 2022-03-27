import React, { useEffect, useState, useRef } from 'react';
import { Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './styles.scss';
import stripeApi from '../../../../services/stripe.service';
import enviroments from '../../../../enviroments';
import helper from '../../../../services/helper.service';

const CARD_OPTIONS = {
    iconStyle: 'solid',
    style: {
        base: {
            iconColor: '#fff',
            color: '#fff',
            fontWeight: 500,
            fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
            fontSize: '16px',
            fontSmoothing: 'antialiased',
            ':-webkit-autofill': {
                color: '#fff',
            },
            '::placeholder': {
                color: 'darkgrey',
            },
        },
        invalid: {
            iconColor: '#ffc7ee',
            color: '#ffc7ee',
        },
    },
};

const CheckoutForm = ({ user, customerObj }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    // const [validate, setValidate] = useState(false);
    const [cardComplete, setCardComplete] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [paymentIntent, setPaymentIntent] = useState(null);
    const [subscribe, setSubscribe] = useState(null);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    console.log(customer, paymentIntent);

    const emailRef = useRef();
    const phoneRef = useRef();
    const nameRef = useRef();
    const cardRef = useRef();

    useEffect(() => {
        console.log('user address: ', address, customerObj);
        if (user) {
            setPhone(user.phone_number);
            setName(`${user.first_name} ${user.last_name}`);
            setEmail(user.email);
            setAddress(user.address);
        }
        if (customerObj) {
            setSubscribe(customerObj);
            getPaymentMethods(customerObj.customer, 'card');
        }

        if (elements) {
            elements.getElement(CardElement).focus();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, customerObj]);

    const createCustomer = async (body) => {
        try {
            const result = await stripeApi.createCustomer(body);
            console.log(result);
            if (result.status) {
                if (result.customer) {
                    setCustomer(result.customer);
                }
                if (result.setupIntent) {
                    setPaymentIntent(result.setupIntent);
                }
                return {
                    customer: result.customer,
                    paymentIntent: result.setupIntent,
                };
            } else {
                setProcessing(false);
                setError(result.error);
                return {
                    customer: null,
                    paymentIntent: null,
                };
            }
        } catch (error) {
            setProcessing(false);
            setError(error);
            return {
                customer: null,
                paymentIntent: null,
            };
        }
    };

    const getPaymentMethods = async (customer, type) => {
        try {
            const res = await stripeApi.getPaymentMethods(customer, type);
            const paymentMethods = res.data ? res.data.data : null;
            if (paymentMethods && paymentMethods.length > 0) {
                setPaymentMethod(paymentMethods[0].card.last4);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const createSubScribe = async (body) => {
        try {
            const result = await stripeApi.createSubScribe(body);
            console.log(result);
            if (result.status) {
                if (result.subscription) {
                    return result.subscription;
                }
                return null;
            } else {
                setProcessing(false);
                setError(result.error);
                return null;
            }
        } catch (error) {
            setProcessing(false);
            setError(error);
            return null;
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);
        if (
            emailRef.current.value === '' ||
            nameRef.current.value === '' ||
            phoneRef.current.value === ''
        ) {
            setProcessing(false);
            setError({ message: 'Please fill out input fields' });
            setSuccessMsg(null);
            return;
        }

        if (!stripe || !elements) {
            setProcessing(false);
            setError({ message: 'Something went wrong, Please try again' });
            setSuccessMsg(null);
            return;
        }

        if (!cardComplete) {
            setProcessing(false);
            setError({ message: 'Please fill out card info' });
            setSuccessMsg(null);
            return;
        }

        setError(null);
        setSuccessMsg(null);

        const { customer, paymentIntent } = await createCustomer({
            name: nameRef.current.value,
            email: emailRef.current.value,
            phone: phoneRef.current.value,
            address,
        });
        if (!paymentIntent) {
            return;
        }

        if (!customer) {
            return;
        }

        const payload = await stripe.confirmCardSetup(
            paymentIntent.client_secret,
            {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: nameRef.current.value,
                        email: emailRef.current.value,
                        phone: phoneRef.current.value,
                        address,
                    },
                },
            }
        );

        if (payload.error) {
            setProcessing(false);
            setError(payload.error);
            setSuccessMsg(null);
            return;
        }
        const subscribeRes = await createSubScribe({
            customerId: customer.id,
            paymentMethodId: payload.setupIntent.payment_method,
            price_id: enviroments.GENERAL_PRICE_ID,
        });
        if (!subscribeRes) {
            return;
        }
        setError(null);
        if (subscribe) {
            setSuccessMsg({
                message: 'Credit card information successfully updated!',
            });
            helper.showToast(
                'Success',
                'Credit card information successfully updated!',
                1
            );
        } else {
            setSuccessMsg({
                message: 'Credit card information successfully entered!',
            });
            helper.showToast(
                'Success',
                'Credit card information successfully entered!',
                1
            );
        }
        setSubscribe(subscribeRes);
        setProcessing(false);
    };

    return (
        <Form className='check-payment-form' noValidate onSubmit={handleSubmit}>
            <Form.Group
                key={'email'}
                as={Col}
                controlId={'email'}
                className='justify-content-md-start input-row'
            >
                <Form.Label as={Col}>Email</Form.Label>
                <InputGroup as={Col} className='input-area'>
                    <Form.Control
                        ref={emailRef}
                        required={true}
                        type='text'
                        defaultValue={email}
                        name={'email'}
                        disabled={true}
                    />
                </InputGroup>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
            <Form.Group
                key={'phone'}
                as={Col}
                controlId={'phone'}
                className='justify-content-md-start input-row'
            >
                <Form.Label as={Col}>Phone</Form.Label>
                <InputGroup as={Col} className='input-area'>
                    <Form.Control
                        ref={phoneRef}
                        required={true}
                        type='text'
                        defaultValue={phone}
                        name={'phone'}
                        disabled={true}
                    />
                </InputGroup>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
            <Form.Group
                key={'name'}
                as={Col}
                controlId={'name'}
                className='justify-content-md-start input-row'
            >
                <Form.Label as={Col}>Name</Form.Label>
                <InputGroup as={Col} className='input-area'>
                    <Form.Control
                        ref={nameRef}
                        required={true}
                        type='text'
                        defaultValue={name}
                        name={'name'}
                        disabled={true}
                    />
                </InputGroup>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
            {paymentMethod && <p>•••• •••• •••• {paymentMethod}</p>}
            <Form.Group>
                <CardElement
                    ref={cardRef}
                    options={CARD_OPTIONS}
                    value={'1111 1111'}
                    onChange={(e) => {
                        setError(e.error);
                        setCardComplete(e.complete);
                    }}
                />
            </Form.Group>
            {error && (
                <div style={{ color: 'red' }}>
                    {error.message ||
                        error.raw.message ||
                        JSON.stringify(error)}
                </div>
            )}
            {successMsg && (
                <div style={{ color: 'green' }}>
                    {successMsg.message || JSON.stringify(successMsg)}
                </div>
            )}
            <Row className='justify-content-md-start'>
                <Col>
                    <Button
                        disabled={processing}
                        style={{ marginTop: 30 }}
                        type='submit'
                        className='btn btn-primary'
                    >
                        {processing
                            ? 'Processing...'
                            : subscribe
                            ? 'UPDATE PAYMENT INFO'
                            : 'ENTER PAYMENT INFO'}
                    </Button>
                </Col>
            </Row>
        </Form>
    );
};

export default CheckoutForm;
