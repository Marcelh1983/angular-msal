import { Inject, Injectable, InjectionToken } from '@angular/core';
import { MsalConfig } from './msal-config';
import {
    UserAgentApplication,
    Constants, Logger, AuthError
} from 'msal';
import { AuthenticationParameters } from 'msal/lib-commonjs/AuthenticationParameters';
import { AuthResponse } from 'msal/lib-commonjs/AuthResponse';
import { Router } from '@angular/router';

export const MSAL_CONFIG = new InjectionToken<string>('MSAL_CONFIG');

@Injectable()
export class MsalService extends UserAgentApplication {
    public renewActive: boolean;

    constructor(@Inject(MSAL_CONFIG) private injectedConfig: MsalConfig, private router: Router) {
        super({
            auth: {
                authority: injectedConfig.authority,
                validateAuthority: injectedConfig.validateAuthority,
                navigateToLoginRequestUrl: injectedConfig.navigateToLoginRequestUrl,
                postLogoutRedirectUri: injectedConfig.postLogoutRedirectUri,
                clientId: injectedConfig.clientID,
                redirectUri: injectedConfig.redirectUri,
            },
            cache: {
                cacheLocation: injectedConfig.cacheLocation,
                storeAuthStateInCookie: injectedConfig.storeAuthStateInCookie
            },
            system: {
                loadFrameTimeout: injectedConfig.loadFrameTimeout,
                logger: new Logger(injectedConfig.logger,
                    {
                        correlationId: injectedConfig.correlationId,
                        level: injectedConfig.level,
                        piiLoggingEnabled: injectedConfig.piiLoggingEnabled
                    })
            },
            framework: {
                isAngular: true,
                protectedResourceMap: new Map(injectedConfig.protectedResourceMap),
                unprotectedResources: injectedConfig.unprotectedResources || []
            }
        });
        const urlHash = window.location.hash;
        this.processHash(urlHash);
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
            this.saveTokenFromHash(hash, { ...requestInfo, stateMatch: true });
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


    protected clearCache() {
        super.clearCache();
    }

    public isCallback(hash: string): boolean {
        return super.isCallback(hash);
    }

    public loginRedirect(request?: AuthenticationParameters): void {
        this.storeCurrentRoute();
        if (!request.extraScopesToConsent) {
            request.extraScopesToConsent = this.injectedConfig.consentScopes;
        }
        if (!request.scopes) {
            request.scopes = [];
        }
        this.getLogger().verbose('login redirect flow');
        // because msal does a window.location.replace which does't give you the
        // possibilty to navigate back

        // see: https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/588
        history.pushState(null, null, this.router.url);
        super.loginRedirect(request);
    }

    public loginPopup(request?: AuthenticationParameters): Promise<AuthResponse> {
        this.storeCurrentRoute();
        if (!request.extraScopesToConsent) {
            request.extraScopesToConsent = this.injectedConfig.consentScopes;
        }
        return new Promise(resolve => {
            super.loginPopup(request);
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
            request.scopes = this.injectedConfig.consentScopes;
        }
        return super.acquireTokenSilent(request);
    }

    public acquireTokenPopup(request: AuthenticationParameters): Promise<AuthResponse> {
        this.storeCurrentRoute();
        return new Promise((resolve, reject) => {
            super.acquireTokenPopup(request).then((token: any) => {
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
        super.acquireTokenRedirect(request);
    }

    private storeCurrentRoute() {
        const url = this.router.url;
        this.cacheStorage.setItem('login-url', url);
    }
    private getPreviousRoute() {
        const url = this.router.url;
        return this.cacheStorage.getItem('login-url');
    }


    getScopesForEndpoint(endpoint: string) {
        return super.getScopesForEndpoint(endpoint);
    }

    getCacheStorage() {
        return this.cacheStorage;
    }

    getTokenFromCached(scopes: string[]) {
        return super.getCachedTokenInternal(scopes, this.getAccount(), '');
    }

    clearCacheForScope(accessToken: string) {
        super.clearCacheForScope(accessToken);
    }

    getLogger() {
        return super.getLogger();
    }

    info(message: string) {
        this.getLogger().info(message);
    }

    verbose(message: string) {
        this.getLogger().verbose(message);
    }

    removeItem(key: string) {
        this.cacheStorage.removeItem(key);
    }

}

