import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { TopicService } from 'src/app/services/topic.service';

@Component({
  selector: 'app-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.scss']
})
export class TopicsComponent implements OnInit, OnDestroy {

  pageSizeOptions = [1, 5, 10, 20];
	topics_count = 0;
  pageSize = 1;
	pageIndex = 0;
  showFirstLastButtons = true;
  isLoading = false;
  topics: any[];
  userIsAuthenticated = false;
	authSubscription: Subscription

  constructor(private topicService: TopicService, private authService: AuthService) { }

  ngOnInit() {
    this.getTopics(this.pageIndex * this.pageSize, this.pageSize);
    this.authSubscription = this.authService.getAuthStatusListener().subscribe(isAuth => {
			this.userIsAuthenticated = isAuth;
		});
  }


  getTopics(perPage, current) {
    this.isLoading = true;
    this.topicService.getAdminTopics(perPage, current).subscribe(data => {
      if(data.success) {
        this.isLoading = false;
        this.topics = data.topics;
        this.topics_count = data.maxTopics;
      }
    })
  }

  OnCreateBtnClicked() {}


  onDelete(id) {
    this.isLoading = true;
    this.topicService.deleteTopic(id).subscribe(data => {
      if(data.success) {
        this.isLoading = false;
        this.getTopics(this.pageIndex * this.pageSize, this.pageSize);
      }
    })
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
		this.topics_count = pageData.length;
		const skip = pageData.pageIndex * pageData.pageSize;
    const take = pageData.pageSize;
    this.getTopics(skip, take);
  }

	ngOnDestroy(): void {
		if(this.authSubscription) this.authSubscription.unsubscribe();
	}

}
