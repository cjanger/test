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
casper.then(function(){ // first gather listing page data
  console.log('clicked ok, new location is ' + this.getCurrentUrl());
  // this waits for the selector (hovereffect class) to show on page before anything else happens,
  // then does the first function and does the second if it timesout
  casper.waitForSelector('.hovereffect',processPage,stopScript); // this can then be made recursive
});
// TODO: need to figure out how to have something occur after this ^^^^^^
// like all of these run then after have another round of processing occur
// capser.then(function(){
//   for(i=0;i<listings.length;i++){
//     console.log('attempting to go: ' + url + listings[i].link);
//     this.thenOpen(url + listings[i].link).then(function(){
//       this.waitForSelector('.hovereffect',processListing,step1Script);
//     });
//   }
// });
casper.run();

var step1Script = function(){
  casper.echo("Step 1 Done");
}

var stopScript = function(){
  // printData(); // print data into console if wanted
  //******************
  // write to csv https://www.garysieling.com/blog/scraping-tabular-websites-into-a-csv-file-using-phantomjs
  // csv must be created in the folder tree first
  if(listings.length != undefined) {
    console.log("writing csv...");
    for(i = 0; i < listings.length; i++) {
      if(listings[i] != null) {
        facname = listings[i].name;
        factype = listings[i].type;
        faccomm = listings[i].community;
        facaddr = listings[i].address;
        facphone = listings[i].phone;
        faclink = listings[i].link;
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
  casper.echo("SCRIPT ENDING").exit();
};

var processPage = function(){
  console.log('in process page');
  // this will concat the new data to the existing array (really only matters if we are scraping paginated data only)
  // if we are just doing a giant query this will work all the same regardless of format. could condesnse it if necessary to save on operation time
  listings.push.apply(listings,this.evaluate(getListings,'table tbody tr.hovereffect')); // getListings is the function that will do the data scraping
  console.log('back in process page');

  if(this.exists('.next-page-link') == true){ // this is to handle pagination but later should be set to false to allow for pagination
    stopScript();
  }

  this.thenClick('.next-page-link').then(function(){ // recursion starts here for pagination
    this.waitForSelector('.hovereffect',processPage,stopScript);
  });
};

var processListing = function(){
  console.log('in listing page');
  console.log('new location is ' + this.getCurrentUrl());
}

// Helper links: http://stackoverflow.com/questions/34247237/how-to-parse-map-an-html-data-table-to-a-json-object-using-casperjs
function getListings(selector){ // do all inita listings page processing here
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

// TODO: Not working ATM
function getListingData(){ // individual listing page processing
  var ListingData = [];
  // need to do individual selectors because the data is all over the place. could work on a more generic collection method
  // TODO: write collection of infractions (in first table,tbody)
  var q1 = document.querySelectorAll('table tbody tr.nozebrastripes'); // all of the first table rows only need 5th and 6th row though
  ListingData['nonCritInfractionCount'] = q1[5].children[1].innerText.trim();
  ListingData['CritInfractionCount'] = q1[6].children[1].innerText.trim();
  return ListingData;
  // TODO: write collection of the individual infractions?
  // how do we want to handle individual infractions or only show the number of outstanding infracitons?
  // because each layer deeper into this dataset we should be thinking about the format of the data and turn it into either XML or JSON to handle the layers
  // and to store it maybe store as either XML or JSON or linked SQL tables?
}

function printData(){
  for(i=0;i<listings.length;i++){
    console.log("Name : " + listings[i].name); // should print facility name
    console.log("Type : " + listings[i].type);
    console.log("Community : " + listings[i].community);
    console.log("Address : " + listings[i].address)
    console.log("Phone : " + listings[i].phone);
    console.log("Link : " + listings[i].link);
    // console.log("Count : " + listings[i].nonCritInfractionCount);
    console.log("|==============================================================================|");
  }
}
