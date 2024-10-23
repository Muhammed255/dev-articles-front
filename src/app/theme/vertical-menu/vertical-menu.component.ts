import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuService } from 'src/app/services/menu.service';
import { MaterialModule } from 'src/app/shared/material.module';
@Component({
  selector: 'app-vertical-menu',
  templateUrl: './vertical-menu.component.html',
  styleUrls: ['./vertical-menu.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ MenuService ],
	imports: [MaterialModule, RouterModule],
	standalone: true,
})
export class VerticalMenuComponent implements OnInit {
  @Input('menuItems') menuItems;
  @Input('menuParentId') menuParentId
  parentMenu:Array<any>;
  constructor(public menuService:MenuService) {
  }

  ngOnInit() {
    this.parentMenu = this.menuItems.filter(item => item.parentId == this.menuParentId);
  }

  onClick(menuId){
    this.menuService.toggleMenuItem(menuId);
    this.menuService.closeOtherSubMenus(this.menuItems, menuId);
  }

}
