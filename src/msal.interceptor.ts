import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpErrorResponse
} from '@angular/common/http';
import { MsalService } from './msal.service';
import { BroadcastService } from './broadcast.service';
import { MSALError } from './MSALError';
import { from, Observable } from 'rxjs';
import { tap, mergeMap } from 'rxjs/operators';

@Injectable()
export class MsalInterceptor implements HttpInterceptor {

    constructor(private auth: MsalService, private broadcastService: BroadcastService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const scopes = this.auth.getScopesForEndpoint(req.url);
        this.auth.verbose('Url: ' + req.url + ' maps to scopes: ' + scopes);
        if (scopes === null) {
            return next.handle(req);
        }
        const tokenStored = this.auth.getCachedTokenInternal(scopes);
        if (tokenStored && tokenStored.token) {
            req = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${tokenStored.token}`,
                }
            });
            return next.handle(req).pipe(tap(event => { }, err => {
                if (err instanceof HttpErrorResponse && err.status === 401) {
                    if (tokenStored && tokenStored.token) {
                        this.auth.clearCacheForScope(tokenStored.token);
                    }
                    const msalError = new MSALError(JSON.stringify(err), '', JSON.stringify(scopes));
                    this.broadcastService.broadcast('msal:notAuthorized', msalError);
                }
            }));
        } else {
            return from(this.auth.acquireTokenSilent(scopes).then(token => {
                const JWT = `Bearer ${token}`;
                return req.clone({
                    setHeaders: {
                        Authorization: JWT,
                    },
                });
            })).pipe(mergeMap(_ => next.handle(req).pipe(
                tap(event => { }, err => {
                    if (err instanceof HttpErrorResponse && err.status === 401) {
                        if (tokenStored && tokenStored.token) {
                            this.auth.clearCacheForScope(tokenStored.token);
                        }
                        const msalError = new MSALError(JSON.stringify(err), '', JSON.stringify(scopes));
                        this.broadcastService.broadcast('msal:notAuthorized', msalError);
                    }
                })))); // calling next.handle means we are passing control to next interceptor in chain
        }
    }
}
