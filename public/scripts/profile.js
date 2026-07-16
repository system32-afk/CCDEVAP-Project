const editDetailsBtn =$("#edit-details-btn");
const personalInfoFields = $("#personal-info-details input, #personal-info-details select");
const buttonsContainer = $("#edit-actions-container");
const saveChanges = $("#save-changes");
const cancelChanges = $("#cancel-edit");
var userInformation = null;
const fullNameDisplay = $(".full-name");


const uploadBtn = $("#upload-picture-btn");
const hiddenInput = $("#image-file-input");
const profilePicDisplay = $("#profile-picture-preview");

const FnameField = $("#Fname-field");
const LnameField = $("#Lname-field");
const MIField = $("#MI-field");
const sexField = $("#sex-field");
const mobileNumField = $("#mobile-number-field");
const emailField = $("#email-field")
const DOBField = $("#DOB-field")
const nationalityField = $("#nationality-field")


var whatToDelete = "" //GLOBAL (file scope) VAR TO REUSE CONFIRM DELETE MODAL
var userInformation = null;
var informationSnapshot = null;
$(document).ready(function() {

    userInformation = {
    Fname: FnameField.val().trim(),
    Lname: LnameField.val().trim(),
    MI: MIField.val().trim(),
    sex: sexField.val(),
    MobileNum: mobileNumField.val().trim(),
    DOB: DOBField.val().trim(),
    nationality: nationalityField.val().trim(),
    email: emailField.val().trim()
    }  

    const userSex = sexField.data("current-sex");
    console.log("Sex pulled from data attribute:", userSex);
    
    if (userSex) {
        sexField.val(userSex);
        userInformation.sex = userSex;
    }


    informationSnapshot = {...userInformation};
    loadInformation()
    
});


//======UPLOAD PICTURE=========================
uploadBtn.on("click", function(){
    hiddenInput.click();
})

hiddenInput.on("change", function(event){
    var selectedFile = event.target.files[0];
    var imageUrl = URL.createObjectURL(selectedFile);

    profilePicDisplay.attr("src",imageUrl);

    console.log(imageUrl);

})


//===PERSONAL INFO SECTION=====================

editDetailsBtn.on("click", ()=>{

    personalInfoFields.not("#email-field").removeAttr("disabled");
    editDetailsBtn.addClass("d-none");
    buttonsContainer.removeClass("d-none");
   uploadBtn.removeClass("d-none");
})


cancelChanges.on("click", ()=>{

    userInformation = { ...informationSnapshot };
    personalInfoFields.attr("disabled",true);
    buttonsContainer.addClass("d-none")
    editDetailsBtn.removeClass("d-none");
    uploadBtn.addClass("d-none");
    loadInformation()

    
})


saveChanges.on("click", ()=>{
    updateUserInformation();

    personalInfoFields.attr("disabled",true);
    uploadBtn.addClass("d-none");
    
    buttonsContainer.addClass("d-none")
    editDetailsBtn.removeClass("d-none");
    

})

/**
* Loads the information from the UserInformation object into the fields
* @function loadInformation
*/
function loadInformation(){

    if (!userInformation) return;

    personalInfoFields.each(function(){
        let field = $(this).data("field");

        if (userInformation[field] !== undefined){
            $(this).val(userInformation[field]);
        }
    })

    fullNameDisplay.text(`${userInformation.Fname} ${userInformation.Lname}`)
}

/**
 * Asynchronously sends off the new user information to the server
 * and then reloads the UI to reflect new user information
 * @async
 * @function updateUserInformation
 * @throws {Error} Throws an error if the HTTP response status is not OK.
 */
async function updateUserInformation(){
     var updatedInformation = {
            Fname: FnameField.val().trim(),
            Lname: LnameField.val().trim(),
            MI: MIField.val().trim(),
            sex: sexField.val(),
            MobileNum: mobileNumField.val().trim(),
            DOB: DOBField.val().trim(),
            nationality: nationalityField.val().trim(),
            email: emailField.val().trim()
        };

    try{

        let response = await fetch(application/json, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(updatedInformation) 
        });

        if (!response.ok) {
            throw new Error(`error status: ${response.status}`);
        }

        loadInformation();
    }catch (error) {
        console.error("there was an error updating your information: ", error);
    }


    
}




