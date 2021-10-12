import {Component, Inject, OnInit} from '@angular/core';
import {AuthService} from '@auth0/auth0-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {

  constructor(public auth: AuthService) {

    this.auth.isAuthenticated$.subscribe(authResult => {
      if(!authResult) {
        this.auth.loginWithRedirect({appState: { target: '/booking' }})
      }
    })
  }


}
