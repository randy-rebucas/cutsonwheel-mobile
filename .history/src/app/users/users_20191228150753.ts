import { PlaceLocation } from '../services/location';
export interface Notification {
  val: string;
  label: string;
  isChecked: boolean;
}
export class Users {
  constructor(
    public id: string,
    public firstname: string,
    public lastname: string,
    public email: string,
    public emailVerified: boolean,
    public photoURL: string,
    public displayName: string,
    public phoneNumber: string,
    public experience: string,
    public visibility: string,
    public classification: string,
    public location: PlaceLocation,
    public notification: Notification
  ) {}
}
