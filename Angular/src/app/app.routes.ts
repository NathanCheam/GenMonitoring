import { Routes } from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {LoginComponent} from './pages/login/login.component';
import {RegisterComponent} from './pages/register/register.component';
import {ExerciceComponent} from './pages/exercice/exercice.component';
import {ExercicedetailsComponent} from './pages/exercice/exercicedetails/exercicedetails.component';

export const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'exercice', component: ExerciceComponent},
  {path: 'exercicedetails', component: ExercicedetailsComponent},
];
