import http from './http.service';
import session from './session.service';

const path = {
    login: 'auth/login',
    forgotPass: 'auth/forgotpass',
    confirmPass: 'auth/confirmcodepass',
    updatePass: 'auth/updatePass',
    signup: 'auth/signup',
    getAuthAllUsers: 'auth/getusers',
    updateUser: 'auth/updateUser',
    updateAdmin: 'auth/update',
    createUser: 'auth/create',
    stripeAuthCustomer: 'auth/stripe/customer',
    stripeAuthSubscribe: 'auth/stripe/subscribe',
    stripeAuthSubscribeWithCoupon: 'auth/stripe/subscribewithcoupon',
    sendEmailCode: 'auth/sendEmailCode',
    checkEmailCode: 'auth/checkEmailCode',
    inviteCodeRequest: 'auth/inviteCodeRequest',
    deleteUser: 'user',
    updateUserWithId: 'auth/update/id',
    getallusers: 'getusers',
    getUsers: 'getusers',
    getuserswithoppisite: 'connect/users/opposite',

    // getallevents: 'events',
    getallvcodes: 'vcodes',
    getallacodes: 'acodes',

    /// Club apis

    getallclubs: 'clubs',
    createClub: 'club/create',
    updateClub: 'club',
    deleteClub: 'club',
    clubDetail: 'club/details',
    getUsersWithClubId: 'club/connect/users',
    getClubsWithUserId: 'club/connect/clubs/user',
    getDataWithClubId: 'list',
    delClubConnect: 'club/connect/user',

    requestClub: 'clubreq/request',
    requestClubById: 'clubreq/requests',
    clubManager: 'club/manager',
    clubManagers: 'club/managers',

    /// Club Tiers apis

    getAllClubTiers: 'clubtiers',
    createClubTier: 'clubtier/create',
    updateClubTier: 'clubtier',
    deleteClubTier: 'clubtier',

    /// Email Templates apis

    getAllEmailTemplates: 'emailtemplates',
    createEmailTemplate: 'emailtemplate/create',
    updateEmailTemplate: 'emailtemplate',

    /// Group apis

    getallgroups: 'groups',
    createGroup: 'group/create',
    updateGroup: 'group',
    deleteGroup: 'group',
    groupDetail: 'group/details',
    getUsersWithGroupId: 'group/connect/users',
    getGroupsWithUserId: 'group/connect/clubs/user',
    getDataWithGroupId: 'list',
    delGroupConnect: 'group/connect/user',

    requestGroup: 'groupreq/request',
    requestGroupById: 'groupreq/requests',
    groupManager: 'group/manager',
    groupManagers: 'group/managers',

    getCorporates: 'admin/corporates',
    sendmailofclub: 'admin/sendmailclub',

    // createEvent: 'event/create',
    // inviteClub: 'event/invite',
    // getAssemblies: 'event/getassembles',

    getReqests: 'request/getallrequests',
    approve: 'request/update',

    getallassembles: 'assembles',
    getUsersWithAssembleId: 'assemble/connect/users',
    createAssemble: 'assemble/create',
    updateAssemble: 'assemble/update',
    updateAssembleOrder: 'assemble/order',
    deleteAssemble: 'assemble/delete',
    getAssemble: 'assemble',
    getAssembliesWithUserId: 'assemble/connect/assembles/user',

    getAllEvents: 'events',
    createEvent: 'event/create',
    updateEvent: 'event/update',
    deleteEvent: 'event/delete',
    getEvent: 'event',

    getallaudios: 'audios',
    getallaudioswithuser: 'audio/connect/users',
    createAudio: 'audio/create',
    updateAudio: 'audio/update',
    updateAudioOrder: 'audio/order',
    deleteAudio: 'audio/delete',
    getAudio: 'audio',
    audioIndexing: 'audio/indexing',

    getallvoices: 'voicenotes',
    voicenote: 'voicenote',

    tutoraudio: 'tutoraudio',
    stripeConnect: 'stripe/connect',
    stripeCustomer: 'stripe/customer',
    stripeSubscribe: 'stripe/subscribe',

    getViewersWithAssembleId: 'viewers/channel',

    referral: 'referral',
    referrals: 'referrals',

    clubRoomImage: 'club-room',
    searchPodcast: 'podcast/search',
    getEpisodes: 'podcasts',
    getPaymentMethods: 'stripe/customer/payment_methods',
};

