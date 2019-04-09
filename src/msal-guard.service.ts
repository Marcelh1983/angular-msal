import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { MSAL_CONFIG, MsalService } from './msal.service';
import { Location } from '@angular/common';
import { MsalConfig } from './msal-config';
import { BroadcastService } from './broadcast.service';
import { Constants } from 'msal';
import { MSALError } from './MSALError';
import { AuthenticationResult } from './AuthenticationResult';

@Injectable()
export class MsalGuard implements CanActivate {

    constructor(@Inject(MSAL_CONFIG) private config: MsalConfig,
        // tslint:disable-next-line:align
        private authService: MsalService, private location: Location, private broadcastService: BroadcastService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Promise<boolean> {
        this.authService.getLogger().verbose('location change event from old url to new url');

        this.authService.updateDataFromCache([this.config.clientID]);
        if (!this.authService.oauthData.isAuthenticated && !this.authService.oauthData.userName) {
            if (state.url) {

                if (!this.authService.renewActive && !this.authService.loginInProgress()) {
                    const loginStartPage = this.getBaseUrl() + state.url;
                    if (loginStartPage !== null) {
                        this.authService.getCacheStorage().setItem(Constants.angularLoginRequest, loginStartPage);
                    }
                    if (this.config.popUp) {
                        return new Promise((resolve, reject) => {
                            this.authService.loginPopup(this.config.consentScopes, this.config.extraQueryParameters).then((token) => {
                                resolve(true);
                            }, (error) => {
                                reject(false);
                            });
                        });
                    } else {
                        this.authService.loginRedirect(this.config.consentScopes, this.config.extraQueryParameters);
                    }
                }
            }
        } else if (!this.authService.oauthData.isAuthenticated && this.authService.oauthData.userName) {
            // token is expired/deleted but userdata still exists in _oauthData object
            return new Promise((resolve, reject) => {
                this.authService.acquireTokenSilent([this.config.clientID]).then((token: any) => {
                    if (token) {
                        this.authService.oauthData.isAuthenticated = true;
                        const authenticationResult = new AuthenticationResult(token);
                        this.broadcastService.broadcast('msal:loginSuccess', authenticationResult);
                        resolve(true);
                    }
                }, (error: any) => {
                    const errorParts = error.split('|');
                    const msalError = new MSALError(errorParts[0], errorParts[1], '');
                    this.broadcastService.broadcast('msal:loginFailure', msalError);
                    resolve(false);
                });
            });
        } else {
            return true;
        }
    }

    private getBaseUrl(): string {
        let currentAbsoluteUrl = window.location.href;
        const currentRelativeUrl = this.location.path();
        if (!currentRelativeUrl) {
            if (currentAbsoluteUrl.endsWith('/')) {
                currentAbsoluteUrl = currentAbsoluteUrl.replace(/\/$/, '');
            }
            return currentAbsoluteUrl;
        } else {
            const index = currentAbsoluteUrl.indexOf(currentRelativeUrl);
            return currentAbsoluteUrl.substring(0, index);
        }
    }

}
