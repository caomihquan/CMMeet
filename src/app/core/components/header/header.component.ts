import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/shares/services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  constructor(protected _user:UserService,private _router:Router){
  }
  logout(){
    this._user.logout()
    this._router.navigate(['/login'])
  }
}