//===SAVED PASSENGERS SECTION=======

const addPassengerBtn = $(".add-passenger");
const passengerForm= $("#passengers-form");
const passengerFormFields = $("#passengers-form input, #passengers-form select");
const hiddenPassengerID = $("#edit-passenger-id");
const formModal = $("#passenger-modal");
const deleteConfirmationModal = $("#confirm-remove")
const confirmDeleteBtn = $("#confirm-delete-btn");

const passengerList = $("#saved-passengers-list");
const toSavedPassengerPane = $("#pane-passengers-tab");
var passengerToDelete = null;

toSavedPassengerPane.on("click", ()=>{
    loadSavedPassengers();
})

passengerList.on("click", ".edit-passenger-btn", function(){
    var passengerID = $(this).data("id");
    hiddenPassengerID.val(passengerID);
    editPassengerInfo(passengerID)

    bootstrap.Modal.getOrCreateInstance(formModal[0]).show();

})


passengerList.on("click", ".remove-passenger-btn", function(){
    passengerToDelete = $(this).data("id");
    whatToDelete = "PASSENGER";
    bootstrap.Modal.getOrCreateInstance(deleteConfirmationModal[0]).show();
})


confirmDeleteBtn.on("click", () =>{
    if (!passengerToDelete){
        showAlert("Could not find passenger to delete", "danger");
    }

    if(whatToDelete === "PASSENGER"){
        console.log("DELETING: ", passengerToDelete);
        removePassenger(passengerToDelete);
        passengerToDelete = null;
        whatToDelete = ""
    }else if (whatToDelete == "CARD"){
        removePaymentMethod(cardToDelete)
    }
    
    bootstrap.Modal.getInstance(deleteConfirmationModal[0]).hide();
})





passengerForm.on("submit", (event)=>{
    event.preventDefault();

    submitPassengerInfo();

    bootstrap.Modal.getInstance(formModal[0]).hide();

    passengerForm[0].reset();
    hiddenPassengerID.val("");//resets hidden val

})


/**
 * Asynchronously fetches saved passengers from the server and renders them 
 * into the passenger list container.
 * * If no passengers are found, a placeholder message is displayed.
 * * If the fetch request fails, an error message is printed to the console 
 * an error state is displayed in the UI.
 * @async
 * @function loadSavedPassengers
 * @throws {Error} Throws an error if the HTTP response status is not OK.
 */
async function loadSavedPassengers() {
    passengerList.empty();

    try {
        
        let response = await fetch("/saved-passengers");
        
        
        if (!response.ok) {
            throw new Error(`HTTP error status: ${response.status}`);
        }

        
        let savedPassengersArray = await response.json();

        
        if (!savedPassengersArray || savedPassengersArray.length === 0) {
            passengerList.append('<p class="text-secondary text-center py-3">you have no saved passengers.</p>');
            return;
        }

        let list = "";

        
        savedPassengersArray.forEach(passenger => {
            list += `
            <div class="list-group-item d-flex flex-column flex-md-row justify-content-md-between align-items-start align-items-md-center px-0 py-3 border-bottom passenger-item" id="passenger-${passenger._id}">
                <div class="mb-2 mb-md-0">
                    <h6 class="passenger-name fw-bold text-dark mb-0">${passenger.Lname}, ${passenger.Fname} ${passenger.MI}.</h6>
                    <small class="passenger-info text-secondary">${passenger.ageClass} | ${passenger.sex} | ${passenger.DOB} | ${passenger.emailAddress} | +63 ${passenger.mobileNum}</small>
                </div>
                <div class="modify-buttons d-flex gap-3 align-items-center">
                    <button type="button" class="btn btn-link link-info text-decoration-none btn-sm fw-bold p-0 edit-passenger-btn" data-id="${passenger._id}">Edit</button>
                    <button type="button" class="btn btn-link link-danger text-decoration-none btn-sm fw-bold p-0 remove-passenger-btn" data-id="${passenger._id}" data-bs-toggle="modal" data-bs-target="#confirm-remove">Remove</button>
                </div>
            </div>
            `;
        });

        passengerList.append(list);

    } catch (error) {
        
        console.error("Error encountered while loading passengers", error);
        passengerList.append('<p class="text-danger text-center py-3">Error loading saved passengers. Please refresh.</p>');
    }
}


