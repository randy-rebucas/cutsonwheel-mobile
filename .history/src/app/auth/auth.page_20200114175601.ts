import { Component, OnInit, OnDestroy } from '@angular/core';

import { Router } from '@angular/router';
import { FirebaseUISignInSuccessWithAuthResult, FirebaseUISignInFailure } from 'firebaseui-angular';
import { UsersService } from 'src/app/users/users.service';
import { Users } from 'src/app/users/users';
import { map, switchMap } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit, OnDestroy {

  public user: firebase.User;

  private authSub: Subscription;

  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit() {
    // listen to auth state
    this.authSub = this.authService.getUserState().pipe(
      switchMap(user => {
        if (user) {
          return this.usersService.getUser(user.uid);
        } else {
          return of(null);
        }
      })
    ).subscribe((profile) => {
      // check if user state was logedin
      if (profile) {
        // check if user already done the setup
        if (profile.isSetupCompleted) {
          // redirect to discover
          this.router.navigateByUrl('/t/services/discover');
        } else {
          // redirect to user setup
          this.router.navigateByUrl('/setup');
        }
      }
    });
  }

  successCallback(signInSuccessData: FirebaseUISignInSuccessWithAuthResult) {
    // check if its new user
    if (signInSuccessData.authResult.additionalUserInfo.isNewUser) {
      // signInSuccessData.authResult.additionalUserInfo.providerId
      this.user = signInSuccessData.authResult.user;

      this.usersService.insert(this.user).then(() => {
        this.router.navigateByUrl('/setup');
      });
    }
  }

  errorCallback(errorData: FirebaseUISignInFailure) {
    console.log(errorData);
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }

}
