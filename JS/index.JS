function swapValues(){
    var departure = document.getElementById("departure-airports");
    var destination = document.getElementById("destination-airports");

    //.value is a property that gets or sets a value inside an html input element
    var temp =  departure.value; 
    departure.value = destination.value;
    destination.value = temp;
}

function noInvalidDates(){
    var departure = document.getElementById("departure-date");
    var returndate = document.getElementById("return-date");
    

        // same dates are invalid
        if(departure.value === returndate.value){
            alert("Please choose or enter a valid date.");
            return false;
        }
        //return date is before departure date invalid, departure and return dates are empty invalid,
        if(departure.value > returndate.value ||  departure.value === "" || returndate.value === ""){
            alert("Please choose or enter a valid date.");
            return false;
        }
        return true;
}