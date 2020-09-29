import { Component, Input, OnInit } from '@angular/core';
import { images } from 'src/common/mockData';

@Component({
  selector: 'app-hotel-card',
  templateUrl: './hotel-card.component.html',
  styleUrls: ['./hotel-card.component.css']
})
export class HotelCardComponent implements OnInit {
  @Input()
  hotel: any;

  @Input()
  index: number;

  hotelImages = images;
  randomInd = Math.round(Math.random() * (this.hotelImages.length - 1))

  constructor() { }

  ngOnInit(): void { }

  getImage = () => {
    return images[this.randomInd];
  }
}
