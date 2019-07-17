
import { Observable } from 'rxjs';
import { MsalConfig } from 'msal-config';

export abstract class ConfigLoader {
  abstract getConfig(): Observable<MsalConfig> ;
}
