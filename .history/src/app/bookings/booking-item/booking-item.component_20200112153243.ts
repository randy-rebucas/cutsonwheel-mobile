import { Component, OnInit, Input } from '@angular/core';
import { Bookings } from '../bookings';
import { AuthService } from 'src/app/auth/auth.service';
import { LoadingController } from '@ionic/angular';
import { BookingsService } from '../bookings.service';

@Component({
  selector: 'app-booking-item',
  templateUrl: './booking-item.component.html',
  styleUrls: ['./booking-item.component.scss'],
})
export class BookingItemComponent implements OnInit {
  @Input() booking: Bookings;

  userId: string;

  constructor(
    private authsService: AuthService,
    private loadingCtrl: LoadingController,
    private bookingsService: BookingsService
  ) { }

  ngOnInit() {
    const user = this.authsService.getUsersProfile();
    if (user) {
      this.userId = user.uid;
    }
  }

  onCancel(bookingId: string) {
      this.loadingCtrl
      .create({
        message: 'Deleting offer...'
      })
      .then(loadingEl => {
        loadingEl.present();
        this.bookingsService.delete(bookingId).then(() => {
          loadingEl.dismiss();
        });
      });

  }
}
