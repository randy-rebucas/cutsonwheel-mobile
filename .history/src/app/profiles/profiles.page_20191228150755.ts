import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { FormGroup, FormControl } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { UsersService } from '../users/users.service';
import { UploadProfilePictureComponent } from './upload-profile-picture/upload-profile-picture.component';
import { PlaceLocation } from '../services/location';
import { ServicesService } from '../services/services.service';
import { Services } from '../services/services';
import { Observable } from 'rxjs';

export interface Notification {
  val: string;
  label: string;
  isChecked: boolean;
}
@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.page.html',
  styleUrls: ['./profiles.page.scss'],
})
export class ProfilesPage implements OnInit {
  form: FormGroup;
  user: firebase.User;
  location: PlaceLocation;
  notifications: Notification;
  selectedSegment: string;
  isLoading: boolean;
  experiences: any[];
  selectedExperience: string;
  visibilities: any[];
  selectedVisibility: string;

  services: Observable<Services[]>;
  selectedClassification: string;

  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private modalCtrl: ModalController,
    private servicesService: ServicesService,
    private toastCtrl: ToastController
  ) {
    this.selectedSegment = 'account';
    this.isLoading = false;
  }

  ngOnInit() {
    this.isLoading = true;
    this.authService.getUserState().subscribe((user) => {
      if (user) {
        this.isLoading = false;
        this.user = user;
        this.getLocation(this.user.uid);
        this.getNotification(this.user.uid);
      }
    });

    this.services = this.servicesService.getCategories();

    this.experiences = [
      { val: 'entry', label: 'Entry' },
      { val: 'intermediate', label: 'Intermediate' },
      { val: 'expert', label: 'Expert' }
    ];

    this.visibilities = [
      { val: 'public', label: 'Public' },
      { val: 'private', label: 'Private' }
    ];

  }

  getLocation(userId: string) {
    this.userService.getUser(userId).subscribe((detail) => {
      this.location = detail.location;
    });
  }

  getNotification(userId: string) {
    this.userService.getUser(userId).subscribe((detail) => {
      this.notifications = detail.notification;
    });
  }

  getSetting(userId: string) {
    this.userService.getUser(userId).subscribe((detail) => {
      this.selectedExperience = detail.experience;
      this.selectedVisibility = detail.visibility;
      this.selectedClassification = detail.classification;
    });
  }

  segmentChanged(ev: any) {
    this.selectedSegment = ev.detail.value;
  }

  classificationChanged(ev: any) {
    // this.selectedSegment = ev.detail.value;
    console.log(ev.detail.value);
  }

  visibilityChanged(ev: any) {
    console.log(ev.detail.value);
  }

  experienceChanged(ev: any) {
    console.log(ev.detail.value);
  }

  notificationSelect(ev: any) {
    this.userService.setNotification(this.notifications, this.user.uid).then(() => {
      this.showToast('Notificaiton set.');
    });
  }

  onLocationPicked(selectedLocation: PlaceLocation) {
    this.userService.setLocation(selectedLocation, this.user.uid).then(() => {
      this.getLocation(this.user.uid);
    });
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

  private showToast(msg: string) {
    this.toastCtrl.create({
      message: msg,
      duration: 2000
    }).then(toast => toast.present());
  }
}
