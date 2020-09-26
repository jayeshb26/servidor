import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/concatMap';
import { Observable } from "rxjs/Observable";
import { APP_CONFIG, AppConfig } from "../app/app.config";
import { Country } from '../models/country.models';
import { Setting } from '../models/setting.models';
import { ResetPasswordResponse } from '../models/reset-password-request.models';
import { AuthResponse } from '../models/auth-response.models';
import { SignUpRequest } from '../models/signup-request.models';
import { BaseListResponse } from '../models/base-list.models';
import { Profile } from '../models/profile.models';
import { ProfileUpdateRequest } from '../models/profile-update-request.models';
import { SupportRequest } from '../models/support-request.models';
import { Appointment } from '../models/appointment.models';
import { User } from '../models/user.models';
import { Rating } from '../models/rating.models';
import { Plan } from '../models/plan.models';
import { PlanDetail } from '../models/plan-detail.models';
import { ProviderPortfolio } from '../models/provider-portfolio.models';
import { SocialLoginRequest } from '../models/sociallogin-request.models';
import { Faq } from '../models/faq.models';
import { Helper } from '../models/helper.models';
import moment from 'moment';
import { Payment } from '../models/payment.models';

@Injectable()
export class ClientService {
    constructor(@Inject(APP_CONFIG) private config: AppConfig, private http: HttpClient) {

    }

    public getCountries(): Observable<Array<Country>> {
        return this.http.get<Array<Country>>('./assets/json/countries.json').concatMap((data) => {
            return Observable.of(data);
        });
    }

