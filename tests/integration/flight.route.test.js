const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

jest.mock('../../middleware/auth', () => {
    const mongoose = require('mongoose'); 
    return {
        isAuthenticated: (req, res, next) => {
            req.session = req.session || {};
            req.session.userID = new mongoose.Types.ObjectId();
            req.session.role = 'admin';
            req.session.isLoggedIn = true;
            next();
        },
        isAdmin: (req, res, next) => {
            req.session.role = 'admin';
            next();
        },
        isUser: (req, res, next) => next()
    };
});

let mongoServer;

const app = require("../../app");
const Flight = require("../../models/flight_model");
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

    describe("POST /admin-flights Integration Test", ()=>{
        test("Should create flight", async () =>{

            const response = await request(app)
            .post("/admin/admin-flights")
            .send(sampleFlight);
            
            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toBe("/admin/admin-flights");

            const savedFlight = await Flight.findOne({flightNumber: sampleFlight.flightNumber});

            expect(savedFlight).not.toBeNull();
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
    });

    describe("PUT /admin-flights Integration Test", ()=>{
        let createdFlightId;
        beforeEach(async()=>{
            const flight = new Flight(sampleFlight);
            await flight.save();
            createdFlightId = flight._id.toString();

        });

        const updatedFlight = {
            flightNumber: 9017,
            airline: "Japan Airlines"
        };

        test("Should Update Flight", async()=>{

        
        
            const response = await request(app)
            .put(`/admin/admin-flights/${createdFlightId}`)
            .send(updatedFlight);

            expect(response.statusCode).toBe(200);
            expect(response.body.flightNumber).toBe(9017);
            expect(response.body.airline).toBe("Japan Airlines");

            const flight= await Flight.findById(createdFlightId);
            expect(flight).not.toBeNull();
            expect(flight.flightNumber).toBe(9017);
            expect(flight.airline).toBe("Japan Airlines");

        });
    });

    describe("PATCH /admin-flights/:id/deactivate Integration Test", ()=>{
    let createdFlightId;

        beforeEach(async () => {
            // Create an active flight to deactivate
            const flight = new Flight(sampleFlight);
            await flight.save();
            createdFlightId = flight._id.toString();
        });

        test("Should deactivate existing flight", async()=>{
            const response = await request(app)
            .patch(`/admin/admin-flights/${createdFlightId}/deactivate`)
            .send();

        expect(response.statusCode).toBe(200);
        
        const flight = await Flight.findById(createdFlightId);
        expect(flight).not.toBeNull();
        expect(flight.isActive).toBe(false);
        });    
    });