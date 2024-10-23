import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { AngularEditorModule } from '@kolkov/angular-editor';
import { AddEditPostComponent } from "src/app/admin-pages/add-edit-post/add-edit-post.component";
import { AdminAuthGuard } from "src/app/guards/auth.guard";
import { AuthProfileModule } from 'src/app/pages/auth-profile/auth-profile.module';
import { SearchModule } from "src/app/pages/search/search.module";
import { SidenavModule } from "src/app/theme/sidenav/sidenav.module";
import { MaterialModule } from "../../shared/material.module";
import { AdminPagesComponent } from "./admin-pages.component";



// const routes: Routes = [
//   {
//     path: "",
//     children: [
//       {
//         path: "dashboard",
//         loadChildren: () =>
//           import("../../pages/dashboard/dashboard.module").then(
//             (m) => m.DashboardModule
//           ),
//         data: { breadcrumb: "Dashboard" },
//         canActivate: [AdminAuthGuard],
//       },
//       {
//         path: "add-category",
//         component: AddEditCategoryComponent,
//         data: { breadcrumb: "Add | Edit Category" },
//         canActivate: [AdminAuthGuard],
//       },
//       {
//         path: "category/:catId",
//         component: AddEditCategoryComponent,
//         data: { breadcrumb: "Add | Edit Category" },
//         canActivate: [AdminAuthGuard],
//       },
//       {
//         path: "categories",
//         component: CategoriesComponent,
//         data: { breadcrumb: "Categories" },
//         canActivate: [AdminAuthGuard],
//       },
//       {
//         path: "add-topic",
//         component: AddEditTopicComponent,
//         data: { breadcrumb: "Add | Edit Topic" },
//         canActivate: [AdminAuthGuard],
//       },
//       {
//         path: "topic/:topicId",
//         component: AddEditTopicComponent,
//         data: { breadcrumb: "Add | Edit Topic" },
//         canActivate: [AdminAuthGuard],
//       },
//       {
//         path: "topics",
//         component: TopicsComponent,
//         data: { breadcrumb: "Topics" },
//         canActivate: [AdminAuthGuard],
//       },
//       {
// 				path: 'post/:postId',
//         component: SingleArticleComponent,
//         data: { breadcrumb: "Single Post" },
//         canActivate: [AdminAuthGuard]
//       },
//       {
// 				path: "posts",
//         component: PostsComponent,
//         data: { breadcrumb: "Posts" },
//         canActivate: [AdminAuthGuard],
//       },
// 			{
// 			  path: ':username/settings',
// 			  component: SettingsComponent,
// 			  data: { breadcrumb: "User Settings" },
// 			  canActivate: [AdminAuthGuard]
// 			},
//       {
//         path: ":username",
//         component: AuthProfileComponent,
//         canActivate: [AdminAuthGuard],
//       },
//     ],
//   },
// ];



const routes: Routes = [
  {
    path: "",
		component: AdminPagesComponent,
    children: [
      {
        path: "dashboard",
        loadChildren: () =>
          import("../../pages/dashboard/dashboard.module").then(
            (m) => m.DashboardModule
          ),
        data: { breadcrumb: "Dashboard" },
        canActivate: [AdminAuthGuard],
      },
      {
        path: "add-category",
        loadChildren: () =>
          import("../../admin-pages/add-edit-category/add-edit-category.module").then(
            (m) => m.AddEditCategoryModule
          ),
        data: { breadcrumb: "Add | Edit Category" },
        canActivate: [AdminAuthGuard],
      },
      {
        path: "category/:catId",
        loadChildren: () =>
          import("../../admin-pages/add-edit-category/add-edit-category.module").then(
            (m) => m.AddEditCategoryModule
          ),
        data: { breadcrumb: "Add | Edit Category" },
        canActivate: [AdminAuthGuard],
      },
      {
        path: "categories",
        loadChildren: () =>
          import("../../admin-pages/categories/categories.module").then(
            (m) => m.CategoriesModule
          ),
        data: { breadcrumb: "Categories" },
        canActivate: [AdminAuthGuard],
      },
      {
        path: "add-topic",
        loadChildren: () =>
          import("../../admin-pages/add-edit-topic/add-edit-topic.module").then(
            (m) => m.AddEditTopicModule
          ),
        data: { breadcrumb: "Add | Edit Topic" },
        canActivate: [AdminAuthGuard],
      },
      {
        path: "topic/:topicId",
        loadChildren: () =>
          import("../../admin-pages/add-edit-topic/add-edit-topic.module").then(
            (m) => m.AddEditTopicModule
          ),
        data: { breadcrumb: "Add | Edit Topic" },
        canActivate: [AdminAuthGuard],
      },
      {
        path: "topics",
        loadChildren: () =>
          import("../../admin-pages/topics/topics.module").then(
            (m) => m.TopicsModule
          ),
        data: { breadcrumb: "Topics" },
        canActivate: [AdminAuthGuard],
      },
      {
        path: "post/:postId",
        loadChildren: () =>
          import("../../pages/single-article-post/single-article-post.module").then(
            (m) => m.SingleArticlePostModule
          ),
        data: { breadcrumb: "Single Post" },
      },
      {
        path: "posts",
        loadChildren: () =>
          import("../../admin-pages/posts/posts.module").then(
            (m) => m.PostsModule
          ),
        data: { breadcrumb: "Posts" },
        canActivate: [AdminAuthGuard],
      },
			{
				path: ':username',
				loadChildren: () =>
					import('../../pages/auth-profile/auth-profile.module').then(
						(m) => m.AuthProfileModule
					),
			},
      {
        path: ':username/settings',
        loadChildren: () =>
          import("../../pages/settings/settings.module").then(
            (m) => m.SettingsModule
          ),
        data: { breadcrumb: "User Settings" },
        canActivate: [AdminAuthGuard]
      },
    ],
  },
];




@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    AuthProfileModule,
    AngularEditorModule,
    SidenavModule,
		SearchModule
  ],
  declarations: [
    // CategoriesComponent,
    // AddEditCategoryComponent,
    // TopicsComponent,
    // AddEditTopicComponent,
    AddEditPostComponent,
    // PostsComponent,
    // SingleArticleComponent,
    AdminPagesComponent
  ]
})
export class AdminPagesModule {}
