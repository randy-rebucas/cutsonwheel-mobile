import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { WalletService } from '../wallet/wallet.service';
import { Wallet } from '../wallet/wallet';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  slideOpts: any;

  user: firebase.User;
  token: firebase.auth.IdTokenResult;
  private authSub: Subscription;

  wallet: Wallet;

  constructor(
    private authService: AuthService,
    private walletService: WalletService,
    private router: Router
  ) {}

  ngOnInit() {
    this.slideOpts = {
      initialSlide: 0,
      speed: 400
    };

    this.authSub = this.authService.getUserState()
      .subscribe( user => {
        if (user) {
          this.user = user;
          // this.walletService.getOne('HahDL2ZRjvtxtADZr4Cg').subscribe((wallet) => {
          //   this.wallet = wallet;
          //   console.log(wallet);
          // });
          this.walletService.getTotalWallet(user.uid)
          .subscribe((wallet) => {
            console.log(wallet);
          });
        }
    });
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
  }
}
