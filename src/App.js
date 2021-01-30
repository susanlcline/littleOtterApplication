import React from 'react';
import './App.css';
import * as CurrencySymbols from './currencies';

/*
 * TO DO: If click on country without continent being selected what should the behavior be?
 * I think I need to create the dropdown and sync it with the selected country
*/

class App extends React.Component {

  constructor(props) {
    super(props);
    
    this.state = {
      // contains ISO2 Code and country Name
      countryArray: [],
      chosenContinent: null,
      chosenCountryCode: "",
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
      countryDetailsObj: {},
      isLoadingDetails: true
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
    this.sortMapEntries = this.sortMapEntries.bind(this);
    this.sortArrayEntries = this.sortArrayEntries.bind(this);
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
    const { continentCountryMap, countryListMap } = this.state;
    const val = evt.target.value;
    if (val) {
      // now update the list with just these countries
      // put the country list into key/value ones again
      // iterate through these, and get the corresponding country names
      const countryNames = continentCountryMap.get(val);
      const countryAbbrNames = countryNames.map(co => (
        [co, countryListMap.get(co)]
      ));

      const sortedAbbrNames = this.sortArrayEntries(countryAbbrNames);
      this.setState({
        countryArray: sortedAbbrNames,
        chosenContinent: val,
        chosenCountryCode: ""
      });
    } else {
      this.setState({
        countryArray: Array.from(countryListMap),
        chosenContinent: null,
        chosenCountryCode: ""
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
          countryNameAbbrNameList.set(key, data[key]);
        });
        const sortedCountryList = this.sortMapEntries(theCountryList);
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
    const { chosenCountryCode } = this.state;
    let image = null;
    const url = `https://www.countryflags.io/${chosenCountryCode}/flat/64.png`;

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
    const { countryArray, countryListMap, chosenCountryCode } = this.state;
    const arrayToDisplay = countryArray.length ? countryArray : Array.from(countryListMap);
    return (chosenCountryCode === "" && 
      <React.Fragment>
        <ul>
          {arrayToDisplay.map(it => (
            <li key={this.generateUUID()} id={it[0]} onClick={(evt) => this.handleCountrySelection(evt)}>{countryListMap.get(it[0])}</li>
          ))}
        </ul>
      </React.Fragment>
    );
  }

  getCountryDropDown() {
    const { chosenContinent, chosenCountryCode, countryArray, countryListMap } = this.state;
    if (chosenContinent) {
      const arrayToDisplay = countryArray.length ? countryArray : Array.from(countryListMap);
      return (
        <React.Fragment>
          <select id="countrySelect" value={chosenCountryCode} onChange={(e) => this.handleCountrySelection(e)} style={{width: '200px'}}>
          <option value="">(Select a country ...)</option>
            {arrayToDisplay.map(it => (
              <option value={it[0]} key={this.generateUUID()}>{countryListMap.get(it[0])}</option>
            ))}
          </select>
        </React.Fragment>
      );
    }
  }

  handleCountrySelection(evt) {
    const target = evt.target;
    // the dropdown was changed
    if (target.value) {
      this.fetchISO3List();
      this.setState({
        chosenCountryCode: target.value
      });
    // the list was clicked
    } else if (target.id) {
      this.fetchISO3List();
      // set the country select to reflect the list click
      let sel = document.getElementById("countrySelect");
      if (sel) {
        sel.value = target.id;
        this.setState({
          chosenCountryCode: target.id
        });
      } else {
        // if the user clicks directly on the list, the select is never shown
        // show the country select, which means set the continent
        // look up the continent the selected country belongs to
        const continent = this.state.countryContinentMap.get(target.id);
        // this is the continent code
        let continentSelect = document.getElementById("continent");
        continentSelect.value = continent;
        this.setState({
          chosenCountryCode: target.id,
          chosenContinent: continent
        });
      }
      // this.setState({
      //   chosenCountryCode: target.id,
      //   chosenContinent: continent
      // });
    }
  }

  createCountryDetails() {
    const { chosenCountryCode } = this.state;
      this.setState({
        countryDetailsObj: {
          selectedCountry: chosenCountryCode
        },
        isLoadingDetails: false
      });
  }

  displayCountryDetails() {
    const { isLoadingDetails, chosenCountryCode, fullCountryNameAbbrName, iso2CurrencyMap, 
      countryImage, countryContinentMap, iso2ToIso3Map, iso2CapitalMap, iso2PhoneMap
      } = this.state;
    if (chosenCountryCode !== "") {
      const countryName = fullCountryNameAbbrName.get(chosenCountryCode);

      const currencySymbols = CurrencySymbols.CURRENCY_HTML_CODES;
      const currencyCode = iso2CurrencyMap.get(chosenCountryCode);

      const wikipediaUrl = `https://en.wikipedia.org/wiki/${countryName}`;

      let imgTag = <img height="200px" alt="myCountry" src={countryImage}/>;
      const cSymbol = currencySymbols[currencyCode];
      return (
        <div>
          {isLoadingDetails && 
          <div className="loadingDetails"></div>
          }
          {!isLoadingDetails &&
            <div>
            <ul>
            <li>Country: {countryName}</li>
            <li>Continent: {this.continentMap.get(countryContinentMap.get(chosenCountryCode))}</li>
            <li>ISO code(3 letters): {iso2ToIso3Map.get(chosenCountryCode)}</li>
            <li>Capital: {iso2CapitalMap.get(chosenCountryCode)}</li>
            <li>Phone code: {iso2PhoneMap.get(chosenCountryCode)}</li>
            <li>Currency code: {iso2CurrencyMap.get(chosenCountryCode)}</li>
            {currencyCode && currencySymbols[currencyCode] && (
              // I should decoded this somehow ...
              <li>Currency symbol: {cSymbol}</li>
            )}
            <li><a href='' onClick={() => window.open(wikipediaUrl, "_blank")}>Wikipedia</a></li>
            </ul>
          </div>
        }
        </div>
      )
    }
  }

  sortMapEntries(theMap) {
    const sortArray = [];

    theMap.forEach((x, y) => {
      sortArray.push([x, y]);
    });

    sortArray.sort();

    const sortedMap = new Map(sortArray);
    // now reverse the key and value 
    let newMap = new Map();
    for (let [key, value] of sortedMap) {
      newMap.set(value, key);
    };
    return newMap;
  }

  // sort by the second value in the array element
  sortArrayEntries(theArray) {
    let revSortArray = [];

    theArray.forEach(item => {
      revSortArray.push([item[1], item[0]])
    });

    revSortArray.sort();

   // now put them back in the same order in the individual array
   let retArray = [];

   revSortArray.forEach(item => {
    retArray.push([item[1], item[0]]);
   });

   return retArray;
  }
}

export default App;
