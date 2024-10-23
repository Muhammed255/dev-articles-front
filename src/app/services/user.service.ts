import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

const BACKEND_URL = environment.backendUrl + '/user/';

@Injectable({ providedIn: 'root' })
export class UserService {

	constructor(private http: HttpClient) {}

  updateProfile(
    fullName: string,
    gender: string,
    birthdate: Date,
    address: string,
    phone_number: string,
    linkedInUrl: string,
    stackoverflowUrl: string
  ) {
    return this.http.put<{ success: boolean; msg: string; updatedUser: any }>(
      BACKEND_URL + 'update-profile',
      {
        fullName,
        gender,
        birthdate,
        address,
        phone_number,
        linkedInUrl,
        stackoverflowUrl,
      }
    );
  }


  updatePassword(oldPassword: string, newPassword: string) {
    return this.http.put<{ success: boolean; msg: string }>(
      BACKEND_URL + 'update-password',
      { oldPassword, newPassword }
    );
  }

	updateImage(image: File, alt) {
		let formData: FormData | any;
		if(typeof image === 'object') {
			formData = new FormData();
			formData.append('imageUrl', image, alt);
		} else {
			formData = {
				imageUrl: image
			}
		}
		return this.http.put<{success: boolean, msg: string, user: any}>(BACKEND_URL + 'update-image', formData);
	}

	followUser(userId: number) {
    return this.http.put<{ success: boolean; msg: string }>(
      BACKEND_URL + 'follow/' + userId,
      {}
    );
  }

	unfollowUser(userId: number) {
    return this.http.put<{ success: boolean; msg: string }>(
      BACKEND_URL + 'unfollow/' + userId,
      {}
    );
  }

	isFollow(userId: number) {
    return this.http.get<{ isFollowing: boolean }>(
      BACKEND_URL + 'is-follow/' + userId
    );
  }

	getAdminDashboard() {
    return this.http.get<{
      success: boolean;
      msg: string;
      data: {
        categoriesCount: number;
        topicsCount: number;
        articlesCount: number;
        commentsCount: { totalComments: number, totalReplies: number, totalInteractions: number };
        likesCount: number;
        dislikesCount: number;
      };
    }>(BACKEND_URL + 'get-dashboard');
  }
}
