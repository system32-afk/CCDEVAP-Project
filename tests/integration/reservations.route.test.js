const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../../app");
const bookingModel = require("../../models/booking_model");
const flightModel = require("../../models/flight_model");
const userModel = require("../../models/user_model");

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
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// dummy/sample data to be used for the tests

function buildSampleUser(overrides = {}) {
    return {
        Fname: "John",
        Lname: "Doe",
        MI: "N",
        DOB: "2005/10/24",
        MobileNum: "09364663229",
        nationality: "Filipino",
        emailAddress: "johndoe@gmail.com",
        sex: "Male",
        password: "password123",
        ...overrides
    };
}

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

async function registerAndLogin(userPayload) {
    const agent = request.agent(app);
    await agent.post("/register").send(userPayload);
    await agent.post("/login").send({
        emailAddress: userPayload.emailAddress,
        password: userPayload.password
    });
    const dbUser = await userModel.findOne({ emailAddress: userPayload.emailAddress });
    return { agent, userId: dbUser._id.toString() };
}

// testing for getting user reservations

describe("GET /reservations-data Integration Tests", () => {

    test("Should only return reservations belonging to the logged-in user", async () => {
        const owner = buildSampleUser();
        const otherUser = buildSampleUser({ emailAddress: "other@gmail.com" });

        const { agent, userId } = await registerAndLogin(owner);
        const otherDbUser = await new userModel(otherUser).save();

        const flight = await flightModel.create(buildSampleFlight());

        const ownedBooking = await bookingModel.create({
            bookingReference: "BK-OWNED",
            flight: flight._id,
            cabinType: "economy",
            belongsToUser: userId,
            totalPrice: 3000,
            passengers: [buildSamplePassenger()]
        });

        await bookingModel.create({
            bookingReference: "BK-OTHER",
            flight: flight._id,
            cabinType: "economy",
            belongsToUser: otherDbUser._id.toString(),
            totalPrice: 3000,
            passengers: [buildSamplePassenger({ email: "someoneelse@gmail.com" })]
        });

        const response = await agent.get("/reservations/reservations-data");

        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].bookingReference).toBe(ownedBooking.bookingReference);
        expect(response.body[0].flight.origin).toBe(flight.origin);
    });
});

// testing for canellation of passenger reservation

describe("PUT /passenger/:passengerId/status Integration Tests", () => {

    test("Should cancel a passenger and increment the flight's available seats", async () => {
        const { agent, userId } = await registerAndLogin(buildSampleUser());

        const flight = await flightModel.create(buildSampleFlight());
        // simulate one seat already taken, same way the app itself decrements it
        await flightModel.findByIdAndUpdate(flight._id, { $inc: { "cabin.economy.seats": -1 } });

        const booking = await bookingModel.create({
            bookingReference: "BK-CANCEL",
            flight: flight._id,
            cabinType: "economy",
            belongsToUser: userId,
            totalPrice: 3000,
            passengers: [buildSamplePassenger()]
        });
        const passengerId = booking.passengers[0]._id.toString();

        const response = await agent
            .put(`/reservations/passenger/${passengerId}/status`)
            .send({ status: "Cancelled" });

        expect(response.statusCode).toBe(200);

        const updatedBooking = await bookingModel.findById(booking._id);
        expect(updatedBooking.passengers[0].status).toBe("Cancelled");

        const updatedFlight = await flightModel.findById(flight._id);
        expect(updatedFlight.cabin.economy.seats).toBe(60); // 59 -> 60 after cancellation
    });

    test("Should return 400 if status is anything other than Cancelled", async () => {
        const { agent, userId } = await registerAndLogin(buildSampleUser());
        const flight = await flightModel.create(buildSampleFlight());

        const booking = await bookingModel.create({
            bookingReference: "BK-BADSTATUS",
            flight: flight._id,
            cabinType: "economy",
            belongsToUser: userId,
            totalPrice: 3000,
            passengers: [buildSamplePassenger()]
        });
        const passengerId = booking.passengers[0]._id.toString();

        const response = await agent
            .put(`/reservations/passenger/${passengerId}/status`)
            .send({ status: "Confirmed" });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Users may only cancel a reservation.");
    });

    test("Should return 404 if passenger does not exist", async () => {
        const { agent } = await registerAndLogin(buildSampleUser());
        const fakePassengerId = new mongoose.Types.ObjectId();

        const response = await agent
            .put(`/reservations/passenger/${fakePassengerId}/status`)
            .send({ status: "Cancelled" });

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Passenger not found");
    });

    test("Should return 403 if the reservation does not belong to the logged-in user", async () => {
        const { agent } = await registerAndLogin(buildSampleUser());
        const otherDbUser = await new userModel(buildSampleUser({ emailAddress: "other@gmail.com" })).save();

        const flight = await flightModel.create(buildSampleFlight());
        const booking = await bookingModel.create({
            bookingReference: "BK-NOTMINE",
            flight: flight._id,
            cabinType: "economy",
            belongsToUser: otherDbUser._id.toString(),
            totalPrice: 3000,
            passengers: [buildSamplePassenger()]
        });
        const passengerId = booking.passengers[0]._id.toString();

        const response = await agent
            .put(`/reservations/passenger/${passengerId}/status`)
            .send({ status: "Cancelled" });

        expect(response.statusCode).toBe(403);
        expect(response.body.message).toBe("You do not have permission to modify this reservation.");
    });
});

// testing for seat change of passenger

