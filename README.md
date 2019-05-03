
Angular MSAL
=================================================================

Copied from <a href="https://github.com/AzureAD/microsoft-authentication-library-for-js."> @azure/msal-angular</a> and made some changes I needed to support Angular 6+ and Internet Explorer. 

<a href="https://github.com/Marcelh1983/msal-angular-clone/blob/master/changelog.md">Changes</a>

## Usage

This is how I use the package:
I have a userService that has a function: TryToGetUser, which tries to get the current user from
my backend (using the tokens ObjectId which I make sure is equal to my User.Id)

Add the MsalModule and HttpIntercepter in app.module.ts

```js 
MsalModule.forRoot({
  clientID: environment.clientId,
  authority: environment.authority,
  validateAuthority: true,
  cacheLocation: 'localStorage',
  navigateToLoginRequestUrl: true,
  popUp: false,
  consentScopes: environment.scopes,
  logger: loggerCallback,
  correlationId: '1234',
  level: LogLevel.Info,
  piiLoggingEnabled: true
})
```    

```js 
providers: [UserService,
    { provide: HTTP_INTERCEPTORS, useClass: MsalInterceptor, multi: true }
  ]
```

```js
@Injectable()
export class UserService {
    user: User;
    constructor(private authService: MsalService, private http: HttpClient) {}
    public tryToGetUser() {
        if (this.authService.getUser()) {
            return this.getUser();
        }
        return of(null);
    }

    public getUser() {
        return this.http.get<User>(`User/loggedinuser`).pipe(tap(user => {
            this.user = user;
        }));
    }
}

```



login.component.ts

```js
export class LoginPageComponent {
  constructor(private authService: MsalService, public userService: UserService, private router: Router) {
    // used for login redirect
    userService.tryToGetUser().pipe(tap(user => {
      if (user) {
        router.navigate(['MyProfile']);
      }
    })).subscribe();
  }

  loginRedirect = () => this.authService.loginRedirect(environment.scopes);

  loginPopup = () => from(this.authService.loginPopup(environment.scopes)).pipe(
    flatMap(_ => this.userService.getUser().pipe(
      flatMap(user =>
        this.router.navigate(['myProfile']))
    ))
  ).subscribe()
```

To logout use 

```js
this.msalService.logout();
```

In my case msal redirects to baseUrl, whitch I redirect to /login. 
because it's logged-out it won't find a user and stays on the loginPage.