/**
 * Asynchronously submits passenger information to the server.
 * * This function retrieves passenger form data from the UI, determines whether
 * to perform a create (POST) or update (PUT) operation based on the presence of 
 * an edit ID, sends the request, and reloads the passenger list upon success
 * @async
 * @function submitPassengerInfo
 * @throws {Error} Throws an error if the HTTP request fails.
 */
async function submitPassengerInfo() {
    
    const editId = $("#edit-passenger-id").val();

    const Fname = $("#passenger-Fname").val();
    const Lname = $("#passenger-Lname").val();
    const MI = $("#passenger-MI").val();
    const ageClass = $("#passenger-age").val();
    const sex = $("#passenger-sex").val();
    const DOB = $("#passenger-DOB").val();
    const nationality = $("#passenger-nationality").val();
    var mobileNum = $("#passenger-mobile-number").val().toString();
    const email = $("#passenger-email").val();

    // remove leading 0s if ever user puts a 0
    if (mobileNum.startsWith("0")) {
        mobileNum = mobileNum.slice(1);
    }

    console.log("edit id:", editId);

    const passengerData = {
        Fname: Fname,
        Lname: Lname,
        MI: MI,
        DOB: DOB,
        sex: sex,
        ageClass: ageClass,
        nationality: nationality,
        mobileNum: mobileNum,
        emailAddress: email
    };

    // determine url and method dynamically based on edit state
    var url = editId ? `/saved-passengers/update/${editId}` : `/saved-passengers/add`;
    var method = editId ? "PUT" : "POST";

    try {
        let response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(passengerData) 
        });

       
        if (!response.ok) {
            throw new Error(`error status: ${response.status}`);
        }

        
        
        
        if (editId) {
            console.log("successfully updated passenger");
        } else {
            console.log("successfully added passenger");
        }

        // Reload the UI list
        loadSavedPassengers();

    } catch (error) {
        console.error("there was an error processing the passengers", error);
    }
}

/**
 * Asynchronously fetches a specific passenger's details by ID from the server
 * and populates the corresponding form fields for editing.
 * @async
 * @function editPassengerInfo
 * @param {string|number} ID - The ID of the passenger to be edited.
 * @throws {Error} Throws an error if the HTTP response status is not OK.
 */
async function editPassengerInfo(ID) {
    try {
        // fetch the target passenger profile from the server
        let response = await fetch(`/saved-passengers/edit/${ID}`);

        if (!response.ok) {
            throw new Error(`error status: ${response.status}`);
        }

        let passenger = await response.json();

        if (!passenger) {
            console.log("Passenger details could not be found.");
            return;
        }

        passengerFormFields.each(function() {
            let field = $(this).data("field");

            if (passenger[field] !== undefined) {
                $(this).val(passenger[field]);
            }
        });

    } catch (error) {
        console.log("Error communicating with the database.");
        console.error(error);
    }
}


/**
 * Asynchronously deletes a specific passenger by ID from the server.
 * * This function sends a DELETE request to the backend. Upon a successful response,
 * it logs the success and triggers a reload of the UI passenger list.
 * @async
 * @function removePassenger
 * @param {string|number} ID - The ID of the passenger to be removed.
 * @throws {Error} Throws an error if the HTTP response status is not OK.
 */
