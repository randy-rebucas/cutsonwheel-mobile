import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { Users } from 'src/app/users/users';
import { Observable } from 'rxjs';
import { Offers } from 'src/app/services/offers/offers';
import { OffersService } from 'src/app/services/offers/offers.service';
import { UsersService } from 'src/app/users/users.service';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
})
export class ServicesComponent implements OnInit {
  @Input() assistantId: string;
  @ViewChild('f', { static: false }) form: NgForm;

  public user: any;
  public offers$: Observable<Offers[]>;
  selectedServices = [{}];
  // navParams: NavParams
  constructor(
    private modalCtrl: ModalController,
    private offersService: OffersService,
    private usersService: UsersService
  ) { }

  ngOnInit() {
    this.usersService.getUser(this.assistantId).subscribe((user) => {
      this.user = user;
    });

    this.offers$ = this.offersService.getByUserId(this.assistantId);
  }

  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  selectService(ev: CustomEvent) {
    if (ev.detail.checked) {
      this.selectedServices.push(ev.detail.value);
    }
    console.log(this.getSum());
    this.getSum().subscribe((total) => {
      console.log(total);
    });
  }

  onSelectService() {
    localStorage.setItem('services', JSON.stringify(this.selectedServices));
  }

  onPickedService(offerId: string) {
    // console.log(offerId);
    // this.modalCtrl.dismiss(
    //   {
    //     offerId
    //   },
    //   'confirm'
    // );
  }

  private getServices() {
    return JSON.parse(localStorage.getItem('services'));
  }

  private getSum(): Observable<number> {
    const input = this.getServices();
    return new Observable(observer => {
      let total =  0;
      if (input !== null) {
        // tslint:disable-next-line: prefer-for-of
        for (let index = 0; index < input.length; index++) {
          const element = input[index];
          if (isNaN(element.charges)) {
            continue;
          }
          total += Number(element.charges);
        }
        observer.next(total);
      }

    });
    // let total =  0;
    // // tslint:disable-next-line: prefer-for-of
    // for (let index = 0; index < input.length; index++) {
    //   const element = input[index];
    //   if (isNaN(element.charges)) {
    //     continue;
    //   }
    //   total += Number(element.charges);
    // }
    // return total;
  }
}
