import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { map, switchMap } from 'rxjs/operators';
import { PaymentsService } from './payments.service';
import { Payments } from './payments';
import { Observable, Subscription, of } from 'rxjs';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.page.html',
  styleUrls: ['./payments.page.scss'],
})
export class PaymentsPage implements OnInit {

  isLoading: boolean;
  public payments$: Observable<Payments[]>;

  constructor(
    private authsService: AuthService,
    private paymentsService: PaymentsService
  ) {
    this.isLoading = true;
  }

  ngOnInit() {
    this.authsService.getUserState().pipe(
      switchMap(user => {
        if (user) {
          return this.paymentsService.getPaymentsByAssistantId(user.uid);
        } else {
          return of(null);
        }
      })
    ).subscribe((payments) => {
      this.isLoading = false;
      this.payments$ = payments;
    });
  }

  onViewDetails(paymentId: string) {
    console.log(paymentId);
  }

}
