import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { emailValidator } from 'src/app/helpers/app-validators';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  isLoading = false;

  constructor(
    public fb: FormBuilder,
    public snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      email: [null, Validators.compose([Validators.required, emailValidator])],
      password: [
        null,
        Validators.compose([Validators.required, Validators.minLength(6)]),
      ],
      rememberMe: false,
    });
  }

  public onSubmit() {
    if (this.form.invalid) {
      return;
    }
    this.authService.login(this.form.value.email, this.form.value.password);
  }
}
