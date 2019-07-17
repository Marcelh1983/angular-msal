import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ConfigLoader } from './config-loader';
import { MsalConfig } from './msal-config';

@Injectable()
export class HttpConfigLoader implements ConfigLoader {
  constructor(private http: HttpClient, private url: string) { }

  public getConfig(): Observable<MsalConfig> {
    return this.http.get<MsalConfig>(`${this.url}`);
  }
}
