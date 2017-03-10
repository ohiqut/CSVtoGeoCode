var express = require('express');
var https = require('https');

var app = express();
const port = 3000;

var nameAddressCount=0; // includes count of both place Name and Address combined

app.use('/', express.static(__dirname + '/../public'));

app.get('/', function (appReq, appRes) {
	appRes.sendFile('index.html'); //Home Page
});


/*
 *Gets the name and address of places feeding from the URL's last request parameter. Splits them into an array then iterates over them
 *calling the following defined 'getGeoCode()' function that gets latitude and longitude of each address
 *and sends final response to the client-side by itself.
 */
app.get('/convert/:address', function(appReq, appRes) {
    var feed = appReq.params.address;
    feed = feed.replace(/#|&|,|;|\+/g,' ').replace(/\\r/g, '').replace(/^"|"$/g, '');
    var arr = feed.split('\\"');
    //console.log(arr);

    /*'locations' array to hold each place's Name followed by Object bearing the latitude and longitude*/
    var locations = [];

    /*deducted 2 from the 'arr' array length in the following Count because the last item in the array is an empty string
    and the second last is an address that can be referenced as 'i+1' in the following loop*/
    nameAddressCount = arr.length-2;

    for (var i =0; i<nameAddressCount;i++){
        var name = arr[i];
        var address = arr[i+1].replace(/ /g, '+');
           getGeoCode(name, address, locations, appRes);
            i++; // incremented again in this loop so that the next iteration skips the address already used from arr[i+1]
    }
});


 /*
  *Uses Google Geo Code API to get the latitude and longitude of all the addresses in the 'locations' array.
  *The Parent Response within which this function is called is passed as the last parameter
  *that is used to eventually send the final array output to the client and then gets ended within this function.
  */
function getGeoCode(name, address, locations, parentRsp){
     /*Geo Code API parameter options*/
     var options ={
             hostname: 'maps.googleapis.com',
             port:443,
             path: '/maps/api/geocode/json?address='+address+'&key=AIzaSyDkB2eh2WaQZGxkSNHMZnnCIVCCRny9P7Q',
             method: 'GET'
         };

    var body = [];
    var req = https.request(options, function(res) {
          console.log('STATUS: ' + res.statusCode);
          //console.log('HEADERS: ' + JSON.stringify(res.headers));
          res.setEncoding('utf8');
          res.on('data', function (chunk) {
            //console.log('BODY: ' + chunk);
            body.push(chunk);
          });

          res.on('end', function(){
             var bodyString = body.join('');

             /*Store full response data in JSON format*/
             var rspJSON = JSON.parse(bodyString);

             /*Latitude and Longitude are stored in one object*/
             var latLng= rspJSON.results[0].geometry.location;

             /*The 'locations' array is populated by pushing the place's name followed by location object 'latLng' for easy name referencing*/
             locations.push(name);
             locations.push(latLng);

             console.log('\nUPDATED Collection: ');
             console.log(locations);
             console.log("Current Total Location(s): "+locations.length/2);//divided by 2 because locations array includes both names and locations

             /*When 'locations' array has all the locations, it is sent to the main client side, then the parent's response gets ended here*/
             if(locations.length === nameAddressCount+1){
             //Main/Parent response:
             parentRsp.send(locations);
             parentRsp.end();
             }
          })
        });

        req.on('error', function(e) {
          console.log('problem with request: ' + e.message);
        });

        req.end();
}


app.listen(port, function() {
	console.log('Express app listening on port ' + port);
});

