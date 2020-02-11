import { Component } from '@angular/core';
import { MsalService } from 'modules';
import { UserService } from './../shared/services/user.service';
import { Router } from '@angular/router';
import { environment } from 'demo/environments/environment';
import { StringDict } from 'msal/lib-commonjs/MsalTypes';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {


  constructor(private msalService: MsalService, public userService: UserService, private router: Router) { }
  
  public login(popup = false) {
      this.msalService.authority = environment.authority + environment.userflow;
      const key = 'mkt';
      const qp: StringDict = {};
      qp[key] = 'en-US';
      if (popup) {
        this.msalService.loginRedirect({
          authority: environment.authority + environment.userflow,
          extraQueryParameters: qp
        });
      } else {
        this.msalService.loginPopup({
          authority: environment.authority + environment.userflow,
          extraQueryParameters: qp
        }).then(response => {
          if (response.idToken) {
            this.router.navigate(['/my-profile']);
          }
        });
      }

  }

}
