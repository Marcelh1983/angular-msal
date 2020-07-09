import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, Router } from '@angular/router';
import { Constants } from 'msal';
import { MSAL_CONFIG, MsalService } from 'modules/msal.service';
import { MsalConfig, MsalGuard } from 'modules';
import { Location } from '@angular/common';

@Injectable()
export class AuthenticatedGuard extends MsalGuard implements CanActivate {

    constructor(@Inject(MSAL_CONFIG) config: MsalConfig, authService: MsalService, location: Location, private router: Router) {
        super(config, authService, location)
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Promise<boolean> {
       const canActivateRoute = super.canActivate(route, state);
       if (!canActivateRoute) {
           this.router.navigate(['/login']);
       }
       return canActivateRoute;
    }
}
