import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/shared/material.module';
import { CommentComponent } from '../comment/comment.component';

@Component({
  selector: 'app-comments-list',
  templateUrl: './comments-list.component.html',
  styleUrls: ['./comments-list.component.scss'],
	imports: [RouterModule, MaterialModule, CommentComponent],
	standalone: true,
})
export class CommentsListComponent implements OnInit {

	// comments: any[] = [];
	auth_user: any;
	articleId: number;

  constructor(
		public dialogRef: MatDialogRef<CommentsListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
	) { }

  ngOnInit(): void {
		console.log('====================================');
		console.log("data",this.data);
		console.log('====================================');
		// this.comments = this.data.comments;
		this.auth_user = this.data.auth_user;
		this.articleId = this.data.articleId
  }

	allLikedOrDisliked(item) {
    return {
      likers: item?.userLikedPosts?.filter((up) => up.type == 'like'),
      dislikers: item?.userLikedPosts?.filter((up) => up.type == 'dislike'),
    };
  }

}
