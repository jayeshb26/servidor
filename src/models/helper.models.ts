import { Setting } from './setting.models';
import { Constants } from './constants.models';
import { StatusLog } from './status-log.models';
import moment from 'moment';

export class Helper {
    static getChatChild(userId: string, myId: string) {
        //example: userId="9" and myId="5" -->> chat child = "5-9"
        let values = [userId, myId];
        values.sort((one, two) => (one > two ? -1 : 1));
        return values[0] + "-" + values[1];
    }

    static getLocale(): string {
        let sl = window.localStorage.getItem(Constants.KEY_LOCALE);
        return sl && sl.length ? sl : "en";
    }

    static formatMillisDateTime(millis: number, locale: string): string {
        return moment(millis).locale(locale).format("ddd, MMM D | h:mm A");
    }

    static formatTimestampDateTime(timestamp: string, locale: string): string {
        return moment(timestamp).locale(locale).format("ddd, MMM D | h:mm A");
    }

    static formatMillisDate(millis: number, locale: string): string {
        return moment(millis).locale(locale).format("DD MMM YYYY");
    }

    static formatTimestampDate(timestamp: string, locale: string): string {
        return moment(timestamp).locale(locale).format("DD MMM YYYY");
    }

    static formatMillisTime(millis: number, locale: string): string {
        return moment(millis).locale(locale).format("h:mm");
    }

    static formatTimestampTime(timestamp: string, locale: string): string {
        return moment(timestamp).locale(locale).format("h:mm");
    }

    static getSetting(settingKey: string) {
        let settings: Array<Setting> = JSON.parse(window.localStorage.getItem(Constants.KEY_SETTING));
        let toReturn: string;
        if (settings) {
            for (let s of settings) {
                if (s.key == settingKey) {
                    toReturn = s.value;
                    break;
                }
            }
        }
        if (!toReturn) toReturn = "";
        return toReturn;
    }

    static getLogTimeForStatus(status: string, logs: Array<StatusLog>) {
        let toReturn = "";
        if (status && logs) {
            for (let log of logs) {
                if (log.status == status) {
                    toReturn = log.created_at;
                    break;
                }
            }
        }
        return toReturn;
    }

    static isValidURL(string: string) {
        if (!string) return false;
        if (!(string.startsWith("http://") || string.startsWith("https://"))) return false;
        var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
        return res != null;
    }

}