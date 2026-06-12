//operating dates: 0 - sunday, 1 - monday, 2-tuesday,
//3-wednesday,4-thursday 5 - friday, 6 - saturday
var flightsDatabase = [
    {id: 1, airline:"Philippine Airline",
        flightNum:6767, Departure:"07:00",
        arrival:"09:30", numOfLayovers: 0,
        ticketPrice:5565, remainingSeats: 8,
        departDate: [0,2,3,5], logoName: "PAL"
    },
    {id: 2, airline:"AirAsia",
        flightNum:1234, Departure:"06:00",
        arrival:"08:30", numOfLayovers: 0,
        ticketPrice:7000, remainingSeats: 1,
        departDate: [0,1,4,6], logoName: "AirAsia"
    },
    {id: 3, airline:"AirAsia",
        flightNum:1123, Departure:"13:00",
        arrival:"14:35", numOfLayovers: 0,
        ticketPrice:12344, remainingSeats: 6,
        departDate: [0,2,5,6], logoName: "AirAsia"
    },
    {id: 4, airline:"Cebu Pacific",
        flightNum:1212, Departure:"12:00",
        arrival:"14:30", numOfLayovers: 1,
        ticketPrice:1650, remainingSeats: 2,
        departDate: [1,4,5,6], logoName: "CebuPac"
    },
    {id: 5, airline:"Cathay Pacific",
        flightNum:5565, Departure:"14:30",
        arrival:"18:00", numOfLayovers: 1,
        ticketPrice:6778, remainingSeats: 7,
        departDate: [2,4,5,6], logoName: "CathPac"
    },
    {id: 6, airline:"Cebu Pacific",
        flightNum:1124, Departure:"07:00",
        arrival:"09:30", numOfLayovers: 0,
        ticketPrice:5678, remainingSeats: 10,
        departDate: [1,2,3,6], logoName: "CebuPac"
    },
    {id: 7, airline:"Cathay Pacific",
        flightNum:7767, Departure:"03:00",
        arrival:"09:30", numOfLayovers: 2,
        ticketPrice:9567, remainingSeats: 7,
        departDate: [0,2,5,6], logoName: "CathPac"
    },
    {id: 8, airline:"Cebu Pacific",
        flightNum:8989, Departure:"07:00",
        arrival:"09:30", numOfLayovers: 0,
        ticketPrice:3452, remainingSeats: 4,
        departDate: [1,2,3,5], logoName: "CebuPac"
    },
    {id: 9, airline:"Philippine Airlines",
        flightNum:9524, Departure:"06:00",
        arrival:"12:30", numOfLayovers: 2,
        ticketPrice:15523, remainingSeats: 3,
        departDate: [0,2,3,5], logoName: "PAL"
    },

]


function getFlightsDatabase(){
    return flightsDatabase;
}