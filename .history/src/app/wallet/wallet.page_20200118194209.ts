import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PaymentsService } from '../payments/payments.service';
import { AuthService } from '../auth/auth.service';
import { IonInfiniteScroll, ToastController } from '@ionic/angular';
import { map } from 'rxjs/operators';
import { Payments } from '../payments/payments';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
})
export class WalletPage implements OnInit {
  @ViewChild(IonInfiniteScroll, { static: false}) infiniteScroll: IonInfiniteScroll;

  public user: firebase.User;
  balance: number;
  wallets = [];
  payments: Payments;

  constructor(
    private paymentsService: PaymentsService,
    private authService: AuthService,
    private toastCtrl: ToastController,

  ) { }

  ngOnInit() {
    this.authService.getUserState().subscribe((user) => {
      if (user) {
        this.user = user;
        this.paymentsService.getByUserId(user.uid).subscribe((payments) => {

          payments.forEach(element => {
            console.log(element);
            this.wallets.push(element);
          });

          let balance = 0;
          for (const payment of payments) {
            if (payment.paymentFrom === user.uid) {
              balance -= payment.transactions.amount.total;
            }

            if (payment.paymentTo === user.uid) {
              balance += payment.transactions.amount.total;
            }
          }

          this.balance = balance;
        });

      }
    });
  }

  loadData(event) {
    const length = 0;
    this.paymentsService.getByUserId(this.user.uid).subscribe((payments) => {

      payments.forEach(element => {
        this.wallets.push(element);
      });
      event.target.complete();
      // App logic to determine if all data is loaded
      // and disable the infinite scroll
      if (length < this.wallets.length) {
        this.toastCtrl.create({
          message: 'all transaction loaded!',
          duration: 2000
        }).then(toast => toast.present());
        event.target.disabled = true;
      }
    });
  }

}
