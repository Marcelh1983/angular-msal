import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { ConfigLoader } from './config-loader';
import { MsalConfig } from './msal-config';
import { tap } from 'rxjs/operators';

@Injectable()
export class HttpConfigLoader implements ConfigLoader {
  private cachedConfig: MsalConfig;
  constructor(private http: HttpClient, private url: string) { }

  public getConfig(): Observable<MsalConfig> {
    return this.cachedConfig ?
      of(this.cachedConfig) :
      this.http.get<MsalConfig>(`${this.url}`).pipe(
        tap(config => this.cachedConfig = config)
      );
  }
}
