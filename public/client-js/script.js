/*Stores all the lines from csv in text array. Its populated by the csv file handling Functions at the bottom*/
    var lines = [];
    var fileName = '';

   var map;
      function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: -27.4709, lng: 153.0235}, //Brisbane
          zoom: 12
        });
      }

    function markMap(map, locationArray){
    /*'i' is incremented by 2 in this loop so that the next iteration skips the location Object already used from locationArray[i+1]*/
        for(var i=0; i<locationArray.length; i+=2){
            var marker = new google.maps.Marker({
             position: locationArray[i+1], //location Object containing latitude and longitude
             map: map,
            title: locationArray[i] //location name
            });
         }
    }

/*
*Populates table with  Name, Latitude and Longitude of places in each row, from an array ('locationArray').
*/
    function populateTable(table,locationArray){
        var str ='<tr><th>Name</th><th>Latitude</th><th>Longitude</th></tr>';

        /*'i' is incremented by 2 in this loop so that the next iteration skips the location Object already used from locationArray[i+1]*/
                for(var i=0; i<locationArray.length-1; i+=2){
                    str+="<tr> <td>"+locationArray[i]+"</td> <td>"+locationArray[i+1].lat+"</td> <td>"+locationArray[i+1].lng+"</td></tr>";
                }
                table.innerHTML=str;
    }

/*
*Sends the csv 'lines' array string to the server to get in return an array of place Names with Longitude and Latitude as a result.
*/
    function callServer(){
        if(ValidateExtension()){//checks if a file with .csv extension is selected
            $.ajax({
                  url: '/convert/'+encodeURIComponent(JSON.stringify(lines[0][0])) ,
                  success: function(result){
                        console.log(result);
                        var table = document.getElementById('table');
                        populateTable(table,result);
                        markMap(map, result);
                        document.getElementById('fileName').innerHTML = 'File Used: '+fileName;
                  },
                  error: function(e){alert('Location not found. \nNote: CSV file needs to follow the structure: Name,"Address"');
                        console.log(e);
                  }
            });
	    }
    }


/*
*Beyond this point are Functions to handle a CSV file.
*/
function handleFiles(files) {
      // Check for the various File API support.
      if (window.FileReader) {
          // FileReader are supported.

        if(ValidateExtension()){//checks if a file with .csv extension is selected
            getAsText(files[0]);
        }
      } else {
          alert('FileReader are not supported in this browser.');
      }
    }

    function ValidateExtension() {
            var allowedFiles = [".csv"];
            var fileUpload = document.getElementById("csvFileInput");
            fileName = fileUpload.value.replace(/[^a-zA-Z0-9.]/g, '_');

            var regex = new RegExp("([a-zA-Z0-9\s_\\.\-:])+(" + allowedFiles.join('|') + ")$");
            if (!regex.test(fileName.toLowerCase())) {
                alert( "Please select a "+ allowedFiles.join(', ') + " file.");
                return false;
            }
                fileName = fileUpload.value;
            return true;
        }

    function getAsText(fileToRead) {
      var reader = new FileReader();
      // Read file into memory as UTF-8
      reader.readAsText(fileToRead);
      // Handle errors load
      reader.onload = loadHandler;
      reader.onerror = errorHandler;
    }

    function loadHandler(event) {
      var csv = event.target.result;
      processData(csv);
    }


    function processData(csv) {
        var allTextLines = csv.split(/\r\n|\n/);
        lines = [];
        for (var i=0; i<allTextLines.length; i++) {
            var data = allTextLines[i].split(';');
                var tarr = [];
                for (var j=0; j<data.length; j++) {
                    tarr.push(data[j]);
                }
                lines.push(tarr);
        }

    }

    function errorHandler(evt) {
      if(evt.target.error.name == "NotReadableError") {
          alert("Cannot read file !");
      }
    }