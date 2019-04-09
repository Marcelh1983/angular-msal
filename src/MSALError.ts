export class MSALError {
    public error = '';
    public errorDesc = '';
    public scopes = '';
    constructor(error: string, errorDesc?: string, scopes?: string) {
        this.error = error;
        if (errorDesc) {
            this.errorDesc = errorDesc;
        }
        if (scopes) {
            this.scopes = scopes;
        }
    }
}
