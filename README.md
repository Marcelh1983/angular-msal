
Angular MSAL
=================================================================

# About this package
When I started using msal with Angular I used <a href="https://github.com/benbaran/msal-angular">msal-angular</a> and did some changes in the library. Later Microsoft created their own library and msal-angular wasn't maintained anymore. I did try to use <a href="https://github.com/AzureAD/microsoft-authentication-library-for-js/">@azure/msal-angular</a> but it lacks support for Angular 6+ and didn't compile to es5. That's why I decided to clone @azure/msal and fix some things. 

@azure/msal is much better now, but I choose to keep using my own library because I think it's easier to use.

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
         clientID: environment.clientId,
         authority: environment.authority + environment.userflow,
         consentScopes: environment.scopes,
         logger: loggerCallback,
         correlationId: 'correlationId1234',
         level: environment.production ? LogLevel.Error : LogLevel.Info,
         piiLoggingEnabled: true
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


