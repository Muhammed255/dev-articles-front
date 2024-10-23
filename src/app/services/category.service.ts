import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Subject } from 'rxjs';
import { map } from "rxjs/operators";

import { environment } from "src/environments/environment.prod";

const BACKEND_URL = environment.backendUrl + "/categories/";

@Injectable({
  providedIn: "root",
})
export class CategoryService {

  private catsUpdated = new Subject<{ categories: any[]; maxCats: number }>();
  private cats: any[] = [];

  constructor(private http: HttpClient) {}

  newCategory(name: string, description: string) {
    const categoryData = {name, description};
    return this.http.post<{success: boolean, msg: string}>(BACKEND_URL + 'new-cat', categoryData);
  }

  getAllCategories() {
    return this.http.get<{success: boolean, msg: string, categories: any[], maxCats: number}>(BACKEND_URL + 'get-all');
  }

  getAdminCategories(skip?: number, take?: number) {
    this.http.get<{ success: boolean, msg: string, categories: any[], maxCats: number }>(
      `${BACKEND_URL}admin-categories?skip=${skip}&take=${take}`
    ).pipe(map(catData => {
      return {
        categories: catData.categories.map(cat => {
          return {
            name: cat.name,
            description: cat.description,
            id: cat._id,
            userId: cat.user
          }
        }),
        maxCats: catData.maxCats
      }
    })).subscribe(transformedCats => {
      this.cats = transformedCats.categories;
      this.catsUpdated.next({
        categories: [...this.cats],
        maxCats: transformedCats.maxCats
      })
    })
  }

  getAdminCategoriesUpdateListener() {
    return this.catsUpdated.asObservable();
  }

  findOneCategory(id: number) {
    return this.http.get<{success: boolean, msg: string, category: any}>(BACKEND_URL + id);
  }

  updateCategory(id: string, name: string, description: string) {
    const categoryData = {name, description};
    return this.http.put<{success: boolean, msg: string}>(BACKEND_URL + id, categoryData);
  }

  deleteCategory(id: string) {
    return this.http.delete<{success: boolean, msg: string}>(BACKEND_URL + id);
  }


  getTopicsByCategory() {
    return this.http.get<{success: boolean, msg: string, topicsByCat: any[]}>(BACKEND_URL + 'join')
  }

}
