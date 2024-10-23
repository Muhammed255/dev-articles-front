import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { emailValidator, matchingPasswords } from 'src/app/helpers/app-validators';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin-signup',
  templateUrl: './admin-signup.component.html',
  styleUrls: ['./admin-signup.component.scss']
})
export class AdminSignupComponent implements OnInit {

  registerForm: FormGroup;
  imagePreview: string;

  constructor(
    public formBuilder: FormBuilder,
    public snackBar: MatSnackBar,
    public authService: AuthService,
    public router: Router
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.registerForm = this.formBuilder.group(
      {
        name: [
          null,
          Validators.compose([Validators.required, Validators.minLength(3)]),
        ],
        username: [
          null,
          Validators.compose([Validators.required, Validators.minLength(3)]),
        ],
        email: [
          null,
          Validators.compose([Validators.required, emailValidator]),
        ],
        password: ["", Validators.required],
        confirmPassword: ["", Validators.required],
        bio: [
          "",
          Validators.compose([Validators.required, Validators.minLength(10)]),
        ],
      },
      { validator: matchingPasswords("password", "confirmPassword") }
    );
  }

  onSubmit() {
    this.authService
      .adminSignup(
        this.registerForm.value.name,
        this.registerForm.value.username,
        this.registerForm.value.email,
        this.registerForm.value.password,
        this.registerForm.value.bio
      )
      .subscribe((data) => {
        if (data.success) {
          this.snackBar.open(data.msg, "Success", {
            duration: 3000,
          });
          this.router.navigateByUrl("/account/login");
        } else {
          this.snackBar.open(data.msg, "Error", {
            duration: 3000,
          });
          return;
        }
      });
  }

}
