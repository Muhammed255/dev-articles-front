import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mimeType } from 'src/app/helpers/mime-type.validator';
import { CategoryService } from 'src/app/services/category.service';
import { TopicService } from 'src/app/services/topic.service';

@Component({
  selector: 'app-add-edit-topic',
  templateUrl: './add-edit-topic.component.html',
  styleUrls: ['./add-edit-topic.component.scss']
})
export class AddEditTopicComponent implements OnInit {

  form: FormGroup;
  imagePreview: string;
  topic: any;
  mode = 'create';
  topicId: any;
  isLoading = false;
  categories: any[];

  constructor(
    private topicService: TopicService,
    private catService: CategoryService,
    private router: Router,
    public route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.initForm();
    this.route.paramMap.subscribe((paramMap) => {
      if (Number(paramMap.has("topicId"))) {
        this.mode = "edit";
        this.topicId = paramMap.get("topicId");
        this.isLoading = true;
        this.topicService
          .findOneTopic(+paramMap.get("topicId"))
          .subscribe((data) => {
            if (data.success) {
              this.isLoading = false;
              this.topic = data.topic;
              this.form.setValue({
                name: this.topic.name,
                description: this.topic.description,
                image: this.topic.image,
                categoryId: this.topic.category._id
              });
            }
          });
      } else {
        this.mode = "create";
        this.topicId = null;
      }
    });
    this.catService.getAllCategories().subscribe(data => {
      if(data.success) {
        this.categories = data.categories;
      }
    })
  }

  initForm() {
    this.form = new FormGroup({
      name: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      description: new FormControl(null, { validators: [Validators.required] }),
      categoryId: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType]
      })
    });
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get("image").updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSaveTopic() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === "create") {
      this.topicService.newTopic(
        this.form.value.name,
        this.form.value.description,
        this.form.value.categoryId,
        this.form.value.image
      ).subscribe(res => {
        if(res.success) {
          this.router.navigateByUrl('/admin/topics');
        }
      })
    } else {
      this.topicService.updateTopic(
        this.topicId,
        this.form.value.name,
        this.form.value.description,
        this.form.value.categoryId,
        this.form.value.image
      ).subscribe(res => {
        if(res.success) {
          this.router.navigateByUrl('/admin/topics');
        }
      })
    }

  }

}
