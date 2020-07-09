import { Inject, Injectable, InjectionToken } from '@angular/core';
import { MsalConfig } from './msal-config';
import {
    UserAgentApplication, Logger, AuthError
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
                validateAuthority: injectedConfig.validateAuthority || true,
                navigateToLoginRequestUrl: injectedConfig.navigateToLoginRequestUrl || false,
                postLogoutRedirectUri: injectedConfig.postLogoutRedirectUri || `${window.location.protocol}//${window.location.host}/`,
                clientId: injectedConfig.clientID,
                redirectUri: injectedConfig.redirectUri || `${window.location.protocol}//${window.location.host}/`,
            },
            cache: {
                cacheLocation: injectedConfig.cacheLocation || 'sessionStorage',
                storeAuthStateInCookie: injectedConfig.storeAuthStateInCookie || false
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
        this.handleRedirectCallback(() => {
        });
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

    
}

