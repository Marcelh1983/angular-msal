import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpErrorResponse
} from '@angular/common/http';
import { MsalService } from './msal.service';
import { Observable, forkJoin, from } from 'rxjs';
import { tap, flatMap } from 'rxjs/operators';

@Injectable()
export class MsalInterceptor implements HttpInterceptor {

    constructor(private auth: MsalService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const scopes = this.auth.getScopesForEndpoint(req.url);
        this.auth.verbose('Url: ' + req.url + ' maps to scopes: ' + scopes);
        if (scopes === null) {
            return next.handle(req);
        }
        const tokenStored = this.auth.getTokenFromCached(scopes);
        if (tokenStored && tokenStored.idToken) {
            req = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${tokenStored.idToken.rawIdToken}`,
                }
            });
            return next.handle(req).pipe(tap(event => { }, err => {
                if (err instanceof HttpErrorResponse && err.status === 401) {
                    if (tokenStored && tokenStored.idToken) {
                        this.auth.clearCacheForScope(tokenStored.idToken.rawIdToken);
                    }
                }
            }));
        } else {
            return from(this.auth.acquireTokenSilent({})).pipe(
                flatMap(token => {
                    if (token) {
                        req = req.clone({
                            setHeaders: {
                                Authorization: `Bearer ${token.idToken.rawIdToken}`,
                            }
                        });
                    }
                    return next.handle(req).pipe(tap(event => { }, err => {
                        if (err instanceof HttpErrorResponse && err.status === 401) {
                            if (token && token.idToken) {
                                this.auth.clearCacheForScope(token.idToken.rawIdToken);
                            }
                        }
                    }));
                })
            )
        }

    }
}
