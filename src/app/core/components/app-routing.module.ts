import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/modules/home/home.component';
import { RoomComponent } from 'src/app/modules/room/room.component';
import { LoginComponent } from './authentication/login/login.component';
import { AuthGuard } from '../guard/auth.guard';
import { PreventUnsavedChangesGuard } from '../guard/prevent-unsaved-changes.guard';

const routes: Routes = [
  {
    path:'',
    runGuardsAndResolvers:'always',
    canActivate: [AuthGuard],
    children:[
      {path: '', component: HomeComponent},
      {path: 'home', component: HomeComponent},
      {path: 'room/:id', component: RoomComponent,canDeactivate: [PreventUnsavedChangesGuard]},
      //{path: 'manage-user', component: ManageUserComponent, canActivate: [AdminGuard]}
    ]
  },
  {path: 'login', component: LoginComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
