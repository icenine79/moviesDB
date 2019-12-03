import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './core/components/home/home.component';
import { SignupComponent } from './core/components/signup/signup.component';
import { LoginComponent } from './core/components/login/login.component';
import { AuthGuardService } from './core/services/guards/auth-guard.service';
import { DetailComponent } from './core/components/detail/detail.component';
import { UsersListComponent } from './core/components/users-list/users-list.component';
import { LogoutComponent } from './core/components/logout/logout.component';


export const routes: Routes = [
  {path:'home', component: HomeComponent ,  canActivate:[AuthGuardService] },
  {path:'movieDetail/:title', component:DetailComponent},
  {path: 'signup', component: SignupComponent},
  {path: 'login', component: LoginComponent},
  {path: 'list', component: UsersListComponent},
  {path: 'edit/:id', component:SignupComponent},
  {path:'logout', component:LogoutComponent},
  {path:'', redirectTo:'login', pathMatch:'full'},
  {path:'**', component: LoginComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }