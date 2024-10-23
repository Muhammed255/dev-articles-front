import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit {

	likers: any[] = [];
	dislikers: any[] = [];

  constructor(
		public dialogRef: MatDialogRef<UsersListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
	) { }

  ngOnInit(): void {
		if(this.data) {
			this.likers = this.data.users.likers;
			this.dislikers = this.data.users.dislikers;
		}
  }

	onNoClick(): void {
    this.dialogRef.close();
  }

}
