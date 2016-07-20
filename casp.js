var listings = [];
var count = 0;
var casper = require('casper').create();
var mouse = require("mouse").create(casper);
var url='https://inspections.vcha.ca'; //original start page
// var url='https://inspections.vcha.ca/FoodPremises/Table?SortMode=FacilityName&PageSize=20000'; //start page that will go to the large query after entering

casper.start(url, function() { //gets past and verifies we are past the disclaimer page
    if (this.exists('input.button')) {
        this.echo('the button exists'); //proof
    }
    else {
        this.echo ('could not find'); //proof
    }
    this.mouse.click('input.button');
});

casper.then(function() { //verifies that we are past the disclaimer page just a tester function
  // attempt to write a setup that will log eat row in table then delve into each to see which have compliance issues
  console.log('clicked ok, new location is ' + this.getCurrentUrl());
  var rows = this.evaluate(getRows,'hovereffect');
  // this.echo(casper.getPageContent()); // show html of page dont use anymore please
});

function getRows(selectorText){
  var rows = document.querySelectorAll(selectorText);

}

// casper.then(function() { //scrapes the info
//   /*eventually this should loop for x amount of times to scrape entire
//    table http://stackoverflow.com/questions/18835159/how-to-for-loop-in-casperjs */
//
//     //var limit = 20000, count = 1;
//     var name = casper.getElementInfo('td.facilityName').text.trim();
//     var type = casper.getElementInfo('td.facilityType').text.trim();
//     var community = casper.getElementInfo('td.community').text.trim();
//     var addr = casper.getElementInfo('td.siteAddress').text.trim();
//     var phone = casper.getElementInfo('td.phoneNumber').text.trim();
//     this.echo (name + "\n" + type + "\n" + community + "\n" + addr + "\n" + phone); //proof
//
//     var drill = casper.getElementAttribute('tr.hovereffect', 'onclick'); //select link attribute with href
//     this.echo(drill);
//     var drillopen = drill.match (/'(.*?)'/)[1]; //uses regexp function to trim 'drill'
//     this.echo(drillopen);
//     casper.thenOpen (url+drillopen, function (){ // now in detail page
//       /*gets the href for the first link the selector is focused on and opens it,
//       unsure how to increment the selector down*/
//       //console.log('clicked ok, new location is ' + this.getCurrentUrl()); //proof
//         var results = casper.getElementAttribute('tr.hovereffect', 'onclick'); //select link attribute with href
//         var resultsopen = results.match (/'(.*?)'/)[1]; //uses regexp function to trim 'drill'
//         casper.thenOpen (url+resultsopen, function (){
//          /*opens inspection results, thinking to use coordinates so that the most
//          recent inspection is always opened, however not elegant*/
//         var description = casper.getElementInfo('th.colspanheader').text.trim(); // this table row has no class or id, so not sure how to select
//         var compliance = casper.getElementInfo('td.inspection-answer').text.trim();
//         this.echo (description + "\n" + compliance); //proof
//         });
//     });
// });

casper.run();
