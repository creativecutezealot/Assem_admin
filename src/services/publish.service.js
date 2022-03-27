import http from './http.service';
import session from './session.service';

const path = {
    clubrequest: 'club/request',
    createClub: 'club/create',
    clubDetail: 'club/details',
    getCorporates: 'admin/corporates',
    sendmailofclub: 'admin/sendmailclub',
};

export default {
    clubrequest: function (data) {
        return http.memberRequest(path.clubrequest, data, {});
    },
    createClub: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.postClub(path.createClub, body, header);
    },
    clubDetail: function (param) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.get(`${path.clubDetail}/${param}`, header);
    },
    getCorporates: function () {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.post(path.getCorporates, {}, header);
    },
    sendmailofclub: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.mailclub(path.sendmailofclub, body, header);
    },
};
