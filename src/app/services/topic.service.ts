import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment.prod";

const BACKEND_URL = environment.backendUrl + "/topics/";

@Injectable({
  providedIn: "root",
})
export class TopicService {
  constructor(private http: HttpClient) {}

  newTopic(name: string, description: string, categoryId: string, image: File) {
    const topicData = new FormData();
    topicData.append("name", name);
    topicData.append("description", description);
    topicData.append("categoryId", categoryId);
    topicData.append("image", image, name);
    return this.http.post<{ msg: string, success: boolean }>(BACKEND_URL + "create", topicData);
  }

  getAllTopics() {
    // const queryParams = `?pagesize=${TopicsPerPage}&page=${currentPage}`;
    return this.http.get<{ success: boolean, msg: string, topics: any[], maxTopics: number }>(BACKEND_URL + "get-all");
  }

  getAdminTopics(skip?: number, take?: number) {
    const queryParams = `?skip=${skip}&take=${take}`;
    return this.http.get<{ success: boolean, msg: string, topics: any[], maxTopics: number }>(BACKEND_URL + "admin-topics" + queryParams);
  }

  findOneTopic(id: number) {
    return this.http.get<{ success: boolean, msg: string, topic: any }>(BACKEND_URL + id);
  }

  getUserTopics() {
    return this.http.get<{ success: boolean, msg: string, topics: any[] }>(BACKEND_URL + "all-topics");
  }

	getOtherTopics(currentTopicId: string) {
    return this.http.get<{ success: boolean, msg: string, topics: any[] }>(BACKEND_URL + "get-other-topics/"+currentTopicId);
  }

  updateTopic(
    id: string,
    name: string,
    description: string,
    categoryId: string,
    image: File
  ) {
    let topicData: FormData | any;
    if (typeof image === "object") {
      topicData = new FormData();
      topicData.append("name", name);
      topicData.append("description", description);
      topicData.append("categoryId", categoryId);
      topicData.append("image", image, name);
    } else {
      topicData = {
        id: id,
        name,
        description,
        categoryId,
        image,
      };
    }
    return this.http.put<{ msg: string, success: boolean }>(BACKEND_URL + id, topicData);
  }

  deleteTopic(id: string) {
    return this.http.delete<{ msg: string, success: boolean }>(BACKEND_URL + id);
  }
}
