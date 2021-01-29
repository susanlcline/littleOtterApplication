import React from 'react';
import './App.css';
// maps currency codes to currency symbol
import * as CurrencySymbols from './currencies';

/*
 * * TO DO: destructure, sort, loading, show all countries once the continent has been selected, CSS
*/

class App extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      // contains ISO2 Code and country Name
      countryArray: [],
      chosenContinent: null,
      chosenCountry: "",
      // map of abbreviatedName ==> countryName
      countryListMap: new Map(),
      fullCountryNameAbbrName: new Map(),
      // map of continentName => array of abbreviatedNames
      continentCountryMap: new Map(),
      countryContinentMap: new Map(),
      iso2ToIso3Map: new Map(),
      iso2CapitalMap: new Map(),
      iso2PhoneMap: new Map(),
      iso2CurrencyMap: new Map(),
      countryImage: null,
      countryDetailsObj: {}
      // therefore to get the countries associated with the continent
      // continentCountryMap.get([countryList[0]]) returns an array
    }
    this.continentMap = new Map([['AF', 'Africa'], ['AS', 'Asia'], ['EU', 'Europe'], 
    ['NA', 'North America'], ['OC', 'Oceania'], ['SA', 'South America']]);

    this.fetchCountryList = this.fetchCountryList.bind(this);
    this.fetchContinentList = this.fetchContinentList.bind(this);
    this.fetchISO3List = this.fetchISO3List.bind(this);
    this.fetchIso2CapitalList = this.fetchIso2CapitalList.bind(this);
    this.fetchIso2PhoneList = this.fetchIso2PhoneList.bind(this);
    this.fetchIso2CurrencyList = this.fetchIso2CurrencyList.bind(this);
    this.generateUUID = this.generateUUID.bind(this);
    this.getListItems = this.getListItems.bind(this);
    this.handleContinentChange = this.handleContinentChange.bind(this);
    this.handleCountrySelection = this.handleCountrySelection.bind(this);
    this.getCountryDropDown = this.getCountryDropDown.bind(this);
    this.createCountryDetails = this.createCountryDetails.bind(this);
    this.displayCountryDetails = this.displayCountryDetails.bind(this);
  }


  render() {
    return (
      <div className="App">
        <h1> Country Data </h1>
        <div className="spacer">
          <label htmlFor="continent" className="marginRight10">Select a Continent</label>
          <select id="continent" onChange={(e) => this.handleContinentChange(e)}>
            <option value="">(All)</option>
            <option value="AF">Africa</option>
            <option value="AS">Asia</option>
            <option value="EU">Europe</option>
            <option value="NA">North America</option>
            <option value="OC">Oceania</option>
            <option value="SA">South America</option>
          </select>
        </div>

        <div>
          <label htmlFor="country" className="marginRight10">Countries</label>
          {this.getCountryDropDown()}
          {this.getListItems()}
          {this.displayCountryDetails()}
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.fetchCountryList();
    this.fetchContinentList();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState !== this.state) {
      return true;
    }
    return true;
  }

  handleContinentChange(evt) {
    const { continentCountryMap } = this.state;
    const val = evt.target.value;
    if (val) {
      // now update the list with just these countries ...
      // I need to put the country list into key/value ones again
      // iterate through these, and get the corresponding country names
      const countryNames = continentCountryMap.get(val);
      const countryAbbrNames = countryNames.map(co => (
        [co, this.state.countryListMap.get(co)]
      ));
      this.setState({
        countryArray: countryAbbrNames,
        chosenContinent: val
      });
    } else {
      this.setState({
        countryArray: Array.from(this.state.countryListMap),
        chosenContinent: null
      })
    }
  }

  fetchCountryList() {
    let theCountryList = new Map();
    let countryNameAbbrNameList = new Map();
    fetch('/api/names')
      .then(response => response.json())
      .then(data => {

        Object.keys(data).forEach((key) => {
          theCountryList.set(key, data[key]);
          countryNameAbbrNameList.set(data[key], key);
        });
        let sortedCountryList = new Map([...theCountryList.entries()].sort());
        this.setState({
          countryListMap: sortedCountryList,
          fullCountryNameAbbrName: countryNameAbbrNameList
        });

      });
  }

  fetchContinentList() {
    fetch('/api/continent')
      .then(response => response.json())
      .then(data => {
        let cCountryMap = new Map();
        let countryContinentMap = new Map();
        Object.keys(data).forEach((key) => {
          // I need the key to be continent, and then for values push all of the countries
          // make a map, if data[key] is not in the map, add it and add all the incoming keys
          const val = data[key];
          if (!cCountryMap.get(val)) {
            const countryArray = [key];
            cCountryMap.set(val, countryArray);
          } else {
            const countries = cCountryMap.get(val);
            countries.push(key);
            cCountryMap.set(val, countries);
          }
          if (!countryContinentMap.get(key)) {
            countryContinentMap.set(key, val);
          }
        });
        this.setState({
          continentCountryMap: cCountryMap,
          countryContinentMap: countryContinentMap
        });

      });
  }

  fetchISO3List() {
    let iso2Iso3Map = new Map();
    fetch('/api/iso3')
      .then(response => response.json())
      .then(data => {
        Object.keys(data).forEach((key) => {
          const val = data[key];
          if (!iso2Iso3Map.get(key)) {
            iso2Iso3Map.set(key, val);
          }
        });
        this.setState({
          iso2ToIso3Map: iso2Iso3Map
        });
        this.fetchIso2CapitalList();
      });
  }

  fetchIso2CapitalList() {
    let iso2CapitalMap = new Map();
    fetch('/api/capital')
      .then(response => response.json())
      .then(data => {
        Object.keys(data).forEach((key) => {
          const val = data[key];
          if (!iso2CapitalMap.get(key)) {
            iso2CapitalMap.set(key, val);
          }
        });
        this.setState({
          iso2CapitalMap: iso2CapitalMap
        });
        this.fetchIso2PhoneList();
      });
  }

  fetchIso2PhoneList() {
    let iso2PhoneMap = new Map();
    fetch('/api/phone')
      .then(response => response.json())
      .then(data => {
        Object.keys(data).forEach((key) => {
          const val = data[key];
          if (!iso2PhoneMap.get(key)) {
            iso2PhoneMap.set(key, val);
          }
        });
        this.setState({
          iso2PhoneMap: iso2PhoneMap
        });
        this.fetchIso2CurrencyList();
      });
  }

  fetchIso2CurrencyList() {
    let iso2CurrencyMap = new Map();
    fetch('/api/currency')
      .then(response => response.json())
      .then(data => {
        Object.keys(data).forEach((key) => {
          const val = data[key];
          if (!iso2CurrencyMap.get(key)) {
            iso2CurrencyMap.set(key, val);
          }
        });
        this.setState({
          iso2CurrencyMap: iso2CurrencyMap
        });
        this.fetchImage();
      });
  }

  /*
   * I could not get this to display.  I must be doing wrong with the way I'm trying to access the URL??
   */
  fetchImage() {
    let image = null;
    const countryCode = this.state.fullCountryNameAbbrName.get(this.state.chosenCountry);
    const url = `https://www.countryflags.io/${countryCode}/flat/64.png`;
    fetch(url,
      {
        mode: 'no-cors', // 'cors' by default,
        cache: 'default'
      })
    .then(response => response.blob())
    .then(images => {
      image = URL.createObjectURL(images);
      this.setState(
        {
          countryImage: image
        }
      );
      
      this.createCountryDetails();
    })
    
  }

  generateUUID() {
    return Math.random();
  }

  getListItems() {
    const arrayToDisplay = this.state.countryArray.length ? this.state.countryArray : Array.from(this.state.countryListMap);
    return (this.state.chosenCountry === "" && 
      <React.Fragment>
        <ul>
          {arrayToDisplay.map(it => (
            <li key={this.generateUUID()} id={it[0]} onClick={(evt) => this.handleCountrySelection(evt)}>{this.state.countryListMap.get(it[0])}</li>
          ))}
        </ul>
      </React.Fragment>
    );
  }

  getCountryDropDown() {
    if (this.state.chosenContinent) {
      const arrayToDisplay = this.state.countryArray.length ? this.state.countryArray : Array.from(this.state.countryListMap);
      return (
        <React.Fragment>
          <select value={this.state.chosenCountry} onChange={(e) => this.handleCountrySelection(e)} style={{width: '200px'}}>
          <option value="">(Select a country ...)</option>
            {arrayToDisplay.map(it => (
              <option value={this.state.countryListMap.get(it[0])} key={this.generateUUID()}>{this.state.countryListMap.get(it[0])}</option>
            ))}
          </select>
        </React.Fragment>
      );
    }
  }

  handleCountrySelection(evt) {
    const target = evt.target;
    if (target.value) {
      this.fetchISO3List();
      this.setState({
        chosenCountry: target.value
      });
    } else if (target.id) {
      this.fetchISO3List();
      this.setState({
        chosenCountry: target.id
      });
    }
  }

  createCountryDetails() {
      const countryCode = this.state.fullCountryNameAbbrName.get(this.state.chosenCountry);
      this.setState({
        countryDetailsObj: {
          selectedCountry: countryCode
        }
      })
  }

  displayCountryDetails() {
    // display the information about the chosenCountry
    // create a structure that contains the following:
    // 
    // Full Name
    // Continent
    // Three-letter ISO Code
    // Capital Name
    // Phone Code
    // Three-letter Currency Code
    // Currency Symbol, if avaible, in the currencies.js file
    // Image of the country's flag (use https://www.countryflags.io/ for the image), if available
    // <img src="https://www.countryflags.io/:country_code/:style/:size.png"></img>
    // Link to Wikipedia article (assume wikipedia url is based off country name in /api/names)
    if (this.state.chosenCountry !== "") {
      const countryCode = this.state.fullCountryNameAbbrName.get(this.state.chosenCountry);
      const currencySymbols = CurrencySymbols.CURRENCY_HTML_CODES;
      // first get the iso2 currencyCode and then get
      const currencyCode = this.state.iso2CurrencyMap.get(countryCode);
      const wikipediaUrl = `https://en.wikipedia.org/wiki/${this.state.chosenCountry}`;
      let imgTag = <img height="200px" alt="myCountry" src={this.state.countryImage}/>;
      const cSymbol = currencySymbols[currencyCode];
      // imgTag = "<img height='200px' alt='myCountry' src='https://www.countryflags.io/BE/flat/64.png/'>";
      return (
        <div>
          <ul>
          <li>Country: {this.state.chosenCountry}</li>
          <li>Continent: {this.continentMap.get(this.state.countryContinentMap.get(countryCode))}</li>
          {/* <li>Country code: {this.state.countryDetailsObj.selectedCountry}</li> */}
          {/* <li><img height='200px' alt='myCountry' src='https://www.countryflags.io/BE/flat/64.png/' /></li> */}
          <li>ISO code(3 letters): {this.state.iso2ToIso3Map.get(countryCode)}</li>
          <li>Capital: {this.state.iso2CapitalMap.get(countryCode)}</li>
          <li>Phone code: {this.state.iso2PhoneMap.get(countryCode)}</li>
          <li>Currency code: {this.state.iso2CurrencyMap.get(countryCode)}</li>
          {currencyCode && currencySymbols[currencyCode] && (
            // I should have decoded this ...
            <li>Currency symbol: {cSymbol}</li>
          )}
          <li><a href='' onClick={() => window.open(wikipediaUrl, "_blank")}>Wikipedia</a></li>
          </ul>
        </div>
      )
    }
  }
}

export default App;
