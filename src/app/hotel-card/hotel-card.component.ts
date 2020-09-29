import { Component, Input, OnInit } from '@angular/core';
import { getRandomInt } from 'src/common/helpers/helpers';
import { images } from 'src/common/mockData';

@Component({
  selector: 'app-hotel-card',
  templateUrl: './hotel-card.component.html',
  styleUrls: ['./hotel-card.component.css']
})
export class HotelCardComponent implements OnInit {
  @Input()
  hotel: any;

  hotelImages = images;
  randomInd = getRandomInt(0, this.hotelImages.length - 1);

  constructor() { }

  ngOnInit(): void { }

  getImage = () => {
    return images[this.randomInd];
  }
}
