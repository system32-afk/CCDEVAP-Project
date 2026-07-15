const reservationsDatabase = [
    {
        id: 1,
        bookingReference: "BK-100124",
        status: "Confirmed",
        origin: "NAIA (Manila)",
        destination: "MCIA (Cebu)",
        flightNum: 6767,
        airline: "Philippine Airlines",
        departureDate: "2025-08-01",
        departure: "07:00",
        arrival: "09:30",
        passengers: {
            adults: [
                {
                    passengerNumber: 1,
                    fullName: "Juan dela Cruz",
                    email: "juan@email.com",
                    contactNumber: "+63 912 345 6789",
                    passportNumber: "P1234567A",
                    nationality: "Filipino",
                    dateOfBirth: "1990-05-14",
                    gender: "Male",
                    emergencyContact: "+63 912 345 6790",
                    seat: "3A",
                    mealPackage: "Standard",
                    extraServices: {
                        additionalBaggage: 0,
                        priorityBoarding: false,
                        travelInsurance: false,
                        loungeAccess: false
                    }
                }
            ],
            children: [],
            infants: []
        },
        pricing: {
            baseFare: 5565,
            mealAddOn: 0,
            seatUpgrade: 0,
            extraServices: 0,
            taxes: 450,
            grandTotal: 6015
        }
    },
    {
        id: 2,
        bookingReference: "BK-200231",
        status: "Confirmed",
        origin: "NAIA (Manila)",
        destination: "SA (Siargao)",
        flightNum: 1234,
        airline: "AirAsia",
        departureDate: "2025-08-10",
        departure: "06:00",
        arrival: "08:30",
        passengers: {
            adults: [
                {
                    passengerNumber: 1,
                    fullName: "Maria Santos",
                    email: "maria@email.com",
                    contactNumber: "+63 917 123 4567",
                    passportNumber: "P9876543B",
                    nationality: "Filipino",
                    dateOfBirth: "1988-03-22",
                    gender: "Female",
                    emergencyContact: "+63 917 123 4568",
                    seat: "1B",
                    mealPackage: "Vegetarian",
                    extraServices: {
                        additionalBaggage: 1,
                        priorityBoarding: true,
                        travelInsurance: false,
                        loungeAccess: false
                    }
                },
                {
                    passengerNumber: 2,
                    fullName: "Jose Santos",
                    email: "jose@email.com",
                    contactNumber: "+63 917 123 4568",
                    passportNumber: "P9876544C",
                    nationality: "Filipino",
                    dateOfBirth: "1985-11-10",
                    gender: "Male",
                    emergencyContact: "+63 917 123 4567",
                    seat: "1C",
                    mealPackage: "Vegetarian",
                    extraServices: {
                        additionalBaggage: 0,
                        priorityBoarding: true,
                        travelInsurance: false,
                        loungeAccess: false
                    }
                }
            ],
            children: [],
            infants: []
        },
        pricing: {
            baseFare: 14000,
            mealAddOn: 300,
            seatUpgrade: 1000,
            extraServices: 800,
            taxes: 450,
            grandTotal: 16550
        }
    },
    {
        id: 3,
        bookingReference: "BK-300389",
        status: "Cancelled",
        origin: "CIA (Clark)",
        destination: "BSA (Bacolod)",
        flightNum: 1212,
        airline: "Cebu Pacific",
        departureDate: "2025-07-15",
        departure: "12:00",
        arrival: "14:30",
        passengers: {
            adults: [
                {
                    passengerNumber: 1,
                    fullName: "Anna Reyes",
                    email: "anna@email.com",
                    contactNumber: "+63 920 987 6543",
                    passportNumber: "P1122334D",
                    nationality: "Filipino",
                    dateOfBirth: "1992-07-30",
                    gender: "Female",
                    emergencyContact: "+63 920 987 6544",
                    seat: "5D",
                    mealPackage: "Halal",
                    extraServices: {
                        additionalBaggage: 2,
                        priorityBoarding: false,
                        travelInsurance: true,
                        loungeAccess: false
                    }
                }
            ],
            children: [
                {
                    passengerNumber: 1,
                    fullName: "Luis Reyes",
                    email: "",
                    contactNumber: "",
                    passportNumber: "P1122335E",
                    nationality: "Filipino",
                    dateOfBirth: "2016-04-18",
                    gender: "Male",
                    emergencyContact: "+63 920 987 6543",
                    seat: "5E",
                    mealPackage: "Standard",
                    extraServices: {
                        additionalBaggage: 1,
                        priorityBoarding: false,
                        travelInsurance: true,
                        loungeAccess: false
                    }
                }
            ],
            infants: [
                {
                    passengerNumber: 1,
                    fullName: "Baby Reyes",
                    passportNumber: "",
                    nationality: "Filipino",
                    dateOfBirth: "2024-11-02",
                    gender: "Female",
                    assignedToAdult: 1,
                    seat: "LAP",
                    mealPackage: "Standard",
                    extraServices: {
                        additionalBaggage: 0,
                        priorityBoarding: false,
                        travelInsurance: false,
                        loungeAccess: false
                    }
                }
            ]
        },
        pricing: {
            baseFare: 4950,
            mealAddOn: 200,
            seatUpgrade: 0,
            extraServices: 1200,
            taxes: 450,
            grandTotal: 6800
        }
    },
    {
        id: 4,
        bookingReference: "BK-400412",
        status: "Pending",
        origin: "NAIA (Manila)",
        destination: "GPRA (Caticlan)",
        flightNum: 5565,
        airline: "Cathay Pacific",
        departureDate: "2025-09-03",
        departure: "14:30",
        arrival: "18:00",
        passengers: {
            adults: [
                {
                    passengerNumber: 1,
                    fullName: "Carlos Mendoza",
                    email: "carlos@email.com",
                    contactNumber: "+63 935 456 7890",
                    passportNumber: "P5544332F",
                    nationality: "Filipino",
                    dateOfBirth: "1979-01-25",
                    gender: "Male",
                    emergencyContact: "+63 935 456 7891",
                    seat: "2F",
                    mealPackage: "Kosher",
                    extraServices: {
                        additionalBaggage: 0,
                        priorityBoarding: true,
                        travelInsurance: true,
                        loungeAccess: true
                    }
                }
            ],
            children: [],
            infants: []
        },
        pricing: {
            baseFare: 6778,
            mealAddOn: 200,
            seatUpgrade: 500,
            extraServices: 1500,
            taxes: 450,
            grandTotal: 9428
        }
    },
    {
        id: 5,
        bookingReference: "BK-500567",
        status: "Confirmed",
        origin: "IIA (Iloilo)",
        destination: "NAIA (Manila)",
        flightNum: 1124,
        airline: "Cebu Pacific",
        departureDate: "2025-08-20",
        departure: "07:00",
        arrival: "09:30",
        passengers: {
            adults: [
                {
                    passengerNumber: 1,
                    fullName: "Rosa Villanueva",
                    email: "rosa@email.com",
                    contactNumber: "+63 908 234 5678",
                    passportNumber: "P6677889G",
                    nationality: "Filipino",
                    dateOfBirth: "1983-09-05",
                    gender: "Female",
                    emergencyContact: "+63 908 234 5679",
                    seat: "4B",
                    mealPackage: "Gluten-Free",
                    extraServices: {
                        additionalBaggage: 2,
                        priorityBoarding: true,
                        travelInsurance: false,
                        loungeAccess: false
                    }
                },
                {
                    passengerNumber: 2,
                    fullName: "Pedro Villanueva",
                    email: "pedro@email.com",
                    contactNumber: "+63 908 234 5679",
                    passportNumber: "P6677890H",
                    nationality: "Filipino",
                    dateOfBirth: "1981-12-19",
                    gender: "Male",
                    emergencyContact: "+63 908 234 5678",
                    seat: "4C",
                    mealPackage: "Standard",
                    extraServices: {
                        additionalBaggage: 1,
                        priorityBoarding: true,
                        travelInsurance: false,
                        loungeAccess: false
                    }
                }
            ],
            children: [
                {
                    passengerNumber: 1,
                    fullName: "Nina Villanueva",
                    email: "",
                    contactNumber: "",
                    passportNumber: "P6677891I",
                    nationality: "Filipino",
                    dateOfBirth: "2015-06-23",
                    gender: "Female",
                    emergencyContact: "+63 908 234 5678",
                    seat: "4A",
                    mealPackage: "Standard",
                    extraServices: {
                        additionalBaggage: 0,
                        priorityBoarding: false,
                        travelInsurance: false,
                        loungeAccess: false
                    }
                }
            ],
            infants: []
        },
        pricing: {
            baseFare: 17034,
            mealAddOn: 180,
            seatUpgrade: 0,
            extraServices: 400,
            taxes: 450,
            grandTotal: 18064
        }
    }
]
