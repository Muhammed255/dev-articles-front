import {
	ChangeDetectorRef,
	Component,
	ElementRef,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { mimeType } from 'src/app/helpers/mime-type.validator';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  profileFormGroup: FormGroup;
  passwordFormGroup: FormGroup;
  imageFormGroup: FormGroup;
  user: any;

  isLoading = false;

  newImage: string | ArrayBuffer | null = null;
  imageFile: File | null = null;

  basicInfoLabel = 'Basic Info';
  securityLabel = 'Security';

  @ViewChild('fileInput') fileInput: ElementRef;

  fileName: string | null = null;

  private userSubscription: Subscription;

  constructor(
    private snackBar: MatSnackBar,
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.initForms();

    this.route.paramMap.subscribe((p) => {
      if (p && p.has('username')) {
        this.authService.findUserByUsername(p.get('username'));
        this.userSubscription = this.authService.user$.subscribe((user) => {
          this.user = user;
          this.cd.detectChanges();
          console.log('Change detection triggered!');
        });
        this.updateFormValues();
      }
    });
  }

  initForms(): void {
    this.profileFormGroup = new FormGroup({
      fullName: new FormControl('', Validators.required),
      gender: new FormControl('', Validators.required),
      birthdate: new FormControl('', Validators.required),
      address: new FormControl('', Validators.nullValidator),
      phone_number: new FormControl('', Validators.nullValidator),
      linkedInUrl: new FormControl('', Validators.nullValidator),
      stackoverflowUrl: new FormControl('', Validators.nullValidator),
    });

    this.passwordFormGroup = new FormGroup({
      oldPassword: new FormControl('', Validators.required),
      newPassword: new FormControl('', Validators.required),
    });

    this.imageFormGroup = new FormGroup({
      imageUrl: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType.bind(this)],
      }),
    });
  }

  updateFormValues(): void {
    this.profileFormGroup.patchValue({
      fullName: this.user?.name || '',
      address: this.user?.address || '',
      gender: this.user?.gender || '',
      birthdate: this.user?.birthdate || '',
      phone_number: this.user?.phone_number || '',
      linkedInUrl: this.user?.linked_in || '',
      stackoverflowUrl: this.user?.stackoverflow || '',
    });
  }

  updateProfile(): void {
    this.isLoading = true;
    this.userService
      .updateProfile(
        this.profileFormGroup.value.fullName,
        this.profileFormGroup.value.gender,
        this.profileFormGroup.value.birthdate,
        this.profileFormGroup.value.address,
        this.profileFormGroup.value.phone_number,
        this.profileFormGroup.value.linkedInUrl,
        this.profileFormGroup.value.stackoverflowUrl
      )
      .subscribe(
        (result) => {
          this.user = result.updatedUser;
          this.authService.getUserSubject().next(result.updatedUser);
          this.snackBar.open(result.msg, 'Success', { duration: 3000 });
          this.isLoading = false;
        },
        (error) => {
          console.error('Failed to update profile:', error);
          this.snackBar.open(
            'Failed to update profile. Please try again.',
            'Close',
            { duration: 3000 }
          );
          this.isLoading = false;
        }
      );
  }

  updatePassword(): void {
    this.isLoading = true;
    this.userService
      .updatePassword(
        this.passwordFormGroup.value.oldPassword,
        this.passwordFormGroup.value.newPassword
      )
      .subscribe(
        (passRes) => {
          this.snackBar.open(passRes.msg, 'Success', { duration: 3000 });
          this.isLoading = false;
        },
        (error) => {
          console.error('Failed to update password:', error);
          this.snackBar.open(
            'Failed to update password. Please try again.',
            'Close',
            { duration: 3000 }
          );
          this.isLoading = false;
        }
      );
  }

  updateImage(): void {
    this.isLoading = true;
    if (!this.imageFile) {
      this.snackBar.open('Please select a new image.', 'Close', {
        duration: 3000,
      });
      this.isLoading = false;
      return;
    }

    this.userService
      .updateImage(this.imageFormGroup.value.imageUrl, this.user.name)
      .subscribe(
        (response) => {
          this.isLoading = true;
          this.newImage = response.user.imageUrl;
          this.user = response.user;
          this.authService.getUserSubject().next(response.user);
          this.snackBar.open('Image updated successfully.', 'Close', {
            duration: 3000,
          });
          this.dismissImage();
          this.isLoading = false;
        },
        (error) => {
          console.error('Failed to update user image:', error);
          this.snackBar.open(
            'Failed to update image. Please try again.',
            'Close',
            { duration: 3000 }
          );
          this.isLoading = false;
        }
      );
  }

  dismissImage() {
    this.newImage = null;
    this.imageFile = null;
    this.imageFormGroup.get('imageUrl').setValue(null);

    if (this.fileInput) {
      this.fileInput.nativeElement.value = null;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.imageFormGroup.patchValue({ imageUrl: file });
      this.imageFormGroup.get('imageUrl').updateValueAndValidity();
      this.fileName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.newImage = reader.result;
      };
      reader.readAsDataURL(file);
      this.imageFile = file;
    } else {
      this.fileName = null;
    }
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
