import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { UsersService } from '../users/users.service';
import { UploadProfilePictureComponent } from './upload-profile-picture/upload-profile-picture.component';
import { PlaceLocation } from '../services/location';

@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.page.html',
  styleUrls: ['./profiles.page.scss'],
})
export class ProfilesPage implements OnInit {
  form: FormGroup;
  user: firebase.User;
  address: string;
  selectedSegment: string;


  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private modalCtrl: ModalController,
  ) {
    this.selectedSegment = 'settings';
  }

  ngOnInit() {
    this.user = this.authService.getUsersProfile();
    this.userService.getUser(this.user.uid).subscribe((detail) => {
      this.address = detail.address;
    });
  }

  segmentChanged(ev: any) {
    this.selectedSegment = ev.detail.value;
  }

  onLocationPicked(selectedLocation: PlaceLocation) {
    console.log(selectedLocation);
  }

  onImagePicked() {
    this.modalCtrl
      .create({
        component: UploadProfilePictureComponent
      })
      .then(modalEl => {
        modalEl.present();
        return modalEl.onDidDismiss();
      });
  }
}
