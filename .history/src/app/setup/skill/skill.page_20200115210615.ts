import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription, of } from 'rxjs';
import { Router } from '@angular/router';
import { UsersService } from './../../users/users.service';
import { AuthService } from './../../auth/auth.service';
import { switchMap, map, take } from 'rxjs/operators';
import { Classifications } from './../../shared/class/classifications';
import { ClassificationsService } from './../../shared/services/classifications.service';
import { Users } from 'src/app/users/users';
import { PaymentsService } from 'src/app/payments/payments.service';
import { WalletService } from 'src/app/shared/services/wallet.service';

@Component({
  selector: 'app-skill',
  templateUrl: './skill.page.html',
  styleUrls: ['./skill.page.scss'],
})
export class SkillPage implements OnInit, OnDestroy {
  private authSub: Subscription;
  user: firebase.User;
  users: Users;

  classifications: Observable<Classifications[]>;
  classificationSelected: string;
  experienceLevel: string;
  total: number;
  bonusAmount: number;
  currency: string;
  qty: number;
  paymentMethod: string;

  constructor(
    private authService: AuthService,
    private classificationsService: ClassificationsService,
    private usersService: UsersService,
    private paymentsService: PaymentsService,
    private walletService: WalletService,
    private router: Router
  ) {
    this.qty = 1;
    this.bonusAmount = 200;
    this.currency = 'PHP';
    this.paymentMethod = 'cash';
  }

  ngOnInit() {
    const u = this.usersService.getByAdmin();
    console.log(u);
    // load all classifications
    this.classifications = this.classificationsService.getClassifications();

    // check user current state
    this.authSub = this.authService.getUserState().pipe(
      switchMap(user => {
        if (user) {
          this.user = user;
          return this.usersService.getUser(user.uid);
        } else {
          return of(null);
        }
      })
    ).subscribe( profile => {
      // make sure return an object
      this.users = profile;
      if (this.user) {
        this.classificationSelected = (profile.skills) ? profile.skills.name : '';
        this.experienceLevel = (profile.skills) ? profile.skills.level : '';
      }
    });
  }

  onPickedSkill(classification: string) {
    this.classificationSelected = classification;
  }

  levelSelected(event: CustomEvent) {
    this.experienceLevel = event.detail.value;
  }

  onNext() {
    // make sure required field not empty
    if (!this.classificationSelected || !this.experienceLevel) {
      return;
    }
    const data = {
      id: this.user.uid,
      isSetupCompleted: true,
      skills: {
        name: this.classificationSelected,
        level: this.experienceLevel
      }
    };
    // update user profile
    this.usersService.update(data).then(() => {
      const payment = {
        intent: 'authorize',
        payer: {
          paymentMethod: this.paymentMethod
        },
        transactions: {
          amount: {
            total: this.bonusAmount,
            currency: this.currency
          },
          description: 'Payment for service.',
          invoiceNumber: Math.floor(Math.random() * 999999999), // autogenerate
          itemList: {
            items: {
              name: 'Signing bunos',
              description: 'This is not refundable, transferable and withdrawable. This is equavalent to peso value that can you used.',
              quantity: this.qty,
              price: this.bonusAmount,
              currency: this.currency
            },
            shippingAddress: {
              recipientName: this.user.displayName,
              address: this.users.location.address
            }
          }
        },
        note: 'Enjoy using cutsonwheel app.',
        datePaid: new Date()
      };
      // insert payment data
      this.paymentsService.insert(payment).then((ref) => {

        // get payment information
        this.paymentsService.getOne(ref.id).subscribe((paymentRes) => {

          // this.usersService.getByAdmin().pipe(take(1)).subscribe((adminId) => {
            // set wallet object
            const wallet = {
              paymentId: paymentRes.id,
              paymentFrom: '', //adminId[0].id,
              paymentTo: this.user.uid
            };
            // insert wallet data
            this.walletService.create(wallet).then(() => {
              this.router.navigateByUrl('/t/services/discover');
            });

          // });

        });

      });

    });
  }

  onChangeExpertise() {
    this.classificationSelected = null;
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
  }
}
