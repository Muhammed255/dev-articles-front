import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { CategoryService } from 'src/app/services/category.service';

export interface CategoryData {
  name: string;
  description: string;
}

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent implements OnInit, OnDestroy {
  // @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = ['name', 'description', 'star'];
  categories: MatTableDataSource<CategoryData>;
  pageSizeOptions = [1, 5, 10, 20];
  isLoading = false;
	cats_count = 0;
  pageSize = 1;
	pageIndex = 0;
  showFirstLastButtons = true;

  private catSub: Subscription;

  constructor(
    private catService: CategoryService,
    private snackBar: MatSnackBar
  ) {
    this.categories = new MatTableDataSource();
  }

  ngOnInit() {
    this.getCategories(this.pageIndex * this.pageSize, this.pageSize);
  }

  ngAfterViewInit() {
    // this.categories.paginator = this.paginator;
    this.categories.sort = this.sort;
  }

  getCategories(skip?: number, take?: number) {
    this.isLoading = true;
    this.catService.getAdminCategories(skip, take);
    this.catSub = this.catService
      .getAdminCategoriesUpdateListener()
      .subscribe((catsData: { categories: any[]; maxCats: number }) => {
        this.isLoading = false;
        this.categories.data = catsData.categories;
        this.cats_count = catsData.maxCats;
      });
    // .subscribe((data) => {
    //   if (data.response.success) {
    //     this.isLoading = false;
    //     this.categories = data.response.categories;
    //     this.totalCats = data.response.maxCats;
    //   }
    // });
  }

  onDeleteCategory(id: string) {
    this.isLoading = true;
    this.catService.deleteCategory(id).subscribe((data) => {
      if (data.success) {
        this.isLoading = false;
        this.snackBar.open('Category Deleted', 'success', { duration: 5000 });
        this.catService.getAdminCategories(this.pageIndex * this.pageSize, this.pageSize);
      }
    });
  }

  onChangedPage(pageData: PageEvent) {
		this.isLoading = true;
    this.cats_count = pageData.length;
		const skip = pageData.pageIndex * pageData.pageSize;
    const take = pageData.pageSize;
    this.catService.getAdminCategories(skip, take);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.categories.filter = filterValue.trim().toLowerCase();

    if (this.categories.paginator) {
      this.categories.paginator.firstPage();
    }
  }

  ngOnDestroy() {
		if(this.catSub)
    	this.catSub.unsubscribe();
  }
}
