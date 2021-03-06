import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NavController,
  LoadingController,
  AlertController
} from '@ionic/angular';
import { Subscription } from 'rxjs';

import { AuthService } from '../../../auth/auth.service';
import { Offers } from '../../offers/offers';
import { OffersService } from '../../offers/offers.service';
import { UsersService } from '../../../users/users.service';
import { Users } from 'src/app/users/users';

@Component({
  selector: 'app-offer-detail',
  templateUrl: './offer-detail.page.html',
  styleUrls: ['./offer-detail.page.scss'],
})
export class OfferDetailPage implements OnInit, OnDestroy {

  isBookable: boolean;
  isLoading: boolean;
  user: firebase.User;
  assistantDetail: Users;
  userDetail: Users;
  canDelete: boolean;
  offer: Offers;

  private offerSub: Subscription;
  private authSub: Subscription;
  private userSub: Subscription;

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private offersService: OffersService,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private usersService: UsersService,
    private alertCtrl: AlertController,
    private router: Router
  ) {
    this.canDelete = false;
    this.isLoading = true;
    this.isBookable = false;
  }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('offerId')) {
        this.navCtrl.navigateBack('/t/services/discover');
        return;
      }

      this.authSub = this.authService.getUserState()
          .subscribe((user) => {
            if (user) {
              this.user = user;
              // validate client permission to booked
              this.canBooked(user.uid);
            }
          }
        );

      this.offerSub = this.offersService.getOne(paramMap.get('offerId'))
      .subscribe(offer => {
        // set loading to false
        this.isLoading = false;

        // set offer class
        this.offer = offer;

        // get assistant details
        this.getAssistantRole(offer.userId);

        // validate can delete access
        this.canDelete = this.canDeleteAction(this.user.uid, offer.userId);
      },
      error => {
        this.alertCtrl
          .create({
            header: 'An error ocurred!',
            message: 'Could not load offer.',
            buttons: [
              {
                text: 'Okay',
                handler: () => {
                  this.router.navigate(['/t/services/discover']);
                }
              }
            ]
          })
          .then(alertEl => alertEl.present());
      });
    });
  }

  getAssistantRole(userId: string) {
    this.userSub = this.usersService.getUser(userId)
      .subscribe((assistant) => {
        this.assistantDetail = assistant;
      }
    );
  }

  canDeleteAction(userId: string, key: any): boolean {
    if (!userId) { return false; }
    if (userId === key) {
      return true;
    }
    return false;
  }

  canBooked(userId: string) {
    this.userSub = this.usersService.getUser(userId)
      .subscribe((activeUser) => {
        this.userDetail = activeUser;
        if (activeUser.roles.client) {
          this.isBookable = true;
        }
      }
    );
  }

  onBookOffer(offerId: string) {
    this.loadingCtrl
    .create({
      message: 'Booking service...'
    })
    .then(loadingEl => {
      loadingEl.present();

      this.offerSub = this.offersService.getOne(offerId)
        .subscribe(offer => {
          loadingEl.dismiss();
          offer.qty = 1;
          const assistant = {
            assistantId: offer.userId,
            selectedServices: [offer],
            subTotal: offer.charges
          };
          this.setAssistant(assistant);
          this.router.navigateByUrl('/t/bookings/booking-create/location');
        }
      );
    });
  }

  setAssistant(serviceSelected: any) {
    localStorage.setItem('assistant', JSON.stringify(serviceSelected));
  }

  onDeleteOffer(offerId: string) {
    this.loadingCtrl
    .create({
      message: 'Deleting service...'
    })
    .then(loadingEl => {
      loadingEl.present();
      this.offersService.delete(offerId).then(() => {
        loadingEl.dismiss();
        this.router.navigateByUrl('/t/services/offers');
      });
    });
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
    this.offerSub.unsubscribe();
    this.userSub.unsubscribe();
  }

}
