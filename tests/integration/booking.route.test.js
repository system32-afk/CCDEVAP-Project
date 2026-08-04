const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../../app");
const bookingModel = require("../../models/booking_model");
const flightModel = require("../../models/flight_model");
const userModel = require("../../models/user_model");
const AuditLog = require("../../models/AuditLog");

let mongoServer;

beforeAll(async () => {
    await mongoose.disconnect();
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterEach(async () => {
    await bookingModel.deleteMany({});
    await flightModel.deleteMany({});
    await userModel.deleteMany({});
    await AuditLog.deleteMany({});
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

const sampleUser = {
    Fname: "John",
    Lname: "Doe",
    MI: "N",
    DOB: "2005/10/24",
    MobileNum: "09364663229",
    nationality: "Filipino",
    emailAddress: "johndoe@gmail.com",
    sex: "Male",
    password: "password123",
};

function buildSampleFlight(overrides = {}) {
    return {
        flightNumber: 101,
        airline: "Philippine Airlines",
        origin: "Manila",
        destination: "Cebu",
        departureDate: "2026-09-01",
        departureTime: "08:00",
        arrivalDate: "2026-09-01",
        arrivalTime: "09:30",
        cabin: {
            economy: { price: 3000, seats: 60 },
            premium_economy: { price: 6000, seats: 60 },
            business_class: { price: 10000, seats: 60 },
            first_class: { price: 15000, seats: 60 }
        },
        logoName: "PAL",
        numOfLayovers: 0,
        isActive: true,
        ...overrides
    };
}

const samplePassenger = {
    passengerType: "adult",
    fullName: "Jane Doe",
    email: "janedoe@gmail.com",
    contact: "09171234567",
    passport: "P7654321",
    nationality: "Filipino",
    birthdate: "1998/05/10",
    gender: "Female",
    emergencyContact: "09169998888",
    meal: "standard",
    seat: "2A",
    baggage: 1,
    priority: false,
    insurance: false,
    lounge: false,
    price: 3360
};

async function getLoggedInAgent() {
    const agent = request.agent(app);
    await agent.post("/register").send(sampleUser);
    await agent.post("/login").send({
        emailAddress: sampleUser.emailAddress,
        password: sampleUser.password
    });
    return agent;
}

describe("POST /booking Integration Tests", () => {

    // successful cases

    // Test 1, a logged in passenger should be able to book a flight successfully
    test("Should successfully create a booking and decrement seats", async () => {
        const flight = await flightModel.create(buildSampleFlight());
        const agent = await getLoggedInAgent();

        const response = await agent
            .post("/booking")
            .send({
                flightId: flight._id.toString(),
                returnFlightId: "",
                cabinType: "economy",
                totalPrice: samplePassenger.price,
                returnTotalPrice: 0,
                passengers: [samplePassenger],
                returnPassengers: []
            });

        expect(response.statusCode).toBe(201);

        const savedBooking = await bookingModel.findOne({ flight: flight._id });
        expect(savedBooking).toBeDefined();
        expect(savedBooking.passengers.length).toBe(1);
        expect(savedBooking.bookingReference).toMatch(/^BK-/);

        const updatedFlight = await flightModel.findById(flight._id);
        expect(updatedFlight.cabin.economy.seats).toBe(59); // started at 60, minus 1 passenger
    });

    // unsucessful cases

    // Test 2, booking a flight id that doesn't exist
    test("Should return 404 if departure flight does not exist", async () => {
        const agent = await getLoggedInAgent();
        const fakeFlightId = new mongoose.Types.ObjectId();

        const response = await agent
            .post("/booking")
            .send({
                flightId: fakeFlightId.toString(),
                cabinType: "economy",
                totalPrice: samplePassenger.price,
                passengers: [samplePassenger],
                returnPassengers: []
            });

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Departure flight not found");
    });

    // Test 3, booking a flight with no available seats
    test("Should return 409 if not enough seats available", async () => {
        const flight = await flightModel.create(buildSampleFlight());

        await flightModel.findByIdAndUpdate(flight._id, {
            $set: { "cabin.economy.seats": 0 }
        });

        const agent = await getLoggedInAgent();

        const response = await agent
            .post("/booking")
            .send({
                flightId: flight._id.toString(),
                cabinType: "economy",
                totalPrice: samplePassenger.price,
                passengers: [samplePassenger],
                returnPassengers: []
            });

        expect(response.statusCode).toBe(409);
        expect(response.body.message).toBe("Not enough seats available on departure flight");

        const bookingCount = await bookingModel.countDocuments({});
        expect(bookingCount).toBe(0); // confirms nothing was saved despite the failed attempt
    });

    // Test 4, selecting an occupied seat
    test("Should return 409 if a selected seat is already occupied", async () => {
        const flight = await flightModel.create(buildSampleFlight());
        const agent = await getLoggedInAgent();

        // first booking takes seat 2A
        await agent.post("/booking").send({
            flightId: flight._id.toString(),
            cabinType: "economy",
            totalPrice: samplePassenger.price,
            passengers: [samplePassenger],
            returnPassengers: []
        });

        // second passenger tries to take the same seat
        const secondPassenger = { ...samplePassenger, fullName: "Mark Cruz", email: "markc@gmail.com" };
        const response = await agent.post("/booking").send({
            flightId: flight._id.toString(),
            cabinType: "economy",
            totalPrice: secondPassenger.price,
            passengers: [secondPassenger],
            returnPassengers: []
        });

        expect(response.statusCode).toBe(409);
        expect(response.body.message).toBe("This seat is already occupied");

        const bookingCount = await bookingModel.countDocuments({});
        expect(bookingCount).toBe(1);
    });

    // test if audit logs are created

    // Test 5, reservation creation should be recorded in the audit log
    test("Should create an audit log entry when a reservation is made", async () => {
        const flight = await flightModel.create(buildSampleFlight());
        const agent = await getLoggedInAgent();

        await agent.post("/booking").send({
            flightId: flight._id.toString(),
            cabinType: "economy",
            totalPrice: samplePassenger.price,
            passengers: [samplePassenger],
            returnPassengers: []
        });

        const reservationLogs = await AuditLog.find({ action: "RESERVATION CREATED" });
        expect(reservationLogs.length).toBe(1);
        expect(reservationLogs[0].actor).toBe(sampleUser.emailAddress);
        expect(reservationLogs[0].user_role).toBe("customer");
    });
});