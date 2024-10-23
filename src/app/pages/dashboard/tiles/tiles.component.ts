import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-tiles',
  templateUrl: './tiles.component.html',
  styleUrls: ['./tiles.component.scss']
})
export class TilesComponent implements OnInit {

	data: {
		categoriesCount: number;
		topicsCount: number;
		articlesCount: number;
		commentsCount: { totalComments: number, totalReplies: number, totalInteractions: number };
		likesCount: number;
		dislikesCount: number;
	};

  constructor(private userService: UserService) { }

  ngOnInit() {
		this.userService.getAdminDashboard().subscribe(res => {
			this.data = res.data;
		})
  }

}
