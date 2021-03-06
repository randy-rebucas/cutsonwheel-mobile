import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, from } from 'rxjs';
import { Auth } from './auth';
import { map, tap } from 'rxjs/operators';
import { Plugins } from '@capacitor/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  localId: string;
  expiresIn: string;
  registered?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private eventAuthError = new BehaviorSubject<string>(null);
  eventAuthError$ = this.eventAuthError.asObservable();
  newUser: any;

  private auth = new BehaviorSubject<Auth>(null);

  private activeLogoutTimer: any;

  get userIsAuthenticated() {
    return this.auth.asObservable().pipe(
      map(auths => {
        if (auths) {
          return !!auths.token;
        } else {
          return false;
        }
      })
    );
  }

  get userId() {
    return this.auth.asObservable().pipe(
      map(auths => {
        if (auths) {
          return auths.uid;
        } else {
          return null;
        }
      })
    );
  }

  get token() {
    return this.auth.asObservable().pipe(
      map(auths => {
        if (auths) {
          return auths.refreshToken;
        } else {
          return null;
        }
      })
    );
  }

  get email() {
    return this.auth.asObservable().pipe(
      map(auths => {
        if (auths) {
          return auths.email;
        } else {
          return null;
        }
      })
    );
  }

  constructor(
    private http: HttpClient,
    private angularFireAuth: AngularFireAuth,
    private db: AngularFirestore,
    private router: Router
  ) { }

  getUserState() {
    return this.angularFireAuth.authState;
  }

  login(enteredEmail: string, enteredPassword: string) {
    this.angularFireAuth.auth.signInWithEmailAndPassword(enteredEmail, enteredPassword)
    .catch(error => {
      this.eventAuthError.next(error);
    })
    .then(userCredential => {
      if (userCredential) {
        this.router.navigate(['/f/places/discover']);
      }
    });
    // return this.angularFireAuth.auth.signInWithEmailAndPassword(enteredEmail, enteredPassword)
    //   .then(res => {
    //     const userData = {
    //       refreshToken: res.user.refreshToken,
    //       id:  res.user.uid,
    //       email:  res.user.email,
    //       emailVerified:  res.user.emailVerified,
    //       displayName:  res.user.displayName,
    //       photoURL:  res.user.photoURL,
    //       phoneNumber:  res.user.phoneNumber,
    //       creationTime:  res.user.metadata.creationTime,
    //       lastSignInTime:  res.user.metadata.lastSignInTime
    //     };
    //     this.setUserData(userData);
    //   }
    // );
  }

  autoLogin() {
    return from(Plugins.Storage.get({ key: 'authData' })).pipe(
      map(storedData => {
        if (!storedData || !storedData.value) {
          return null;
        }
        const parseData = JSON.parse(storedData.value) as {
          refreshToken: string;
          userId: string;
          email: string;
          emailVerified: boolean;
          displayName: string;
          photoURL: string;
          phoneNumber: string;
          creationTime: Date;
          lastSignInTime: Date;
        };

        const user = new Auth(
          parseData.refreshToken,
          parseData.userId,
          parseData.email,
          parseData.emailVerified,
          parseData.displayName,
          parseData.photoURL,
          parseData.phoneNumber,
          parseData.creationTime,
          parseData.lastSignInTime
        );
        return user;
      }),
      tap(user => {
        if (user) {
          this.auth.next(user);
        }
      }),
      map(user => {
        return !!user;
      })
    );
  }

  createUser(user) {
    this.angularFireAuth.auth.createUserWithEmailAndPassword( user.email, user.password)
      .then( userCredential => {
        this.newUser = user;
        console.log(userCredential);
        userCredential.user.updateProfile( {
          displayName: user.firstName + ' ' + user.lastName
        });

        this.insertUserData(userCredential)
          .then(() => {
            this.router.navigate(['/home']);
          });
      })
      .catch( error => {
        this.eventAuthError.next(error);
      });
  }

  insertUserData(userCredential: firebase.auth.UserCredential) {
    return this.db.doc(`Users/${userCredential.user.uid}`).set({
      email: this.newUser.email,
      firstname: this.newUser.firstName,
      lastname: this.newUser.lastName,
      role: 'network user'
    });
  }

  logout() {
    return this.angularFireAuth.auth.signOut();
  }

  signup(enteredEmail: string, enteredPassword: string) {
    return this.angularFireAuth.auth.createUserWithEmailAndPassword(enteredEmail, enteredPassword).then(res => {
      const userData = {
        refreshToken: res.user.refreshToken,
        id:  res.user.uid,
        email:  res.user.email,
        emailVerified:  res.user.emailVerified,
        displayName:  res.user.displayName,
        photoURL:  res.user.photoURL,
        phoneNumber:  res.user.phoneNumber,
        creationTime:  res.user.metadata.creationTime,
        lastSignInTime:  res.user.metadata.lastSignInTime
      };
      this.setUserData(userData);
    });
  }

  // logout() {
  //   if (this.activeLogoutTimer) {
  //     clearTimeout(this.activeLogoutTimer);
  //   }
  //   this.auth.next(null);
  //   Plugins.Storage.remove({ key: 'authData' });
  //   this.angularFireAuth.auth.signOut();
  // }

  ngOnDestroy() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
  }

  private setUserData(userData: any) {
    const user = new Auth(
      userData.refreshToken,
      userData.id,
      userData.email,
      userData.emailVerified,
      userData.displayName,
      userData.photoURL,
      userData.phoneNumber,
      userData.creationTime,
      userData.lastSignInTime
      // expirationTime
    );
    this.auth.next(user);
    this.storeAuthData(userData);
  }

  private storeAuthData(authData: any) {
    const data = JSON.stringify({
      userId: authData.id,
      token: authData.refreshToken,
      email: authData.email,
      emailVerified: authData.emailVerified,
      displayName: authData.displayName,
      photoURL: authData.photoURL,
      phoneNumber: authData.phoneNumber,
      creationTime: authData.creationTime,
      lastSignInTime: authData.lastSignInTime
      // tokenExpirationDate: setTokenExpirationDate,
      // tenantId: authData.tenantId
    });
    Plugins.Storage.set({
      key: 'authData',
      value: data
    });
  }

}
