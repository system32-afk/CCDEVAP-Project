// var travelHistory = [

//     {
//         id: 1,
//         origin: "Manila (NAIA)",
//         destination: "Tokyo (HND)",
//         date: "10/24/2025",
//         airline: "Philippine Airline",
//         cabinType: "First Class",
//         price: 30000,
//         flightID: "PR 1234",
//         seat: "A18",
//         bookingRef: "TRP-5712"
//     },
//     {
//         id: 2,
//         origin: "Bacolod (BSA)",
//         destination: "Cebu City (MCI)",
//         date: "01/10/2026",
//         airline: "Cebu Pacific",
//         cabinType: "Business Class",
//         price: 10000,
//         flightID: "PR 6767",
//         seat: "C16",
//         bookingRef: "TRP-7156"
//     }

// ]

// const accordionContainer = $(".accordion");
// const toTravelHistory = $("#pane-history-tab");

// toTravelHistory.on("click", () =>{
//     loadTravelHistory();
// })


// function getTravelHistory(){
//     return travelHistory
// }


// function loadTravelHistory(){
//     accordionContainer.empty();

//     console.log("clicked!")
//     var list = "";

//     var travelHistory = getTravelHistory();

//     travelHistory.forEach(history =>{
//         var date = convertDateToWords(history.date)

//         list += `
//         <div class="accordion-item border-bottom">
//             <h2 class="accordion-header">
//                 <button class="accordion-button collapsed fw-bold text-dark px-0" data-bs-toggle="collapse" data-bs-target="#collapse-${history.bookingRef}" aria-expanded="false">
//                     ${history.origin} to ${history.destination} (${date}) 
//                 </button>
//             </h2>
//             <div id="collapse-${history.bookingRef}" class="accordion-collapse collapse" data-bs-parent="#travelHistory">
//                 <div class="accordion-body px-0 text-secondary">
//                     <div class="row g-2 mb-2 small">
//                         <div class="col-6 col-sm-4">Flight ID: ${history.flightID}</div>
//                         <div class="col-6 col-sm-4">Cabin Seat: ${history.seat} (${history.cabinType})</div>
//                         <div class="col-12 col-sm-4">Booking Reference: ${history.bookingRef}</div>
//                     </div>
//                     <div class="bg-light p-2 rounded small text-muted">
//                          Ticket Invoice Total: PHP ${history.price.toLocaleString()}
//                     </div>
//                 </div>
//             </div>
//         </div>
//         `;
//     });

//     accordionContainer.append(list);
// }



