import { Component, OnInit } from '@angular/core';
import { MapboxService } from '../mapbox.service';
import * as mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  mapType = '';
  constructor(public map: MapboxService) {}
  ngOnInit() {
    //this.map.buildMultiMarkerMap();
  }
  selectMap() {
    if (this.mapType == 'geoCoder') {
      this.map.buildMapGeoCoder()
    } else if (this.mapType == 'locateUser') {
      this.map.buildMapLocateUser();
    } else if (this.mapType == 'draggableMarker') {
      this.map.buildMapDraggableMarker();
    } else if (this.mapType == 'popupOnMarker') {
      this.map.buildMapPoponMarkerClick();
    } else if (this.mapType == 'MultiMarker') {
      this.map.buildMultiMarkerMap();
    }
  }
}
