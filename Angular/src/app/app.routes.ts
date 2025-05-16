import { Routes } from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {ExerciceComponent} from './pages/exercice/exercice.component';
import {ExercicedetailsComponent} from './pages/exercice/exercicedetails/exercicedetails.component';
import {DepartementsTComponent} from './pages/apiOlivier/departements-t/departements-t.component';

export const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {path: 'exercice', component: ExerciceComponent},
  {path: 'exercicedetails', component: ExercicedetailsComponent},
  {path: 'departementsT', component: DepartementsTComponent},
];
