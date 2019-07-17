import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { MSAL_CONFIG, MsalService } from './msal.service';
import { Location } from '@angular/common';
import { ConfigLoader } from './config-loader';
import { Constants } from 'msal';
import { map, flatMap, catchError } from 'rxjs/operators';
import { Observable, from, of } from 'rxjs';

@Injectable()
export class MsalGuard implements CanActivate {

    constructor(private configLoader: ConfigLoader, private authService: MsalService, private location: Location) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.configLoader.getConfig().pipe(flatMap(config => {
            this.authService.getLogger().verbose('location change event from old url to new url');
            const tokenStored = this.authService.getTokenFromCached([config.clientID]);
            if (!tokenStored) {
                if (state.url) {
                    if (!this.authService.renewActive && !this.authService.getLoginInProgress()) {
                        const loginStartPage = this.getBaseUrl() + state.url;
                        if (loginStartPage !== null) {
                            this.authService.getCacheStorage().setItem(Constants.angularLoginRequest, loginStartPage);
                        }
                        if (config.popUp) {
                           return  from(this.authService.loginPopup({
                                    extraQueryParameters: config.extraQueryParameters,
                                    extraScopesToConsent: config.consentScopes,
                                })).pipe(
                                    map(_ => true),
                                    catchError(_ => of(false))
                                );
                        } else {
                            this.authService.loginRedirect({
                                extraQueryParameters: config.extraQueryParameters,
                                extraScopesToConsent: config.consentScopes,
                            });
                        }
                    }
                }
            } else {
                return of(true);
            }
        }));
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
