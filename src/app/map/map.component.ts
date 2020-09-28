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
  public hotels = [];
  private markers = [];
  private platform: any;
  private map: any;
  private ui: any;
  private timer: ReturnType<typeof setTimeout>;
  private activeMarker: any;

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
          this.hotels = data.results.items;
          const markers = this.map.getObjects();
          this.map.removeObjects(markers.filter(
            marker => !this.hotels.find(hotel => marker.data?.id === hotel.id)
          ));
          const filteredHotels = this.markers.length
            ? this.hotels.filter(hotel => (
              !markers.find(marker => marker.data.id === hotel.id)
            ))
            : this.hotels;
          const newMarkers = filteredHotels.map(hotel => (
            this.createMarker(this.createCoords(hotel), hotel)
          ));
          this.map.addObjects(newMarkers);
        },
        error => console.error('There was an error!', error)
      );
  }

  private createCoords = (place) => ({
     lat: place.position[0], lng: place.position[1]
  })

  private createMarker = (coords, data, type = 'default') => {
    const icon = type === 'default'
      ? new H.map.Icon('../../assets/images/defaultHomeIcon.svg')
      : new H.map.Icon('../../assets/images/activeHomeIcon.svg');
    const marker = new H.map.Marker(coords, { icon });

    marker.setData(data);
    marker.addEventListener('tap', () => {
      if (this.activeMarker) {
        if (this.activeMarker.data.id === marker.data.id) return;
        const newMarker = this.createMarker(this.createCoords(this.activeMarker.data), this.activeMarker.data);
        this.replaceMarker(this.activeMarker, newMarker);
      }
      const newMarker = this.createMarker(coords, data, 'active');
      this.replaceMarker(marker, newMarker);
      this.activeMarker = newMarker;
      this.scroll(data.id);
    }, false);

    return marker;
  }

  private scroll = (id) => {
    const el = document.getElementById(id);
    el.scrollIntoView({ behavior: 'smooth', inline: 'center' });
  }

  private replaceMarker = (marker, newMarker) => {
    this.map.removeObject(marker);
    this.map.addObject(newMarker);
  }
}
