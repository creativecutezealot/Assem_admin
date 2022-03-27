import http from './http.service';
import session from './session.service';

const path = {
    connectClubRequest: 'club/connect/user',
    delConnectClubRequest: 'club/connect/user/',
    stripeCustomer: 'stripe/customer',
    stripeSubscribeItem: 'stripe/subscribeItem',
    getUser: 'user',
};

export default {
    connectClubRequest: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.userPost(path.connectClubRequest, body, header);
    },
    delConnectClubRequest: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        const club_id = body.club_id;
        const userid = body.userid;
        const urlpath = `${path.connectClubRequest}/${club_id}/${userid}`;
        return http.userDelete(urlpath, header);
    },
    getCustomer: function (userId) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.get(`${path.stripeCustomer}/${userId}`, header);
    },
    createSubscribeItem: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.userPost(`${path.stripeSubscribeItem}`, body, header);
    },
    cancelSubscribeItem: function (userId, price) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        const urlpath = `${path.stripeSubscribeItem}/${userId}/${price}`;
        return http.userDelete(urlpath, header);
    },
    getUser: function (userId) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        const urlpath = `${path.getUser}/${userId}`;
        return http.userGet(urlpath, header);
    },
};
