import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { MSAL_CONFIG, MsalService } from './msal.service';
import { Location } from '@angular/common';
import { MsalConfig } from './msal-config';
import { Constants } from 'msal';

@Injectable()
export class MsalGuard implements CanActivate {

    constructor(@Inject(MSAL_CONFIG) private config: MsalConfig, private authService: MsalService, private location: Location) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Promise<boolean> {
        this.authService.getLogger().verbose('location change event from old url to new url');
        const tokenStored = this.authService.getTokenFromCached([this.config.clientID]);
        if (!tokenStored) {
            if (state.url) {
                if (!this.authService.renewActive && !this.authService.getLoginInProgress()) {
                    const loginStartPage = this.getBaseUrl() + state.url;
                    if (loginStartPage !== null) {
                        this.authService.getCacheStorage().setItem(Constants.adalIdToken, loginStartPage);
                    }
                    if (this.config.popUp) {
                        return new Promise((resolve, reject) => {
                            this.authService.loginPopup({
                                extraQueryParameters: this.config.extraQueryParameters,
                                extraScopesToConsent: this.config.consentScopes,
                            }).then(() => {
                                resolve(true);
                            }, () => {
                                reject(false);
                            });
                        });
                    } else {
                        this.authService.loginRedirect({
                            extraQueryParameters: this.config.extraQueryParameters,
                            extraScopesToConsent: this.config.consentScopes,
                        });
                    }
                }
            }
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
