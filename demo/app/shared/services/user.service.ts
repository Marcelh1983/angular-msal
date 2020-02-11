import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, BehaviorSubject } from 'rxjs';
import { filter, take, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MsalService } from '../../../../modules';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Account, AuthError, AuthResponse } from 'msal';
import { authResponseCallback } from 'msal/lib-commonjs/UserAgentApplication';
@Injectable({
    providedIn: 'root'
})
export class UserService {

    userState$ = new BehaviorSubject<{ account: Account, isProcessing: boolean }>
        ({ account: this.msalService.getAccount(), isProcessing: true });

    constructor(private msalService: MsalService, router: Router) {
        router.events.pipe(
            filter(e => (e instanceof NavigationEnd)),
            map((e: NavigationEnd) => e.url),
            take(1)
        )
            .subscribe(url => {
                this.userState$.pipe(
                    filter(u => !u.isProcessing),
                    take(1)
                ).subscribe(userstate => {
                    if (userstate && (url === '/' || url === '/login')) {
                        router.navigate(['my-profile']);
                    }
                });
            });
    }

    public tryToGetUser() {
        const authAccount = this.msalService.getAccount();
        this.userState$.next({ isProcessing: false, account: authAccount });
    }

}
