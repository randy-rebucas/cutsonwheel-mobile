import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { PlaceLocation } from 'src/app/services/location';
import { UsersService } from 'src/app/users/users.service';
import { Users } from 'src/app/users/users';

interface Assistant {
  assisstantId: string;
  selectedServices: any[];
  subTotal: number;
}

interface Schedule {
  datePicked: string;
  timePicked: string;
}
@Component({
  selector: 'app-review',
  templateUrl: './review.page.html',
  styleUrls: ['./review.page.scss'],
})
export class ReviewPage implements OnInit {
  activeNext: boolean;
  location: PlaceLocation;
  assistant: Assistant;
  schedule: Schedule;
  user: Users;
  endUntil: Date;
  formatedTime: string;

  mapping: {[k: string]: string} = {
    '=0': 's',
    '=1': '',
    other: 's',
  };

  constructor(
    private navCtrl: NavController,
    private usersServce: UsersService
  ) {
    this.activeNext = false;
  }

  ngOnInit() {
    this.location = this.getLocation();
    this.assistant = this.getAssistant();
    this.usersServce.getUser(this.assistant.assisstantId).subscribe((user) => {
      this.user = user;
    });
    this.schedule = this.getSchedule();

    const services = this.assistant.selectedServices;
    let totalDuration = 0;
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < services.length; i++) {
      totalDuration += parseInt(services[i].duration.replace(/[^0-9]/g, ''), 10);
    }
    const currenctTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const timePicked = this.schedule.timePicked.split(' ')[0];
    const scheduleDate = new Date(this.schedule.datePicked);

    const year = scheduleDate.getFullYear();
    const month = this.pad(scheduleDate.getMonth() + 1);
    const day = this.pad(scheduleDate.getDate());
    const datePicked = year + '-' + month + '-' + day;
    const pickedSchedule = new Date(datePicked + 'T' + timePicked);
    console.log(pickedSchedule);
    this.formatedTime = pickedSchedule.toLocaleString('en-US', {
      timeZone: currenctTimeZone,
      hour12 : true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    pickedSchedule.setMinutes(pickedSchedule.getMinutes() + totalDuration);
    console.log(pickedSchedule);
    this.endUntil = pickedSchedule;
  }

  pad(n: number) {
    return n < 10 ? '0' + n : n;
  }

  onNext(target: string) {
    this.navCtrl.navigateBack('/t/bookings/booking-create/' + target);
  }

  private getLocation() {
    return JSON.parse(localStorage.getItem('location'));
  }

  private getAssistant() {
    return JSON.parse(localStorage.getItem('assistant'));
  }

  private getSchedule() {
    return JSON.parse(localStorage.getItem('schedule'));
  }
}
