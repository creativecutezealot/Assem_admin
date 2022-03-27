import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import './payment.scss';
import { Form, Button, Row, Col, Image } from 'react-bootstrap';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    CardNumberElement,
    CardExpiryElement,
    CardCvcElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { Link } from 'react-router-dom';

import adminApi from '../../../services/admin.service';
import userApi from '../../../services/user.service';
import session from '../../../services/session.service';
import helper from '../../../services/helper.service';

import environment from '../../../enviroments';
import stripeApi from '../../../services/stripe.service';

const stripePromise = loadStripe(environment.STRIPE_PUBLIC);

const createOptions = (padding) => {
    return {
        style: {
            base: {
                fontSize: '16px',
                color: '#ffffff',
                letterSpacing: '0.025em',
                fontFamily: 'SweetSans-SC, Sweet Sans',
                '::placeholder': {
                    color: '#7d7d7d',
                    fontSize: '14px'
                },
                textAlign: 'center',
                ...(padding ? { padding } : {}),
            },
            invalid: {
                color: '#9e2146',
            },
        },
    };
};

const CheckoutForm = (props) => {
    const stripe = useStripe();
    const elements = useElements();
    const [coupon, setCoupon] = useState('');
    //   const [error, setError] = useState(null);
    //   const [successMsg, setSuccessMsg] = useState(null);
    //   const [cardComplete, setCardComplete] = useState(false);
    //   const [processing, setProcessing] = useState(false);
    //   const [paymentMethod, setPaymentMethod] = useState(null);
    //   const [customer, setCustomer] = useState(null);
    //   const [paymentIntent, setPaymentIntent] = useState(null);
    const [subscribe, setSubscribe] = useState(null);
    const [cardNumber, setCardNumber] = useState(false);
    const [cardSetup, setCardSetup] = useState(null);
    const history = useHistory();
    const currentUser = session.get('currentUser');
    const club = props.location.state ? props.location.state.club : null;
    const priceId = props.location.state ? props.location.state.priceId : null;
    const price = props.location.state ? props.location.state.price : null;

    useEffect(() => {
        if (!currentUser) {
            history.push('/signup');
            setCoupon('');
            return;
        } else {
            console.log('priceId: ', priceId);
            console.log('club: ', club);
            getCustomer();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getCustomer = async () => {
        try {
            const res = await adminApi.getCustomer(currentUser.user_id);
            if (res.status) {
                setCardSetup(res.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // const handleInputChange = (event) => {
    //     let target = event.target;
    //     let name = target.name;
    //     let value = target.value;
    //     console.log('coupon: ', value);
    //     setCoupon(value);

    // }

    const createCustomer = async (body) => {
        try {
            const result = await stripeApi.createAuthCustomer(body);
            console.log(result);
            if (result.status) {
                if (result.customer) {
                    //   setCustomer(result.customer);
                }
                if (result.setupIntent) {
                    //   setPaymentIntent(result.setupIntent);
                }
                return {
                    customer: result.customer,
                    paymentIntent: result.setupIntent,
                };
            } else {
                // setProcessing(false);
                // setError(result.error);
                return {
                    customer: null,
                    paymentIntent: null,
                };
            }
        } catch (error) {
            //   setProcessing(false);
            //   setError(error);
            return {
                customer: null,
                paymentIntent: null,
            };
        }
    };

    const createSubScribe = async (body) => {
        try {
            const result = await stripeApi.createAuthSubscribe(body);
            if (result.status) {
                if (result.subscription) {
                    return result.subscription;
                }
                return null;
            } else {
                // setProcessing(false);
                // setError(result.error);
                return null;
            }
        } catch (error) {
            //   setProcessing(false);
            //   setError(error);
            return null;
        }
    };

    const createSubscribeWithCoupon = async (body) => {
        try {
            console.log('create subscribe with coupon: ', body);
            const result = await stripeApi.createAuthSubscribeWithcoupon(body);
            console.log('create subscribe with coupon: ', result);
            if (result.status) {
                if (result) {
                    return result;
                }
                return null;
            } else {
                // setProcessing(false);
                // setError(result.error);
                return null;
            }
        } catch (error) {
            //   setProcessing(false);
            //   setError(error);
            return null;
        }
    };

    const joinClub = async () => {
        try {
            const joinClubRes = await userApi.connectClubRequest({
                club_id: club.club_id,
                userid: currentUser.user_id,
                isJoined: true,
            });

            if (joinClubRes.status) {
                return true;
            } else {
                helper.showToast('Error', joinClubRes.data, 3);
                return false;
            }
        } catch (error) {
            console.log('joinClub error: ', error);
            helper.showToast('Error', error.message, 3);
            return false;
        }
    };

    const handleNext = async (event) => {
        event.preventDefault();
        try {
            const userid = currentUser.user_id;
            const name = currentUser.first_name + ' ' + currentUser.last_name;
            const email = currentUser.email;
            const phone = currentUser.phone_number || '';
            const address = currentUser.address || '';
            if (!stripe || !elements) {
                // Stripe.js has not loaded yet. Make sure to disable
                // form submission until Stripe.js has loaded.
                helper.showToast('Error', 'Stripe.js has not loaded yet', 3);
                return;
            }
            // Get a reference to a mounted CardElement. Elements knows how
            // to find your CardElement because there can only ever be one of
            // each type of element.

            if (!cardNumber && coupon === '') {
                helper.showToast(
                    'Error',
                    'Fill in your card number or coupon code',
                    3
                );
                return;
            } else if (cardNumber && coupon !== '') {
                helper.showToast(
                    'Error',
                    'Choose only one of your card number and coupon code',
                    3
                );
                return;
            }

            if (coupon !== '') {
                console.log('coupon: ', coupon);
                // setError(null);
                // setSuccessMsg(null);
                const { customer, paymentIntent } = await createCustomer({
                    name: name,
                    email: email,
                    phone: phone,
                    address: address,
                    userid: userid,
                });
                if (!paymentIntent) {
                    return;
                }

                if (!customer) {
                    return;
                }

                const params = {
                    customerId: customer.id,
                    price_id: priceId,
                    userid: userid,
                    coupon: coupon,
                };

                const subscribeRes = await createSubscribeWithCoupon(params);
                console.log('subscribeRes: ', subscribeRes);
                if (!subscribeRes) {
                    return;
                }
                // setError(null);
                if (subscribe) {
                    //   setSuccessMsg({
                    //     message: 'Coupon information successfully updated!',
                    //   });
                    helper.showToast(
                        'Success',
                        'Coupon successfully updated!',
                        1
                    );
                    await updateUser(userid);
                } else {
                    //   setSuccessMsg({
                    //     message: 'Coupon successfully entered!',
                    //   });
                    helper.showToast(
                        'Success',
                        'Coupon successfully entered!',
                        1
                    );
                    await updateUser(userid);
                }
                setSubscribe(subscribeRes);
                // setProcessing(false);
                return;
            } else {
                const cardElement = elements.getElement(CardNumberElement);

                // setError(null);
                // setSuccessMsg(null);
                const { customer, paymentIntent } = await createCustomer({
                    name: name,
                    email: email,
                    phone: phone,
                    address: address,
                    userid: userid,
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
                            card: cardElement,
                            billing_details: {
                                name: name,
                                email: email,
                                // phone: phone,
                                // address: address
                            },
                        },
                    }
                );

                if (payload.error) {
                    console.log('confirmcardsetup error: ', payload.error);
                    //   setProcessing(false);
                    //   setError(payload.error);
                    //   setSuccessMsg(null);
                    return;
                }

                console.log('payload: ', payload);

                const subscribeRes = await createSubScribe({
                    customerId: customer.id,
                    paymentMethodId: payload.setupIntent.payment_method,
                    price_id: priceId,
                    userid: userid,
                });

                console.log('subscribeRes: ', subscribeRes);
                if (!subscribeRes) {
                    helper.showToast('Error', 'Subscribe is not created!', 3);
                    return;
                }
                // setError(null);
                // setSuccessMsg({
                //   message: 'Credit card information successfully updated!',
                // });
                helper.showToast(
                    'Success',
                    'Credit card information successfully updated!',
                    1
                );
                await updateUser(userid);
                setSubscribe(subscribeRes);
                // setProcessing(false);
            }
        } catch (error) {
            console.error(error);
            helper.showToast('Error', error.message, 3);
        }
    };

    const updateUser = async (userid) => {
        const data = {
            approved: true,
            userid: userid,
            onboarding: 'complete'
        };
        try {
            const updateRes = await adminApi.updateUser(data);
            if (updateRes.status) {
                await joinClub();
                console.log('updateRes: ', updateRes.data);
                session.clear();
                session.set('audio-club', club);
                session.set('futureof-user', updateRes.data);
                window.location.href = '/user';
            } else {
                helper.showToast('Error', updateRes.data, 3);
            }
        } catch (error) {
            helper.showToast(
                'Error',
                'Failed to update profile. Please try again',
                3
            );
        }
    };

    const handleBlur = () => {
        console.log('[blur]');
    };

    const handleChange = (change) => {
        console.log('[change]', change);
        if (change.elementType === 'cardNumber') {
            if (change.complete === true) {
                setCardNumber(true);
            } else {
                setCardNumber(false);
            }
        }
    };

    // const handleClick = () => {
    //     console.log('[click]');
    // }

    const handleFocus = () => {
        console.log('[focus]');
    };

    const handleReady = () => {
        console.log('[ready]');
    };

    const goBack = (event) => {
        event.preventDefault();
        history.goBack();
    };

    return (
        <div className='payment'>
            <div className='stepper'>
                <div className='container'>
                    <div className='title'>STEP 8/8</div>
                    <div className='step step1'>
                        <div>
                            <div className='circle'></div>
                        </div>
                    </div>
                    <div className='step step1'>
                        <div>
                            <div className='circle'></div>
                        </div>
                    </div>
                    <div className='step step1'>
                        <div>
                            <div className='circle'></div>
                        </div>
                    </div>
                    <div className='step step2'>
                        <div>
                            <div className='circle'></div>
                        </div>
                    </div>
                    <div className='step step2'>
                        <div>
                            <div className='circle'></div>
                        </div>
                    </div>
                    <div className='step step2'>
                        <div>
                            <div className='circle'></div>
                        </div>
                    </div>
                    <div className='step step2'>
                        <div>
                            <div className='circle'></div>
                        </div>
                    </div>
                    <div className='step step-active step2'>
                        <div>
                            <div className='circle'></div>
                        </div>
                    </div>
                </div>

            </div>
            <Form className='signup-form' onSubmit={handleNext}>
                <div className='d-flex align-items-center justify-content-center'>
                    <img
                        className='auth-logo'
                        src={require('../../../assets/logo.svg')}
                        alt=''
                    />
                </div>
                <h5 className='d-flex align-items-center justify-content-center text-center mt-3 mb-4 title'>
                    ENTER PAYMENT INFO
                </h5>
                <Col md={{ span: 6, offset: 3 }} className='d-flex flex-row mb-4 p-0 club-card'>
                    <div className='d-flex align-items-center justify-content-center'
                        style={{
                            backgroundImage: `url(${club?.banner_url})`,
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: 'cover',
                            flexDirection: 'column',
                            borderTopLeftRadius: '6px',
                            borderBottomLeftRadius: '6px',
                            width: '600px'
                        }}
                    >
                    </div>
                    <div className='d-flex flex-column align-items-center justify-content-center mr-auto ml-auto'>
                        <div className='d-flex align-items-center justify-content-center p-1 name'>
                            {club?.club_name} <br></br> {club?.memebership.toUpperCase()} CLUB
                        </div>
                        <div className='d-flex align-items-center justify-content-center p-1 tier'>
                            <span style={{ marginTop: '-10px', fontSize: '16px' }}>$</span><span className='mr-2' style={{ fontSize: '30px', fontWeight: 'bold' }}>{price}</span> PER MONTH
                        </div>
                        <div className='d-flex align-items-center justify-content-center p-1 cancel'>
                            CANCEL ANYTIME
                        </div>
                    </div>
                    <div className='d-flex align-items-center justify-content-center'
                        style={{ backgroundColor: '#2d313f', width: '80px', borderTopRightRadius: '6px', borderBottomRightRadius: '6px' }}
                    >
                        <Image src={require('../../../assets/icon/check_mark_icon.svg')} width={40} />
                    </div>
                </Col>

                {!cardSetup && (
                    <>
                        <div className='d-flex align-content-center justify-content-center'>
                            <Form.Group className='form-group mb-2 mt-4'>
                                <CardNumberElement
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    onFocus={handleFocus}
                                    onReady={handleReady}
                                    options={createOptions()}
                                />
                            </Form.Group>
                        </div>
                        <div className='d-flex align-content-center justify-content-center'>
                            <Form.Group className='form-group mb-2'>
                                <CardExpiryElement
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    onFocus={handleFocus}
                                    onReady={handleReady}
                                    options={createOptions()}
                                />
                            </Form.Group>
                        </div>
                        <div className='d-flex align-content-center justify-content-center'>
                            <Form.Group className='form-group mb-4'>
                                <CardCvcElement
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    onFocus={handleFocus}
                                    onReady={handleReady}
                                    options={createOptions()}
                                />
                            </Form.Group>
                        </div>
                        {/* <div className='d-flex align-items-center justify-content-center text-center mt-2 mb-2'>
                    OR
                </div>
                <Form.Group className='form-group'>
                    <Form.Control
                        type='text'
                        className='register-form-input'
                        placeholder='COUPON CODE'
                        name='coupon'
                        required
                        value={coupon}
                        onChange={handleInputChange}
                    />
                </Form.Group> */}
                    </>
                )}
                <div className='d-flex align-items-center justify-content-center'>
                    <Button
                        type='submit'
                        className='btn btn-primary register-btn'
                        onClick={handleNext}
                        disabled={!stripe}
                    >
                        AGREE & SUBSCRIBE
                    </Button>
                </div>
                <div className='d-flex align-items-center justify-content-center mt-4 join-now'>
                    <Link to='#' onClick={goBack} className='join-now-link'>
                        <span>{'< '}GO BACK</span>
                    </Link>
                </div>
                <div className='d-flex align-items-center justify-content-center text-center mt-4'>
                    <p className='description'>TO AVOID AUTO-RENEW CHARGES, CANCEL AT LEAST 24 HOURS BEFORE
                        CURRENT BILLING PERIOD ENDS. CANCEL ANYTIME BY VISITING THE
                        MY ACCOUNT SECTION. RENEWAL CHARGES WILL BE APPLIED TO THE
                        PAYMENT METHOD ASSOCIATED WITH YOUR ACCOUNT, AND YOU HEREBY
                        AUTHORIZE ASSEMBLY OR ITS DESIGNEE TO MAKE SUCH CHARGE.
                        SUBSCRIPTION FEES ARE NON-REFUNDABLE. ALL PRICES LISTED ARE
                        IN U.S. DOLLARS.</p>
                </div>
            </Form>
            <div className='background-overlay'></div>
            <video className='video' autoPlay loop muted>
                <source src={require('../../../assets/video/background.mp4')} />
            </video>
        </div>
    );
};

const Payment = (props) => {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutForm {...props} />
        </Elements>
    );
};

export default Payment;
