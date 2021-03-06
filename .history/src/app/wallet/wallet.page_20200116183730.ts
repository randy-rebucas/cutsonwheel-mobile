import { Component, OnInit, OnDestroy } from '@angular/core';
import { Wallet } from './wallet';
import { Observable, Subscription, forkJoin } from 'rxjs';
import { WalletService } from './wallet.service';
import { switchMap, map, mergeMap } from 'rxjs/operators';
import { PaymentsService } from '../payments/payments.service';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
})
export class WalletPage implements OnInit {
  public wallet$: Observable<Wallet[]>;
  public user: firebase.User;
  public wallets: Wallet;

  private authSub: Subscription;
  constructor(
    private walletService: WalletService,
    private authService: AuthService
  ) { }

  ngOnInit() {

    this.wallet$ = this.walletService.getByUserId(this.authService.getUsersProfile().uid);

    this.walletService.getByUserId(this.authService.getUsersProfile().uid).pipe(
      map( bookings => {
        console.log(bookings);
        return bookings;
      })
    ).subscribe((w) => {
      console.log(w);
    });

  }
}
