
Angular MSAL
=================================================================

# About this package
When I started using msal with Angular I used <a href="https://github.com/benbaran/msal-angular">msal-angular</a> and did some changes in the library. Later Microsoft created their own library and msal-angular wasn't maintained anymore. I did try to use <a href="https://github.com/AzureAD/microsoft-authentication-library-for-js/">@azure/msal-angular</a> but it lacks support for Angular 6+ and didn't compile to es5. That's why I deceided to clone @azure/msal and fix some things. When msal@1.0.0 came out I upgraded the package and removed all code I didn't understand and thought I wouldn't need. I'm sure I missed things so if thing does not work contact me or better: create a pull request. if @azure/msal-angular will be usefull I'll stop maintaining this library.

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
export function baseUri() {
  return window.location.protocol + '//' + window.location.host + '/';
}

@NgModule({
  imports: [
    MsalModule.forRoot({
      clientID: environment.clientId,
      authority: environment.authority + environment.userFlowTeacher,
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
        // register redirect call back (only for needed for loginRedirect)
        this.authService.handleRedirectCallback(() => {  
          router.navigate(['myProfile']);
        });
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
      this.authService.loginPopup().then(_ => {
        this.userService.tryToGetUser().subscribe(_ => {
           this.router.navigate(['myProfile']);
        });
      });
    }
```

To logout use 

```js
this.msalService.logout();
```


