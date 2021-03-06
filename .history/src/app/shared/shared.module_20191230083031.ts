import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { LocationPickerComponent } from './pickers/location-picker/location-picker.component';
import { MapModalComponent } from './map-modal/map-modal.component';
import { ImagePickerComponent } from './pickers/image-picker/image-picker.component';
import { ToastComponent } from './toast/toast.component';
import { ImagePickerModalComponent } from './pickers/image-picker/image-picker-modal/image-picker-modal.component';

@NgModule({
  declarations: [
    LocationPickerComponent,
    MapModalComponent,
    ImagePickerComponent,
    ToastComponent,
    ImagePickerModalComponent
  ],
  imports: [CommonModule, IonicModule],
  exports: [
    LocationPickerComponent,
    MapModalComponent,
    ImagePickerComponent,
    ToastComponent
  ],
  entryComponents: [MapModalComponent, ImagePickerModalComponent]
})
export class SharedModule {}
