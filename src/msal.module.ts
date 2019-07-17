import { Injectable, ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MsalGuard } from './msal-guard.service';

@Injectable()
export class WindowWrapper extends Window {

}
@NgModule({
  imports: [CommonModule],
  declarations: [  ],
  providers: [MsalGuard],
})
export class MsalModule {
  static forRoot(configLoader: Provider): ModuleWithProviders {
    return {
      ngModule: MsalModule,
      providers:  [
        configLoader
      ]
    };
  }
}
