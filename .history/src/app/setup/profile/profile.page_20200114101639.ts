import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Subscription, of } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/users/users.service';
import { switchMap } from 'rxjs/operators';

import { PlaceLocation, Coordinates } from './../../services/location';
import { LocationService } from './../../shared/services/location.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  private authSub: Subscription;
  user: firebase.User;
  private location: Location;
  // center = {};
  // googleMaps: any;
  // location: PlaceLocation;

  firstname: string;
  lastname: string;
  middlename: string;
  lat: number;
  lng: number;
  address: string;
  staticMapImageUrl: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private usersService: UsersService,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    const curentLocation = this.locationService.currentLocation();
    curentLocation.then((geoPosition) => {
      const coordinates: Coordinates = {
        lat: geoPosition.coords.latitude,
        lng: geoPosition.coords.longitude
      };
      this.lat = geoPosition.coords.latitude;
      this.lng =  geoPosition.coords.longitude;
      this.locationService.getAddress(coordinates.lat, coordinates.lng).subscribe((currentAddress) => {
        this.address = currentAddress;
      });

      console.log(this.locationService.getMapImage(this.lat, this.lng, 14));
    });

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
        if (this.user) {
          this.firstname = profile.firstname;
          this.lastname = profile.lastname;
          this.middlename = profile.middlename;
        }
    });
  }

  onNext() {
    if (!this.firstname || !this.lastname || !this.address) {
      return;
    }
    const data = {
      id: this.user.uid,
      firstname: this.firstname,
      lastname: this.lastname,
      middlename: this.middlename,
      location: {
        lat: this.lat,
        lng: this.lng,
        address: this.address,
        staticMapImageUrl: ''
      }
    };
    this.usersService.update(data).then((response) => {
      console.log(response);
    });
  }

}
