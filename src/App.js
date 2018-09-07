import React, { Component } from 'react';
import { withScriptjs, withGoogleMap, GoogleMap, Polyline } from "react-google-maps"
import { geoToH3, h3ToGeoBoundary, kRing as h3KRing } from 'h3-js'
import NumericInput from 'react-numeric-input';


// const h3Index = geoToH3(13.067439, 80.237617, 8)
// let hexBoundary = h3ToGeoBoundary(h3Index)
// hexBoundary.push(hexBoundary[0])

function h3ToPolyline(h3idx) {
  let hexBoundary = h3ToGeoBoundary(h3idx)
  hexBoundary.push(hexBoundary[0])

  let arr = []
  for (const i of hexBoundary) {
    arr.push({lat: i[0], lng: i[1]})
  }

  return arr
}


window.mapInstance = null

const MyMapComponent = withScriptjs(withGoogleMap((props) =>
  <GoogleMap
    defaultZoom={14}
    defaultCenter={{ lat: 13.067439, lng: 80.237617 }}
    ref={el => window.mapInstance = el }
  >
  {
    props.hexagons.map(hex => (
      <Polyline
        key={hex}
        path={h3ToPolyline(hex)}
        options={{strokeColor: '#FF0000', strokeWeight: 2}}
      />
    ))
  }
  </GoogleMap>
))

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      kringSize: 1,
      lat: 13.067439,
      lng: 80.237617,
      resolution: 8
    };
    this.handleInputChangekRing = this.handleInputChangekRing.bind(this);
    this.handleInputChangeResolution = this.handleInputChangeResolution.bind(this);
  }

  handleInputChangekRing(num) {
    console.log(num);
    this.setState(state => ({
      kringSize: num
    }));
  }

  handleInputChangeResolution(num) {
    console.log(num);
    this.setState(state => ({
      resolution: num
    }));
  }

  getH3Index() {
    return geoToH3(this.state.lat, this.state.lng, this.state.resolution)
  }

  render() {
    let h3idx = this.getH3Index()

    return (
      <div>
        <MyMapComponent
          isMarkerShown
          googleMapURL="https://maps.googleapis.com/maps/api/js?key=&v=3.exp&libraries=geometry,drawing,places"
          loadingElement={<div style={{ height: `100%` }} />}
          containerElement={<div style={{ height: `500px`, width: `70%`, float: 'left' }} />}
          mapElement={<div style={{ height: `100%` }} />}
          hexagons= {h3KRing(h3idx, this.state.kringSize)}
        />        
      <div className="my-form" style={{float: 'right', paddingRight: '20px'}}>
      <form>
          <label style={{paddingRight: `30px`}}>
            Resolution:
          </label>
          <NumericInput className="res_input" min={0} max={30} value={this.state.resolution} onChange={this.handleInputChangeResolution}/>
        </form>
        <form>
          <label style={{paddingRight: `30px`}}>
            Ring:
          </label>
          <NumericInput className="num_input" min={0} max={100} value={this.state.kringSize} onChange={this.handleInputChangekRing}/>
        </form>
      </div>
      
      </div>
    );
  }
}

export default App;
