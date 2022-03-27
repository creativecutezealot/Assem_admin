import environment from '../enviroments';

export default {
    post: function (path, body, headers = {}) {
        return fetch(`${environment.baseApi}/${path}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                ...headers,
            },
            //make sure to serialize your JSON body
            body: JSON.stringify(body),
        }).then((response) => response.json());
    },
    postClub: function (path, body, headers = {}) {
        return fetch(`${environment.baseApi}/${path}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                ...headers,
            },
            //make sure to serialize your JSON body
            body: JSON.stringify(body),
        }).then((response) => response.json());
    },
    get: function (path, headers = {}) {
        return fetch(`${environment.baseApi}/${path}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                ...headers,
            },
        }).then((response) => response.json());
    },

    patch: function (path, body, headers = {}) {
        console.log('data: ', body);
        try {
            return fetch(`${environment.baseApi}/${path}`, {
                method: 'PATCH',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    ...headers,
                },
                body: JSON.stringify(body),
            }).then((response) => response.json());
        } catch (error) {
            console.log('error', error);
        }
    },
    delete: function (path, headers = {}) {
        return fetch(`${environment.baseApi}/${path}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                ...headers,
            },
            //make sure to serialize your JSON body
        }).then((response) => response.json());
    },
    mailclub: function (path, body, headers = {}) {
        let data = {
            club_url: body,
        };
        return fetch(`${environment.baseApi}/${path}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                ...headers,
            },
            body: JSON.stringify(data),
        }).then((response) => response.json());
    },
    memberRequest: function (path, body, headers = {}) {
        return fetch(`${environment.baseApi}/${path}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                ...headers,
            },
            //make sure to serialize your JSON body
            body: JSON.stringify(body),
        }).then((response) => response.json());
    },
    /// create event
    postEvent: function (path, body, headers = {}) {
        return fetch(`${environment.baseApi}/${path}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                ...headers,
            },
            //make sure to serialize your JSON body
            body: JSON.stringify(body),
        }).then((response) => response.json());
    },
    /// send invite
    inviteClub: function (path, body, headers = {}) {
        return fetch(`${environment.baseApi}/${path}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                ...headers,
            },
            //make sure to serialize your JSON body
            body: JSON.stringify(body),
        }).then((response) => response.json());
    },

    userGet: function (path, headers = {}) {
        return fetch(`${environment.userbaseApi}/${path}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                ...headers,
            },
            //make sure to serialize your JSON body
        }).then((response) => response.json());
    },

    userPost: function (path, body, headers = {}) {
        return fetch(`${environment.userbaseApi}/${path}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                ...headers,
            },
            //make sure to serialize your JSON body
            body: JSON.stringify(body),
        }).then((response) => response.json());
    },

    userPatch: function (path, body, headers = {}) {
        return fetch(`${environment.userbaseApi}/${path}`, {
            method: 'PATCH',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                ...headers,
            },
            //make sure to serialize your JSON body
            body: JSON.stringify(body),
        }).then((response) => response.json());
    },

    userDelete: function (path, headers = {}) {
        return fetch(`${environment.userbaseApi}/${path}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                ...headers,
            },
            //make sure to serialize your JSON body
        }).then((response) => response.json());
    },
};
