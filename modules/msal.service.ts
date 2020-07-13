import { Inject, Injectable, InjectionToken } from '@angular/core';
import { MsalConfig } from './msal-config';
import {
    UserAgentApplication, AuthError, AuthResponse, AuthenticationParameters, UrlUtils
} from 'msal';

export const MSAL_CONFIG = new InjectionToken<string>('MSAL_CONFIG');

@Injectable()
export class MsalService extends UserAgentApplication {
    public renewActive: boolean;

    constructor(@Inject(MSAL_CONFIG) private msalConfig: MsalConfig) {
        super({
            auth: {
                authority: msalConfig.authority || 'https://login.microsoftonline.com/common',
                validateAuthority: msalConfig.validateAuthority || true,
                navigateToLoginRequestUrl: msalConfig.navigateToLoginRequestUrl || false,
                postLogoutRedirectUri: msalConfig.postLogoutRedirectUri || `${window.location.protocol}//${window.location.host}/`,
                clientId: msalConfig.clientId,
                redirectUri: msalConfig.redirectUri || `${window.location.protocol}//${window.location.host}/`,
            },
            cache: {
                cacheLocation: msalConfig.cacheLocation || 'sessionStorage',
                storeAuthStateInCookie: msalConfig.storeAuthStateInCookie || false
            },
            system: {
                loadFrameTimeout: msalConfig.loadFrameTimeout
            },
            framework: {
                isAngular: true,
                protectedResourceMap: new Map(msalConfig.protectedResourceMap),
                unprotectedResources: msalConfig.unprotectedResources || []
            }
        });
        this.handleRedirectCallback(() => { });
    }

    public loginPopup(userRequest?: AuthenticationParameters): Promise<AuthResponse> {
        debugger;
        const languageKey = 'mkt';
        if (this.msalConfig.lang && (!userRequest || !userRequest.extraQueryParameters || !userRequest.extraQueryParameters[languageKey])) {
            userRequest = userRequest || {} as AuthenticationParameters;
            userRequest.extraQueryParameters = userRequest.extraQueryParameters || {};
            userRequest.extraQueryParameters[languageKey] = this.msalConfig.lang;
        }
        return super.loginPopup(userRequest);
    }

    public loginRedirect(userRequest?: AuthenticationParameters) {
        const languageKey = 'mkt';
        if (this.msalConfig.lang && (!userRequest || !userRequest.extraQueryParameters || !userRequest.extraQueryParameters[languageKey])) {
            userRequest = userRequest || {} as AuthenticationParameters;
            userRequest.extraQueryParameters = userRequest.extraQueryParameters || {};
            userRequest.extraQueryParameters[languageKey] = this.msalConfig.lang;
        }
        return super.loginRedirect(userRequest);
    }

    public acquireTokenSilent(request: AuthenticationParameters): Promise<AuthResponse> {
        const isIframe = window !== window.parent && !window.opener;
        if (!isIframe) {
            if (!request.scopes) {
                request.scopes = this.msalConfig.consentScopes;
            }
            return super.acquireTokenSilent(request);
        }
    }

    public acquireTokenPopup(request: AuthenticationParameters): Promise<AuthResponse> {
        // this.storeCurrentRoute();
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
        super.acquireTokenRedirect(request);
    }

    public clearCacheForScope(accessToken: string) {
        super.clearCacheForScope(accessToken);
    }

    public logout(correlationId?: string) {
        this.acquireTokenSilent({}).then(r => {
            if (r.idToken) {
                super.logout(correlationId);
            }
        });
    };

    public getScopesForEndpoint(endpoint: string): Array<string> {
        // if user specified list of unprotectedResources, no need to send token to these endpoints, return null.
        const isUnprotected = this.isUnprotectedResource(endpoint);
        if (isUnprotected) {
            return null;
        }
        const protectedResourceMap = new Map(this.msalConfig.protectedResourceMap);
        // process all protected resources and send the matched one
        const keyForEndpoint = Array.from(protectedResourceMap.keys()).find(key => endpoint.indexOf(key) > -1);
        if (keyForEndpoint) {
            return protectedResourceMap.get(keyForEndpoint);
        }
        /*
         * default resource will be clientid if nothing specified
         * App will use idtoken for calls to itself
         * check if it's staring from http or https, needs to match with app host
         */
        if (endpoint.indexOf("http://") > -1 || endpoint.indexOf("https://") > -1) {
            if (UrlUtils.getHostFromUri(endpoint) === UrlUtils.getHostFromUri(super.getRedirectUri())) {
                return new Array<string>(this.msalConfig.clientId);
            }
        } else {
            /*
             * in angular level, the url for $http interceptor call could be relative url,
             * if it's relative call, we'll treat it as app backend call.
             */
            return new Array<string>(this.msalConfig.clientId);
        }

        // if not the app's own backend or not a domain listed in the endpoints structure
        return null;
    }

    private isUnprotectedResource(url: string): boolean {
        const unprotectedResources = this.msalConfig.unprotectedResources || [];
        return unprotectedResources.some(resource => url.indexOf(resource) > -1);
    }
}
