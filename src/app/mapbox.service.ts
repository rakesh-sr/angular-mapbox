import { Injectable } from '@angular/core';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import * as mapboxgl from 'mapbox-gl';
import * as locations from '../assets/chicago-parks.json';

import { environment } from 'src/environments/environment.development';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class MapboxService {
  map!: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/streets-v12';
  // lat = 45.899977;
  //  lng = 6.172652;
  lat = 17.39937710971077;
  lng = 78.46795032100118;
  zoom = 3;
  marker!: mapboxgl.Marker;
  draggerMarkerLatLng: any;
  constructor(private http: HttpClient) {}

  initMap() {
    this.map = new mapboxgl.Map({
      accessToken: environment.mapbox.accessToken,
      container: 'map',
      style: this.style,
      zoom: this.zoom,
      center: [this.lat, this.lng],
    });
  }

  buildMapLocateUser() {
    this.initMap();
    this.map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        // When active the map will receive updates to the device's location as it changes.
        trackUserLocation: true,
        // Draw an arrow next to the location dot to indicate which direction the device is heading.
        showUserHeading: true,
      })
    );
  }

  buildMapGeoCoder() {
    this.initMap();

    // Add the control to the map.
    this.map.addControl(
      new MapboxGeocoder({
        accessToken: environment.mapbox.accessToken,
        mapboxgl: mapboxgl,
      })
    );
  }

  buildMapDraggableMarker() {
    this.initMap();
    this.marker = new mapboxgl.Marker({
      draggable: true,
    })
      .setLngLat([this.lat, this.lng])
      .addTo(this.map);
    this.marker.on('dragend', () => {
      console.log(this.marker.getLngLat());
      this.draggerMarkerLatLng = this.marker.getLngLat();
    });
  }

  buildMapPoponMarker() {
    this.http
      .get('../assets/chicago-parks.json')
      .subscribe((locations: any) => {
        this.initMap();
        const map = this.map;
        map.on('load', () => {
          map.addSource('places', {
            type: 'geojson',
            data: locations,
          });
          // Add a layer showing the places.
          map.addLayer({
            id: 'places',
            type: 'circle',
            source: 'places',
            paint: {
              'circle-color': '#4264fb',
              'circle-radius': 6,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
            },
          });

          // Create a popup, but don't add it to the map yet.
          const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
          });

          map.on('mouseenter', 'places', (e: any) => {
            // Change the cursor style as a UI indicator.
            map.getCanvas().style.cursor = 'pointer';

            // Copy coordinates array.
            const coordinates = e.features[0].geometry.coordinates.slice();
            const description = e.features[0].properties.description;

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            // Populate the popup and set its coordinates
            // based on the feature found.
            popup.setLngLat(coordinates).setHTML(description).addTo(map);
          });

          map.on('mouseleave', 'places', () => {
            map.getCanvas().style.cursor = '';
            popup.remove();
          });
        });
      });
  }
}
