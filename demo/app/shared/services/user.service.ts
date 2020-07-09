import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, take, map } from 'rxjs/operators';
import { MsalService } from '../../../../modules';
import { Router, NavigationStart } from '@angular/router';
import { Account } from 'msal';
@Injectable({
    providedIn: 'root'
})
export class UserService {

    userState$ = new BehaviorSubject<{ account: Account, isProcessing: boolean }>
        ({ account: this.msalService.getAccount(), isProcessing: true });

    constructor(private msalService: MsalService) { }

    public tryToGetUser() {
        const authAccount = this.msalService.getAccount();
        this.userState$.next({ isProcessing: false, account: authAccount });
    }

}
