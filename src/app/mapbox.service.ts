import { Injectable } from '@angular/core';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import * as mapboxgl from 'mapbox-gl';
import * as locations from '../assets/chicago-parks.json';

import { environment } from 'src/environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
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
    this.marker = new mapboxgl.Marker({
      draggable: true,
      color: 'red',
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
    const locateUser = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    });
    console.log(locateUser);

   
    this.map.addControl(locateUser, 'bottom-right');
    locateUser.on('geolocate', (data) => {
      console.log(data);
    });

    
    let geoCoder = new MapboxGeocoder({
      accessToken: environment.mapbox.accessToken,
      mapboxgl: mapboxgl,
      marker: false,
    });
    this.map.addControl(geoCoder);
   
    geoCoder.on('result', (event) => {
      console.log(event.result);
      this.marker = new mapboxgl.Marker({ draggable: true })
        .setLngLat(event.result.center)
        .addTo(this.map);

      this.marker.on('dragend', () => {
        console.log(this.marker.getLngLat());
        this.draggerMarkerLatLng = this.marker.getLngLat();
      });
    });
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
    this.http
      .get('../assets/chicago-parks.json')
      .subscribe((locations: any) => {
        for (const location of locations.features) {
          // Create a DOM element for each marker.
          const el = document.createElement('div');
          const width = 50;
          const height = 50;
          el.className = 'marker';
          el.style.backgroundImage = `url(https://placekitten.com/g/${width}/${height}/)`;
          el.style.width = `${width}px`;
          el.style.height = `${height}px`;
          el.style.backgroundSize = '100%';

          el.addEventListener('click', () => {
            window.alert(location.properties.description);
          });

          // Add markers to the map.
          new mapboxgl.Marker(el)
            .setLngLat(location.geometry.coordinates)
            .addTo(this.map);
        }
      });
  }

  buildMapPoponMarkerHover() {
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
  buildMapPoponMarkerClick() {
    this.http
      .get('../assets/chicago-parks.json')
      .subscribe((locations: any) => {
        this.initMap();
        const map = this.map;
        map.on('load', () => {
          map.loadImage(
            'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
            (error, image: any) => {
              map.addImage('custom-marker', image);
              map.addSource('places', {
                // This GeoJSON contains features that include an "icon"
                // property. The value of the "icon" property corresponds
                // to an image in the Mapbox Streets style's sprite.
                type: 'geojson',
                data: {
                  type: 'FeatureCollection',
                  features: [
                    {
                      type: 'Feature',
                      properties: {
                        description:
                          '<strong>Make it Mount Pleasant</strong><p><a href="http://www.mtpleasantdc.com/makeitmtpleasant" target="_blank" title="Opens in a new window">Make it Mount Pleasant</a> is a handmade and vintage market and afternoon of live entertainment and kids activities. 12:00-6:00 p.m.</p>',
                      },
                      geometry: {
                        type: 'Point',
                        coordinates: [-77.038659, 38.931567],
                      },
                    },
                    {
                      type: 'Feature',
                      properties: {
                        description:
                          '<strong>Mad Men Season Five Finale Watch Party</strong><p>Head to Lounge 201 (201 Massachusetts Avenue NE) Sunday for a <a href="http://madmens5finale.eventbrite.com/" target="_blank" title="Opens in a new window">Mad Men Season Five Finale Watch Party</a>, complete with 60s costume contest, Mad Men trivia, and retro food and drink. 8:00-11:00 p.m. $10 general admission, $20 admission and two hour open bar.</p>',
                      },
                      geometry: {
                        type: 'Point',
                        coordinates: [-77.003168, 38.894651],
                      },
                    },
                    {
                      type: 'Feature',
                      properties: {
                        description:
                          '<strong>Big Backyard Beach Bash and Wine Fest</strong><p>EatBar (2761 Washington Boulevard Arlington VA) is throwing a <a href="http://tallulaeatbar.ticketleap.com/2012beachblanket/" target="_blank" title="Opens in a new window">Big Backyard Beach Bash and Wine Fest</a> on Saturday, serving up conch fritters, fish tacos and crab sliders, and Red Apron hot dogs. 12:00-3:00 p.m. $25.grill hot dogs.</p>',
                      },
                      geometry: {
                        type: 'Point',
                        coordinates: [-77.090372, 38.881189],
                      },
                    },
                    {
                      type: 'Feature',
                      properties: {
                        description:
                          '<strong>Ballston Arts & Crafts Market</strong><p>The <a href="http://ballstonarts-craftsmarket.blogspot.com/" target="_blank" title="Opens in a new window">Ballston Arts & Crafts Market</a> sets up shop next to the Ballston metro this Saturday for the first of five dates this summer. Nearly 35 artists and crafters will be on hand selling their wares. 10:00-4:00 p.m.</p>',
                      },
                      geometry: {
                        type: 'Point',
                        coordinates: [-77.111561, 38.882342],
                      },
                    },
                    {
                      type: 'Feature',
                      properties: {
                        description:
                          '<strong>Seersucker Bike Ride and Social</strong><p>Feeling dandy? Get fancy, grab your bike, and take part in this year\'s <a href="http://dandiesandquaintrelles.com/2012/04/the-seersucker-social-is-set-for-june-9th-save-the-date-and-start-planning-your-look/" target="_blank" title="Opens in a new window">Seersucker Social</a> bike ride from Dandies and Quaintrelles. After the ride enjoy a lawn party at Hillwood with jazz, cocktails, paper hat-making, and more. 11:00-7:00 p.m.</p>',
                      },
                      geometry: {
                        type: 'Point',
                        coordinates: [-77.052477, 38.943951],
                      },
                    },
                    {
                      type: 'Feature',
                      properties: {
                        description:
                          '<strong>Capital Pride Parade</strong><p>The annual <a href="http://www.capitalpride.org/parade" target="_blank" title="Opens in a new window">Capital Pride Parade</a> makes its way through Dupont this Saturday. 4:30 p.m. Free.</p>',
                      },
                      geometry: {
                        type: 'Point',
                        coordinates: [-77.043444, 38.909664],
                      },
                    },
                    {
                      type: 'Feature',
                      properties: {
                        description:
                          '<strong>Muhsinah</strong><p>Jazz-influenced hip hop artist <a href="http://www.muhsinah.com" target="_blank" title="Opens in a new window">Muhsinah</a> plays the <a href="http://www.blackcatdc.com">Black Cat</a> (1811 14th Street NW) tonight with <a href="http://www.exitclov.com" target="_blank" title="Opens in a new window">Exit Clov</a> and <a href="http://godsilla.bandcamp.com" target="_blank" title="Opens in a new window">Gods’illa</a>. 9:00 p.m. $12.</p>',
                      },
                      geometry: {
                        type: 'Point',
                        coordinates: [-77.031706, 38.914581],
                      },
                    },
                    {
                      type: 'Feature',
                      properties: {
                        description:
                          '<strong>A Little Night Music</strong><p>The Arlington Players\' production of Stephen Sondheim\'s  <a href="http://www.thearlingtonplayers.org/drupal-6.20/node/4661/show" target="_blank" title="Opens in a new window"><em>A Little Night Music</em></a> comes to the Kogod Cradle at The Mead Center for American Theater (1101 6th Street SW) this weekend and next. 8:00 p.m.</p>',
                        icon: 'music',
                      },
                      geometry: {
                        type: 'Point',
                        coordinates: [-77.020945, 38.878241],
                      },
                    },
                    {
                      type: 'Feature',
                      properties: {
                        description:
                          '<strong>Truckeroo</strong><p><a href="http://www.truckeroodc.com/www/" target="_blank">Truckeroo</a> brings dozens of food trucks, live music, and games to half and M Street SE (across from Navy Yard Metro Station) today from 11:00 a.m. to 11:00 p.m.</p>',
                        icon: 'music',
                      },
                      geometry: {
                        type: 'Point',
                        coordinates: [-77.007481, 38.876516],
                      },
                    },
                  ],
                },
              });
              // Add a layer showing the places.
              map.addLayer({
                source: 'places',
                id: 'markers',
                type: 'symbol',
                layout: {
                  'icon-image': 'custom-marker',
                  'text-offset': [0, 1.25],
                  'text-anchor': 'top',
                },
              });
              // When a click event occurs on a feature in the places layer, open a popup at the
              // location of the feature, with description HTML from its properties.
              map.on('click', 'places', (e: any) => {
                // Copy coordinates array.
                const coordinates = e.features[0].geometry.coordinates.slice();
                const description = e.features[0].properties.description;

                // Ensure that if the map is zoomed out such that multiple
                // copies of the feature are visible, the popup appears
                // over the copy being pointed to.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                  coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                new mapboxgl.Popup()
                  .setLngLat(coordinates)
                  .setHTML(description)
                  .addTo(map);
              });

              // Change the cursor to a pointer when the mouse is over the places layer.
              map.on('mouseenter', 'places', () => {
                map.getCanvas().style.cursor = 'pointer';
              });

              // Change it back to a pointer when it leaves.
              map.on('mouseleave', 'places', () => {
                map.getCanvas().style.cursor = '';
              });
            }
          );
        });
      });
  }

  buildMultiMarkerMap() {
    this.initMap();
    this.http
      .get('../assets/chicago-parks.json')
      .subscribe((locations: any) => {
        let features = locations?.features;
        features.forEach((place: any) => {
          console.log('object', place);
          new mapboxgl.Marker()
            .setLngLat(place.geometry.coordinates)
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(
                '<h3>' +
                  place.properties.title +
                  '</h3><p>' +
                  place.properties.description +
                  '</p>'
              )
            )
            .addTo(this.map);
          
        });
      });
  }
}
