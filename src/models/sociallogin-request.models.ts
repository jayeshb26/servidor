export class SocialLoginRequest {
    platform: string;
    token: string;
    os: string;
    constructor(token: string, platform: string, os: string) {
        this.token = token;
        this.platform = platform;
        this.os = os;
    }
}
