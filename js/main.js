//Array of initial locations
var Locations = [
   {title: 'King Abdullah Financial District', category:'Financial Institution in Riyadh, Saudi Arabia', location: {lat: 24.7621814, lng: 46.6391327}},
   {title: 'Olaya Towers', category:'Are a pair of skyscrapers on Olaya Street in Riyadh, Saudi Arabia.', location: {lat: 24.6969424 , lng: 46.6820784}},
   {title: 'Kingdom Centre', category:' shopping mall, Kingdom Tower contains the Four Seasons Hotel Riyadh and apartments.', location: {lat: 24.7113 , lng: 46.6744}},
   {title: 'Al Faisaliyah Center', category:'shopping mall in Riyadh, Saudi Arabia', location: {lat: 24.690278 , lng: 46.685278}},
   {title: 'Burj Rafal', category:'is a skyscraper hotel in Riyadh, Saudi Arabia',location: {lat:24.792222 ,lng:46.632222}},
   {title: 'Princess Nora University', category:'a public women’s university' , location: {lat:24.846 ,lng:46.72}},
   {title: 'Al Yamamah University' , category: 'university comprises the Colleges of Business Administration and Computing and Information Systems ', location: {lat: 24.863611 , lng:46.594444}},
   {title: 'King Saud University' , category: ' public university in Riyadh, Saudi Arabia,', location:{lat: 24.722, lng:46.627}},
   {title: 'Royal Saudi Air Force Museum', category:'museum gives the history of the Royal Saudi Air Force from its establishment in the 1920s to the present day.',location: {lat:24.7538 ,lng:46.7392}},
   {title: 'National Museum' , category: 'National Museum of Saudi Arabia', location: {lat: 24.647222,  lng:46.710833}},
   {title: 'Masmak fort', category:'Museum Historic building in Riyadh, Saudi Arabia', location: {lat: 24.6311 , lng: 46.7133}},
   {title: 'Murabba Palace' , category: 'historic buildings', location: {lat: 24.6465, lng: 46.7093}},
   {title: 'Deera Square' , category: 'public space in Riyadh, Saudi Arabia', location: {lat: 24.630884 , lng:46.711838}}  
];

var Location = function(data) {
  this.title = data.title;
  this.category = data.category;
  this.location = data.location;
};

// declaring global variables
var map;
var infoWindow;
var bounds;
// google maps init
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 24.7619, lng: 46.6404},
    zoom: 12 
  });

  infoWindow = new google.maps.InfoWindow();
  bounds = new google.maps.LatLngBounds();
  ko.applyBindings(new ViewModel());
}

// handle map error
function googleMapsError() {
    alert('An error occurred with Google Maps, please check your internet connection.');
}

var ViewModel = function() {
  var self = this;
  
  this.Listlocations = ko.observableArray([]);
  this.filter = ko.observable();
  
  Locations.forEach(function(place) {
    self.Listlocations.push(new Location(place));
  });

  self.Listlocations().forEach(function(location) {
    var marker = new google.maps.Marker({
      map: map,
      position: location.location,
      title: location.title,
      category: location.category,
      animation: google.maps.Animation.DROP
    });

    location.marker = marker;

    location.marker.addListener('click',function() {
        populateInfoWindow(this,infoWindow);
        toggleBounce(this);
      });
    bounds.extend(location.marker.position);
  });
  map.fitBounds(bounds);

  this.visiblePlaces = ko.computed(function() {
      var filter = self.filter();
      if (!self.filter()) {
        self.Listlocations().forEach(
          function(location) {
            location.marker.setMap(map);
          });
        return self.Listlocations();
      } else {
        return ko.utils.arrayFilter(self.Listlocations(),function(loc) {
            if (loc.title.toLowerCase().indexOf(filter.toLowerCase()) !== -1) {
              loc.marker.setMap(map);
            } else {
              loc.marker.setMap(null);
            }
            return loc.title.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
          });
      }
    }, self);


  self.listClick  = function() {
          google.maps.event.trigger(this.marker, 'click');
    };
    
//bounce when location is clicked
function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
        for (var i = 0; i < self.Listlocations().length; i++) {
          var mark = self.Listlocations()[i].marker;
          if (mark.getAnimation() !== null) {
            mark.setAnimation(null);
        }
      }
      marker.setAnimation(google.maps.Animation.BOUNCE);
    }
  }
};

//function populates the infowindow when marker clicked
function populateInfoWindow(marker,infowindow) {
  if (infowindow.marker != marker) {
    infowindow.marker = marker;

    //Wikipedia API
    var Url ='https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';

    $.ajax({
      url: Url,
      dataType: 'jsonp',
      jsonp: "callback",
    }).done(function(data) {
      var articleList = data[1];
      var articleStr = articleList[0];
        var url = 'https://www.wikipedia.org/wiki/' + articleStr;
        infowindow.setContent('<div><h3>' + marker.title + '</h3><p>'+ marker.category + '</p>'+'<p> <a href="' + url + '">' + articleStr +'</a></p></div>');
      
    }).fail(function(){
      infowindow.setContent("failed to get wikipedia resources, please check your internet connection.");
    });

    infowindow.open(map, marker);

    infowindow.addListener('closeclick',function() {
        infowindow.close();
        marker.setAnimation(null);
      });
  }}