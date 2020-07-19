

window.onload = () => {
    getCountriesData();
    getHistoricalData();
    getWorldCoronaData();
}


var map;
var infoWindow;
let coronaGlobalData;
let mapCircles = [];
let coronaHistoricalData;
let coronaHistoricalCountryData;
let worldwideSelection = {
    name: '<i class="fa fa-globe" aria-hidden="true"></i>Worldwide',
    value: 'www',
    selected: true
}
var casesTypeColors = {
    cases: '#cc1034',
    recovered: '#7fd922',
    deaths: '#fa5575'
}
const mapCentre = {
    lat: 34.80746,
    lng: -40.4796
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: mapCentre,
        zoom: 3,
        styles: mapStyle
    });
    infoWindow = new google.maps.InfoWindow();
}

/* when click on tabs it changes graph and clear the map */ 
const changeDataSelection = (cardElem, casesType) => {
    clearTheMap();
    showDataOnMap(coronaGlobalData, casesType);
    setActiveTab(cardElem);
    
    let chartData = buildChartData(coronaHistoricalData[casesType]);
    buildChart(chartData, casesType);
    
}

/* HW-2 Added active effect on TABS */
const setActiveTab = (elem) => {
    const activeEl = document.querySelector('.card.active');
    activeEl.classList.remove('active');
    elem.classList.add('active');
}

const clearTheMap = () => {
    for(let circle of mapCircles){
        circle.setMap(null);
    }
}

/* Dropdown functionality */ 
const initDropdown = (searchList) => {
    $('.ui.dropdown').dropdown({
        values: searchList,
        onChange: function(value, text) {
            if (value !== worldwideSelection.value){
                getCountryData(value);
            }else {
                google.maps.event.trigger(map, 'click');
                getWorldCoronaData();
            }
        }
    });
}

/* construting data for init dropdown */
const setSearchList = (data) => {
    let searchList = [];
    searchList.push(worldwideSelection);
    data.forEach((countryData, i) => {
        searchList.push({
            name: `<img src="${countryData.countryInfo.flag}" alt="">${countryData.country}`,
            value: `${countryData.countryInfo.iso3}-${i}`,
        })
    })
    initDropdown(searchList);
}

/* setting location and zoom option for dropdown country */
const setMapCentre = (lat, long, zoom) => {
    map.setZoom(zoom);
    map.panTo({
        lat: lat,
        lng: long
    })
}

const getCountriesData = () => {
    fetch("https://corona.lmao.ninja/v2/countries")
    .then((response)=>{
        return response.json()
    }).then((data)=>{
        coronaGlobalData = data;
        setSearchList(data);
        showDataOnMap(data);
        showDataInTable(data);
    })
}

/* changing the tabs and maps data as per country for dropdown*/
const getCountryData = (countryIso) => {
    countryIso = countryIso.split("-")
    google.maps.event.trigger(map, 'click');
    const url = "https://disease.sh/v3/covid-19/countries/" + countryIso[0];
    fetch(url)
    .then((response) => {
        return response.json()
    }).then((data) => {
        setMapCentre(data.countryInfo.lat, data.countryInfo.long, 3);
        setStatsData(data);
        google.maps.event.trigger(mapCircles[countryIso[1]], 'click');
    })
}

const getWorldCoronaData = () => {
    fetch("https://disease.sh/v2/all")
    .then((response)=>{
        return response.json()
    }).then((data)=>{
        coronaLastUpdateDate(data.updated);
        setStatsData(data);
        setMapCentre(mapCentre.lat, mapCentre.lng, 2);
    })
}

/* last update of corona data */
const coronaLastUpdateDate = (currentdate) => {
    let date = moment(currentdate).format("MMMM DD, YYYY");
    document.getElementById("dateupdate").innerHTML = `Last updated ${date}`;
}

const setStatsData = (data) => {
    let addedCases = numeral(data.todayCases).format('+0,0');
    let addedRecovered = numeral(data.todayRecovered).format('+0,0');
    let addedDeaths = numeral(data.todayDeaths).format('+0,0');
    let totalCases = numeral(data.cases).format('0.0a');
    let totalRecovered = numeral(data.recovered).format('0.0a');
    let totalDeaths = numeral(data.deaths).format('0.0a');

    document.querySelector('.total-number').innerHTML = addedCases;
    document.querySelector('.recovered-number').innerHTML = addedRecovered;
    document.querySelector('.deaths-number').innerHTML = addedDeaths;
    document.querySelector('.cases-total').innerHTML = `${totalCases} Total`;
    document.querySelector('.recovered-total').innerHTML = `${totalRecovered} Total`;
    document.querySelector('.deaths-total').innerHTML = `${totalDeaths} Total`;
}

