import { Injectable, InjectionToken } from '@angular/core';
import {
    UserAgentApplication,
    Constants, Logger, AuthError
} from 'msal';
import { AuthenticationParameters } from 'msal/lib-commonjs/AuthenticationParameters';
import { AuthResponse } from 'msal/lib-commonjs/AuthResponse';
import { Router } from '@angular/router';
import { ConfigLoader } from 'config-loader';
import { tap } from 'rxjs/operators';
@Injectable()
export class MsalService {
    public renewActive: boolean;
    private userAgentApplication: UserAgentApplication;
    constructor(configLoader: ConfigLoader, private router: Router) {

        configLoader.getConfig().pipe(tap(config => {
            {
                this.userAgentApplication = new UserAgentApplication({
                    auth: {
                        authority: config.authority,
                        validateAuthority: config.validateAuthority,
                        navigateToLoginRequestUrl: config.navigateToLoginRequestUrl,
                        postLogoutRedirectUri: config.postLogoutRedirectUri,
                        clientId: config.clientID,
                        redirectUri: config.redirectUri,
                    },
                    cache: {
                        cacheLocation: config.cacheLocation,
                        storeAuthStateInCookie: config.storeAuthStateInCookie
                    },
                    system: {
                        loadFrameTimeout: config.loadFrameTimeout,
                        logger: new Logger(config.logger,
                            {
                                correlationId: config.correlationId,
                                level: config.level,
                                piiLoggingEnabled: config.piiLoggingEnabled
                            })
                    },
                    framework: {
                        isAngular: true,
                        protectedResourceMap: new Map(config.protectedResourceMap),
                        unprotectedResources: config.unprotectedResources || []
                    }
                });


            }
            const urlHash = window.location.hash;
            this.processHash(urlHash);
        }));
    }

    private processHash(hash: string, popup = false) {
        // assuming that using a popup, this is not needed.
        let requestInfo: any = null;
        let callback: any = null;
        let msal: any;
        if (this.isCallback(hash)) {
            // redirect flow
            if (window.parent && window.parent.msal) {
                msal = window.parent.msal;
                requestInfo = msal.deserializeHash(hash);
            }
            // tslint:disable-next-line:no-string-literal
            this.userAgentApplication['saveTokenFromHash'](hash, { ...requestInfo, stateMatch: true });
            const url = this.getPreviousRoute();
            if (window.location.href.indexOf('#state=') !== -1) {
                // navigate to previous url otherwise it gives route not found error.
                this.router.navigateByUrl(url);
            }
            // give some time to register callback in user's code
            if (!popup) {
                setTimeout(() => {
                    if (msal) {
                        callback = msal.authResponseCallback;
                    }
                    if (callback && typeof callback === 'function') {
                        const token = requestInfo.access_token || requestInfo.id_token;
                        const error = requestInfo.error;
                        const errorDescription = requestInfo.error_description;
                        callback(errorDescription, token, error, Constants.idToken);
                    }
                }, 100);
            }
        }
    }

    public getLoginInProgress() {
        return this.userAgentApplication.getLoginInProgress();
    }


    protected clearCache() {
        // tslint:disable-next-line:no-string-literal
        this.userAgentApplication['clearCache']();
    }

    public isCallback(hash: string): boolean {
        return this.userAgentApplication.isCallback(hash);
    }

    public loginRedirect(request?: AuthenticationParameters): void {
        this.storeCurrentRoute();
        if (!request.extraScopesToConsent) {
            // tslint:disable-next-line:no-string-literal
            request.extraScopesToConsent = this.userAgentApplication['config'].consentScopes;
        }
        if (!request.scopes) {
            request.scopes = [];
        }
        this.getLogger().verbose('login redirect flow');
        // because msal does a window.location.replace which does't give you the
        // possibilty to navigate back

        // see: https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/588
        history.pushState(null, null, this.router.url);
        this.userAgentApplication.loginRedirect(request);
    }

    public loginPopup(request?: AuthenticationParameters): Promise<AuthResponse> {
        this.storeCurrentRoute();
        if (!request.extraScopesToConsent) {
            // tslint:disable-next-line:no-string-literal
            request.extraScopesToConsent = this.userAgentApplication['config'].consentScopes;
        }
        return new Promise(resolve => {
            this.userAgentApplication.loginPopup(request);
            const callbackFunction = (e: CustomEvent) => {
                this.getLogger().verbose('popUpHashChanged');
                this.processHash(e.detail, true);
                window.removeEventListener('msal:popUpHashChanged', callbackFunction);
                resolve();
            };
            // callback can come from popupWindow, iframe or mainWindow
            window.addEventListener('msal:popUpHashChanged', callbackFunction);
        });
    }

    public acquireTokenSilent(request: AuthenticationParameters): Promise<AuthResponse> {
        this.storeCurrentRoute();
        if (!request.scopes) {
            // tslint:disable-next-line:no-string-literal
            request.scopes = this.userAgentApplication['config'].consentScopes;
        }
        return this.userAgentApplication.acquireTokenSilent(request);
    }

    public acquireTokenPopup(request: AuthenticationParameters): Promise<AuthResponse> {
        this.storeCurrentRoute();
        return new Promise((resolve, reject) => {
            this.userAgentApplication.acquireTokenPopup(request).then((token: any) => {
                this.renewActive = false;
                resolve(token);
            }, (error: AuthError) => {
                this.renewActive = false;
                this.getLogger().error('Error when acquiring token for scopes : ' + request.scopes + ' ' + error);
                reject(error);
            });
        });
    }

    public acquireTokenRedirect(request: AuthenticationParameters) {
        this.storeCurrentRoute();
        this.userAgentApplication.acquireTokenRedirect(request);
    }

    private storeCurrentRoute() {
        const url = this.router.url;
        // tslint:disable-next-line:no-string-literal
        this.getCacheStorage().setItem('login-url', url);
    }
    private getPreviousRoute() {
        const url = this.router.url;
        // tslint:disable-next-line:no-string-literal
        return this.getCacheStorage().getItem('login-url');
    }


    getScopesForEndpoint(endpoint: string) {
        // tslint:disable-next-line:no-string-literal
        return this.userAgentApplication['getScopesForEndpoint'](endpoint);
    }

    getCacheStorage() {
        // tslint:disable-next-line:no-string-literal
        return this.userAgentApplication['cacheStorage'];
    }

    getTokenFromCached(scopes: string[]) {
        // tslint:disable-next-line:no-string-literal
        return this.userAgentApplication['getCachedTokenInternal'](scopes,
            this.userAgentApplication.getAccount(), '');
    }

    clearCacheForScope(accessToken: string) {
        // tslint:disable-next-line:no-string-literal
        this.userAgentApplication['clearCacheForScope'](accessToken);
    }

    getLogger() {
        // tslint:disable-next-line:no-string-literal
        return this.userAgentApplication['getLogger']();
    }

    info(message: string) {
        this.getLogger().info(message);
    }

    verbose(message: string) {
        this.getLogger().verbose(message);
    }

    removeItem(key: string) {
        this.getCacheStorage().removeItem(key);
    }

}

