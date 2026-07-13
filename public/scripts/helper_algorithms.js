// var flightsDB = null;

// $(document).ready(function() {
//flight database
// flightsDB = getFlightsDatabase();
// });




function sortArray(criteria,type,array){

    var a,b;
    
    var sortedArray = array.slice().sort((a,b) => {

        if (criteria === "ticketPrice"){
            a = a.ticketPrice;
            b = b.ticketPrice
            return a - b;
        }else if (criteria ==="departure"){
            a = a.Departure;
            b = b.Departure;
            return a.localeCompare(b);
        }else if (criteria === "duration"){
            a = a.durationMinutes;
            b = b.durationMinutes;
            return a - b;
        }
        return 0;
    }); 

    if (type === "descending"){
        return sortedArray.reverse();
    }
    
    return sortedArray;
}


function calculateFlightDuration(departureTime, arrivalTime){


    //split it from a string like 03:00 into two parts
    var depPart = departureTime.split(":");
    var arrPart = arrivalTime.split(":");

    /*
    turn them into minutes by, multiplying the hours part by 60, and adding the minutes to it
    */
    var depMins = (parseInt(depPart[0],10)*60) + parseInt(depPart[1],10);
    var arrMins = (parseInt(arrPart[0],10)*60) + parseInt(arrPart[1],10);

    //for overnight flights, like flights leaving at 23:00pm and arriving at 02:00 am
    if (arrMins < depMins){
        arrMins += 24*60; //24 hours
    }

    //flight duration in minutes
    var totalDiffMinutes = arrMins - depMins;

    var hours = Math.floor(totalDiffMinutes/60);
    var minutes = totalDiffMinutes % 60;

    return {
        display: `${hours} hrs ${minutes} min`,
        durationMinutes: totalDiffMinutes,
    } 
}

function getTotalPassengers(booking_info){
    return parseInt(booking_info.passengers.adults) + parseInt(booking_info.passengers.children)+
                        parseInt(booking_info.passengers.infants);
}




function showAlert(message, type) {
    var alertPlaceholder = $('#liveAlertPlaceholder');
    
    alertPlaceholder.empty(); 

   
    var alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show shadow-sm mb-3" role="alert">
            <div class="d-flex align-items-center">

                <div>${message}</div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    
    alertPlaceholder.html(alertHtml);

    
    setTimeout(() => {
        $('.alert').alert('close');
    }, 5000);
}



function convertDateToWords(date) {
  // split the YYYY/MM/DD string into individual day, month, and year parts
  const [year, month, day] = date.split('/');
  
  // construct a native Date object (months is 0 index so -1 to align properly w months)
  const dateObj = new Date(year, month - 1, day);
  
  //use formatter
  const formatter = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  return formatter.format(dateObj);
}


function getDateRange(chosenDate, dates){
    var baseDate = new Date(chosenDate);

    var minus5 = new Date(chosenDate);
    var plus5 = new Date(chosenDate);

    plus5.setDate(baseDate.getDate()+5);

    return{
        minus5: minus5.toISOString().split('T')[0],
        baseDate: baseDate.toISOString().split('T')[0],
        plus5: plus5.toISOString().split('T')[0]
    }
}