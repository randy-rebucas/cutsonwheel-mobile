import { Component, OnInit, Input } from '@angular/core';
import { Bookings } from '../bookings';
import { OffersService } from 'src/app/services/offers/offers.service';
import { Offers } from 'src/app/services/offers/offers';
import { map } from 'rxjs/operators';
import { UsersService } from 'src/app/users/users.service';
import { Users } from 'src/app/users/users';

@Component({
  selector: 'app-booking-item',
  templateUrl: './booking-item.component.html',
  styleUrls: ['./booking-item.component.scss'],
})
export class BookingItemComponent implements OnInit {
  @Input() booking: Bookings;
  @Input() role: string;

  offer: Offers;
  fullname: string;

  constructor(
    private offersService: OffersService,
    private usersService: UsersService
  ) { }

  ngOnInit() {
    this.offersService.getOffer(this.booking.assistant.offerId)
    .subscribe((offer) => {
      this.offer = offer;
    });
  }

  getFullname() {
    const id = (this.role === 'assistant') ? this.booking.userId : this.booking.assistant.assisstantId;
    this.usersService.getUser(id).pipe(
      map((user) => {
        return user.firstname + ' ' + user.lastname;
      })
    ).subscribe((fullname) => {
      this.fullname = fullname;
    });
  }
}
