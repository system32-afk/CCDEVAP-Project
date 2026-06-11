function swapValues(){
    var departure = document.getElementById("departure-airports");
    var destination = document.getElementById("destination-airports");

    //.value is a property that gets or sets a value inside an html input element
    var temp =  departure.value; 
    departure.value = destination.value;
    destination.value = temp;
}
