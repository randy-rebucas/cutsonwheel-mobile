import { Component, OnInit } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

@Component({
  selector: 'app-tabs-page',
  templateUrl: './tabs-page.page.html',
  styleUrls: ['./tabs-page.page.scss'],
})
export class TabsPagePage implements OnInit {

  user: firebase.User;
  isLoading: boolean;
  userInfo: any;

  constructor(
    private authService: AuthService,
    private userService: UsersService
  ) { }

  ngOnInit() {
    this.authService.getUserState().pipe(
      switchMap(user => {
        return this.userService.getUser(user.uid);
      })
      ).subscribe((profile) => {
        this.isLoading = false;
        const user = this.authService.getUsersProfile();
        this.userInfo = { profile, ...user };
    });
  }

}
