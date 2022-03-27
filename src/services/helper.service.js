import { store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';
import 'animate.css';
import { EventEmitter } from './events';
import moment from 'moment-timezone';

export default {
    showToast: function (title, message, type_code) {
        let type = 'default';

        switch (type_code) {
        case 1:
            type = 'success';
            break;
        case 2:
            type = 'warning';
            break;
        case 3:
            type = 'danger';
            break;
        case 4:
            type = 'info';
            break;
        default:
            type = 'default';
            break;
        }

        store.addNotification({
            title: title,
            message: message,
            type: type, // 'default', 'success', 'info', 'warning'
            container: 'top-right', // where to position the notifications
            animationIn: ['animated', 'fadeIn'], // animate.css classes that's applied
            animationOut: ['animated', 'fadeOut'], // animate.css classes that's applied
            dismiss: {
                duration: 3000,
            },
        });
    },
    startLoader: function () {
        EventEmitter.dispatch('loader', true);
    },
    stopLoader: function () {
        EventEmitter.dispatch('loader', false);
    },
    isURL: function (url) {
        const pattern =
            /[(http(s)?)://(www.)?a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;
        return pattern.test(url);
    },
    getCurrentLocalTime: function (time) {
        const currentTimeZone = moment.tz.guess();
        console.log(currentTimeZone);
        const currentLocalTime = moment.tz(time, currentTimeZone);
        console.log(currentLocalTime);
        const currentConvertedTime = currentLocalTime
            .clone()
            .tz('America/Los_Angeles')
            .utc()
            .format();
        console.log(currentConvertedTime);
        return currentConvertedTime;
    },
    getUri: function (uri = '') {
        if (uri.includes('http')) {
            return uri;
        } else {
            return `http://${uri}`;
        }
    },
    getDisplayName: function (text, frontSign = '@') {
        if (text && text !== '') {
            return `${frontSign}${text.replace(/\s/g, '').trim()}`;
        }
        return '';
    },
    getTime: function (date) {
        return moment(date).format('YYYY/MM/DD: HH:mm');
    },
    assembleStarted: function (item) {
        const startTime = moment.tz(item.start_time, 'America/Los_Angeles');
        const currrentTime = moment().tz('America/Los_Angeles');
        const isStarted =
            item.is_immediately || startTime.unix() < currrentTime.unix();
        return isStarted;
    },
};
