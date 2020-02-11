import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { AuthenticatedGuard } from './shared/guards/authenticated.guard';
import { MsalGuard } from 'modules';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    redirectTo: '/my-profile',
    pathMatch: 'full'
  },
  { path: 'my-profile', component: MyProfileComponent, canActivate: [AuthenticatedGuard] }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  providers: [
    MsalGuard,
    AuthenticatedGuard
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
