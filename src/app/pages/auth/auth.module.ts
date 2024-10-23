import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from 'src/app/shared/material.module';
import { AdminSignupComponent } from './admin-signup/admin-signup.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ContentHeaderComponent } from 'src/app/shared/content-header/content-header.component';


const authRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'admin-signup', component: AdminSignupComponent }
];

@NgModule({
  imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		RouterModule.forChild(authRoutes),
		MaterialModule,
		ContentHeaderComponent
  ],
  declarations: [LoginComponent, SignupComponent, AdminSignupComponent],
  exports: [LoginComponent, SignupComponent, AdminSignupComponent]
})
export class AuthModule { }
