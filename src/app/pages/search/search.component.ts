import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'search-form',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {

	@Input() searchString: string;
  @Output() searchSubmitted: EventEmitter<any> = new EventEmitter();
	searchForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private searchService: SearchService) {}

  ngOnInit(): void {
    this.initSearchForm();
  }

  initSearchForm() {
    this.searchForm = this.fb.group({
      searchString: [this.searchString || ''],
      postDateFrom: [''],
      postDateTo: [''],
    });
  }

  onSubmitSearchForm() {
		const postDateFrom = this.searchForm.get('postDateFrom').value;
    const postDateTo = this.searchForm.get('postDateTo').value;

		const searchString = this.searchForm.get('searchString').value;

    this.searchService.setPostDateFrom(postDateFrom);
    this.searchService.setPostDateTo(postDateTo);

		this.searchSubmitted.emit({ searchString, postDateFrom, postDateTo });

    // this.router.navigate(['/account/wall'], {
    //   queryParams: {
    //     search: this.searchForm.get('searchString').value,
    //   },
    // });
  }
}
