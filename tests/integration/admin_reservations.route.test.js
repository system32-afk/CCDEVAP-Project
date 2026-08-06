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
const bookingModel = require("../../models/booking_model");
const flightModel = require("../../models/flight_model");

beforeAll(async () => {
    await mongoose.disconnect();
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterEach(async () => {
    await bookingModel.deleteMany({});
    await flightModel.deleteMany({});
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// ======= sample data =======

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

function buildSamplePassenger(overrides = {}) {
    return {
        passengerType: "adult",
        status: "Confirmed",
        fullName: "Jane Doe",
        email: "janedoe@gmail.com",
        contact: "09171234567",
        passport: "P7654321",
        nationality: "Filipino",
        birthdate: "1998/05/10",
        gender: "Female",
        emergencyContact: "09169998888",
        meal: "standard",
        seat: "10A",
        baggage: 1,
        priority: false,
        insurance: false,
        lounge: false,
        price: 3000,
        ...overrides
    };
}

// ======= GET /admin-reservations-data =======

describe("GET /admin-reservations-data Integration Tests", () => {

    test("Should return all reservations, regardless of which user they belong to", async () => {
        const flight = await flightModel.create(buildSampleFlight());

        await bookingModel.create({
            bookingReference: "BK-USER1",
            flight: flight._id,
            cabinType: "economy",
            belongsToUser: new mongoose.Types.ObjectId().toString(),
            totalPrice: 3000,
            passengers: [buildSamplePassenger({ email: "p1@gmail.com" })]
        });

        await bookingModel.create({
            bookingReference: "BK-USER2",
            flight: flight._id,
            cabinType: "economy",
            belongsToUser: new mongoose.Types.ObjectId().toString(),
            totalPrice: 3000,
            passengers: [buildSamplePassenger({ email: "p2@gmail.com" })]
        });

        const response = await request(app).get("/admin/admin-reservations-data");

        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(2);
    });
});

// ======= PUT /admin-reservations/passenger/:passengerId/status =======

describe("PUT /admin-reservations/passenger/:passengerId/status Integration Tests", () => {

    test("Should cancel a passenger regardless of who owns the booking, and increment flight seats", async () => {
        const flight = await flightModel.create(buildSampleFlight());
        await flightModel.findByIdAndUpdate(flight._id, { $inc: { "cabin.economy.seats": -1 } });

        const booking = await bookingModel.create({
            bookingReference: "BK-ADMINCANCEL",
            flight: flight._id,
            cabinType: "economy",
            belongsToUser: new mongoose.Types.ObjectId().toString(), // not the admin's own id
            totalPrice: 3000,
            passengers: [buildSamplePassenger()]
        });
        const passengerId = booking.passengers[0]._id.toString();

        const response = await request(app)
            .put(`/admin/admin-reservations/passenger/${passengerId}/status`)
            .send({ status: "Cancelled" });

        expect(response.statusCode).toBe(200);

        const updatedBooking = await bookingModel.findById(booking._id);
        expect(updatedBooking.passengers[0].status).toBe("Cancelled");

        const updatedFlight = await flightModel.findById(flight._id);
        expect(updatedFlight.cabin.economy.seats).toBe(60);
    });

    test("Should normalize status casing (e.g. 'cancelled' -> 'Cancelled')", async () => {
        const flight = await flightModel.create(buildSampleFlight());
        const booking = await bookingModel.create({
            bookingReference: "BK-CASING",
            flight: flight._id,
            cabinType: "economy",
            belongsToUser: new mongoose.Types.ObjectId().toString(),
            totalPrice: 3000,
            passengers: [buildSamplePassenger()]
        });
        const passengerId = booking.passengers[0]._id.toString();

        const response = await request(app)
            .put(`/admin/admin-reservations/passenger/${passengerId}/status`)
            .send({ status: "cancelled" });

        expect(response.statusCode).toBe(200);

        const updatedBooking = await bookingModel.findById(booking._id);
        expect(updatedBooking.passengers[0].status).toBe("Cancelled");
    });

    test("Should return 400 for an invalid status value", async () => {
        const flight = await flightModel.create(buildSampleFlight());
        const booking = await bookingModel.create({
            bookingReference: "BK-INVALID",
            flight: flight._id,
            cabinType: "economy",
            belongsToUser: new mongoose.Types.ObjectId().toString(),
            totalPrice: 3000,
            passengers: [buildSamplePassenger()]
        });
        const passengerId = booking.passengers[0]._id.toString();

        const response = await request(app)
            .put(`/admin/admin-reservations/passenger/${passengerId}/status`)
            .send({ status: "onboard" });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Invalid status value");
    });

    test("Should return 404 if passenger does not exist", async () => {
        const fakePassengerId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .put(`/admin/admin-reservations/passenger/${fakePassengerId}/status`)
            .send({ status: "Cancelled" });

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Passenger not found");
    });
});

// ======= PUT /passenger/:passengerId/seat (admin) =======

describe("PUT /admin/passenger/:passengerId/seat Integration Tests", () => {

    test("Should let admin change a seat on a booking they do not own", async () => {
        const flight = await flightModel.create(buildSampleFlight());
        const booking = await bookingModel.create({
            bookingReference: "BK-ADMINSEAT",
            flight: flight._id,
            cabinType: "economy",
            belongsToUser: new mongoose.Types.ObjectId().toString(),
            totalPrice: 3000,
            passengers: [buildSamplePassenger({ seat: "10A", price: 3000 })]
        });
        const passengerId = booking.passengers[0]._id.toString();

        const response = await request(app)
            .put(`/admin/passenger/${passengerId}/seat`)
            .send({ seat: "11A" });

        expect(response.statusCode).toBe(200);
        expect(response.body.seat).toBe("11A");

        const updatedBooking = await bookingModel.findById(booking._id);
        expect(updatedBooking.passengers[0].seat).toBe("11A");
    });

    test("Should still return 409 if the seat is already taken", async () => {
        const flight = await flightModel.create(buildSampleFlight());
        const booking = await bookingModel.create({
            bookingReference: "BK-ADMINCONFLICT",
            flight: flight._id,
            cabinType: "economy",
            belongsToUser: new mongoose.Types.ObjectId().toString(),
            totalPrice: 6000,
            passengers: [
                buildSamplePassenger({ seat: "5A", email: "p1@gmail.com" }),
                buildSamplePassenger({ seat: "5B", email: "p2@gmail.com" })
            ]
        });
        const passengerToMove = booking.passengers[1]._id.toString();

        const response = await request(app)
            .put(`/admin/passenger/${passengerToMove}/seat`)
            .send({ seat: "5A" });

        expect(response.statusCode).toBe(409);
        expect(response.body.message).toBe("That seat is already taken.");
    });

    test("Should return 400 when trying to change the seat of a cancelled reservation", async () => {
        const flight = await flightModel.create(buildSampleFlight());
        const booking = await bookingModel.create({
            bookingReference: "BK-ADMINCANCELLEDSEAT",
            flight: flight._id,
            cabinType: "economy",
            belongsToUser: new mongoose.Types.ObjectId().toString(),
            totalPrice: 3000,
            passengers: [buildSamplePassenger({ seat: "10A", status: "Cancelled" })]
        });
        const passengerId = booking.passengers[0]._id.toString();

        const response = await request(app)
            .put(`/admin/passenger/${passengerId}/seat`)
            .send({ seat: "11A" });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Cannot change the seat on a cancelled reservation.");
    });
});