export default {
    login: function (body) {
        return http.post(path.login, body, {});
    },

    forgotPass: function (body) {
        return http.post(path.forgotPass, body, {});
    },

    confirmPass: function (body) {
        return http.post(path.confirmPass, body, {});
    },

    updatePass: function (user_id, body) {
        const urlPath = `${path.updatePass}/${user_id}`
        return http.patch(urlPath, body, {});
    },

    signup: function (body) {
        return http.post(path.signup, body, {});
    },

    getAuthAllUsers: function (body) {
        return http.get(path.getAuthAllUsers, body, {});
    },
    updateUser: function (body) {
        return http.patch(path.updateUser, body, {});
    },
    createAuthCustomer: function (body) {
        return http.post(`${path.stripeAuthCustomer}`, body, {});
    },
    createAuthSubscribe: function (body) {
        return http.post(`${path.stripeAuthSubscribe}`, body, {});
    },
    createAuthSubscribeWithcoupon: function (body) {
        return http.post(`${path.stripeAuthSubscribeWithCoupon}`, body, {});
    },
    sendEmailCode: function (body) {
        return http.post(`${path.sendEmailCode}`, body, {});
    },
    checkEmailCode: function (body) {
        return http.post(`${path.checkEmailCode}`, body, {});
    },
    inviteCodeRequest: function (body) {
        return http.post(`${path.inviteCodeRequest}`, body, {});
    },
    updateAdmin: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        const urlpath = `${path.updateAdmin}`;
        return http.patch(urlpath, body, header);
    },
    createUser: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        const urlpath = `${path.createUser}`;
        return http.post(urlpath, body, header);
    },
    ///delete user
    deleteUser: function (param) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.delete(`${path.deleteUser}/${param}`, header);
    },
    updateUserWithId: function (userid, body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        const urlpath = `${path.updateUserWithId}/${userid}`;
        return http.patch(urlpath, body, header);
    },

    getUsersWithClubId: function (club_id) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        const urlpath = `${path.getUsersWithClubId}/${club_id}`;
        return http.get(urlpath, header);
    },
    getAssembliesWithUserId: function (user_id) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        const urlpath = `${path.getAssembliesWithUserId}/${user_id}`;
        return http.get(urlpath, header);
    },
    getDataWithClubId: function (club_id) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        const urlpath = `${path.getDataWithClubId}/${club_id}?decludeVoice=true`;
        return http.get(urlpath, header);
    },

    getClub: function (club_id) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        const urlpath = `${path.updateClub}/${club_id}`;
        return http.get(urlpath, header);
    },
    createClub: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        body['userid'] = user.user_id;

        return http.postClub(path.createClub, body, header);
    },
    updateClub: function (club_id, body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        const urlpath = `${path.updateClub}/${club_id}`;
        return http.patch(urlpath, body, header);
    },
    deleteClub: function (club_id) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        const urlpath = `${path.deleteClub}/${club_id}`;
        return http.delete(urlpath, header);
    },
    getClubReq: function (club_id, body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        const urlpath = `${path.requestClub}`;
        return http.get(urlpath, header);
    },
    delClubReq: function (club_id, user_id) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        const urlpath = `${path.requestClub}/${club_id}/${user_id}`;
        return http.delete(urlpath, header);
    },
    getClubReqsByClubId: function (club_id) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        const urlpath = `${path.requestClubById}/${club_id}`;
        return http.get(urlpath, header);
    },
    createClubReq: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.postClub(path.requestClub, body, header);
    },
    updateClubReq: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        const urlpath = `${path.requestClub}`;
        return http.patch(urlpath, body, header);
    },
    clubDetail: function (param) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.get(`${path.clubDetail}/${param}`, header);
    },
    clubManager: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        const urlpath = `${path.clubManager}`;
        return http.post(urlpath, body, header);
    },
    getClubByManager: function (param, token) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': token ? token : api_token,
        };

        const urlpath = `${path.clubManager}/${param}`;
        return http.get(urlpath, header);
    },
    getManagersByClub: function (param) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        const urlpath = `${path.clubManagers}/${param}`;
        return http.get(urlpath, header);
    },
    deleteClubConnect: function (club_id, user_id) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        const urlpath = `${path.delClubConnect}/${club_id}/${user_id}`;
        return http.delete(urlpath, header);
    },
    getDataWithGroupId: function (group_id) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        const urlpath = `${path.getDataWithClubId}/${group_id}?decludeVoice=true`;
        return http.get(urlpath, header);
    },

    getGroup: function (group_id) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        const urlpath = `${path.updateGroup}/${group_id}`;
        return http.get(urlpath, header);
    },
    createGroup: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        body['user_id'] = user.user_id;

        return http.postClub(path.createGroup, body, header);
    },
    updateGroup: function (group_id, body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        const urlpath = `${path.updateGroup}/${group_id}`;
        return http.patch(urlpath, body, header);
    },
    deleteGroup: function (group_id) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        const urlpath = `${path.deleteGroup}/${group_id}`;
        return http.delete(urlpath, header);
    },
    getGroupReq: function (group_id, body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        const urlpath = `${path.requestGroup}`;
        return http.get(urlpath, header);
    },
    delGroupReq: function (group_id, user_id) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        const urlpath = `${path.requestGroup}/${group_id}/${user_id}`;
        return http.delete(urlpath, header);
    },
    getGroupReqsByGroupId: function (group_id) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        const urlpath = `${path.requestGroupById}/${group_id}`;
        return http.get(urlpath, header);
    },
    createGroupReq: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.postClub(path.requestGroup, body, header);
    },
    updateGroupReq: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        const urlpath = `${path.requestGroup}`;
        return http.patch(urlpath, body, header);
    },
    groupDetail: function (param) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.get(`${path.groupDetail}/${param}`, header);
    },
    groupManager: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        const urlpath = `${path.groupManager}`;
        return http.post(urlpath, body, header);
    },
    getGroupByManager: function (param, token) {
        const header = {
            'x-access-token': token,
        };

        const urlpath = `${path.groupManager}/${param}`;
        return http.get(urlpath, header);
    },
    getManagersByGroup: function (param) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        const urlpath = `${path.groupManagers}/${param}`;
        return http.get(urlpath, header);
    },
    deleteGroupConnect: function (group_id, user_id) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        const urlpath = `${path.delGroupConnect}/${group_id}/${user_id}`;
        return http.delete(urlpath, header);
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
    /// create event
    // createEvent: function (body) {
    //     const user = session.get('futureof-user');
    //     const api_token = user ? user.api_token : '';
    //     const header = {
    //         'x-access-token': api_token,
    //     };

    //     return http.postEvent(path.createEvent, body, header);
    // },
    // /// send invite the clut
    // inviteClub: function (body) {
    //     const user = session.get('futureof-user');
    //     const api_token = user ? user.api_token : '';
    //     const header = {
    //         'x-access-token': api_token,
    //     };

    //     return http.inviteClub(path.inviteClub, body, header);
    // },
    /// get users
    getUsers: function () {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.get(`${path.getUsers}`, header);
    },
    /// get assemblies for the userid
    getUsersWithOppositeId: function (userid) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.get(`${path.getuserswithoppisite}/${userid}`, header);
    },
    /// get assemblies for the event
    getAssemble: function (param) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.get(`${path.getAssemble}/${param}`, header);
    },
    // getAssemblies: function (param) {
    //     const user = session.get('futureof-user');
    //     const api_token = user ? user.api_token : '';
    //     const header = {
    //         'x-access-token': api_token,
    //     };
    //     return http.get(`${path.getAssemblies}/${param}`, header);
    // },
    /// get assemblies for the userid
    getUsersWithAssembleId: function (userid) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.get(`${path.getUsersWithAssembleId}/${userid}`, header);
    },
    getViewersWithAssembleId: function (assembleId) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.get(
            `${path.getViewersWithAssembleId}/${assembleId}`,
            header
        );
    },
    getClubsWithUserId: function (user_id) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        const urlpath = `${path.getClubsWithUserId}/${user_id}`;
        return http.get(urlpath, header);
    },
    /// create assemble
    createAssemble: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.postEvent(path.createAssemble, body, header);
    },
    /// update assemble
    updateAssemble: function (assemble_id, body) {
        console.log('this is the assemble id ' + assemble_id);
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.patch(
            `${path.updateAssemble}/${assemble_id}`,
            body,
            header
        );
    },
    updateAssembleOrder: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.patch(`${path.updateAssembleOrder}`, body, header);
    },
    ///delete assemble
    deleteAssemble: function (param) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.delete(`${path.deleteAssemble}/${param}`, header);
    },

    getAllEvents: function () {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.get(`${path.getAllEvents}`, header);
    },

    /// create event
    createEvent: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.postEvent(path.createEvent, body, header);
    },
    /// update event
    updateEvent: function (event_id, body) {
        console.log('this is the event id ' + event_id);
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.patch(
            `${path.updateEvent}/${event_id}`,
            body,
            header
        );
    },
    ///delete event
    deleteEvent: function (param) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.delete(`${path.deleteEvent}/${param}`, header);
    },

    getEvent: function (param) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.get(`${path.getEvent}/${param}`, header);
    },

    /// get an audio
    getAudio: function (param) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.get(`${path.getAudio}/${param}`, header);
    },
    /// get audios for the userid
    getAudiosWithUserId: function (userid) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.get(`${path.getallaudioswithuser}/${userid}`, header);
    },
    /// create audio
    createAudio: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.postEvent(path.createAudio, body, header);
    },
    /// update audio
    updateAudio: function (audio_id, body) {
        console.log('this is the audio id ' + audio_id);
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.patch(`${path.updateAudio}/${audio_id}`, body, header);
    },
    updateAudioOrder: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.patch(`${path.updateAudioOrder}`, body, header);
    },
    ///delete audio
    deleteAudio: function (param) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.delete(`${path.deleteAudio}/${param}`, header);
    },
    /// get requests from user
    getReqests: function () {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.get(`${path.getReqests}`, header);
    },
    /// request approve or denied
    approve: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.postEvent(path.approve, body, header);
    },
    getAllUsers: function () {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.get(`${path.getallusers}`, header);
    },
    getAllClubs: function () {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.get(`${path.getallclubs}`, header);
    },
    getAllGroups: function () {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.get(`${path.getallgroups}`, header);
    },
    getAllAssembles: function () {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.get(`${path.getallassembles}`, header);
    },
    getAllAudios: function () {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.get(`${path.getallaudios}`, header);
    },
    // getAllEvents: function () {
    //     const user = session.get('futureof-user');
    //     const api_token = user ? user.api_token : '';
    //     const header = {
    //         'x-access-token': api_token,
    //     };

    //     return http.get(`${path.getallevents}`, header);
    // },
    getAllVcodes: function () {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.get(`${path.getallvcodes}`, header);
    },
    deleteVcode: function (pcode) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.delete(`${path.getallvcodes}/${pcode}`, header);
    },
    getAllAcodes: function () {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };

        return http.get(`${path.getallacodes}`, header);
    },
    getConfirmVcode: function (code) {
        const path = `vcode/confirm/${code}`;
        return http.get(path);
    },

    /// VOice note
    /// get an audio
    getVoiceNotes: function () {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.get(`${path.getallvoices}`, header);
    },
    deleteVoiceNote: function (receiver_id, voicenote_id) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.delete(
            `${path.voicenote}/${receiver_id}/${voicenote_id}`,
            header
        );
    },
    createVoiceNotes: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.post(`${path.getallvoices}`, body, header);
    },
    deleteVoiceNotes: function (audio_id) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.delete(`${path.getallvoices}/${audio_id}`, header);
    },

    // tutor audio
    getTutorAudio: function () {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.get(`${path.tutoraudio}`, header);
    },
    updateTutorAudio: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.patch(`${path.tutoraudio}`, body, header);
    },
    createTutorAudio: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.post(`${path.tutoraudio}`, body, header);
    },
    createStripeConnect: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.post(`${path.stripeConnect}`, body, header);
    },
    getStripeConnect: function (clubId) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.get(`${path.stripeConnect}/${clubId}`, header);
    },
    getCustomer: function (userId) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.get(`${path.stripeCustomer}/${userId}`, header);
    },
    createCustomer: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.post(`${path.stripeCustomer}`, body, header);
    },
    createSubscribe: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.post(`${path.stripeSubscribe}`, body, header);
    },
    getPaymentMethods: function (customer, type) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        const urlpath = `${path.getPaymentMethods}/${customer}/${type}`;
        return http.get(`${urlpath}`, header);
    },
    createReferral: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.post(`${path.referral}`, body, header);
    },
    deleteReferral: function (id) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.delete(`${path.referral}/${id}`, header);
    },
    getReferrals: function () {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.get(`${path.referrals}`, header);
    },
    getReferralsByClubId: function (clubId) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.get(`${path.referrals}/club/${clubId}`, header);
    },
    getReferralsByUserId: function (userId) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.get(`${path.referrals}/user/${userId}`, header);
    },
    createAudioIndexing: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.post(`${path.audioIndexing}`, body, header);
    },
    updateAudioIndexing: function (body, audio_id, indexing_id) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.patch(
            `${path.audioIndexing}/${audio_id}/${indexing_id}`,
            body,
            header
        );
    },
    deleteAudioIndexing: function (audio_id, indexing_id) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.delete(
            `${path.audioIndexing}/${audio_id}/${indexing_id}`,
            header
        );
    },
    getAudioIndexings: function (audio_id) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.get(`${path.audioIndexing}/${audio_id}`, header);
    },
    createClubRoomImage: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.post(`${path.clubRoomImage}/image`, body, header);
    },
    deleteClubRoomImage: function (club_id, image_id) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.delete(
            `${path.clubRoomImage}/image/${club_id}/${image_id}`,
            header
        );
    },
    getClubImages: function (club_id) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.get(`${path.clubRoomImage}/images/${club_id}`, header);
    },
    searchPodcast: function (q, sort_by_date = 0, type = 'episode', offset = 0) {
        if (q === undefined && q === '') {
            return;
        }

        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.get(
            `${path.searchPodcast}?q=${q}&sort_by_date=${sort_by_date}&type=${type}&offset=${offset}`,
            header
        );
    },

    getEpisodes: function (podcastId) {
        if (podcastId === undefined && podcastId === '') {
            return;
        }
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.get(`${path.getEpisodes}/${podcastId}`, header);
    },
    getAllClubTiers: function () {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.get(`${path.getAllClubTiers}`, header);
    },
    getClubTier: function (clubtier_id) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        const urlpath = `${path.updateClubTier}/${clubtier_id}`;
        return http.get(urlpath, header);
    },
    createClubTier: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.post(`${path.createClubTier}`, body, header);
    },
    updateClubTier: function (clubtier_id, body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        const urlpath = `${path.updateClubTier}/${clubtier_id}`;
        console.log('body: ', body);
        return http.patch(urlpath, body, header);
    },
    deleteClubTier: function (clubtier_id) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        const urlpath = `${path.deleteClubTier}/${clubtier_id}`;
        return http.delete(urlpath, header);
    },

    getAllEmailTemplates: function () {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.get(`${path.getAllEmailTemplates}`, header);
    },

    createEmailTemplate: function (body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        return http.post(`${path.createEmailTemplate}`, body, header);
    },

    updateEmailTemplate: function (template_id, body) {
        const user = session.get('futureof-user');
        const api_token = user ? user.api_token : '';
        const header = {
            'x-access-token': api_token,
        };
        const urlpath = `${path.updateEmailTemplate}/${template_id}`;
        console.log('body: ', body);
        return http.patch(urlpath, body, header);
    },
};