async function removePassenger(ID) {
    try {
        let response = await fetch(`/saved-passengers/delete/${ID}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error(`error status: ${response.status}`);
        }
        
        console.log("Passenger removed successfully.");
        loadSavedPassengers();

    } catch (error) {
        console.log("failed to remove passenger from database.");
        console.error(error);
    }
}

//=====PAYMENT METHOD SECTION===============

const paymentModal = $("#addPaymentModal");
const savePaymentBtn = $("#save-payment-btn");
const paymentForm = $("#payment-form");
const cardContainer = $("#payment-methods-grid");
const cardColumn = $(".dynamic-card-col")
const paymentTab = $("#pane-payment-tab");
const addPaymentContainer = $("#add-payment-container");

var cardToDelete = "";
var savedPayments = null; 
paymentTab.on("click", ()=>{
    console.log("to payments method")
    loadCards();
})


paymentForm.on("submit", (event)=>{

    event.preventDefault();

    var cardHolder = $("#card-name").val().trim();
    var cardNumber =$("#card-number").val().replace(/\s/g, '')
    var expDate = $("#card-expiry").val()
    var cvv = $("#card-cvv").val();

    addCard(cardHolder,cardNumber,expDate,cvv);

    paymentForm[0].reset();
    bootstrap.Modal.getInstance(paymentModal[0]).hide();

})

cardContainer.on("click", ".remove-card-btn", function(){
    var cardID = $(this).data("id");

    console.log(cardID);
    cardToDelete = cardID;
    whatToDelete = "CARD";

    bootstrap.Modal.getOrCreateInstance(deleteConfirmationModal[0]).show();
})

/**
 * Asynchronously fetches the user's saved payment methods from the server, 
 * determines their network styling, and renders them dynamically in a grid.
 * manages the "Add Card" button visibility, and injects stylized card components 
 * (Visa, Mastercard, or generic) into the card container.
 * @async
 * @function loadCards
 * @throws {Error} Throws an error if the HTTP response status is not OK.
 */
async function loadCards() {
    $("#payment-methods-grid .dynamic-card-col").remove(); 
    
    
    try {
        
        let response = await fetch("/paymentMethods");

        
        if (!response.ok) {
            throw new Error(`error status: ${response.status}`);
        }

        let savedPaymentMethods = await response.json();

        
        checkAddCardButtonVisibility(savedPaymentMethods);
        
        // if no cards are loaded, stop executing here
        if (!savedPaymentMethods || savedPaymentMethods.length === 0) {
            return;
        }
        
        let list = "";

        
        savedPaymentMethods.forEach(card => {
            let lastfourDigits = card.cardNumber.slice(-4);
            let bg = "secondary"; 

            if (card.network === "Visa") {
                bg = "primary";
            } else if (card.network === "Mastercard") {
                bg = "dark";
            }
            
            list += `
            <div class="col-md-4 col-sm-6 dynamic-card-col">
                <div class="card p-3 rounded-3 h-100 bg-${bg} text-white">
                    <div class="card-body d-flex flex-column justify-content-between">
                        <h5 class="card-title">•••• •••• •••• ${lastfourDigits} ${card.network}</h5>
                        <div class="d-flex justify-content-between align-items-center mt-4">
                            <small>${card.cardHolder}</small>
                            <small>${card.expDate}</small>
                        </div>
                    </div>

                    <button class="btn btn-sm btn-danger remove-card-btn w-50 mt-2" data-id="${card._id}">Remove</button>
                </div>
            </div>`;
        });

        console.log("Cards loaded!");
        cardContainer.prepend(list);

    } catch (error) {
        console.error("error encountered while loading payment methods:", error);
        cardContainer.append('<p class="text-danger text-center py-3">Error loading saved credit cards. Please refresh.</p>');
    }
}


/**
 * Asynchronously fetches the user's saved payment methods from the server, 
 * determines their network styling, and renders them dynamically in a grid.
 * manages the "Add Card" button visibility, and injects stylized card components 
 * (Visa, Mastercard, or generic) into the card container.
 * @async
 * @function addCard
 * @param {cardHolder|String} cardHolder - the name of the card holder
 * @param {cardNumber|Number} cardNumber - the card number
 * @param {expDate|String} expDate - the expiry date of the card
 * @param {cvv|String} cvv - the cvv of the card
 * @throws {Error} Throws an error if the HTTP response status is not OK.
 */
async function addCard(cardHolder, cardNumber, expDate, cvv){

    var storedCardNumber = cardNumber.toString();
    var network = "";


    if(storedCardNumber.startsWith("4")){
        network =  "Visa";
    }else if (storedCardNumber.startsWith("5")){
        network = "Mastercard";
    }
    var newCard = {
        
        cardHolder: cardHolder,
        expDate: expDate,
        cvv: cvv,
        cardNumber: storedCardNumber,
        network: network, 
    }

    
    try{
        let response = await fetch("/add-payment",{
            method: "POST",
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify(newCard)
        });

        if (!response.ok) {
            throw new Error(`error status: ${response.status}`);
        }

        loadCards();
    }catch(error){
        console.error("there was an error adding payment method")
    }
}


/**
 * Asynchronously deletes a card payment method from the server, 
 * Sends a DELETE request to the server containing the ID of the card to be deleted
 * @async
 * @function removePaymentMethod
 * @param {ID|String} ID - the ID of the card
 * @throws {Error} Throws an error if the HTTP response status is not OK.
 */
async function removePaymentMethod(ID) {
    if (!ID) {
        console.error("Cannot delete card, card doesn't exist");
        return;
    }

    try {
        let response = await fetch(`/delete-payment/${ID}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error(`error status: ${response.status}`);
        }

        
        const data = await response.json();
        console.log("Card deleted successfully from server:", data);

        // Reload the UI
        loadCards();
    } catch (error) {
        console.log("failed to delete card from server");
        console.error(error);
    }
}

