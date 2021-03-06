import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-review',
  templateUrl: './review.page.html',
  styleUrls: ['./review.page.scss'],
})
export class ReviewPage implements OnInit {
  activeNext: boolean;

  constructor(
    private navCtrl: NavController
  ) {
    this.activeNext = false;
  }

  ngOnInit() {
  }

  onNext(target: string) {
    this.navCtrl.navigateBack('/t/bookings/booking-create/' + target);
  }
}
