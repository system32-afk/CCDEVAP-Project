const mongoose = require("mongoose");
const Flight = require("../models/flight_model");

describe("Flight Model Unit Tests", ()=>{

    const sampleFlight ={
        flightNumber: 9016,
        airline: "Philippine Airlines",
        origin: "Manila",
        destination: "Tokyo",
        departureDate: "2026-08-02",
        departureTime: "14:30",
        arrivalDate: "2026-08-02",
        arrivalTime: "21:30",
        cabin: {
            economy: {
                price: 30000,
                seats: 60,
                label: "Economy"
            },
            premium_economy:{
                price: 34000,
                seats: 60,
                label: "Premium Economy"                
            },
            business_class:{
                price: 45000,
                seats: 60,
                label: "Business Class"                
            },
            first_class:{
                price: 60000,
                seats: 60,
                label: "First Class"                
            }      
        },
        logoName: "PAL",
        numOfLayovers: 0,
        isActive: "true"
    };

// Test 1, test if object can be created
    test("Should create a flight object", ()=>{
        const flight = new Flight(sampleFlight);

        expect(flight).toBeDefined();
        expect(flight).toBeInstaceOf(Flight);
    });
// Test 2, verify flight number
    test("Should store correct flight number", ()=>{
        const flight = new Flight(sampleFlight);

        expect(flight.flightNumber).toBe(9016);
    });
// Test 3, verify airline
    test("Should store correct airline", ()=>{
        const flight = new Flight(sampleFlight);

        expect(flight.airline).toBe("Philippine Airlines");
    });
// Test 4, verify if flight can be deleted
    test("Should delete flight", async()=>{
        const flight = new Flight(sampleFlight);

        await Flight.findByIdAndDelete(flight_.id);

        const deletedFlight = await Flight.findById(flight_.id);

        expect(deletedFlight).toBeNull();
    });

// Test 5, verify that flight can be updated
    test("Should update flight", async()=>{
        const flight = new Flight(sampleFlight);
        
        flight.flightNumber = 9014;

        await flight.save();

        const updatedFlight = await Flight.findById(flight_.id);

        expect(updatedFlight.flightNumber).toBe(9014);
    })
});
