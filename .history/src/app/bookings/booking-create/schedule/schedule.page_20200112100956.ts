import { Component, OnInit } from '@angular/core';
import { BookingsService } from '../../bookings.service';
import { Observable, of, forkJoin } from 'rxjs';
import { Bookings } from '../../bookings';
import { switchMap, map, mergeMap } from 'rxjs/operators';
import { UsersService } from 'src/app/users/users.service';
import { NgForm } from '@angular/forms';
import { NavController, ModalController } from '@ionic/angular';
import { DatetimePickerComponent } from './datetime-picker/datetime-picker.component';
import { Misc } from './../../../shared/class/misc';

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
  selector: 'app-schedule',
  templateUrl: './schedule.page.html',
  styleUrls: ['./schedule.page.scss'],
})
export class SchedulePage implements OnInit {
  public assistant: Assistant;
  public booking$: Observable<Bookings[]>;
  public bookings: Bookings;
  public isLoading: boolean;
  public date: string = new Date().toISOString();
  datePicked: string;
  timePicked: string;
  activeNext: boolean;
  schedule: Schedule;
  bookingData: any;

  pickedSchedule: Date;
  misc: Misc;

  constructor(
    private bookingsService: BookingsService,
    private usersService: UsersService,
    private navCtrl: NavController,
    private modalCtrl: ModalController
  ) {
    this.isLoading = true;
    this.activeNext = false;
   }

  ngOnInit() {
    this.assistant = this.getAssistant();
    this.booking$ = this.bookingsService.getByAssistantId(this.assistant.assisstantId, 'pending');

    this.schedule = this.getSchedule();
    if (this.schedule) {
      this.activeNext = true;
      const timePicked = this.schedule.timePicked;
      const scheduleDate = new Date(this.schedule.datePicked);
      console.log(scheduleDate + '' + timePicked);
      // this.pickedSchedule = this.misc.mergeDateTime(scheduleDate, timePicked);
      // console.log(this.pickedSchedule);
      // schedue transformation
      // const year = scheduleDate.getFullYear();
      // const month = this.misc.pad(scheduleDate.getMonth() + 1);
      // const day = this.misc.pad(scheduleDate.getDate());
      // const datePicked = year + '-' + month + '-' + day;
      // const pickedSchedule = new Date(datePicked + 'T' + timePicked);
      // console.log(pickedSchedule);
    }
  }

  onSetSchedule(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const currenctTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const data = {
      datePicked: new Date(form.value.datePicked).toLocaleDateString(undefined, {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      }),
      timePicked: new Date(form.value.timePicked).toLocaleTimeString(undefined, {
        timeZone: currenctTimeZone,
        hour12 : false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };
    this.setSchedule(data);
  }

  onNext(target: string) {
    this.navCtrl.navigateBack('/t/bookings/booking-create/' + target);
  }

  private setSchedule(scheduled: Schedule) {
    localStorage.setItem('schedule', JSON.stringify(scheduled));
    this.onNext('review');
  }

  private getSchedule() {
    return JSON.parse(localStorage.getItem('schedule'));
  }

  private getAssistant() {
    return JSON.parse(localStorage.getItem('assistant'));
  }
}
