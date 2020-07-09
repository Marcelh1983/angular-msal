import { LogLevel, CacheLocation } from 'msal';
import { ILoggerCallback } from 'msal/lib-commonjs/Logger';
import { StringDict } from 'msal/lib-commonjs/MsalTypes';

export class MsalConfig {
    clientID: string;
    authority ?= 'https://login.microsoftonline.com/common';
    tokenReceivedCallback?: boolean;
    validateAuthority ?= true;
    storeAuthStateInCookie ?= true;
    cacheLocation?: CacheLocation;
    redirectUri?: string | (() => string);
    postLogoutRedirectUri?: string | (() => string);
    logger?: ILoggerCallback;
    loadFrameTimeout ?= 6000;
    navigateToLoginRequestUrl ?= false;
    popUp?: boolean;
    consentScopes?: string[];
    unprotectedResources?: string[] = [];
    protectedResourceMap?: [string, string[]][] = [];
    extraQueryParameters?: StringDict;
    correlationId?: string;
    level?: LogLevel;
    piiLoggingEnabled?: boolean;
}

