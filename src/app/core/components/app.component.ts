import { Component, OnInit } from '@angular/core';
import { PresenceService } from 'src/app/shares/services/presence.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'WebEcommerce';
  constructor(){}

  ngOnInit(): void {
  }
}
