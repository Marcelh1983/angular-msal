import { LogLevel, CacheLocation } from 'msal';
import { ILoggerCallback } from 'msal/lib-commonjs/Logger';
import { QPDict } from 'msal/lib-commonjs/AuthenticationParameters';

export class MsalConfig {
    clientID: string;
    authority ?= 'https://login.microsoftonline.com/common';
    tokenReceivedCallback?: boolean;
    validateAuthority ?= true;
    storeAuthStateInCookie ?= true;
    cacheLocation: CacheLocation = 'sessionStorage';
    redirectUri?: string;
    postLogoutRedirectUri?: string;
    logger?: ILoggerCallback;
    loadFrameTimeout ?= 6000;
    navigateToLoginRequestUrl ?= true;
    popUp?: boolean;
    consentScopes?: string[];
    isAngular?: true;
    unprotectedResources?: string[] = [];
    protectedResourceMap?: [string, string[]][] = [];
    extraQueryParameters?: QPDict;
    correlationId?: string;
    level?: LogLevel;
    piiLoggingEnabled?: boolean;

}


