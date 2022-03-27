// import Stripe from 'stripe';
import envrionment from '../enviroments/development';
import session from './session.service';
import adminService from './admin.service';
import moment from 'moment';

const querystring = require('querystring');
export default {
    getStripeStandardOAuthLink: () => {
        const user = session.get('futureof-user');
        const club = session.get('futureof-club');
        const clientId = envrionment.STRIPE_CLIENT_ID;
        const stripeConnectParams = {
            client_id: clientId,
            scope: 'read_write',
            response_type: 'code',
            'stripe_user[email]': user.email,
            'stripe_user[first_name]': user.first_name,
            'stripe_user[last_name]': user.last_name,
            'stripe_user[country]': user.country,
            'stripe_user[phone_number]': user.phone_number,
            'stripe_user[business_name]': club.club_name,
            'stripe_user[business_type]': 'corporation',
            'stripe_user[dob_day]': moment(user.birth).format('DD'),
            'stripe_user[dob_month]': moment(user.birth).format('MM'),
            'stripe_user[dob_year]': moment(user.birth).format('YYYY'),
            'stripe_user[street_address]': user.address,
            'stripe_user[city]': user.city,
            'stripe_user[state]': user.location_state,
            'stripe_user[physical_product]': false,
            redirect_uri: `${window.origin}/manager/profile`,
        };
        console.log('stripeConnectParams', stripeConnectParams);
        const reqQuery = querystring.stringify(stripeConnectParams);

        const location = `https://connect.stripe.com/oauth/authorize?${reqQuery}`;
        return location;
    },

    createStripeConnectRequest: async (code) => {
        const club = session.get('futureof-club');
        adminService
            .createStripeConnect({ code, clubId: club.club_id })
            .then((data) => {
                console.log('make connect', data);
                window.location.replace('/manager/profile');
            })
            .catch((error) => {
                console.log('make connect', error);
                window.location.replace('/manager/profile');
            });
    },
    getStripeConnect: async () => {
        const club = session.get('futureof-club');
        return await adminService.getStripeConnect(club.club_id);
    },
    createCustomer: async (body) => {
        return await adminService.createCustomer(body);
    },
    getCustomer: async (userId) => {
        return await adminService.getCustomer(userId);
    },
    createSubScribe: async (body) => {
        return await adminService.createSubscribe(body);
    },
    createAuthCustomer: async (body) => {
        return await adminService.createAuthCustomer(body);
    },
    createAuthSubscribe: async (body) => {
        return await adminService.createAuthSubscribe(body);
    },
    createAuthSubscribeWithcoupon: async (body) => {
        return await adminService.createAuthSubscribeWithcoupon(body);
    },
    getPaymentMethods: async (customer, type) => {
        return await adminService.getPaymentMethods(customer, type);
    },
};
