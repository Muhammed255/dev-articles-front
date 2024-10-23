import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'createDate',
})
export class CreateDate implements PipeTransform {
  transform(value: Date): string {
    const diff = Math.abs(new Date().getTime() - new Date(value).getTime());
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(weeks / 4);
    const years = Math.floor(days / 365);

    if (minutes < 1) {
      return 'just now';
    } else if (minutes < 60) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (hours < 1) {
      return `${minutes} min ago`;
    } else if (days < 1) {
      return `${hours} hr ago`;
    } else if (weeks < 1) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (months < 1) {
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (years < 1) {
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  }
}
