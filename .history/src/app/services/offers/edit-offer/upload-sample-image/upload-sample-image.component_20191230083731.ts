import { Component, OnInit } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { FormGroup, FormControl } from '@angular/forms';
import { ImagePicker } from 'src/app/shared/pickers/image-picker/image-picker';
import { ModalController, LoadingController } from '@ionic/angular';
import { ImagePickerService } from 'src/app/shared/pickers/image-picker/image-picker.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-upload-sample-image',
  templateUrl: './upload-sample-image.component.html',
  styleUrls: ['./upload-sample-image.component.scss'],
})
export class UploadSampleImageComponent implements OnInit {

  form: FormGroup;
  user: firebase.User;
  imagePicker: ImagePicker;

  constructor(
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private imagePickerService: ImagePickerService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      image: new FormControl(null)
    });

    this.authService.getUserState()
      .subscribe( user => {
        this.user = user;
      }
    );
  }

  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  onUpload() {
    if (!this.form.get('image').value) {
      return;
    }
    this.loadingCtrl
      .create({
        message: 'Uploading...'
      })
      .then(loadingEl => {
        loadingEl.present();
        this.imagePickerService
          .uploadImage(this.form.get('image').value)
          .pipe(
            switchMap(uploadRes => {
              return this.user.updateProfile( {
                photoURL: uploadRes.imageUrl
              });
            })
          )
          .subscribe(() => {
            loadingEl.dismiss();
            this.modalCtrl.dismiss(null, 'cancel');
          });
      });
  }

  onImagePicked(imageData: string | File) {
    let imageFile;
    if (typeof imageData === 'string') {
      try {
        imageFile = this.imagePicker.base64toBlob(
          imageData.replace('data:image/jpeg;base64,', ''),
          'image/jpeg'
        );
      } catch (error) {
        console.log(error);
        return;
      }
    } else {
      imageFile = imageData;
    }
    this.form.patchValue({ image: imageFile });
  }

}
