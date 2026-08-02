const mongoose = require("mongoose");
const User = require("../models/user_model");
const { MongoMemoryServer } = require("mongodb-memory-server");




let mongoServer;

beforeAll(async () =>{
    await mongoose.disconnect();
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
})

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("User authentication Model Unit Tests", ()=>{

    const sampleUser ={
        Fname:"John",
        Lname:"Doe",
        MI: "N",
        DOB:"2005/10/24",
        MobileNum:"09364663229",
        nationality:"Filipino",
        emailAddress:"johndoe@gmail.com",
        sex:"Male",
        password:"password123",
    };

    

    // Test 1,Successful registration
    test("Should be able to create user object",async ()=>{
        const userInstance = new User(sampleUser);
        const savedUser = await userInstance.save()

        expect(savedUser).toBeDefined();
        expect(savedUser).toBeInstanceOf(User);

        // verify password was hashed and is no longer plain text
        expect(savedUser.password).not.toBe("password123");
    });

    //**
    // Test 2
    // check user info
    //  */

    test("Saved user information should be same as inputed",async () =>{
        const userInstance = new User(sampleUser);
        const savedUser = await userInstance.save();

        expect(savedUser.Fname).toBe(userInstance.Fname);
        expect(savedUser.Lname).toBe(userInstance.Lname);
        expect(savedUser.MI).toBe(userInstance.MI);
        expect(savedUser.MobileNum).toBe(userInstance.MobileNum);
        expect(savedUser.nationality).toBe(userInstance.nationality);
        expect(savedUser.emailAddress).toBe(userInstance.emailAddress);
        expect(savedUser.sex).toBe(userInstance.sex);
    })
});
