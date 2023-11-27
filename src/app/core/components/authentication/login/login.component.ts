import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/shares/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form: FormGroup = new FormGroup({
    username: new FormControl('',Validators.required),
    password: new FormControl('',Validators.required),
  });
  returnUrl:string;
  constructor(
    private _user: UserService,
    private route: ActivatedRoute,
    private _router:Router){
      this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    }

  submit() {
    if (this.form.valid) {
      this._user.login(this.form.value).subscribe(x => {
        if(this.returnUrl){
          this._router.navigate([this.returnUrl])
        }
        this._router.navigate(['/home'])
      });
    }
  }


}
