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
  isLoading: boolean;

  items = [];
  constructor(
    private paymentsService: PaymentsService,
    private authService: AuthService,
    private toastCtrl: ToastController,
  ) {
    this.isLoading = true;
  }

  ngOnInit() {
    this.authService.getUserState().subscribe((user) => {
      if (user) {
        this.user = user;

        this.loadTransactions();

        this.paymentsService.getByUserId(user.uid).subscribe((payments) => {
          this.isLoading = false;
          payments.forEach(element => {
            this.wallets.push(element);
          });

          let balance = 0;
          for (const payment of payments) {
            if (payment.paymentTo === user.uid) {
              balance += payment.transactions.amount.total;
            }
          }

          this.balance = balance;
        });

      }
    });
  }

  loadTransactions(event?) {
    this.paymentsService.getByUserId(this.user.uid).subscribe((payments) => {
      // this is an options
      this.items = this.items.concat(payments);

      if (event) {
        event.target.complete();
      }
    });
  }

  loadMore(event) {
    const length = 0;
    this.loadTransactions(event);
    if (length < this.items.length) {
      this.toastCtrl.create({
        message: 'All transaction loaded!',
        duration: 2000
      }).then(toast => toast.present());
      event.target.disabled = true;
    }
  }

}
