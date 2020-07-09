import { LogLevel, CacheLocation } from 'msal';

export class MsalConfig {
    userinteractionInGuard?= false;
    lang?: string;

    clientId: string;
    authority?: string;
    tokenReceivedCallback?: boolean;
    validateAuthority?= true;
    storeAuthStateInCookie?= true;
    cacheLocation?: CacheLocation;
    redirectUri?: string | (() => string);
    postLogoutRedirectUri?: string | (() => string);
    loadFrameTimeout?: number;
    navigateToLoginRequestUrl?= false;
    popUp?: boolean;
    consentScopes?: string[];
    unprotectedResources?: string[] = [];
    protectedResourceMap?: [string, string[]][] = [];
    correlationId?: string;
    level?: LogLevel;
    piiLoggingEnabled?: boolean;
}

