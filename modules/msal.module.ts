import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { MsalConfig } from './msal-config';
import { MsalGuard } from './msal.guard';
import { MSAL_CONFIG, MsalService } from './msal.service';

@NgModule({
  imports: [CommonModule],
  declarations: [],
  providers: [MsalGuard],
})
export class MsalModule {
  static forRoot(config: MsalConfig): ModuleWithProviders<MsalModule> {
    return {
      ngModule: MsalModule,
      providers: [
        { provide: MSAL_CONFIG, useValue: config }, MsalService
      ]
    };
  }
}

