# 2.0.2 (8/9/2020)
* fixed: Scopes are required to obtain an access token while logging out.

# 2.0.1 (7/9/2020)
* default, no user interaction from guard. If the user is not authenicated, it should be handled in your own application. Set userinteractionInGuard to true to enable the user interaction login screen from the guard.
* added language option, which is passed to the login screen if extraParameters aren't provided by the user.
* don't logout and redirect to the base page if tokenId is empty (to prevent redirect loop).


# 2.0.0 (7/9/2020)
* Upgraded all packages
* Copied and modified the guard and interceptor from @azure/msal
* removed most of the msal.service code
* updated demo project

# 1.0.5 (6/26/2019)
* Upgraded Angular and msal

# 1.0.4 (5/10/2019)
* fix for <a href="https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/588"> Cannot navigate "Back" in Login Redirect</a>

# 1.0.3 (5/10/2019)
* redirectUri and postLogoutRedirectUri can be of type function too (useful for aot compiling).

# 1.0.1 (5/8/2019)
* upgraded msal.js (1.0.0)
* removed all code that I don't understand
* login redirect and loginPopup works with msal@1.0.0

# 0.1.5 (5/3/2019)
* updated readme

# 0.1.4 (4/3/2019)
* compile to es5 to support Internet Explorer

# 0.1.3 (4/12/2019)
* if token is in cache, don't try to acquireSilent

# 0.1.2 (4/11/2019)
* Updated readme and added readme to npm package

# 0.1.1 (4/11/2019)
* scope is optional and will be retrieved from config if null

# 0.1.0 (4/9/2019)
* Upgraded packages to support Angular 6+
* Upgraded msal package
* Removed unused code, samples, tests etc.
* Linted code 