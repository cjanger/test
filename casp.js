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
casper.then(function(){
  console.log('clicked ok, new location is ' + this.getCurrentUrl());
  // this waits for the selector (hovereffect class) to show on page before anything else happens,
  // then does the first function and does the second if it timesout
  casper.waitForSelector('.hovereffect',processPage,stopScript); // this can then be made recursive
});
casper.run();

var stopScript = function(){
  casper.echo("SCRIPT ENDING").exit();
};

var processPage = function(){
  console.log('in process page');
  var pageData = this.evaluate(getPageData,'table tbody tr.hovereffect'); // getPageData is the function that will do the data scraping
  console.log('back in process page');
  for(i=0;i<pageData.length;i++){
    console.log("Name : " + pageData[i].name); // should print facility name
    console.log("Type : " + pageData[i].type); // should print facility name
    console.log("Community : " + pageData[i].community); // should print facility name
    console.log("Address : " + pageData[i].address); // should print facility name
    console.log("Phone : " + pageData[i].phone); // should print facility name
    console.log("|==============================================================================|");
  }

  //******************
  // so the current output is an array with the information above that can be parsed into JSON or saved to some other format

  if(this.exists('.next-page-link') == true){ // this is to handle pagination but later should be set to false to allow for pagination
    stopScript();
  }

  this.thenClick('.next-page-link').then(function(){
    this.waitForSelector('.hovereffect',processPage,stopScript);
  });

};

// Helper links: http://stackoverflow.com/questions/34247237/how-to-parse-map-an-html-data-table-to-a-json-object-using-casperjs
function getPageData(selector){ // do all page processing here
  var query = document.querySelectorAll(selector);
  // Return an Array that has these elements
  return Array.prototype.map.call(query,function(tr){ // this take and then breakdown a DOM Element in this case all tr.hovereffect
    return {
      name: tr.children[0].innerText.trim(), // first child (note there could be a better selector)
      type: tr.children[1].innerText.trim(),
      community: tr.children[2].innerText.trim(),
      address: tr.children[3].innerText.trim(),
      phone: tr.children[4].innerText.trim()
    };
  });
}
