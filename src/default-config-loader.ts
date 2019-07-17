import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { ConfigLoader } from './config-loader';
import { MsalConfig } from './msal-config';

@Injectable()
export class DefaultConfigLoader implements ConfigLoader {
  constructor(private config: MsalConfig) { }

  public getConfig(): Observable<MsalConfig> {
    return of(this.config);
  }
}
