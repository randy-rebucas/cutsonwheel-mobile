import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
import { Bookings } from './bookings';
import { BookingsService } from './bookings.service';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { Router } from '@angular/router';
import { Users } from '../users/users';
import { map } from 'rxjs/operators';
import { Misc } from './../shared/class/misc';
@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss']
})
export class BookingsPage implements OnInit, OnDestroy {
  isLoading = false;
  isAssistant: boolean;
  userInfo: any;
  public selectedSegment: string;
  public loadedBookings$: Observable<Bookings[]>;

  private userSub: Subscription;

  constructor(
    private bookingService: BookingsService,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private userService: UsersService,
    private router: Router
  ) {
    this.selectedSegment = 'pending';
  }

  ngOnInit() {

    const currenctUser = this.authService.getUsersProfile();
    if (currenctUser) {
      this.userSub = this.userService.getUser(currenctUser.uid).subscribe((profile) => {
        this.isAssistant = profile.roles.assistant;
        this.userInfo = profile;
        this.populateBookings(profile, 'pending');
      });
    }
  }

  private populateBookings(user: Users, status: string) {
    let loadedBooking;
    if (user.roles.assistant) {
      /** assistant */
      loadedBooking = this.getAssistantBookings(user.id, status);
    } else {
      /** client */
      loadedBooking = this.getClientBookings(user.id, status);
    }
    // this.loadedBookings$ = loadedBooking;
    loadedBooking.pipe(
      map(booking => {
        this.mapBooking(booking);
      })
    ).subscribe((response) => {
      this.isLoading = false;
      console.log(response);
      // this.bookings = response.bookings;
      // this.length = response.bookings.length;
    });
  }

  mapBooking(booking) {
    return {
      bookings: booking.map(
        b => {
          const sd = new Date(b.schedule.datePicked);
          const y = sd.getFullYear();
          const m = new Misc().pad(sd.getMonth() + 1);
          const d = new Misc().pad(sd.getDate());
          const datePicked = y + '-' + m + '-' + d;
          const timePicked = b.schedule.timePicked;
          const scheduleDate = new Date(datePicked + 'T' + timePicked);
          return {
            id: b.id,
            assistant: b.assistant,
            location: b.location,
            schedule: scheduleDate,
            status: b.status,
            userId: b.userId
          };
        }
      )
    };
  }

  private getAssistantBookings(userId: string, status: string): Observable<any> {
    return this.bookingService.getByAssistantId(userId, status);
  }

  private getClientBookings(userId: string, status: string): Observable<any> {
    return this.bookingService.getByClientId(userId, status);
  }

  segmentChanged(ev: any, user: any) {
    this.selectedSegment = ev.detail.value;
    this.populateBookings(user, ev.detail.value);
  }

  onViewBooking(bookingId: string, slidingEl: IonItemSliding) {
    slidingEl.close();
    this.router.navigateByUrl('/t/bookings/booking-detail/' + bookingId);
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }
}
