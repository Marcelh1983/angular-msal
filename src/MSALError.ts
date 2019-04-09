export class MSALError {
    constructor(error: string, errorDesc?: string, scopes?: string) {
        this.error = error;
        if (errorDesc) {
            this.errorDesc = errorDesc;
        }
        if (scopes) {
            this.scopes = scopes;
        }
    }

    get error(): string {
        return this.error;
    }

    set error(value: string) {
        this.error = value;
    }

    get errorDesc(): string {
        return this.errorDesc;
    }

    set errorDesc(value: string) {
        this.errorDesc = value;
    }

    get scopes(): string {
        return this.scopes;
    }

    set scopes(value: string) {
        this.scopes = value;
    }
}
