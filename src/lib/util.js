/**
 * isDomAvailable
 * @description Checks to see if the DOM is available by checking the existence of the window and document
 * @see https://github.com/facebook/fbjs/blob/master/packages/fbjs/src/core/ExecutionEnvironment.js#L12
 */
import { data as geodata } from './areaGeocord'

export function isDomAvailable() {
  return typeof window !== 'undefined' && !!window.document && !!window.document.createElement;
}

export async function getGeocordGoogle(areaName, countryName){
  // All countries having missing area
  // Czech[2],Italy [9], Scotland[13], Sweden[14], slovenia[15], united kindom [16], wales[17] have geolocation missing
  const encodedAreaName = encodeURI(`${areaName} ${countryName}`)
  const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAreaName}&key=${process.env.GOOGLE_API_KEY}`)
  const data = await res.json()
  const location = data?.results[0]?.geometry?.location
  return location
}

function getGeocord(areaName, countryName){
  return geodata.filter(area =>(area.area === areaName)).map(({lat, lng}) => ({lat, lng}))
}

export  function getAreaData(countryData, countryName) {
    return countryData.records.map(async area => {
      // lau is the smallest admin area, then nuts_3 etc.
      const nutArea = area['lau']|| area["nuts_3"] || area["nuts_2"] || area["nuts_1"] || countryName

      // const location = await getGeocordGoogle(nutArea, countryName)
      const [location] = getGeocord(nutArea)
      // filter out the ones without location
      // TODO: later, filter these ones to requery for coord
      if (!location.lat) return null 

      // NEXT: Transform this into GeoJSON data format
      const geoJson = {
        type: 'Feature',
        properties: {
         ...area,
         countryName,
         area: nutArea
        },
        geometry: {
          type: 'Point',
          coordinates: [ location.lng, location.lat ]
        }
      }
      return geoJson
    })

}