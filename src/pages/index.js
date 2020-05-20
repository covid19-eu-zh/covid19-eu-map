import React, { useRef } from 'react';
import Helmet from 'react-helmet';
import L from 'leaflet';
import { Marker } from 'react-leaflet';

import { promiseToFlyTo, getCurrentLocation } from 'lib/map';

import Layout from 'components/Layout';
import Container from 'components/Container';
import Map from 'components/Map';

import gatsby_astronaut from 'assets/images/gatsby-astronaut.jpg';
import {getGeocord, getAreaData} from '../lib/util'

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

const IndexPage = () => {
  const markerRef = useRef();

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

    // 2. Look up the lat and lng for the countries

    
    const geoJSON = await Promise.all(countries.map(async country => {
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
    // Now we have 18 feature collections
    console.log('geoJSON', geoJSON)

    // 4. Group together the countryname, alhpa2, lat lng in state

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
      </Map>

      <Container type="content" className="text-center home-start">
        <h2>Still Getting Started?</h2>
        <p>Run the following in your terminal!</p>
        <pre>
          <code>gatsby new [directory] https://github.com/colbyfayock/gatsby-starter-leaflet</code>
        </pre>
        <p className="note">Note: Gatsby CLI required globally for the above command</p>
      </Container>
    </Layout>
  );
};

export default IndexPage;
