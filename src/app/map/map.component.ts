import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IconType } from 'src/common/enums/IconTypes';
import { ApiService } from '../api.service';
import { icons } from 'src/common/icons';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @ViewChild('map')
  public mapElement: ElementRef;

  public hotels = [];
  private apiKey = 'tlWeWjIWwqJYDLAHkVz5B9T5upp7LeHVewaI7Tv23OE';
  private lat = '37.7397';
  private lng = '-121.4252';
  private category = 'accommodation';
  private lang = 'en-US';
  private zoom = '14';
  private platform: any;
  private map: any;
  private activeMarker: any;
  private boundingBox = {
    aa: -121.43893290993344,
    la: 37.72537701642574,
    da: -121.41146708984375,
    ia: 37.75510599378202
  };

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.platform = new H.service.Platform({
      apikey: this.apiKey
    });
    this.getHotelsList();
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
    new H.mapevents.Behavior(new H.mapevents.MapEvents(this.map));
    H.ui.UI.createDefault(this.map, defaultLayers);
    this.map.addEventListener('dragend', this.handleDragEnd);
    this.map.addEventListener('mapviewchangeend', () => {
      const newZoom= this.map.getZoom();
      if (newZoom !== this.zoom) {
        this.zoom = newZoom;
        this.handleDragEnd();
      }
    })
  }

  private handleDragEnd = () => {
    this.boundingBox = this.map.getViewModel().getLookAtData().bounds.getBoundingBox();
    this.getHotelsList();
  }

  private getHotelsList = () => {
    const url = `browse?apiKey=${this.apiKey}&in=${this.createBoundingBoxCoords()}&cat=${this.category}&lang=${this.lang}`;
    this.apiService.getHotels(url)
      .subscribe(
        data => {
          this.hotels = data.results.items;
          const markers = this.map.getObjects();
          this.removeFarMarkers(markers);
          this.addNewMarkers(markers);
        },
        error => console.error('There was an error!', error)
      );
  }

  private removeFarMarkers = (markers) => {
    this.map.removeObjects(markers.filter(
      marker => !this.hotels.find(hotel => marker.data?.id === hotel.id)
    ));
  }

  private addNewMarkers = (markers) => {
    const filteredHotels = markers.length
      ? this.hotels.filter(hotel => (
        !markers.find(marker => marker.data.id === hotel.id)
      ))
      : this.hotels;
    const newMarkers = filteredHotels.map(hotel => (
      this.createMarker(this.createCoords(hotel), hotel)
    ));
    this.map.addObjects(newMarkers);
  }

  private createMarker = (coords, data, type: IconType = IconType.Default) => {
    const icon = icons[type];
    const marker = new H.map.Marker(coords, { icon });

    marker.setData(data);
    marker.addEventListener('tap', () => {
      if (this.activeMarker) {
        if (this.activeMarker.data.id === marker.data.id) return;
        const newMarker = this.createMarker(this.createCoords(this.activeMarker.data), this.activeMarker.data);
        this.replaceMarker(this.activeMarker, newMarker);
      }
      const newMarker = this.createMarker(coords, data, IconType.Active);
      this.replaceMarker(marker, newMarker);
      this.activeMarker = newMarker;
      this.scroll(data.id);
    }, false);

    return marker;
  }

  private replaceMarker = (marker, newMarker) => {
    this.map.removeObject(marker);
    this.map.addObject(newMarker);
  }

  private scroll = (id) => {
    const el = document.getElementById(id);
    el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'center' });
  }

  private createBoundingBoxCoords = () => {
    const { aa, la, da, ia } = this.boundingBox;
    return `${aa},${la},${da},${ia}`;
  }

  private createCoords = (place) => ({
    lat: place.position[0], lng: place.position[1]
  })
}
