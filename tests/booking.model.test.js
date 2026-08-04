const mongoose = require("mongoose");
const Booking = require("../models/booking_model");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

beforeAll(async () => {
    await mongoose.disconnect();
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    await Booking.init(); 
});

afterEach(async () => {
    await Booking.deleteMany({});
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe("Booking Model Unit Tests", () => {

    const samplePassenger = {
        passengerType: "adult",
        fullName: "John Doe",
        email: "johndoe@gmail.com",
        contact: "09364663229",
        passport: "P1234567",
        nationality: "Filipino",
        birthdate: "2000/01/01",
        gender: "Male",
        emergencyContact: "09171234567",
        meal: "standard",
        seat: "2A",
        baggage: 1,
        priority: false,
        insurance: false,
        lounge: false,
        price: 3500
    };

    const sampleBooking = {
        bookingReference: "BK-TEST001",
        flight: new mongoose.Types.ObjectId(),
        cabinType: "economy",
        belongsToUser: new mongoose.Types.ObjectId().toString(),
        totalPrice: 3500,
        passengers: [samplePassenger]
    };

    // Test 1, if valid booking document saves successfully
    test("Should be able to create booking object", async () => {
        const bookingInstance = new Booking(sampleBooking);
        const savedBooking = await bookingInstance.save();

        expect(savedBooking).toBeDefined();
        expect(savedBooking).toBeInstanceOf(Booking);
    });

    // Test 2, if fields on the saved document match what was inputted
    test("Saved booking information should be same as inputted", async () => {
        const bookingInstance = new Booking(sampleBooking);
        const savedBooking = await bookingInstance.save();

        expect(savedBooking.bookingReference).toBe(sampleBooking.bookingReference);
        expect(savedBooking.cabinType).toBe(sampleBooking.cabinType);
        expect(savedBooking.belongsToUser).toBe(sampleBooking.belongsToUser);
        expect(savedBooking.totalPrice).toBe(sampleBooking.totalPrice);
        expect(savedBooking.passengers.length).toBe(1);
        expect(savedBooking.passengers[0].fullName).toBe(samplePassenger.fullName);
    });

    // Test 3, "flight" should be required field
    test("Should reject booking without a flight reference", async () => {
        const { flight, ...bookingWithoutFlight } = sampleBooking;
        const bookingInstance = new Booking(bookingWithoutFlight);

        await expect(bookingInstance.save()).rejects.toThrow();
    });
});