const getHistoricalData = () => {
    fetch("https://corona.lmao.ninja/v2/historical/all?lastdays=120")
    .then((response)=>{
        return response.json()
    }).then((data)=>{
        coronaHistoricalData = data;
        let chartData = buildChartData(data.cases);
        buildChart(chartData);
    })
}

const showDataOnMap = (data, casesType="cases") => {
    data.map((country)=>{
        let countryCenter = {
            lat: country.countryInfo.lat,
            lng: country.countryInfo.long
        }

        var countryCircle = new google.maps.Circle({
            strokeColor: casesTypeColors[casesType],
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: casesTypeColors[casesType],
            fillOpacity: 0.35,
            map: map,
            center: countryCenter,
            radius: country[casesType]
        });

        var html = `
            <div class="info-container">
                <div class="info-flag" style="background-image: url(${country.countryInfo.flag});">
                </div>
                <div class="info-name">
                    ${country.country}
                </div>
                <div class="info-confirmed">
                    Total: ${country.cases}
                </div>
                <div class="info-recovered">
                    Recovered: ${country.recovered}
                </div>
                <div class="info-deaths">   
                    Deaths: ${country.deaths}
                </div>
            </div>
        `

        var infoWindow = new google.maps.InfoWindow({
            content: html,
            position: countryCircle.center
        });

        google.maps.event.addListener(countryCircle, 'click', function(countryCircle) {
            infoWindow.open(map, countryCircle);
        });

        mapCircles.push(countryCircle);

        google.maps.event.addListener(countryCircle, 'mouseover', function() {
            infoWindow.open(map);
        });

        google.maps.event.addListener(countryCircle, 'mouseout', function(){
            infoWindow.close();
        })

        google.maps.event.addListener(map, 'click', function() {
            infoWindow.close();
        });

    })

}

const showDataInTable = (data) => {

        // First line function using to compare the data of cases to sort 
    function GetSortOrder(prop) {    
        return function(a, b) {   
            if (a[prop] > b[prop]) {    
                return 1;    
            } else if (a[prop] < b[prop]) {    
                return -1;    
            }    
            return 0;    
        }    
    }    

    // testing horizontal bar graph
    data.sort(GetSortOrder("todayCases"));
    data.reverse();
    buildHorizontalchart(data.slice(0,10));

    // passing object of first two from list to compare it using cases
    data.sort(GetSortOrder("active"));
    data.reverse();

    var html = '';
    data.forEach((country)=>{
        html += `
        <tr>
            <td scope="row"><div class="table-row-data"><img src="${country.countryInfo.flag}"> <span>${country.country}</span></div></td>
            <td class="table-active-cases">${numeral(country.active).format('0,0')}</td>
        </tr>
        `
    })
    document.getElementById('table-data').innerHTML = html;
}

/* Corona News Feathers */
async function coronaNewsFeed() {
    const response = await fetch("https://content.guardianapis.com/search?show-fields=thumbnail&q=covid&api-key=2b594032-7138-4866-b757-6bd4ed55f600", {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentails: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
    });
    return response.json();
}

coronaNewsFeed()
.then(data => {
    showCoronaNews(data.response.results);
})

const showCoronaNews = (data) => {
    let content = `<div class="carousel-item active">
                    <div class="card card-news">
                    <img src="${data[0].fields.thumbnail}" class="card-img-top" alt="...">
                    <div class="card-body">
                    <a href="${data[0].webUrl}">
                        <h5 class="card-title news-title">${data[0].webTitle}</h5>
                    </a>
                    </div>
                    <small class="text-muted published-date">Publisted Date: ${moment(data[0].webPublicationDate).format('DD-MM-YYYY')}</small>
                </div></div>`
    data.forEach((news, index) => {
        if (index > 0 & index < 4) {
            content += `<div class="carousel-item">
            <div class="card card-news">
            <img src="${news.fields.thumbnail}" class="card-img-top" alt="...">
            <div class="card-body">
              <a href="${news.webUrl}">
                <h5 class="card-title news-title">${news.webTitle}</h5>
              </a>
            </div>
            <small class="text-muted published-date">Publisted Date: ${moment(news.webPublicationDate).format('DD-MM-YYYY')}</small>
          </div></div>`
        }
    })
    document.querySelector('.card-group').innerHTML = content;

}