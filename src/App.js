import React, { Component } from 'react';
import { withScriptjs, withGoogleMap, GoogleMap, Polyline, Marker } from "react-google-maps"
import { geoToH3, h3ToGeoBoundary, kRing as h3KRing, kRingDistances } from 'h3-js'
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

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

window.mapInstance = null

const MyMapComponent = withScriptjs(withGoogleMap((props) =>
  <GoogleMap
    defaultZoom={12}
    defaultCenter={props.markerPosition}
    ref={el => window.mapInstance = el }
    onClick={props.onClickMap}
  >
  <Marker
    position={props.markerPosition}
    label= {{text: 'Rider'}}
    key={getRandomInt(100000000000)}
  >
  </Marker>

  {props.cabPositions != null && props.cabPositions.map(cabPs => (
    <Marker
      position={cabPs}
      key={getRandomInt(10000000000)}
      label= {{text: 'Cab'}}
      icon={`https://maps.google.com/mapfiles/ms/icons/${cabPs.color}-dot.png`}
    >
    </Marker>
  ))}
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


const defaultCabPositions = [
  {lat: 13.079060248055262, lng: 80.22759760822487, color: 'blue'},
  {lat: 13.06250607460174, lng: 80.223477735178, color: 'blue'},
  {lat: 13.040766585815136, lng: 80.21592463459206, color: 'blue'},
  {lat: 13.049462610776228, lng: 80.18966044391823, color: 'blue'},
  {lat: 13.073876737410314, lng: 80.26004160846901, color: 'blue'},
  {lat: 13.088089328979745, lng: 80.25214518512917, color: 'blue'},
  {lat: 13.033157313192051, lng: 80.25259713734818, color: 'blue'},
  {lat: 13.070783309000612, lng: 80.1504135131836, color: 'blue'},
  {lat: 13.078642227041378, lng: 80.1932023009224, color: 'blue'},
  {lat: 13.053225219080444, lng: 80.16676644887161, color: 'blue'},
  {lat: 13.013756790784246, lng: 80.15955667103958, color: 'blue'},
  {lat: 13.002383364692044, lng: 80.22581796254349, color: 'blue'},
  {lat: 13.141504615491657, lng: 80.2100251158638, color: 'blue'},
  {lat: 13.138161276166231, lng: 80.12419442738724, color: 'blue'},
  {lat: 13.136155250712601, lng: 80.23440103139114, color: 'blue'},
  {lat: 13.119772096194323, lng: 80.28452615346146, color: 'blue'},
  {lat: 12.988333118606006, lng: 80.26701669301224, color: 'blue'},
  {lat: 12.987329499179056, lng: 80.14204721059036, color: 'blue'},
  {lat: 13.047539477747778, lng: 80.09363870228958, color: 'blue'},
  {lat: 13.070950513951637, lng: 80.09157876576614, color: 'blue'}
  ];

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      kringSize: 1,
      lat: 13.067439,
      lng: 80.237617,
      resolution: 7,
      plantingMode: 'RIDER',
      cabPositions: defaultCabPositions
    };

    this.state.riderH3Index = geoToH3(this.state.lat, this.state.lng, this.state.resolution);
    
    this.handleInputChangekRing = this.handleInputChangekRing.bind(this);
    this.handleInputChangeResolution = this.handleInputChangeResolution.bind(this);
    this.handleOnClickMap = this.handleOnClickMap.bind(this);
    this.handleOnClickPlantRider = this.handleOnClickPlantRider.bind(this);
    this.handleOnClickPlantCabs = this.handleOnClickPlantCabs.bind(this);
    this.handleOnClickRemoveCabs = this.handleOnClickRemoveCabs.bind(this);
    this.handleOnClickFindCabs = this.handleOnClickFindCabs.bind(this);
  }

  updateColor() {
    this.setState(state => {
      let res = state.resolution
      let ringsArr = kRingDistances(state.riderH3Index, state.kringSize);
      let rings = [].concat(...ringsArr);
      let ringMap = {}
      rings.forEach(x => ringMap[x]=true);

      // console.log(ringMap)
      // console.log("-----------------------------------")
      let newCabPositions = state.cabPositions.map(x => {
        // console.log(x)
        // console.log(geoToH3(x.lat, x.lng, res))
        // console.log("-----------------------------------")
        let color = ringMap[geoToH3(x.lat, x.lng, res)] ? 'green' : 'blue';
        x.color = color;
        return x
      })

      return { cabPositions: newCabPositions }
    })
  }

  handleInputChangekRing(num) {
    this.setState(state => ({
      kringSize: num
    }));
  }

  handleInputChangeResolution(num) {
    this.setState(state => ({
      resolution: num,
      riderH3Index: geoToH3(state.lat, state.lng, num)
    }));
  }

  handleOnClickMap(e) {
    if (this.state.plantingMode === 'RIDER') {
      this.updateRiderMarker(e)
    }

    if (this.state.plantingMode === 'CABS') {
      this.updateCabsMarker(e)
    }
  }

  updateRiderMarker(e) {
    this.setState(state => ({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
      riderH3Index: geoToH3(e.latLng.lat(), e.latLng.lng(), state.resolution)
    }));
  }

  updateCabsMarker(e) {
    const newCab = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
      color: 'blue'
    }

    this.setState(state => ({
      cabPositions: [...state.cabPositions, newCab],
    }));
  }
  
  handleOnClickRemoveCabs() {
    this.setState(state => ({
      cabPositions: [],
    }));
  }

  handleOnClickPlantRider() {
    this.setState(state => ({
      plantingMode: 'RIDER'
    }));
  }

  handleOnClickPlantCabs() {
    this.setState(state => ({
      plantingMode: 'CABS'
    }));
  }

  handleOnClickFindCabs() {
    this.updateColor();
  }

  getH3Index() {
    return geoToH3(this.state.lat, this.state.lng, this.state.resolution)
  }

  render() {
    let h3idx = this.getH3Index()
    let apiKey = 'AIzaSyAT8jfo6wpzXcgHbis_GlC87rNDz5aIzQU'
    let mapUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=3.exp&libraries=geometry,drawing,places`

    return (
      <div style={{ height: `100%`}}>
        <nav className="navbar navbar-light" style={{ backgroundColor: '#563F7A', height: '5%' }}>
          <div className="mx-auto order-0">
            <a className="navbar-brand mx-auto" href="https://github.com/tak2siva/uber-h3-gmaps-ui" style={{color: 'white'}}>Uber's H3 Playground</a>
          </div>
        </nav>

      <div style={{ height: `95%`}} className='d-flex'>
        <div style={{ height: `100%`, width: `100%`}} className='p-2'>
          <MyMapComponent
            isMarkerShown
            googleMapURL={mapUrl}
            loadingElement={<div style={{ height: `100%` }} />}
            containerElement={<div style={{ height: `100%`, width: `100%`}} />}
            mapElement={<div style={{ height: `100%` }} />}
            hexagons={h3KRing(h3idx, this.state.kringSize)}
            onClickMap={this.handleOnClickMap}
            markerPosition={{ lat: this.state.lat, lng: this.state.lng }}
            cabPositions={this.state.cabPositions}
          />   
        </div>
        <div style={{paddingRight: '20px'}} className='p-2'>
          <form>
            <div className='form-group'>
              <label>
                Resolution:
              </label>
              <NumericInput className="res_input form-control" min={0} max={30} value={this.state.resolution} onChange={this.handleInputChangeResolution} />
            </div>
            <div className='form-group'>
              <label>
                Ring:
              </label>
              <NumericInput className="num_input form-control" min={0} max={100} value={this.state.kringSize} onChange={this.handleInputChangekRing} />
            </div>
          </form>
          <hr/>
          <div className="custom-control custom-radio">
            <input type="radio" id="customRadio1"
                  name="customRadio" 
                  checked={this.state.plantingMode === 'RIDER'}
                  onChange={this.handleOnClickPlantRider}
                  className="custom-control-input"/>
            <label className="custom-control-label" htmlFor="customRadio1">Plant Rider</label>
          </div>
          <div className="custom-control custom-radio">
            <input type="radio" id="customRadio2"
                  checked={this.state.plantingMode === 'CABS'}
                  onChange={this.handleOnClickPlantCabs}
                  name="customRadio" className="custom-control-input"/>
            <label className="custom-control-label" htmlFor="customRadio2">Plant Cabs</label>
          </div>
          <button style={{marginTop: `10px`}} onClick={this.handleOnClickRemoveCabs}>
            Remove all cabs
          </button> 
          <hr/>
          <button className='btn btn-success' style={{marginTop: `10px`, width: `100%`}} onClick={this.handleOnClickFindCabs}>
            Find Cabs
          </button>
        </div>
      </div>
      </div>
    );
  }
}

export default App;
