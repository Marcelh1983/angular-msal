import { MsalConfig } from './msal-config';
import { Injectable, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MsalService, MSAL_CONFIG } from './msal.service';
import { MsalGuard } from './msal.guard';

@Injectable()
export class WindowWrapper extends Window {

}
@NgModule({
  imports: [CommonModule],
  declarations: [

  ],
  providers: [MsalGuard],
})
export class MsalModule {
  static forRoot(config: MsalConfig): ModuleWithProviders<MsalModule> {
    return {
      ngModule: MsalModule,
      providers: [
        { provide: MSAL_CONFIG, useValue: config }, MsalService, { provide: WindowWrapper, useValue: window }
      ]
    };
  }

}
