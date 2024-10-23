import { Component, inject } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  ActivatedRouteSnapshot,
  UrlSegment,
  NavigationEnd,
	RouterModule,
} from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MaterialModule } from '../material.module';
import { ContentHeaderComponent } from '../content-header/content-header.component';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
  standalone: true,
	imports: [MaterialModule, RouterModule, ContentHeaderComponent]
})
export class BreadcrumbComponent {
  public pageTitle: string;
  public breadcrumbs: {
    name: string;
    url: string;
  }[] = [];
  private router = inject(Router);

  constructor(public activatedRoute: ActivatedRoute, public title: Title) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.breadcrumbs = [];
        this.parseRoute(this.router.routerState.snapshot.root);
        this.pageTitle = '';
        this.breadcrumbs.forEach((breadcrumb) => {
          this.pageTitle += ' > ' + breadcrumb.name;
        });
        this.title.setTitle(this.pageTitle);
      }
    });
  }

  private parseRoute(node: ActivatedRouteSnapshot) {
    if (node.data['breadcrumb']) {
      if (node.url.length) {
        let urlSegments: UrlSegment[] = [];
        node.pathFromRoot.forEach((routerState) => {
          urlSegments = urlSegments.concat(routerState.url);
        });
        let url = urlSegments
          .map((urlSegment) => {
            return urlSegment.path;
          })
          .join('/');
        this.breadcrumbs.push({
          name: node.data['breadcrumb'],
          url: '/' + url,
        });
      }
    }
    if (node.firstChild) {
      this.parseRoute(node.firstChild);
    }
  }
}
