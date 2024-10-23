import { Menu } from './menu.model';

export const verticalMenuItems = [
    new Menu (1, 'Dashboard', '/admin/dashboard', null, 'dashboard', null, false, 0),
    new Menu (2, 'Categories', null, null, 'list', null, true, 0),
    new Menu (3, 'All', '/admin/categories', null, 'category', null, false, 2),
    new Menu (4, 'Add New', '/admin/add-category', null, 'new_releases', null, false, 2),
    new Menu (5, 'Topics', null, null, 'list', null, true, 0),
    new Menu (6, 'All Topics', '/admin/topics', null, 'view_list', null, false, 5),
    new Menu (7, 'Add New', '/admin/add-topic', null, 'add_box', null, false, 5),
    new Menu (8, 'Articles', '/admin/posts', null, 'library_books', null, false, 0),
]