import { Inject, Injectable, InjectionToken } from '@angular/core';
import { MsalConfig } from './msal-config';
import {
    UserAgentApplication, AuthError, AuthResponse, AuthenticationParameters
} from 'msal';

export const MSAL_CONFIG = new InjectionToken<string>('MSAL_CONFIG');

@Injectable()
export class MsalService extends UserAgentApplication {
    public renewActive: boolean;

    constructor(@Inject(MSAL_CONFIG) private injectedConfig: MsalConfig) {
        super({
            auth: {
                authority: injectedConfig.authority || 'https://login.microsoftonline.com/common',
                validateAuthority: injectedConfig.validateAuthority || true,
                navigateToLoginRequestUrl: injectedConfig.navigateToLoginRequestUrl || false,
                postLogoutRedirectUri: injectedConfig.postLogoutRedirectUri || `${window.location.protocol}//${window.location.host}/`,
                clientId: injectedConfig.clientId,
                redirectUri: injectedConfig.redirectUri || `${window.location.protocol}//${window.location.host}/`,
            },
            cache: {
                cacheLocation: injectedConfig.cacheLocation || 'sessionStorage',
                storeAuthStateInCookie: injectedConfig.storeAuthStateInCookie || false
            },
            system: {
                loadFrameTimeout: injectedConfig.loadFrameTimeout
            },
            framework: {
                isAngular: true,
                protectedResourceMap: new Map(injectedConfig.protectedResourceMap),
                unprotectedResources: injectedConfig.unprotectedResources || []
            }
        });
        this.handleRedirectCallback(() => { });
    }

    public loginPopup(userRequest?: AuthenticationParameters): Promise<AuthResponse> {
        debugger;
        const languageKey = 'mkt';
        if (this.injectedConfig.lang && (!userRequest || !userRequest.extraQueryParameters || !userRequest.extraQueryParameters[languageKey])) {
            userRequest = userRequest || {} as AuthenticationParameters;
            userRequest.extraQueryParameters = userRequest.extraQueryParameters || {};
            userRequest.extraQueryParameters[languageKey] = this.injectedConfig.lang;
        }
        return super.loginPopup(userRequest);
    }

    public loginRedirect(userRequest?: AuthenticationParameters) {
        const languageKey = 'mkt';
        if (this.injectedConfig.lang && (!userRequest || !userRequest.extraQueryParameters || !userRequest.extraQueryParameters[languageKey])) {
            userRequest = userRequest || {} as AuthenticationParameters;
            userRequest.extraQueryParameters = userRequest.extraQueryParameters || {};
            userRequest.extraQueryParameters[languageKey] = this.injectedConfig.lang;
        }
        return super.loginRedirect(userRequest);
    }

    public acquireTokenSilent(request: AuthenticationParameters): Promise<AuthResponse> {
        if (!request.scopes) {
            request.scopes = this.injectedConfig.consentScopes;
        }
        return super.acquireTokenSilent(request);
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

    public getScopesForEndpoint(endpoint: string) {
        return super.getScopesForEndpoint(endpoint);
    }

    public clearCacheForScope(accessToken: string) {
        super.clearCacheForScope(accessToken);
    }

    public logout(correlationId?: string) {
        super.acquireTokenSilent({}).then(r => {
            if (r.idToken) {
                super.logout(correlationId);
            }
        });
    };
}
