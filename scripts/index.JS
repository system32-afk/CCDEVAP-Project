function swapValues(){
    var departure = document.getElementById("origin-city-search");
    var destination = document.getElementById("destination-city-search");

    //.value is a property that gets or sets a value inside an html input element
    var temp =  departure.value; 
    departure.value = destination.value;
    destination.value = temp;
}
