const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../../app");
const User = require("../../models/user_model");


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
// sample user
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

//REGISTRATION
describe("POST /registration Integration Test", () =>{
    test("should succesfully register user", async () =>{
        const response = await request(app)
        .post("/register")
        .send(sampleUser);


        //expected results
        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe("/login") //if registration is successful users go to login


        //we look for the saved user
        const savedUser = await User.findOne({emailAddress: sampleUser.emailAddress});
        
        //check if the user exist
        expect(savedUser).toBeDefined();
        
        //check if saved information is the same
        expect(savedUser.Fname).toBe(sampleUser.Fname);
        expect(savedUser.Lname).toBe(sampleUser.Lname);
        expect(savedUser.MI).toBe(sampleUser.MI);
        expect(savedUser.MobileNum).toBe(sampleUser.MobileNum);
        expect(savedUser.nationality).toBe(sampleUser.nationality);
        expect(savedUser.emailAddress).toBe(sampleUser.emailAddress);
        expect(savedUser.sex).toBe(sampleUser.sex);

    })
})




//SUCCESSFUL LOGIN
describe("POST /login Integration Tests", () => {
  test("should successfully authenticate user and redirect to home", async () => {
    
    //insert sample user into database
    const user = new User(sampleUser);
    await user.save();

    // send login details
    const response = await request(app)
      .post("/login")
      .send({
        emailAddress: "johndoe@gmail.com",
        password: "password123"
      });

    //expected results
    expect(response.statusCode).toBe(302); // Redirect status
    expect(response.headers.location).toBe("/home"); // Redirect destination
    //a cookie was created
    expect(response.headers["set-cookie"]).toBeDefined();
    
  });
});

//FAILED LOGIN
describe("POST /login Failures",() =>{

    //test 1: user does not exist
    test("User does not exist", async () =>{
        const response = await request(app)
        .post("/login")
        .send({
            emailAddress: "test111@gmail.com",
            password: "123"
        });


        //redirect back to login
        expect(response.statusCode).toBe(302);
        expect(response.header.location).toBe("/login");
        //no cookies created since login failed
        expect(response.headers["set-cookie"]).toBeUndefined();
    });


    //test 2: user exist but incorrect password
    test("Incorrect password", async () =>{

        // insert a sample user to the database
        const user = new User(sampleUser);
        await user.save();

        const response = await request(app)
        .post("/login")
        .send({
            emailAddress: "johndoe@gmail.com",
            password: "123" //incorrect pass
        });


        //redirect back to login
        expect(response.statusCode).toBe(302);
        expect(response.header.location).toBe("/login");
        //no cookies created since login failed
        expect(response.headers["set-cookie"]).toBeUndefined();
    });
})