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
  itemLimit = 5;
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

        this.loadTransactions(null, this.itemLimit);

        this.paymentsService.getByUserId(user.uid, this.itemLimit).subscribe((payments) => {
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

  loadTransactions(event?, limit?: number) {
    this.paymentsService.getByUserId(this.user.uid, limit)
    .subscribe((payments) => {
      this.isLoading = false;
      this.wallets = this.wallets.concat(payments);
      if (event) {
        event.target.complete();
      }
    });
  }

  loadMore(event) {
    console.log(event)
    this.itemLimit++;
    const length = 0;
    this.loadTransactions(event, this.itemLimit);
    if (this.wallets.length === 14) {
      this.toastCtrl.create({
          message: 'All transaction loaded!',
          duration: 2000
        }).then(toast => toast.present());
      event.target.disabled = true;
    }
  }

}
