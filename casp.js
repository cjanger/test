var listings = [];
var count = 0;
var casper = require('casper').create();
var mouse = require("mouse").create(casper);
var fs = require('fs');
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
    console.log("Type : " + pageData[i].type);
    console.log("Community : " + pageData[i].community);
    console.log("Address : " + pageData[i].address)
    console.log("Phone : " + pageData[i].phone);
    console.log("Link : " + pageData[i].link);
    console.log("|==============================================================================|");
  }

  //******************
  // so the current output is an array with the information above that can be parsed into JSON or saved to some other format

  if(this.exists('.next-page-link') == true){ // this is to handle pagination but later should be set to false to allow for pagination
    stopScript();
  }

  this.thenClick('.next-page-link').then(function(){ // recursion starts here for pagination
    this.waitForSelector('.hovereffect',processPage,stopScript);
  });

  //******************
  // write to csv https://www.garysieling.com/blog/scraping-tabular-websites-into-a-csv-file-using-phantomjs
  // csv must be created in the folder tree first
  if(pageData.length != undefined) {
    console.log("csv loading...");
  for(i = 0; i < pageData.length; i++) {
    if(pageData[i] != null) {
      facname = pageData[i].name;
      factype = pageData[i].type;
      faccomm = pageData[i].community;
      facaddr = pageData[i].address;
      facphone = pageData[i].phone;
      faclink = pageData[i].link;
      stream = fs.open('data.csv','aw'); //appends and writes
      stream.write(facname+",");
      stream.write(factype+",");
      stream.write(faccomm+",");
      stream.write(facaddr+",");
      stream.write(facphone+",");
      stream.writeLine(faclink);
      stream.flush();
      stream.close();

      }
    }
  }

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
      phone: tr.children[4].innerText.trim(),
      link: tr.getAttribute("onclick").match (/'(.*?)'/)[1]
    };
  });
}
