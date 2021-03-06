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
import { map, switchMap } from 'rxjs/operators';
import { ProfilesService } from './profiles.service';

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
  notifications: any;
  selectedSegment: string;
  isLoading: boolean;
  experiences: any[];
  selectedExperience: string;
  visibilities: any[];
  selectedVisibility: string;

  services: Observable<Services[]>;
  selectedClassification: string;

  userInfo: any;

  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private modalCtrl: ModalController,
    private servicesService: ServicesService,
    private toastCtrl: ToastController,
    private profileService: ProfilesService
  ) {
    this.selectedSegment = 'account';
    this.isLoading = false;
  }

  ngOnInit() {
    this.isLoading = true;
    this.authService.getUserState().pipe(
      switchMap(user => {
        return this.userService.getUser(user.uid);
      })
      ).subscribe((profile) => {
        this.isLoading = false;
        const user = this.authService.getUsersProfile();
        this.userInfo = { profile, ...user };
        // this.profileService.getLocations(this.userInfo.uid).subscribe((locations) => {
        //   this.location = locations;
        // });
        this.getLocation(this.userInfo.uid);
        this.getNotification(this.userInfo.uid);
        this.getSetting(this.userInfo.uid);
    });

    this.services = this.servicesService.getCategories();

    this.notifications = [
      { val: 'send-push-notification', label: 'Send push notification', isChecked: true },
      { val: 'send-for-invitations', label: 'Send an email for invitations', isChecked: true },
      { val: 'send-events-updates', label: 'Send an email events and updates', isChecked: true }
    ];

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
    this.profileService.getLocations(this.userInfo.uid).subscribe((locations) => {
      this.location = locations;
    });
  }

  getNotification(userId: string) {
    this.userService.getUser(userId).subscribe((detail) => {
      this.notifications = detail.notification ? detail.notification : this.notifications;
    });
  }

  getSetting(userId: string) {
    this.userService.getUser(userId).subscribe((detail) => {
      this.selectedExperience = detail.experience ? detail.experience : 'entry';
      this.selectedVisibility = detail.visibility ? detail.visibility : 'public';
      this.selectedClassification = detail.classification ? detail.classification : '';
    });
  }

  segmentChanged(ev: any) {
    this.selectedSegment = ev.detail.value;
  }

  classificationChanged(ev: any, userId: string) {
    this.userService.setClassification(ev.target.value, userId).then(() => {
      this.showToast('Classification updated.');
    });
  }

  visibilityChanged(ev: any, userId: string) {
    this.userService.setVisibility(ev.detail.value, userId).then(() => {
      this.showToast('Visibility updated.');
    });
  }

  experienceChanged(ev: any, userId: string) {
    this.userService.setExpirience(ev.detail.value, userId).then(() => {
      this.showToast('Experience level updated.');
    });
  }

  notificationSelect(ev: any, userId: string) {
    this.userService.setNotification(this.notifications, userId).then(() => {
      this.showToast('Notificaiton updated.');
    });
  }

  onLocationPicked(selectedLocation: PlaceLocation, userId: string) {
    this.userService.setLocation(selectedLocation, userId).then(() => {
      this.getLocation(userId);
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
