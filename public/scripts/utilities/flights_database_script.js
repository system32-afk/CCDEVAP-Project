//operating dates: 0 - sunday, 1 - monday, 2-tuesday,
//3-wednesday,4-thursday 5 - friday, 6 - saturday
var flightsDatabase = [
    {id: 1, 
        airline:"Philippine Airline",
        flightNum:6767, Departure:"07:00",
        arrival:"09:30", numOfLayovers: 0,
        departDate: [0,2,3,5], logoName: "PAL",

        cabins: {
            economy: { price: 3200, seats: 45, label: "Economy" },
            premium_economy: { price: 5800, seats: 12, label: "Premium Economy" },
            business: { price: 12000, seats: 6, label: "Business Class" },
            first_class: { price: 25000, seats: 2, label: "First Class" }
        }
    },
    {id: 2, airline:"AirAsia",
        flightNum:1234, Departure:"06:00",
        arrival:"08:30",departDate: [0,1,4,6], 
        logoName: "AirAsia", numOfLayovers: 0,

        cabins: {
            economy: { price: 5400, seats: 80, label: "Economy" },
            premium_economy: { price: 8900, seats: 20, label: "Premium Economy" },
            business: { price: 17500, seats: 8, label: "Business Class" },
            first_class: { price: 38000, seats: 4, label: "First Class" }
        }
    },
    {id: 3, airline:"AirAsia",
        flightNum:1123, Departure:"13:00",
        arrival:"14:35", numOfLayovers: 0,
        departDate: [0,2,5,6], logoName: "AirAsia",

        cabins: {
            economy: { price: 2100, seats: 15, label: "Economy" },
            premium_economy: { price: 4200, seats: 5, label: "Premium Economy" },
            business: { price: 9500, seats: 2, label: "Business Class" },
            first_class: { price: 19000, seats: 1, label: "First Class" }
        }
    },
    {id: 4, airline:"Cebu Pacific",
        flightNum:1212, Departure:"12:00",
        arrival:"14:30", numOfLayovers: 1,
        departDate: [1,4,5,6], logoName: "CebuPac",

        cabins: {
            economy: { price: 6800, seats: 120, label: "Economy" },
            premium_economy: { price: 11500, seats: 24, label: "Premium Economy" },
            business: { price: 24000, seats: 12, label: "Business Class" },
            first_class: { price: 52000, seats: 6, label: "First Class" }
        }
    },
    {id: 5, airline:"Cathay Pacific",
        flightNum:5565, Departure:"14:30",
        arrival:"18:00", numOfLayovers: 1,
        departDate: [2,4,5,6], logoName: "CathPac",

        cabins: {
            economy: { price: 4150, seats: 65, label: "Economy" },
            premium_economy: { price: 7200, seats: 14, label: "Premium Economy" },
            business: { price: 15800, seats: 4, label: "Business Class" },
            first_class: { price: 31000, seats: 2, label: "First Class" }
        }
    },
    {id: 6, airline:"Cebu Pacific",
        flightNum:1124, Departure:"07:00",
        arrival:"09:30", numOfLayovers: 0,
        departDate: [1,2,3,6], logoName: "CebuPac",

        cabins: {
            economy: { price: 8300, seats: 95, label: "Economy" },
            premium_economy: { price: 13800, seats: 18, label: "Premium Economy" },
            business: { price: 29500, seats: 10, label: "Business Class" },
            first_class: { price: 64000, seats: 4, label: "First Class" }
        }
    },
    {id: 7, airline:"Cathay Pacific",
        flightNum:7767, Departure:"03:00",
        arrival:"09:30", numOfLayovers: 2,
        departDate: [0,2,5,6], logoName: "CathPac",
        cabins: {
            economy: { price: 2990, seats: 35, label: "Economy" },
            premium_economy: { price: 4990, seats: 8, label: "Premium Economy" },
            business: { price: 11000, seats: 4, label: "Business Class" },
            first_class: { price: 22500, seats: 2, label: "First Class" }
        }


    },
    {id: 8, airline:"Cebu Pacific",
        flightNum:8989, Departure:"07:00",
        arrival:"09:30", numOfLayovers: 0,
        departDate: [1,2,3,5], logoName: "CebuPac",

        cabins: {
            economy: { price: 7600, seats: 110, label: "Economy" },
            premium_economy: { price: 12400, seats: 30, label: "Premium Economy" },
            business: { price: 27000, seats: 16, label: "Business Class" },
            first_class: { price: 58500, seats: 4, label: "First Class" }
        }
    },
    {id: 9, airline:"Philippine Airlines",
        flightNum:9524, Departure:"06:00",
        arrival:"12:30", numOfLayovers: 2,
        departDate: [0,2,3,5], logoName: "PAL",

        cabins: {
            economy: { price: 4900, seats: 70, label: "Economy" },
            premium_economy: { price: 8100, seats: 16, label: "Premium Economy" },
            business: { price: 16900, seats: 6, label: "Business Class" },
            first_class: { price: 34000, seats: 2, label: "First Class" }
        }
    },

]


function getFlightsDatabase(){
    return flightsDatabase;
}


function deductSeat(flightID, chosenClass) {
    var originalFlight = getFlightData(flightID); // Grab object reference
    
    if (originalFlight && originalFlight.cabins[chosenClass].seats > 0) {
        originalFlight.cabins[chosenClass].seats--; 
    }
}