describe("PUT /reservations/passenger/:passengerId/seat Integration Tests", () => {

    test("Should change seat with no price change when both seats are non-premium", async () => {
        const { agent, userId } = await registerAndLogin(buildSampleUser());
        const flight = await flightModel.create(buildSampleFlight());

        const booking = await bookingModel.create({
            bookingReference: "BK-SEATCHANGE",
            flight: flight._id,
            cabinType: "economy",
            belongsToUser: userId,
            totalPrice: 3000,
            passengers: [buildSamplePassenger({ seat: "10A", price: 3000 })]
        });
        const passengerId = booking.passengers[0]._id.toString();

        const response = await agent
            .put(`/reservations/passenger/${passengerId}/seat`)
            .send({ seat: "11A" });

        expect(response.statusCode).toBe(200);
        expect(response.body.seat).toBe("11A");
        expect(response.body.price).toBe(3000);

        const updatedBooking = await bookingModel.findById(booking._id);
        expect(updatedBooking.passengers[0].seat).toBe("11A");
    });

    test("Should upcharge when moving into a premium seat", async () => {
        const { agent, userId } = await registerAndLogin(buildSampleUser());
        const flight = await flightModel.create(buildSampleFlight());

        const booking = await bookingModel.create({
            bookingReference: "BK-UPGRADE",
            flight: flight._id,
            cabinType: "economy",
            belongsToUser: userId,
            totalPrice: 3000,
            passengers: [buildSamplePassenger({ seat: "10A", price: 3000 })]
        });
        const passengerId = booking.passengers[0]._id.toString();

        const response = await agent
            .put(`/reservations/passenger/${passengerId}/seat`)
            .send({ seat: "2A" }); // row 2 = premium

        expect(response.statusCode).toBe(200);
        expect(response.body.seat).toBe("2A");
        expect(response.body.price).toBe(3500); // 3000 + 500
        expect(response.body.totalPrice).toBe(3500);
    });

    test("Should refund when moving out of a premium seat", async () => {
        const { agent, userId } = await registerAndLogin(buildSampleUser());
        const flight = await flightModel.create(buildSampleFlight());

        const booking = await bookingModel.create({
            bookingReference: "BK-DOWNGRADE",
            flight: flight._id,
            cabinType: "economy",
            belongsToUser: userId,
            totalPrice: 3500,
            passengers: [buildSamplePassenger({ seat: "1A", price: 3500 })]
        });
        const passengerId = booking.passengers[0]._id.toString();

        const response = await agent
            .put(`/reservations/passenger/${passengerId}/seat`)
            .send({ seat: "10A" });

        expect(response.statusCode).toBe(200);
        expect(response.body.price).toBe(3000); // 3500 - 500
        expect(response.body.totalPrice).toBe(3000);
    });

    test("Should return an error with a status code of 409 if the requested seat is already taken", async () => {
        const { agent, userId } = await registerAndLogin(buildSampleUser());
        const flight = await flightModel.create(buildSampleFlight());

        const booking = await bookingModel.create({
            bookingReference: "BK-CONFLICT",
            flight: flight._id,
            cabinType: "economy",
            belongsToUser: userId,
            totalPrice: 6000,
            passengers: [
                buildSamplePassenger({ seat: "5A", email: "p1@gmail.com" }),
                buildSamplePassenger({ seat: "5B", email: "p2@gmail.com" })
            ]
        });
        const passengerToMove = booking.passengers[1]._id.toString();

        const response = await agent
            .put(`/reservations/passenger/${passengerToMove}/seat`)
            .send({ seat: "5A" });

        expect(response.statusCode).toBe(409);
        expect(response.body.message).toBe("That seat is already taken.");
    });

    test("Should return an error with a status code of 400 when trying to change the seat of a cancelled reservation", async () => {
        const { agent, userId } = await registerAndLogin(buildSampleUser());
        const flight = await flightModel.create(buildSampleFlight());

        const booking = await bookingModel.create({
            bookingReference: "BK-CANCELLEDSEAT",
            flight: flight._id,
            cabinType: "economy",
            belongsToUser: userId,
            totalPrice: 3000,
            passengers: [buildSamplePassenger({ seat: "10A", status: "Cancelled" })]
        });
        const passengerId = booking.passengers[0]._id.toString();

        const response = await agent
            .put(`/reservations/passenger/${passengerId}/seat`)
            .send({ seat: "11A" });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Cannot change the seat on a cancelled reservation.");
    });

    test("Should return an error with a status code of 400 if no seat is provided", async () => {
        const { agent, userId } = await registerAndLogin(buildSampleUser());
        const flight = await flightModel.create(buildSampleFlight());

        const booking = await bookingModel.create({
            bookingReference: "BK-NOSEAT",
            flight: flight._id,
            cabinType: "economy",
            belongsToUser: userId,
            totalPrice: 3000,
            passengers: [buildSamplePassenger({ seat: "10A" })]
        });
        const passengerId = booking.passengers[0]._id.toString();

        const response = await agent
            .put(`/reservations/passenger/${passengerId}/seat`)
            .send({});

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("A seat is required.");
    });

    test("Should return an error with a status code of 403 if the reservation does not belong to the logged-in user", async () => {
        const { agent } = await registerAndLogin(buildSampleUser());
        const otherDbUser = await new userModel(buildSampleUser({ emailAddress: "other@gmail.com" })).save();

        const flight = await flightModel.create(buildSampleFlight());
        const booking = await bookingModel.create({
            bookingReference: "BK-NOTMINE-SEAT",
            flight: flight._id,
            cabinType: "economy",
            belongsToUser: otherDbUser._id.toString(),
            totalPrice: 3000,
            passengers: [buildSamplePassenger({ seat: "10A" })]
        });
        const passengerId = booking.passengers[0]._id.toString();

        const response = await agent
            .put(`/reservations/passenger/${passengerId}/seat`)
            .send({ seat: "11A" });

        expect(response.statusCode).toBe(403);
        expect(response.body.message).toBe("You do not have permission to modify this reservation.");
    });
});
