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
  @Input() isAssistantRole: boolean;

  offer: Offers;
  fullname: string;
  lbl: string;
  user: Users;

  constructor(
    private offersService: OffersService,
    private usersService: UsersService
  ) { }

  ngOnInit() {
    this.offersService.getOne(this.booking.assistant.offerId)
    .subscribe((offer) => {
      console.log(offer);
      this.offer = offer;
      console.log(this.isAssistantRole);
      // this.lbl = (!this.isAssistantRole) ? 'Client' : 'Assistant';
      // const id = (!this.isAssistantRole) ? this.booking.userId : this.booking.assistant.assisstantId;
      // this.usersService.getUser(id).subscribe((user) => {
      //   this.user = user;
      // });
    });
  }
}
