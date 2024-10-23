import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ArticlePostService } from 'src/app/services/article-post.service';

@Component({
  selector: 'app-topic-articles',
  templateUrl: './topic-articles.component.html',
  styleUrls: ['./topic-articles.component.scss']
})
export class TopicArticlesComponent implements OnInit {

  articles: any[] = [];
  topic: any;

  constructor(private articleService: ArticlePostService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(paramMap => {
      if(!paramMap.has("topicId")) {
        return;
      }
      this.articleService.getArticlesByTopic(paramMap.get("topicId")).subscribe(response => {
        if(response.success) {
          this.topic = response.topic;
          this.articles = response.articles;
        }
      })
    })
  }

}
