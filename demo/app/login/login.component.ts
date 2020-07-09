import { Component, OnInit } from '@angular/core';
import { MsalService } from 'modules';
import { UserService } from './../shared/services/user.service';
import { Router } from '@angular/router';
import { environment } from 'demo/environments/environment';
import { StringDict } from 'msal/lib-commonjs/MsalTypes';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {


  constructor(private msalService: MsalService, public userService: UserService, private router: Router) { }

  ngOnInit(): void {
    this.msalService.logout();
  }

  public async login(popup = false) {
    if (!popup) {
      // EXTRA PARAMETERS CAN BE PASSED TO AUTHENTICATE AGAINS ANOTHER AUTHORITY 
      // OR PASS A DIFFERENT LANGUAGE.
      // ------------------ example ----------------------
      // this.msalService.authority = environment.authority + environment.userflow;
      // const key = 'mkt';
      // const qp: StringDict = {};
      // qp[key] = 'en-US';  
      this.msalService.loginRedirect();
    } else {
      const response = await this.msalService.loginPopup();
      if (response.idToken) {
        this.router.navigate(['/my-profile']);
      }
    };
  }

}

