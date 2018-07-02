import * as r from 'request-promise';
import { CookieJar } from 'request';

export class TestClient {
    url: string;
    options: {
        json: boolean;
        jar: CookieJar;
        withCredentials: boolean;
    };

    constructor(url: string) {
        (this.url = url),
            (this.options = {
                json: true,
                jar: r.jar(),
                withCredentials: true
            });
    }

    register(email: string, password: string) {
        return r.post(this.url, {
            ...this.options,
            body: {
                query: `
                mutation {
                    register(email: "${email}", password: "${password}") {
                        path,
                        message
                    }
                }
                `
            }
        });
    }

    me() {
        return r.post(this.url, {
            ...this.options,
            body: {
                query: `
                {
                    me {
                        email,
                        id
                    }
                }
                `
            }
        });
    }

    login(email: string, password: string) {
        return r.post(this.url, {
            ...this.options,
            body: {
                query: `
                mutation {
                    login(email: "${email}", password: "${password}") {
                        path,
                        message
                    }
                }
                `
            }
        });
    }

    logout() {
        return r.post(this.url, {
            ...this.options,
            body: {
                query: `
                mutation {
                    logout 
                }
                `
            }
        });
    }

    sendForgotPasswordEmail(email: string) {
        return r.post(this.url, {
            ...this.options,
            body: {
                query: `
                mutation {
                    sendForgotPasswordEmail(email: "${email}")
                }
                `
            }
        });
    }

    forgotPasswordChange(newPassword: string, key: string) {
        return r.post(this.url, {
            ...this.options,
            body: {
                query: `
                mutation {
                    forgotPasswordChange(newPassword: "${newPassword}", key: "${key}") {
                        path,
                        message
                    }
                }
                `
            }
        });
    }
}
