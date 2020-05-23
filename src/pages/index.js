import React, { useRef, useState } from 'react';
import Helmet from 'react-helmet';
import L from 'leaflet';
import { Marker, GeoJSON } from 'react-leaflet';

import { promiseToFlyTo, getCurrentLocation } from 'lib/map';

import Layout from 'components/Layout';
import Container from 'components/Container';
import Map from 'components/Map';

import gatsby_astronaut from 'assets/images/gatsby-astronaut.jpg';
import {getGeocord, getAreaData} from '../lib/util'

// Docs
// https://leafletjs.com/reference-1.6.0.html#marker
// https://github.com/PaulLeCam/react-leaflet/blob/master/src/GeoJSON.js

const LOCATION = {
  lat: 51.1657,
  lng: 10.4515
};
const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 4;
const ZOOM = 10;

const timeToZoom = 2000;
const timeToOpenPopupAfterZoom = 4000;
const timeToUpdatePopupAfterZoom = timeToOpenPopupAfterZoom + 3000;

const popupContentHello = `<p>Hello 👋</p>`;
const popupContentGatsby = `
  <div class="popup-gatsby">
    <div class="popup-gatsby-image">
      <img class="gatsby-astronaut" src=${gatsby_astronaut} />
    </div>
    <div class="popup-gatsby-content">
      <h1>Gatsby Leaflet Starter</h1>
      <p>Welcome to your new Gatsby site. Now go build something great!</p>
    </div>
  </div>
`;

function geoJSONStyle() {
  return {
    color: '#1f2021',
    weight: 1,
    fillOpacity: 0.5,
    fillColor: '#fff2af',
  }
}

const IndexPage = () => {
  const markerRef = useRef();
  const [geoJSONArrays, setgeoJSONArrays] = useState([])

  /**
   * mapEffect
   * @description Fires a callback once the page renders
   * @example Here this is and example of being used to zoom in and set a popup on load
   */

  async function mapEffect({ leafletElement: map } = {}) {

    // fetch covid 19 EU data 
    // 1. fetch the countries from /countryLookup
    const countriesRes = await fetch('https://covid19-eu-data-api-gamma.now.sh/api/countryLookup')
    let {countries} = await countriesRes.json()
    // countries = countries.slice(0,1)
    const geoJSONArrays = await Promise.all(countries.map(async country => {
      const alpha2 = Object.keys(country)[0]
      const countryName = Object.values(country)[0]
      
      // 3. Fetch the data for each of the countries
      const countryDataRes = await fetch(`https://covid19-eu-data-api-gamma.now.sh/api/countries?alpha2=${alpha2}&days=1`)
      const [countryData] = await countryDataRes.json()

      // Currently Switzerland, ch, nuts_2 is in code, not actual name. e.g. ag, ai etc
      // map them after getting the actual names
      if(alpha2 === 'ch') return
      const features = await Promise.all(getAreaData(countryData, countryName))
      return {
        type: 'FeatureCollection',
        features
      }
    }))
    // Now we have 18 country's feature collections
    const truthyGeoJSONArrays = geoJSONArrays.filter(geojson => !!geojson).map(geojson => {
      const newFeatures = geojson.features.filter(feature => !!feature)
      return {...geojson, features: newFeatures}
    })
    setgeoJSONArrays(truthyGeoJSONArrays)
  }

  // onEachFeature takes map layer as the 2nd arg so that we can bind popup
  // const onEachFeature = (feature, layer) => {
  //   const { countryName, deaths, recovered, datetime, cases, area } = feature.properties
  //   const deathContent = deaths ? `<li><strong>Deaths:</strong> ${deaths}</li>` : ""
  //   const recoveredContent = recovered ? `<li><strong>Recovered:</strong> ${recovered}</li>` : ""
  //   const date = datetime.split("T")[0]
  //   const popupContent = `
  //   <span class="icon-marker">
  //   <span class="icon-marker-tooltip">
  //     <h2>${countryName}</h2>
  //     <h2>${area}</h2>
  //     <ul>
  //       <li><strong>Last Update:</strong> ${date}</li>
  //       <li><strong>Confirmed:</strong> ${cases}</li>
  //       ${deathContent}
  //       ${recoveredContent}
  //     </ul>
  //   </span>
  // </span>
  //    `

  //   layer.bindPopup(popupContent)
  // }

  // pointToLayer takes latlng and creates a layer on that pt.
  // L.marker is a layer
  const pointToLayer = (feature, latlng) => {
    console.log('latlng', latlng)
    const { countryName, deaths, recovered, datetime, cases, area } = feature.properties
    const deathContent = deaths ? `<li><strong>Deaths:</strong> ${deaths}</li>` : ""
    const recoveredContent = recovered ? `<li><strong>Recovered:</strong> ${recovered}</li>` : ""
    const date = datetime.split("T")[0]
    const html = `
    <span class="icon-marker">
    <span class="icon-marker-tooltip">
      <h2>${countryName}</h2>
      <h2>${area}</h2>
      <ul>
        <li><strong>Last Update:</strong> ${date}</li>
        <li><strong>Confirmed:</strong> ${cases}</li>
        ${deathContent}
        ${recoveredContent}
      </ul>
    </span>
    ${cases}
  </span>  `
  return L.marker( latlng, {
    icon: L.divIcon({
      className: 'icon',
      html
    }),
    riseOnHover: true
  });  

  }

  const mapSettings = {
    center: CENTER,
    defaultBaseMap: 'OpenStreetMap',
    zoom: DEFAULT_ZOOM,
    mapEffect
  };

  return (
    <Layout pageName="home">
      <Helmet>
        <title>Home Page</title>
      </Helmet>

      <Map {...mapSettings}>
        <Marker ref={markerRef} position={CENTER} />
        {geoJSONArrays && geoJSONArrays.map(geojson => (
          <GeoJSON 
            data={geojson}
            style={geoJSONStyle}
            pointToLayer={pointToLayer}
          />

        ))}
      </Map>
    </Layout>
  );
};

export default IndexPage;
