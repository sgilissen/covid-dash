/**
 *
 */


let hexToRgba = function(hex, opacity) {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  let rgb = result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;

  return 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + opacity + ')';
};

// Date stuff, used to create the graph when no country is selected
// Empty arrays for countries
let country_cases = ['cases'];
let country_deaths = ['deaths'];
let country_recovered = ['recovered'];
let country_dates = ["Dates"];

let cookie_name = 'covid19-countryselection';
let refreshInterval = 300;
let countdown;
let countdownString;

// Draw the curve graph for the current country
require(['c3', 'jquery'], function(c3, $) {
  						$(document).ready(function(){
    						window.country_chart = c3.generate({
      						bindto: '#curve_country', // id of chart wrapper
      						data: {
      						    x: 'Dates',
        						columns: [
            						// each columns data
                                country_dates,
          						country_cases,
          						country_deaths,
          						country_recovered
        						],
        						labels: false,
        						type: 'area', // default type of chart
        						colors: {
          							'cases': tabler.colors["blue"],
          							'deaths': tabler.colors["red"],
          							'recovered': tabler.colors["green"]
        						},
        						names: {
            						// name of each serie
          							'cases': 'Cases',
          							'deaths': 'Deaths',
          							'recovered': 'Recovered'
        						}
      						},
      						axis: {
        						x: {
          						type: 'timeseries',
                                tick: {
          						  format: '%b %d, %Y'
                                }
          						// name of each category
          						//categories: country_dates
        						},
      						},
      						legend: {
                					show: true, //hide legend
      						},
      						padding: {
        						bottom: 0,
        						top: 0
      						},
    						});
  						});
						});




/**
 *
 */
$(document).ready(function() {
  /** Constant div card */
  const DIV_CARD = 'div.card';

  /** Initialize tooltips */
  $('[data-toggle="tooltip"]').tooltip();

  /** Initialize popovers */
  $('[data-toggle="popover"]').popover({
    html: true
  });

  /** Function for remove card */
  $('[data-toggle="card-remove"]').on('click', function(e) {
    let $card = $(this).closest(DIV_CARD);

    $card.remove();

    e.preventDefault();
    return false;
  });

  /** Function for collapse card */
  $('[data-toggle="card-collapse"]').on('click', function(e) {
    let $card = $(this).closest(DIV_CARD);

    $card.toggleClass('card-collapsed');

    e.preventDefault();
    return false;
  });

  /** Function for fullscreen card */
  $('[data-toggle="card-fullscreen"]').on('click', function(e) {
    let $card = $(this).closest(DIV_CARD);

    $card.toggleClass('card-fullscreen').removeClass('card-collapsed');

    e.preventDefault();
    return false;
  });

  /**  */
  if ($('[data-sparkline]').length) {
    let generateSparkline = function($elem, data, params) {
      $elem.sparkline(data, {
        type: $elem.attr('data-sparkline-type'),
        height: '100%',
        barColor: params.color,
        lineColor: params.color,
        fillColor: 'transparent',
        spotColor: params.color,
        spotRadius: 0,
        lineWidth: 2,
        highlightColor: hexToRgba(params.color, .6),
        highlightLineColor: '#666',
        defaultPixelsPerValue: 5
      });
    };

    require(['sparkline'], function() {
      $('[data-sparkline]').each(function() {
        let $chart = $(this);

        generateSparkline($chart, JSON.parse($chart.attr('data-sparkline')), {
          color: $chart.attr('data-sparkline-color')
        });
      });
    });
  }

  /**  */
  if ($('.chart-circle').length) {
    require(['circle-progress'], function() {
      $('.chart-circle').each(function() {
        let $this = $(this);

        $this.circleProgress({
          fill: {
            color: tabler.colors[$this.attr('data-color')] || tabler.colors.blue
          },
          size: $this.height(),
          startAngle: -Math.PI / 4 * 2,
          emptyFill: '#F4F4F4',
          lineCap: 'round'
        });
      });
    });
  }
});