    public getSettings(): Observable<Array<Setting>> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' });
        return this.http.get<Array<Setting>>(this.config.apiBase + "api/settings", { headers: myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public forgetPassword(resetRequest: any): Observable<ResetPasswordResponse> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' });
        return this.http.post<ResetPasswordResponse>(this.config.apiBase + "api/forgot-password", JSON.stringify(resetRequest), { headers: myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public login(loginTokenRequest: any): Observable<AuthResponse> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' });
        return this.http.post<AuthResponse>(this.config.apiBase + "api/login", JSON.stringify(loginTokenRequest), { headers: myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public loginSocial(socialLoginRequest: SocialLoginRequest): Observable<AuthResponse> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' });
        return this.http.post<AuthResponse>(this.config.apiBase + "api/social/login", socialLoginRequest, { headers: myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public signUp(signUpRequest: SignUpRequest): Observable<AuthResponse> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' });
        return this.http.post<AuthResponse>(this.config.apiBase + "api/register", JSON.stringify(signUpRequest), { headers: myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public verifyMobile(verifyRequest: any): Observable<AuthResponse> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' });
        return this.http.post<AuthResponse>(this.config.apiBase + "api/verify-mobile", JSON.stringify(verifyRequest), { headers: myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public checkUser(checkUserRequest: any): Observable<{}> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json' });
        return this.http.post<{}>(this.config.apiBase + "api/check-user", JSON.stringify(checkUserRequest), { headers: myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public updateProfile(token: string, profileRequest: ProfileUpdateRequest): Observable<Profile> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
        return this.http.put<Profile>(this.config.apiBase + "api/provider/profile", JSON.stringify(profileRequest), { headers: myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public plans(token: string): Observable<Array<Plan>> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
        return this.http.get<Array<Plan>>(this.config.apiBase + "api/provider/plans", { headers: myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public planPurchase(adminToken: string, planId: number, token): Observable<{}> {
        const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + adminToken });
        return this.http.post<{}>(this.config.apiBase + 'api/provider/plans/' + planId + '/payment/stripe', { token: token }, { headers: myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public planDetails(adminToken: string): Observable<PlanDetail> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + adminToken });
        return this.http.get<PlanDetail>(this.config.apiBase + "api/provider/plan-details", { headers: myHeaders }).concatMap(data => {
            let locale = Helper.getLocale();
            data.remaining_days_count = 0;
            if (data.subscription) {
                let dateStart = moment(data.subscription.starts_on).toDate();
                let dateEnd = moment(data.subscription.expires_on).toDate();
                let dateNow = new Date();
                data.remaining_days_count = dateNow > dateEnd ? 0 : Math.round((dateEnd.getTime() - dateNow.getTime()) / (1000 * 60 * 60 * 24));
                data.starts_at = Helper.formatMillisDate(dateStart.getTime(), locale);
                data.ends_at = Helper.formatMillisDate(dateEnd.getTime(), locale);
            }
            if (!data.leads_remaining_for_today) data.leads_remaining_for_today = 0;
            return Observable.of(data);
        });
    }

    public categoryParent(token: string): Observable<BaseListResponse> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
        return this.http.get<BaseListResponse>(this.config.apiBase + "api/category", { headers: myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public categoryChildren(token: string, parentId: number): Observable<BaseListResponse> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
        return this.http.get<BaseListResponse>(this.config.apiBase + "api/category?category_id=" + parentId, { headers: myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public getProfile(token: string): Observable<Profile> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
        return this.http.get<Profile>(this.config.apiBase + "api/provider/profile", { headers: myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public getRatings(token: string, userId: number): Observable<Rating> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
        return this.http.get<Rating>(this.config.apiBase + "api/customer/providers/" + userId + "/rating-summary", { headers: myHeaders }).concatMap(data => {
            data.average_rating = Number(data.average_rating).toFixed(2);
            return Observable.of(data);
        });
    }

    public getMyReviews(token: string, profileId: number, pageNo: number): Observable<BaseListResponse> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
        return this.http.get<BaseListResponse>(this.config.apiBase + "api/customer/providers/" + profileId +"/ratings?page=" + pageNo, { headers: myHeaders }).concatMap(data => {
            let locale = Helper.getLocale();
            for (let review of data.data) {
                review.created_at = Helper.formatTimestampDate(review.created_at, locale);
            }
            return Observable.of(data);
        });
    }

    public getMyTransactions(token: string, pid: number, pageNo:number): Observable<BaseListResponse> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
        return this.http.get<BaseListResponse>(this.config.apiBase + "api/customer/providers/" + pid +"/transactions?page=" + pageNo, { headers: myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public getMyPortfolio(token: string): Observable<Array<ProviderPortfolio>> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
        return this.http.get<Array<ProviderPortfolio>>(this.config.apiBase + "api/provider/portfolio", { headers: myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public getServiceMan(token: string): Observable<Array<Profile>> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
        return this.http.get<Array<Profile>>(this.config.apiBase + "api/provider/appointment/serviceman", { headers: myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public addMyPortfolio(token: string, folioBody: { image_url: string, link: string }): Observable<ProviderPortfolio> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
        return this.http.post<ProviderPortfolio>(this.config.apiBase + "api/provider/portfolio", folioBody, { headers: myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public deleteMyPortfolio(token: string, folioId): Observable<ProviderPortfolio> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
        return this.http.delete<ProviderPortfolio>(this.config.apiBase + "api/provider/portfolio/" + folioId, { headers: myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public submitSupport(token: string, supportRequest: SupportRequest): Observable<{}> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
        return this.http.post<{}>(this.config.apiBase + "api/support", supportRequest, { headers: myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public getAppointment(token: string, appointmentRequest: Payment): Observable<any> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
        return this.http.post<any>(this.config.apiBase + "api/customer/getappointment", appointmentRequest, { headers: myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public appointments(token: string, pageNo: number): Observable<BaseListResponse> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
        return this.http.get<BaseListResponse>(this.config.apiBase + "api/provider/appointment?page=" + pageNo, { headers: myHeaders }).concatMap(data => {
            let locale = Helper.getLocale();
            for (let ap of data.data) {
                ap.created_at = Helper.formatTimestampDateTime(ap.created_at, locale);
                ap.updated_at = Helper.formatTimestampDateTime(ap.updated_at, locale);
                for (let log of ap.logs) {
                    log.updated_at = Helper.formatTimestampDateTime(log.updated_at, locale);
                    log.created_at = Helper.formatTimestampDateTime(log.created_at, locale);
                }
                // ap.date = Helper.formatTimestampDate(ap.date, locale);
                ap.time_from = ap.time_from.substr(0, ap.time_from.lastIndexOf(":"));
                ap.time_to = ap.time_to.substr(0, ap.time_to.lastIndexOf(":"));
            }
            return Observable.of(data);
        });
    }

    public provider_appointments(token: string, type:string): Observable<BaseListResponse> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
        return this.http.get<BaseListResponse>(this.config.apiBase + "api/provider/provider_appointments?type=" + type, { headers: myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public provider_home(token: string, type:string): Observable<any> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
        return this.http.get<any>(this.config.apiBase + "api/provider/provider_home?type=" + type, { headers: myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public acceptApointment(token: string, ap: Appointment): Observable<BaseListResponse> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
        return this.http.post<BaseListResponse>(this.config.apiBase + "api/provider/acceptApointment", ap, { headers: myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public makeExtraPayment(token: string, folioBody: { amount: number, detail: string, id: number }): Observable<Appointment> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
        return this.http.post<Appointment>(this.config.apiBase + "api/provider/makeExtraPayment", folioBody, { headers: myHeaders }).concatMap(data => {
            let locale = Helper.getLocale();
            data.updated_at = Helper.formatTimestampDateTime(data.updated_at, locale);
            data.created_at = Helper.formatTimestampDateTime(data.created_at, locale);
            for (let log of data.logs) {
                log.updated_at = Helper.formatTimestampDateTime(log.updated_at, locale);
                log.created_at = Helper.formatTimestampDateTime(log.created_at, locale);
            }
            // data.date = Helper.formatTimestampDate(data.date, locale);
            data.time_from = data.time_from.substr(0, data.time_from.lastIndexOf(":"));
            data.time_to = data.time_to.substr(0, data.time_to.lastIndexOf(":"));
            return Observable.of(data);
        });
    }

    public updateExtraPayment(token: string, folioBody: { amount: number, id: number }): Observable<Appointment> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
        return this.http.post<Appointment>(this.config.apiBase + "api/provider/updateExtraPayment", folioBody, { headers: myHeaders }).concatMap(data => {
            let locale = Helper.getLocale();
            data.updated_at = Helper.formatTimestampDateTime(data.updated_at, locale);
            data.created_at = Helper.formatTimestampDateTime(data.created_at, locale);
            for (let log of data.logs) {
                log.updated_at = Helper.formatTimestampDateTime(log.updated_at, locale);
                log.created_at = Helper.formatTimestampDateTime(log.created_at, locale);
            }
            // data.date = Helper.formatTimestampDate(data.date, locale);
            data.time_from = data.time_from.substr(0, data.time_from.lastIndexOf(":"));
            data.time_to = data.time_to.substr(0, data.time_to.lastIndexOf(":"));
            return Observable.of(data);
        });
    }

    public extendAppointmentTime(token: string, folioBody: { days: number, detail: string, id: number }): Observable<Appointment> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
        return this.http.post<Appointment>(this.config.apiBase + "api/provider/extendAppointmentTime", folioBody, { headers: myHeaders }).concatMap(data => {
            let locale = Helper.getLocale();
            data.updated_at = Helper.formatTimestampDateTime(data.updated_at, locale);
            data.created_at = Helper.formatTimestampDateTime(data.created_at, locale);
            for (let log of data.logs) {
                log.updated_at = Helper.formatTimestampDateTime(log.updated_at, locale);
                log.created_at = Helper.formatTimestampDateTime(log.created_at, locale);
            }
            // data.date = Helper.formatTimestampDate(data.date, locale);
            data.time_from = data.time_from.substr(0, data.time_from.lastIndexOf(":"));
            data.time_to = data.time_to.substr(0, data.time_to.lastIndexOf(":"));
            return Observable.of(data);
        });
    }

    public appointmentUpdate(token: string, apId: number, status: string): Observable<Appointment> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
        return this.http.put<Appointment>(this.config.apiBase + "api/provider/appointment/" + apId, { status: status }, { headers: myHeaders }).concatMap(data => {
            let locale = Helper.getLocale();
            data.updated_at = Helper.formatTimestampDateTime(data.updated_at, locale);
            data.created_at = Helper.formatTimestampDateTime(data.created_at, locale);
            for (let log of data.logs) {
                log.updated_at = Helper.formatTimestampDateTime(log.updated_at, locale);
                log.created_at = Helper.formatTimestampDateTime(log.created_at, locale);
            }
            // data.date = Helper.formatTimestampDate(data.date, locale);
            data.time_from = data.time_from.substr(0, data.time_from.lastIndexOf(":"));
            data.time_to = data.time_to.substr(0, data.time_to.lastIndexOf(":"));
            return Observable.of(data);
        });
    }

    public appointmentCancel(token: string, apId: number, reason: string): Observable<Appointment> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
        return this.http.get<Appointment>(this.config.apiBase + "api/customer/appointment/" + apId + '/cancel?reason=' + reason + "&type=serviceman",  { headers: myHeaders }).concatMap(data => {
            let locale = Helper.getLocale();
            data.updated_at = Helper.formatTimestampDateTime(data.updated_at, locale);
            data.created_at = Helper.formatTimestampDateTime(data.created_at, locale);
            for (let log of data.logs) {
                log.updated_at = Helper.formatTimestampDateTime(log.updated_at, locale);
                log.created_at = Helper.formatTimestampDateTime(log.created_at, locale);
            }
            // data.date = Helper.formatTimestampDate(data.date, locale);
            data.time_from = data.time_from.substr(0, data.time_from.lastIndexOf(":"));
            data.time_to = data.time_to.substr(0, data.time_to.lastIndexOf(":"));
            return Observable.of(data);
        });
    }

    public loadCancelationReasons(token: string): Observable<any> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
        return this.http.get<any>(this.config.apiBase + "api/customer/appointment/cancelationReasons?user=2", { headers: myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public updateUser(token: string, requestBody: any): Observable<User> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
        return this.http.put<User>(this.config.apiBase + "api/user", requestBody, { headers: myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public logActivity(token: string): Observable<{}> {
        const myHeaders = new HttpHeaders({ 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
        return this.http.post<{}>(this.config.apiBase + 'api/activity-log', {}, { headers: myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

    public faqs(): Observable<Array<Faq>> {
        const myHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json' });
        return this.http.get<Array<Faq>>(this.config.apiBase + 'api/faq-help', { headers: myHeaders }).concatMap(data => {
            return Observable.of(data);
        });
    }

}