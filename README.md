
COPIED FROM: Microsoft Authentication Library for Angular Preview
=================================================================

Copied from https://github.com/AzureAD/microsoft-authentication-library-for-js. All credits to Microsoft.

Changed:
* Updated packages
* Linted project
* Removed tests, samples and everything else that's not needed to build a npm package.

## Usage

This is how I use the package:
I have a userService that has a function: TryToGetUser, which tries to get the current user from
my backend (using the tokens ObjectId which I make sure is equal to my User.Id)

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
      router.navigate([!user ? 'login' : 'myProfile']);
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



