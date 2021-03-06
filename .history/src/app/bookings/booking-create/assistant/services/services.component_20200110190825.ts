import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { Users } from 'src/app/users/users';
import { Observable, Subject, Subscription } from 'rxjs';
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

  private cartObservable = new Subject<{ total: number }>();
  public user: any;
  public offers$: Observable<Offers[]>;
  selectedServices = [];
  total: number;
  private servicesSub: Subscription;
  // navParams: NavParams
  constructor(
    private modalCtrl: ModalController,
    private offersService: OffersService,
    private usersService: UsersService
  ) {
    this.total = 0;
  }

  ngOnInit() {
    this.usersService.getUser(this.assistantId).subscribe((user) => {
      this.user = user;
    });

    this.offers$ = this.offersService.getByUserId(this.assistantId);

    this.servicesSub = this.getCartObservable()
    .subscribe((cartData: { total: number}) => {
      this.total = cartData.total;
    });
  }

  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  selectService(ev: CustomEvent) {
    if (ev.detail.checked) {
      // this.selectedServices.push(ev.detail.value);
      this.addCart(ev.detail.value);
    } else {
      this.removeCart(ev.detail.value);
      // let myFish = this.selectedServices;
      // let removed = this.selectedServices.splice(ev.detail.value.id, 1);
      // const index = this.selectedServices.indexOf(ev.detail.value.id, 0);
      // if (index > -1) {
      //   const clean = this.selectedServices.splice(index, 1);
      //   this.selectedServices.push(clean);
      // }
      // const filters = ev.detail.value;
      // this.selectedServices.filter(o => filters.id.includes(o.id));
      // this.selectedServices.filter(obj => obj !== filters);
      // console.log(this.selectedServices);
    }

    // this.getSum().subscribe((subTotal) => {
    //   this.total = subTotal;
    // });
  }

  addCart(service: {}) {
    // get initial cart items
    this.selectedServices = this.getCartItems() ? this.getCartItems() : [];
    // push new item
    this.selectedServices.push(service);
    // set new cart items
    this.setCartItem(this.selectedServices);
  }

  removeCart(service: {id: string}) {
    // get all cart items
    let servicesItems = this.getCartItems() ? this.getCartItems() : [];
    // filter cart items to remove
    servicesItems = servicesItems.filter(items => items.id !== service.id);
    // update observables
    this.cartObservable.next({
      total: this.getTotal()
    });
    // set cart item again
    this.setCartItem([...servicesItems]);
  }

  setCartItem(service: any) {
    // set cart items
    sessionStorage.setItem('services', JSON.stringify(service));
    // set cart items
    this.setCartObservable();
  }

  getCartItems() {
    // get all cart items
    return JSON.parse(sessionStorage.getItem('services'));
  }

  setCartObservable() {
    // get all cart items
    const servicesItems = this.getCartItems() ? this.getCartItems() : [];

    // update observables
    this.cartObservable.next({
      total: this.getTotal()
    });
  }

  getCartObservable() {
    // observe changes in session storage
    return this.cartObservable.asObservable();
  }

  onSelectService() {
    this.modalCtrl.dismiss(
      {
        selectedServices: this.selectedServices
      },
      'confirm'
    );
  }

  private getTotal() {
    // set default total 0
    let subTotal = 0;
    // get all items in session storage
    const servicesItems = this.getCartItems();
    // check if sesison service exist
    if (servicesItems) {
      // iterate all items
      servicesItems.forEach(element => {
        // total
        subTotal += parseFloat(element.charges);

      });

    }

    return subTotal;
  }

}
