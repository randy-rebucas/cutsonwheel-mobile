import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Places } from 'src/app/places/places';
import { ModalController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-create-booking',
  templateUrl: './create-booking.component.html',
  styleUrls: ['./create-booking.component.scss'],
})
export class CreateBookingComponent implements OnInit {
  @Input() selectedPlace: Places;
  @Input() selectedMode: 'select' | 'random';
  @ViewChild('f', {static: false}) form: NgForm;

  startDate: string;
  endDate: string;

  constructor(private modalController: ModalController) { }

  ngOnInit() {
    const availableFrom = new Date(this.selectedPlace.availableFrom);
    const availableTo = new Date(this.selectedPlace.availableTo);
    console.log(availableFrom);
    console.log(availableFrom.getTime() +
    Math.random() *
      (availableTo.getTime() -
        7 * 24 * 60 * 60 * 1000 -
        availableFrom.getTime()));

    if (this.selectedMode === 'random') {
      // this.startDate = ;

      console.log(this.startDate);

      this.endDate = new Date(
        new Date(this.startDate).getTime() +
          Math.random() *
            (new Date(this.startDate).getTime() +
              6 * 24 * 60 * 60 * 1000 -
              new Date(this.startDate).getTime())
      ).toISOString();

      console.log(this.endDate);
    }
  }

  onBookPlace() {
    // || !this.datesValid
    if (!this.form.valid ) {
      return;
    }

    this.modalController.dismiss({ bookingData: {
      firstName: this.form.value['first-name'],
      lastName: this.form.value['last-name'],
      guestsNumber: this.form.value['guest-number'],
      startDate: this.form.value['date-from'],
      endDate: this.form.value['date-to']
    } }, 'confirm');
  }

  onCancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  datesValid() {
    const startDate = new Date(this.form.value['date-from']);
    const endDate = new Date(this.form.value['date-to']);
    return endDate > startDate;
  }
}
