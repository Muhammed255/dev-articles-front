import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPagesModule } from './layouts/admin-pages/admin-pages.module';
import { UserPagesModule } from './layouts/user-pages/user-pages.module';
import { NotFoundComponent } from './shared/not-found/not-found.component';

const routes: Routes = [
  { path: '', redirectTo: '/account/wall', pathMatch: 'full' },
  {
    path: 'account',
    loadChildren: () => UserPagesModule
  },
  {
    path: 'admin',
    loadChildren: () => AdminPagesModule
	},
  {
    path: '**',
    component: NotFoundComponent,
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
