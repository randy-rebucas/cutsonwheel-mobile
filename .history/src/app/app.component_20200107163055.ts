import { Component, OnInit } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthService } from './auth/auth.service';
import { Router } from '@angular/router';

import { Plugins, Capacitor } from '@capacitor/core';
import { switchMap } from 'rxjs/operators';
import { UsersService } from './users/users.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  user: firebase.User;
  userInfo: any;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authService: AuthService,
    private userService: UsersService,
    private router: Router,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if (Capacitor.isPluginAvailable('SplashScreen')) {
        Plugins.SplashScreen.hide();
      }
    });
    this.authService.getUserState().pipe(
      switchMap(user => {
        return this.userService.getUser(user?.uid);
      })
    ).subscribe((profile) => {
      console.log(profile);
    });
    const currenctUser = this.authService.getUsersProfile();
    if (currenctUser) {
      const profile = this.userService.getUser(currenctUser.uid);
      this.userInfo = { profile, ...currenctUser };
    }

  }

  ngOnInit() {
    this.authService.getUserState()
      .subscribe( user => {
        if (!user) {
          this.router.navigateByUrl('/auth');
        }
        this.user = user;
      });
  }

  onLogout() {
    this.authService.logout();
    window.location.reload();
  }

}
