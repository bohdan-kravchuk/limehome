import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';

declare const H: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @ViewChild('map')
  public mapElement: ElementRef;

  private apiKey = 'tlWeWjIWwqJYDLAHkVz5B9T5upp7LeHVewaI7Tv23OE';
  private lat = '37.7397';
  private lng = '-121.4252';
  private zoom = 14;
  public hotels: any;
  private platform: any;
  private map: any;
  private ui: any;
  private timer: ReturnType<typeof setTimeout>;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.platform = new H.service.Platform({
      apikey: this.apiKey
    });
    this.handleHotels();
  }

  ngAfterViewInit() {
    const defaultLayers = this.platform.createDefaultLayers();
    this.map = new H.Map(
      this.mapElement.nativeElement,
      defaultLayers.vector.normal.map,
      {
        zoom: this.zoom,
        center: { lat: this.lat, lng: this.lng }
      }
    );
    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(this.map));
    this.ui = H.ui.UI.createDefault(this.map, defaultLayers);
    this.map.addEventListener('dragend', this.handleDragEnd);
    this.map.addEventListener('dragstart', this.handleDragStart);
    this.map.addEventListener('mapviewchange', () => console.log(this.map.ChangeEvent));
  }

  private handleDragEnd = () => {
    this.timer = setTimeout(() => {
      const { lat, lng } = this.map.getCenter();
      this.lat = lat;
      this.lng = lng;
      this.handleHotels();
    }, 500);
  }

  private handleDragStart = () => {
    clearTimeout(this.timer);
  }

  private getHotels = () => {
    const headers = { 'Accept-Language': 'en' }
    return this.http.get<any>(`https://places.ls.hereapi.com/places/v1/browse?apiKey=${this.apiKey}&in=${this.lat},${this.lng};r=12000&cat=accommodation&lang=en-US`, { headers });
  }

  private handleHotels = () => {
    this.getHotels()
      .subscribe(
        data => {
          this.map.removeObjects(this.map.getObjects());
          this.hotels = data.results.items;
          this.hotels.forEach(hotel => {
            this.setMarker({ lat: hotel.position[0], lng: hotel.position[1] }, hotel)
          });
        },
        error => console.error('There was an error!', error)
      );
  }

  private setMarker = (coords: any, data: any) => {
    const icon = new H.map.Icon('../../assets/images/defaultHomeIcon.svg');
    const marker = new H.map.Marker(coords, { icon });
    marker.setData(data);
    marker.addEventListener('tap', event => {
      console.log('tap');
    }, false);
    this.map.addObject(marker);
  }
}
