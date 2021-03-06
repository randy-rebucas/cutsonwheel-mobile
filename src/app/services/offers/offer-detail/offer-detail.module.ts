import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OfferDetailPageRoutingModule } from './offer-detail-routing.module';

import { OfferDetailPage } from './offer-detail.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OfferDetailPageRoutingModule,
    SharedModule
  ],
  declarations: [OfferDetailPage]
})
export class OfferDetailPageModule {}
