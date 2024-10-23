import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit {

	@Input() article: any;
	@Input() showRemoveOption: boolean = false;
  @Output() removeFromBookmarksClicked: EventEmitter<any> = new EventEmitter<any>();

  constructor(private router: Router, private _snackBar: MatSnackBar) { }

  ngOnInit() {
  }

	truncateContent(content: string): string {
    return (content?.length > 200 ? content.slice(0, 200) + '...' : content);
  }

  isContentTruncated(content: string): boolean {
    return content?.length > 200;
  }

  expandContent(id: number) {
		this.router.navigate(["/account/articles", id])
  }


	onRemoveFromBookmarksClicked() {
    this.removeFromBookmarksClicked.emit(this.article);
    this._snackBar.open('Article removed from bookmarks', 'Dismiss', {
      duration: 2000,
    });
  }

}
