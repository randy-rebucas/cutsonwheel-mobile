import { Component, OnInit } from '@angular/core';
import { SegmentChangeEventDetail } from '@ionic/core';
import { ModalController, NavController } from '@ionic/angular';
import { UsersService } from './../../../users/users.service';
import { Observable, forkJoin } from 'rxjs';
import { Users } from './../../../users/users';
import { ServicesComponent } from './services/services.component';
import { map, mergeMap } from 'rxjs/operators';
import { Offers } from 'src/app/services/offers/offers';

interface Assistant {
  assisstantId: string;
  selectedServices: any[];
  subTotal: number;
}
@Component({
  selector: 'app-assistant',
  templateUrl: './assistant.page.html',
  styleUrls: ['./assistant.page.scss'],
})
export class AssistantPage implements OnInit {
  public assistants$: Observable<Users[]>;
  public isLoading: boolean;
  public selectedAssistant: Users;
  public activeNext: boolean;
  public assistant: Assistant;
  public currentNumber = 1;
  public services: any;

  get assitantData() {
    return this.usersService.getByAssistant('');
  }

  mapping: {[k: string]: string} = {
    '=0': 's',
    '=1': '',
    other: 's',
  };

  constructor(
    private usersService: UsersService,
    private modalCtrl: ModalController,
    private navCtrl: NavController
  ) {
    this.isLoading = true;
    this.activeNext = false;
   }

  ngOnInit() {
    const locationSet = this.getLocation();
    if (!locationSet) {
      this.navCtrl.navigateBack('/t/bookings/booking-create/location');
    }

    this.assistants$ = this.assitantData;
    if (this.assistants$) {
      this.isLoading = false;
    }

    this.assistant = this.getAssistant();
    if (this.assistant) {
      this.activeNext = true;

      this.usersService.getUser(this.assistant.assisstantId).subscribe((user) => {
        this.selectedAssistant = user;
      });
    }

    this.services = this.assistant.selectedServices;
  }

  incrementQty(index: number) {
    this.services[index].qty += 1;
  }

  decrementQty(index: number) {
    const qty = this.services[index].qty;
    if (qty !== 1) {
      this.services[index].qty -= 1;
    }
  }

  ionViewWillEnter() {
    this.assistants$ = this.assitantData;
  }

  onNext(target: string) {
    this.navCtrl.navigateBack('/t/bookings/booking-create/' + target);
  }

  onPickedAssistant(userId: string) {
    this.modalCtrl.create({
        component: ServicesComponent,
        componentProps: {
          assistantId: userId
        }
      }).then(modalEl => {
      modalEl.onDidDismiss().then(modalData => {
        if (!modalData.data) {
          return;
        }
        // if should return service selected
        const assistantData = {
          assisstantId: userId,
          selectedServices: modalData.data.selectedServices,
          subTotal: modalData.data.subTotal
        };
        localStorage.setItem('assistant', JSON.stringify(assistantData));
        // redirect to next steps
        this.navCtrl.navigateBack('/t/bookings/booking-create/schedule');
      });
      modalEl.present();
    });
  }

  private getAssistant() {
    return JSON.parse(localStorage.getItem('assistant'));
  }

  onClear(ev: any) {
    this.assistants$ = this.assitantData;
  }

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    const searchTerm = event.detail.value;
    if (!searchTerm) {
      this.assistants$ = this.assitantData;
    }
    this.assistants$ = this.usersService.getByAssistant(searchTerm);
  }

  private getLocation() {
    return JSON.parse(localStorage.getItem('location'));
  }
}