/**
 * Checks if the amount of cards is equal to the limit of cards (3) 
 * * if the number of cards the user has inputted is equal to the limit
 * * the button to add more cards is hidden
 * @async
 * @function checkAddCardButtonVisibility
 * @param {ID|String} ID - the ID of the card
 * @throws {Error} Throws an error if the HTTP response status is not OK.
 */
function checkAddCardButtonVisibility(cards) {
   
    const activeCards = cards; 
    
    console.log("Checking visibility for card count:", activeCards.length);

    
    if (activeCards.length >= 3) {
        addPaymentContainer.hide();
    } else {
        addPaymentContainer.show();  
    }
}


const accordionContainer = $(".accordion");
const toTravelHistory = $("#pane-history-tab");


toTravelHistory.on("click", () =>{
    loadTravelHistory();
})


/**
 * Asynchronously fetches the travel history of the user
 * * Once fetched, it will load the travel history into accordions.
 * * If the user has no travel history, a message will display that they have no travel history
 * @async
 * @function loadTravelHistory
 * @throws {Error} Throws an error if the HTTP response status is not OK.
 */
async function loadTravelHistory(){
    accordionContainer.empty();

    try{

        let response = await fetch("/travel-history");
        
        if (!response.ok) {
            throw new Error(`error status: ${response.status}`);
        }

        let list = "";

        let travelHistory = await response.json();

        if (!travelHistory || travelHistory.length === 0) {
            accordionContainer.append('<p class="text-muted text-center py-4">No historical travel records found.</p>');
            return;
        } 

        travelHistory.forEach(history =>{
            var date = convertDateToWords(history.date)
        

            list += `
            <div class="accordion-item border-bottom">
            <h2 class="accordion-header">
                <button class="accordion-button collapsed fw-bold text-dark px-0" data-bs-toggle="collapse" data-bs-target="#collapse-${history.bookingRef}" aria-expanded="false">
                    ${history.origin} to ${history.destination} (${date}) 
                </button>
            </h2>
            <div id="collapse-${history.bookingRef}" class="accordion-collapse collapse" data-bs-parent="#travelHistory">
                <div class="accordion-body px-0 text-secondary">
                    <div class="row g-2 mb-2 small">
                        <div class="col-6 col-sm-4">Flight ID: ${history.flightID}</div>
                        <div class="col-6 col-sm-4">Cabin Seat: ${history.seat} (${history.cabinType})</div>
                        <div class="col-12 col-sm-4">Booking Reference: ${history.bookingRef}</div>
                    </div>
                    <div class="bg-light p-2 rounded small text-muted">
                        Ticket Invoice Total: PHP ${history.price.toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
        `;
    });

        accordionContainer.append(list);


    }catch(error){
        console.error("there was an error getting your travel history");
            accordionContainer.append('<p class="text-danger text-center py-3">Error loading your travel history. Please refresh.</p>');
    }

}




$("#flightStatusSwitch, #marketingSwitch").on("change",function(){

    //get the state if true or false
    var isChecked = $(this).is(":checked");
    var switchId = $(this).attr("id");

    var updateData = {};
    if (switchId === "flightStatusSwitch") {
        updateData.flightStatusNotification = isChecked;
    } else if (switchId === "marketingSwitch") {
        updateData.marketingNotification = isChecked;
    }

    $.ajax({
        url: "/update-preferences",
        method: "PATCH",
        data: JSON.stringify(updateData),
        contentType: "application/json",
        success: function(response) {
            console.log("Preferences successfully synced with database!");
        },
        error: function(xhr) {
            console.error("Failed to update user preferences on server:", xhr);
            //revert back if changed failed
            $(this).prop("checked", !isChecked);
        }
    });
})






