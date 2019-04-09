export class AuthenticationResult {
    public token =  '';
    public tokenType = '';
    constructor(token: string, tokenType?: string) {
        this.token = token;
        if (tokenType) {
            this.tokenType = tokenType;
        }
    }
}

