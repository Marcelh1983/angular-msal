import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { environment } from '../environments/environment';
import { MsalModule, MsalInterceptor, MsalGuard } from 'modules';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { LogLevel } from 'msal';
import { UserService } from './shared/services/user.service';

export function baseUri() {
   return window.location.protocol + '//' + window.location.host + '/';
}

export function loggerCallback(level, message) {
   console.log('client logging' + message);
}


@NgModule({
   declarations: [
      AppComponent,
      LoginComponent,
      MyProfileComponent
   ],
   imports: [
      MsalModule.forRoot({
         clientID: environment.clientId,
         authority: environment.authority + environment.userflow,
         validateAuthority: true,
         cacheLocation: 'localStorage',
         postLogoutRedirectUri: baseUri,
         redirectUri: baseUri,
         navigateToLoginRequestUrl: true,
         popUp: false,
         consentScopes: environment.scopes,
         logger: loggerCallback,
         correlationId: 'correlationId1234',
         level: LogLevel.Info,
         piiLoggingEnabled: true
      }),
      BrowserModule,
      AppRoutingModule
   ],
   providers: [
      UserService,
      { provide: HTTP_INTERCEPTORS, useClass: MsalInterceptor, multi: true }
   ],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
