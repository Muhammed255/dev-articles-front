import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { mimeType } from 'src/app/helpers/mime-type.validator';
import { ArticlePostService } from 'src/app/services/article-post.service';
import { TopicService } from 'src/app/services/topic.service';

@Component({
  selector: 'app-add-edit-post',
  templateUrl: './add-edit-post.component.html',
  styleUrls: ['./add-edit-post.component.scss'],
})
export class AddEditPostComponent implements OnInit {
  htmlContent = '<h2>Hello</h2>';
	isUpdate = false;
  imagePreview: string;
  form: FormGroup;
  headerTitle = 'Add New Article';

  topics: any[];
  topicIndex;
  topic;
  article;

  constructor(
    public dialogRef: MatDialogRef<AddEditPostComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private articleService: ArticlePostService,
    private topicService: TopicService
  ) {}

  ngOnInit() {
    this.initForm();
    if (this.data) {
			console.log('====================================');
			console.log(this.data);
			console.log('====================================');
      this.article = this.data.article;
			this.isUpdate = true;
      this.data = {
        title: this.form.value.title,
        sub_title: this.form.value.sub_title,
        content: this.form.value.content,
        topicId: this.form.value.topicId,
        article_image: this.form.value.article_image,
      };
      this.form.patchValue({
				title: this.article.title,
				sub_title: this.article.sub_title,
				content: this.article.content,
				topicId: this.article.topic?._id,
				article_image: this.article.article_image
			})
      this.headerTitle = 'Edit Article Post';
    }
    this.topicService.getUserTopics().subscribe((data) => {
      if (data.success) {
        this.topics = data.topics;
        this.topicIndex = this.topics.findIndex(
          (top) => top?._id === this.topic?._id
        );
      }
    });
  }

  // setDataToForm(id) {
  //   this.articleService.findOneArticle(id).subscribe((data) => {
  //     if (data.success) {
  //       this.topic = data.article.topicId;
  //       this.article = data.article;
  //       this.form.patchValue(data.article);
  //     }
  //   });
  // }

  onNoClick(): void {
    this.dialogRef.close();
  }

  initForm() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(10)],
      }),
      sub_title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(15)],
      }),
      content: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(20)],
      }),
      topicId: new FormControl(null, { validators: [Validators.required] }),
      article_image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType.bind(this)],
      }),
    });
  }

  addNewArticle() {
    this.articleService.newPost(
      this.form.value.title,
      this.form.value.sub_title,
      this.form.value.content,
      this.form.value.article_image,
      this.form.value.topicId
    ).subscribe(_ => {
			this.dialogRef.close()
		});
		this.dialogRef.close();
  }

  onImagePicked(event: any) {
    const file = event.target.files[0];
    this.form.patchValue({ article_image: file });
    this.form.get('article_image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}