function fetchData(country){
    countdown = refreshInterval;
    //curDate = new Date();
    $.getJSON("https://corona.lmao.ninja/countries/" + country, function(data){
      $("#deaths_today").html(data.todayDeaths);
      $("#cases_today").html(data.todayCases);
      $("#tot_cases").html(data.cases);
      $("#tot_deaths").html(data.deaths);
      $("#tot_recovered").html(data.recovered);
      $("#critical").html(data.critical);
      $("#country_identifier").html("COVID-19 statistics for <strong>" + data.country + "</strong> ");
      //$("#curve_country_id").html("Curve for " + data.country);
      $("#country_avatar").css("background-image", "url(" + data.countryInfo.flag + ")");
      $("#country_avatar").html("");
    });

    $.getJSON('feeds.json', function(feeds){
      $("#rss_entries").empty();
      $("#rss_entries").html("<tr><td><img src='./assets/images/loader.gif' /></td><td>Fetching data. One moment please...</td></tr>");
      let count = 0;
      let rss_feed;
      if (country in feeds) {
        $("#rss_feed_title").html("RSS Feed for " + country + "<span class='rss-span'> Source: " + feeds[country].feed_name + "</span>");
        rss_feed = feeds[country].feed_url;
      } else {
        $("#rss_feed_title").html("RSS Feed <span class='rss-span'> Source: " + feeds['Default'].feed_name + "</span>");
        rss_feed = feeds['Default'].feed_url;
      }

      $.get(rss_feed, function(rss) {
        let html_content = "";
          $(rss).find('item').each(function() {
            if(count>3) return false;
            let $item = $(this);
            let title = $item.find('title').text();
            let link = $item.find('link').text();
            let rssdate = $item.find('pubDate').text();

            let entry = "<tr><td>" + rssdate + "</td><td>" + "<a href='"+ link + "' target='_blank'>" + title + "</a></td></tr>";


            html_content += entry;
            count++;

          })
        $("#rss_entries").html(html_content);
        })

    });

    $.getJSON("https://corona.lmao.ninja/v2/historical/" + country + "?lastdays=all", function(data){
      country_deaths = ['deaths'];
      country_cases = ['cases'];
      country_recovered = ['recovered'];
      country_dates = ['Dates'];
      $.each(data.timeline.cases, function(casedate, value){
        country_dates.push(new Date(casedate));
        country_cases.push(value);
      });
      $.each(data.timeline.deaths, function(casedate, value){
        country_deaths.push(value);
      });
      $.each(data.timeline.recovered, function(casedate, value){
        country_recovered.push(value);
      });
      $("#curve_country_id").html("Curve for " + country);
      country_chart.load({
        columns: [
          country_dates,
          country_cases,
          country_deaths,
          country_recovered
        ]
      });

  })
        .fail(function(event, jqhxr, exception){
          country_chart.unload();
          $("#curve_country_id").html("No curve data found for " + country);
        });
}

function createCookie(name, value, days) {
  let expires = "";
  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  } else {
    expires = "";
  }
  document.cookie = name + "=" + value + expires + "; path=/";
}


function readCookie(name) {
  let nameEQ = name + "=";
  let ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}


function eraseCookie(name) {
  createCookie(name, "", -1);
}

function setCountry(country) {
  $("#countries").val(country).change();
}

$(document).ready(function(){
  // Fetch the list of countries available
  $.getJSON("https://corona.lmao.ninja/countries", function(countries){
    // Create a new array to sort the countries
    let country_array = [];
    $.each(countries, function(i, country){
      country_array.push(country.country);
    });
    country_array.sort();

    // Populate selectbox
    $.each(country_array, function(i, country){
      $("#countries").append('<option value=' + country_array[i] + '>' + country_array[i] + '</option>');
    });
    setCountry(readCookie(cookie_name));
  });


  $("#countries").on('change', function() {
    fetchData(this.value);
    createCookie(cookie_name, this.value, 180);
  });

  setInterval(function() {
    let country = $("#countries option:selected").text();
    fetchData(country);
  }, refreshInterval * 1000);

  setInterval(function() {
    countdown -= 1;
    let time = new Date(null);
    time.setSeconds(countdown);
    countdownString = "Next refresh: " + String(time.getMinutes()).padStart(2, '0') + ":" + String(time.getSeconds()).padStart(2, '0');
    $("#refresh-counter").html(countdownString);
  }, 1000);


});

