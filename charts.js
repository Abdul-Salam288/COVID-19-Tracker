const buildChartData = (data) => {
    let chartData = [];
    let lastDataPoint;
    for(let date in data) {
        if (lastDataPoint) { 
            let newDataPoint = {
                x: date,
                y: data[date] - lastDataPoint
            }
            chartData.push(newDataPoint);
        }
        lastDataPoint = data[date];
    }
    return chartData;
}

const buildChart = (chartData, type="cases") => {
    var timeFormat = 'MM/DD/YY';
    chart_color = {
        'cases': ['Confirmed Cases', ['rgba(204, 16, 52, 0.5)', 'rgba(204, 16, 52, 0.1)', 'rgba(204, 16, 52, 0.07)', 'rgba(204, 16, 52, 0)'], '#cc1034'],
        'recovered': ['Recovered Cases', ['rgba(127, 217, 34, 0.5)', 'rgba(127, 217, 34, 0.1)', 'rgba(127, 217, 34, 0.07)', 'rgba(127, 217, 34, 0)'], '#7fd922'],
        'deaths': ['Deaths', ['rgba(250, 85, 117, 0.5)', 'rgba(250, 85, 117, 0.1)', 'rgba(250, 85, 117, 0.07)', 'rgba(250, 85, 117, 0)'], '#fa5575']
    }

    document.getElementById('myChart').remove();
    document.getElementById('linearChart').innerHTML = '<canvas id="myChart"></canvas>';
    var ctx = document.getElementById('myChart').getContext('2d');
    gradient = ctx.createLinearGradient(0, 0, 0, 450);
    gradient.addColorStop(0, chart_color[type][1][0]);
    gradient.addColorStop(0.5, chart_color[type][1][1]);
    gradient.addColorStop(0.75, chart_color[type][1][2]);
    gradient.addColorStop(1, chart_color[type][1][3]);
    var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            datasets: [{
                label: chart_color[type][0],
                backgroundColor: gradient,
                pointBackgroundColor: chart_color[type][2],
                borderWidth: 2,
                borderColor: chart_color[type][2],
                data: chartData
            }]
        },

        // Configuration options go here
        options: {
            responsive: true,
            maintainAspectRatio: false,
            tooltips: {
                mode: 'index',
                intersect: false
            },
            elements: {
                point: {
                    radius: 0
                }
            },
            title: {
                display: true,
                text: 'Daily New Cases Globally'
            },
            scales:     {
                xAxes: [{
                    type: "time",
                    time: {
                        format: timeFormat,
                        tooltipFormat: 'll'
                    }
                }],
                yAxes: [{
                    gridLines: {
                        display: false
                    },
                    ticks: {
                        // Include a dollar sign in the ticks
                        callback: function(value, index, values) {
                            return numeral(value).format('0a');
                        }
                    }
                }]
            }
        }
    });
}


const buildHorizontalchart = (data) => {
    dailynewcases = [];
    countries = [];
    data.forEach(cases => {
        dailynewcases.push(cases.todayCases);
        countries.push(cases.country);
    });

    var options = {
        series: [{
        name: "Today New Cases",
        data: dailynewcases
      }],
        chart: {
        type: 'bar',
        height: 270
      },
      colors: ['#cc1034'],
      plotOptions: {
        bar: {
          horizontal: true,
        }
      },
      dataLabels: {
        enabled: false
      },
    //   tooltip: {
    //     custom: function({ series, seriesIndex, dataPointIndex, w }) {
    //       return (
    //           `<div class="horizonalbar">
    //             <div class="horizontal-country"><small>${countries[seriesIndex]}</small></div>
    //             <div class="horizontal-new-cases"><small>Today New Cases: ${dailynewcases[seriesIndex]}</small></div>
    //           </div>`
    //       );
    //     }
    //   },
      title: {
            text: "Top Countries with Today's New Cases",
            align: 'centre',
            margin: 0,
            offsetX: 0,
            offsetY: 0,
            floating: false,
            style: {
            fontSize:  '12px',
            fontWeight:  '600',
            fontFamily:  undefined,
            color:  '#645D5D'
            }
      },
      xaxis: {
        categories: countries,
      },
      };

      var chart = new ApexCharts(document.querySelector("#chart"), options);
      chart.render();
}