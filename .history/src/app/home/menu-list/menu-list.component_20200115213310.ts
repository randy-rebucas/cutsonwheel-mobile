import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { UsersService } from 'src/app/users/users.service';
import { OffersService } from 'src/app/services/offers/offers.service';
import { BookingsService } from 'src/app/bookings/bookings.service';
import { Router } from '@angular/router';
import { Users } from 'src/app/users/users';
import { MenuController } from '@ionic/angular';


@Component({
  selector: 'app-menu-list',
  templateUrl: './menu-list.component.html',
  styleUrls: ['./menu-list.component.scss'],
})
export class MenuListComponent implements OnInit, OnDestroy {
  user: firebase.User;
  users: Users;

  totalOffer: number;
  totalBooking: number;
  isOfferActive: boolean;

  private authSub: Subscription;
  private offerSub: Subscription;
  private bookingSub: Subscription;

  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private offersService: OffersService,
    private bookingsService: BookingsService,
    private router: Router,
    private menu: MenuController
  ) {
    this.totalOffer = 0;
    this.totalBooking = 0;
    this.isOfferActive = false;
   }

  ngOnInit() {
    this.authSub = this.authService.getUserState().pipe(
      switchMap(user => {
        if (user) {
          this.user = user;
          return this.userService.getUser(user.uid);
        } else {
          return of(null);
        }
      })
    ).subscribe((profile) => {

      if (this.user) {
        this.users = profile;
        if (profile.roles) {
          this.isOfferActive = profile.roles.assistant;
        }
        /** count offers */
        this.getTotalOffer(this.user.uid);
        /** count bookings */
        this.getTotalBooking(this.user.uid);
      }

    });
  }

  getTotalOffer(userId: string) {
    this.offerSub = this.offersService.getSizeById(userId).subscribe((res) => {
      this.totalOffer = res.docs.length;
    });
  }

  getTotalBooking(userId: string) {
    this.bookingSub = this.bookingsService.getSizeById(userId).subscribe((res) => {
      this.totalBooking = res.docs.length;
    });
  }

  onLogout() {
    this.authService.logout();
    this.menu.close();
    this.router.navigateByUrl('/home');
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
    this.offerSub.unsubscribe();
    this.bookingSub.unsubscribe();
  }
}
