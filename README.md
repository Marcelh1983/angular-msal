
Angular MSAL
=================================================================

# About this package
This package is created when @azure/msal wasn't ready to use.
Because there are so many configuration options, this packages tries to make things easier.
See the demo project for a working example using login-redirect and login-popup.

<a href="https://github.com/Marcelh1983/angular-msal/blob/master/changelog.md">Changes</a>
## Installation

```sh
npm install angular-msal --save
```

## Usage

This is how I use the package:
I have a userService that has a function: TryToGetUser, which tries to get the current user from
my backend (using the tokens ObjectId which I make sure is equal to my User.Id)

Add the MsalModule and HttpIntercepter in app.module.ts

```js 
@NgModule({
  imports: [
      MsalModule.forRoot({
         clientId: environment.clientId,
         authority: environment.authority + environment.userflow,
         consentScopes: environment.scopes,
         lang: 'en-US',
         level: environment.production ? LogLevel.Error : LogLevel.Info
      }),
    }),
  ],
```    

```js 
providers: [UserService,
    { provide: HTTP_INTERCEPTORS, useClass: MsalInterceptor, multi: true }
  ]
```

```js
@Injectable()
export class UserService {
    cachedUser: User;
    
    constructor(private authService: MsalService, private http: HttpClient) {
    }
    public tryToGetUser() {
        if (this.authService.getAccount()) {
            return this.getUser();
        }
        return of(null);
    }

    public getUser() {
        return this.http.get<User>(`User/loggedinuser`).pipe(tap(user => {
            this.cachedUser = user;
        }));
    }
}

```

login.component.ts

```js
export class LoginPageComponent {
  constructor(private authService: MsalService, public userService: UserService, private router: Router) {

  loginRedirect = () => this.authService.loginRedirect();

  loginPopup = () => {
      const response = await this.msalService.loginPopup();
      if (response.idToken) {
        this.router.navigate(['/my-profile']);
      }
    }
```

To logout use 

```js
this.msalService.logout();
```


