import { Inject, Injectable, InjectionToken } from "@angular/core";
import {
    ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot,
} from "@angular/router";
import { MsalService } from "./msal.service";
import { Location } from "@angular/common";
import { AuthError, InteractionRequiredAuthError, UrlUtils, WindowUtils } from "msal";
import { MsalConfig } from './msal-config';

export const MSAL_CONFIG = new InjectionToken<string>('MSAL_CONFIG');
@Injectable()
export class MsalGuard implements CanActivate {

    constructor(
        @Inject(MSAL_CONFIG) private msalConfig: MsalConfig,
        private authService: MsalService,
        private location: Location
    ) { }

    /**
     * Builds the absolute url for the destination page
     * @param path Relative path of requested page
     * @returns Full destination url
     */
    getDestinationUrl(path: string): string {
        // Absolute base url for the application (default to origin if base element not present)
        const baseElements = document.getElementsByTagName("base");
        const baseUrl = this.location.normalize(baseElements.length ? baseElements[0].href : window.location.origin);

        // Path of page (including hash, if using hash routing)
        const pathUrl = this.location.prepareExternalUrl(path);

        // Hash location strategy
        if (pathUrl.startsWith("#")) {
            return `${baseUrl}/${pathUrl}`;
        }

        // If using path location strategy, pathUrl will include the relative portion of the base path (e.g. /base/page).
        // Since baseUrl also includes /base, can just concatentate baseUrl + path
        return `${baseUrl}${path}`;
    }

    /**
     * Interactively prompt the user to login
     * @param url Path of the requested page
     */
    async loginInteractively(url: string) {
        const qp = {};
        if (this.msalConfig.lang) {
            const key = 'mkt';
            qp[key] = 'en-US';
        }
        if (this.msalConfig.popUp) {
            return this.authService.loginPopup({
                scopes: this.msalConfig.consentScopes,
                extraQueryParameters: qp
            })
                .then(() => true)
                .catch(() => false);
        }
        const redirectStartPage = this.getDestinationUrl(url);
        this.authService.loginRedirect({
            redirectStartPage,
            scopes: this.msalConfig.consentScopes,
            extraQueryParameters: qp
        });
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Promise<boolean> {
        this.authService.getLogger().verbose("location change event from old url to new url");
        // If a page with MSAL Guard is set as the redirect for acquireTokenSilent,
        // short-circuit to prevent redirecting or popups.
        if (UrlUtils.urlContainsHash(window.location.hash) && WindowUtils.isInIframe()) {
            this.authService.getLogger().warning("redirectUri set to page with MSAL Guard. It is recommended to not set redirectUri to a page that requires authentication.");
            return false;
        }

        if (!this.authService.getAccount() && this.msalConfig.userinteractionInGuard) {
            return this.loginInteractively(state.url);
        }

        return this.authService.acquireTokenSilent({
            scopes: [this.msalConfig.clientId]
        })
            .then(() => true)
            .catch((error: AuthError) => {
                if (InteractionRequiredAuthError.isInteractionRequiredError(error.errorCode)
                    && this.msalConfig.userinteractionInGuard) {
                    this.authService.getLogger().info(`Interaction required error in MSAL Guard, prompting for interaction.`);
                    return this.loginInteractively(state.url);
                } else {
                    this.authService.getLogger().error(`Non-interaction error in MSAL Guard: ${error.errorMessage}`);
                    return Promise.resolve(false);
                }
            });
    }
}