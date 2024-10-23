import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [],
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.scss'
})
export class LogoComponent {
	@Input() width: string = '200';
  @Input() height: string = '200';
  @Input() primaryColor: string = '#ff0000';
  @Input() secondaryColor: string = '#0000ff';
}
