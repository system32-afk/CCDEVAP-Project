const mongoose = require("mongoose");
const Flight = require("../models/flight_model");
const { MongoMemoryServer } = require("mongodb-memory-server");



    let mongoServer;

    beforeAll(async () =>{
        await mongoose.disconnect();
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    })

    afterEach(async () => {
    await Flight.deleteMany({});
    });

    afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    });

describe("Flight Model Unit Tests", ()=>{

    const sampleFlight ={
        flightNumber: 9016,
        airline: "Philippine Airlines",
        origin: "Manila",
        destination: "Tokyo",
        departureDate: "2026-08-02T00:00:00.000Z",
        departureTime: "14:30",
        arrivalDate: "2026-08-02T00:00:00.000Z",
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
        isActive: true
    };



// Test 1, test if object can be created
    test("Should create a flight object", ()=>{
        const flight = new Flight(sampleFlight);

        expect(flight).toBeDefined();
        expect(flight).toBeInstanceOf(Flight);
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
        await flight.save();

        await Flight.findByIdAndDelete(flight._id);

        const deletedFlight = await Flight.findById(flight._id);

        expect(deletedFlight).toBeNull();
    });

// Test 5, verify that flight can be updated
    test("Should update flight", async()=>{
        const flight = new Flight(sampleFlight);
        
        flight.flightNumber = 9014;

        await flight.save();

        const updatedFlight = await Flight.findById(flight._id);

        expect(updatedFlight.flightNumber).toBe(9014);
    });

// Test 6, verify if document can be saved
    test("Should save a flight to MongoDB", async()=>{
        const flight = new Flight(sampleFlight);

        const savedFlight = await flight.save();

        expect(savedFlight._id).toBeDefined();
        expect(savedFlight.flightNumber).toBe(sampleFlight.flightNumber);
        expect(savedFlight.airline).toBe(sampleFlight.airline);
        expect(savedFlight.origin).toBe(sampleFlight.origin);
        expect(savedFlight.destination).toBe(sampleFlight.destination);
        expect(savedFlight.departureDate).toEqual(new Date(sampleFlight.departureDate));
        expect(savedFlight.departureTime).toBe(sampleFlight.departureTime);
        expect(savedFlight.arrivalDate).toEqual(new Date(sampleFlight.arrivalDate));
        expect(savedFlight.arrivalTime).toBe(sampleFlight.arrivalTime);
        expect(savedFlight.logoName).toBe(sampleFlight.logoName);
        expect(savedFlight.numOfLayovers).toBe(sampleFlight.numOfLayovers);
        expect(savedFlight.isActive).toBe(sampleFlight.isActive);
        expect(savedFlight.cabin.economy.price).toBe(sampleFlight.cabin.economy.price);
        expect(savedFlight.cabin.economy.seats).toBe(sampleFlight.cabin.economy.seats);
        expect(savedFlight.cabin.premium_economy.price).toBe(sampleFlight.cabin.premium_economy.price);
        expect(savedFlight.cabin.premium_economy.seats).toBe(sampleFlight.cabin.premium_economy.seats);
        expect(savedFlight.cabin.business_class.price).toBe(sampleFlight.cabin.business_class.price);
        expect(savedFlight.cabin.business_class.seats).toBe(sampleFlight.cabin.business_class.seats);
        expect(savedFlight.cabin.first_class.price).toBe(sampleFlight.cabin.first_class.price);
        expect(savedFlight.cabin.first_class.seats).toBe(sampleFlight.cabin.first_class.seats);

    });

// Test 7. verify if saved flight can be retrieved
    test("Should retrieve the sample flight",async ()=>{
        const createdFlight = await Flight.create(sampleFlight);

        const flight = await Flight.findById(createdFlight._id);

        expect(flight).not.toBeNull();    
        expect(flight.flightNumber).toBe(sampleFlight.flightNumber);
        expect(flight.airline).toBe(sampleFlight.airline);
        expect(flight.origin).toBe(sampleFlight.origin);
        expect(flight.destination).toBe(sampleFlight.destination);
        expect(flight.departureDate).toEqual(new Date(sampleFlight.departureDate));
        expect(flight.departureTime).toBe(sampleFlight.departureTime);
        expect(flight.arrivalDate).toEqual(new Date(sampleFlight.arrivalDate));
        expect(flight.arrivalTime).toBe(sampleFlight.arrivalTime);
        expect(flight.logoName).toBe(sampleFlight.logoName);
        expect(flight.numOfLayovers).toBe(sampleFlight.numOfLayovers);
        expect(flight.isActive).toBe(sampleFlight.isActive);
        expect(flight.cabin.economy.price).toBe(sampleFlight.cabin.economy.price);
        expect(flight.cabin.economy.seats).toBe(sampleFlight.cabin.economy.seats);
        expect(flight.cabin.premium_economy.price).toBe(sampleFlight.cabin.premium_economy.price);
        expect(flight.cabin.premium_economy.seats).toBe(sampleFlight.cabin.premium_economy.seats);
        expect(flight.cabin.business_class.price).toBe(sampleFlight.cabin.business_class.price);
        expect(flight.cabin.business_class.seats).toBe(sampleFlight.cabin.business_class.seats);
        expect(flight.cabin.first_class.price).toBe(sampleFlight.cabin.first_class.price);
        expect(flight.cabin.first_class.seats).toBe(sampleFlight.cabin.first_class.seats);
    });

});
