import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

declare let H: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  @ViewChild("map")
  public mapElement: ElementRef;

  @Input()
  public apiKey: any;

  @Input()
  public lat: any;

  @Input()
  public lng: any;

  private platform: any;
  private map: any;
  private ui: any;

  constructor() { }

  ngOnInit(): void {
    this.platform = new H.service.Platform({
      apikey: this.apiKey
    });
  }

  public ngAfterViewInit() {
    const defaultLayers = this.platform.createDefaultLayers();
    this.map = new H.Map(
      this.mapElement.nativeElement,
      defaultLayers.vector.normal.map,
      {
        zoom: 10,
        center: { lat: this.lat, lng: this.lng }
      }
    );
    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(this.map));
    this.ui = H.ui.UI.createDefault(this.map, defaultLayers);
  }
}
