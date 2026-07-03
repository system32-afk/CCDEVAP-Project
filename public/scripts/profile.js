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

function updateUserInformation(){
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
    $.ajax({
        url:"/profile/update",
        method:"PUT",
        contentType: "application/json",
        data: JSON.stringify(updatedInformation),
        success: function(response){
            fullNameDisplay.text(`${userInformation.Fname} ${userInformation.Lname}`);

            userInformation = {...updatedInformation};
            informationSnapshot = {...updatedInformation}
            loadInformation();
        },
        error: function(xhr){
            console.error(xhr);
        }
        
    })
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

function loadSavedPassengers(){
    passengerList.empty();


    $.ajax({
        url: "/saved-passengers",
        method:"GET",
        success: function(savedPassengersArray){
            if (!savedPassengersArray || savedPassengersArray.length === 0){
                passengerList.append('<p class="text-secondary text-center py-3">you have no saved passengers.</p>');
                return;
            }

            var list = "";

            savedPassengersArray.forEach(passenger =>{
                list += `
                <div class="list-group-item d-flex flex-column flex-md-row justify-content-md-between align-items-start align-items-md-center px-0 py-3 border-bottom passenger-item" id = "passenger-${passenger._id}">
                    
                    <div class="mb-2 mb-md-0">
                        <h6 class="passenger-name fw-bold text-dark mb-0">${passenger.Lname}, ${passenger.Fname} ${passenger.MI}.</h6>
                        <small class="passenger-info text-secondary">${passenger.ageClass} | ${passenger.sex} | ${passenger.DOB} | ${passenger.emailAddress} | +63 ${passenger.mobileNum}</small>
                    </div>
                    <div class="modify-buttons d-flex gap-3 align-items-center">
                        <button type="button" class="btn btn-link link-info text-decoration-none btn-sm fw-bold p-0 edit-passenger-btn" data-id="${passenger._id}">Edit</button>
                        <button type="button" class="btn btn-link link-danger text-decoration-none btn-sm fw-bold p-0 remove-passenger-btn" data-id="${passenger._id}" data-bs-toggle="modal" data-bs-target="#confirm-remove">Remove</button>
                    </div>
                </div>
                `
            });
            passengerList.append(list);
        },
        error: function(xhr){
            console.error("Error encounted while loading passengers", xhr);
            passengerList.append('<p class="text-danger text-center py-3">Error loading saved passengers. Please refresh.</p>');
        }
    })

}

function submitPassengerInfo(){
    
    var editId =  $("#edit-passenger-id").val();

    var Fname = $("#passenger-Fname").val();
    var Lname = $("#passenger-Lname").val();
    var MI = $("#passenger-MI").val();
    var ageClass = $("#passenger-age").val();
    var sex = $("#passenger-sex").val();
    var DOB = $("#passenger-DOB").val();
    var nationality = $("#passenger-nationality").val();
    var mobileNum = $("#passenger-mobile-number").val().toString();
    var email = $("#passenger-email").val();

    //remove leading 0s if ever user puts a 0
    if (mobileNum.startsWith("0")){
        mobileNum = mobileNum.slice(1);
    }

    console.log("edit id:",editId);

    var passengerData = {
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

    //if form is in edit mode
    if (editId){
        $.ajax({
            url: `/saved-passengers/update/${editId}`,
            method:"PUT",
            data: passengerData,
            success: function(response){
                loadSavedPassengers()
            },
            error:function(xhr){
                console.log("there was an error updating passenger details",xhr);
            }
        })
       
    }
    //form is in add passenger mode
    else{
        $.ajax({
            url: `/saved-passengers/add`,
            method:"POST",
            data: passengerData,
            success: function(response){
                console.log("successfully added passenger");
                loadSavedPassengers();
            },
            error:function(xhr){
                console.log("there was an error adding passenger",xhr);
            }
        })
}
}

function editPassengerInfo(ID) {
    // Fetch the target passenger profile from the server
    $.ajax({
        url: `/saved-passengers/edit/${ID}`,
        method: "GET",
        success: function(passenger) {
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
        },
        error: function(xhr) {
            console.log("Error communicating with the database.");
            console.error(xhr);
        }
    });
}

function removePassenger(ID) {
    $.ajax({
        url: `/saved-passengers/delete/${ID}`,
        method: "DELETE",
        success: function(response) {
            console.log("Passenger removed successfully.");
            loadSavedPassengers();
        },
        error: function(xhr) {
            console.log("Failed to remove passenger from database.");
            console.error(xhr);
        }
    });
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

    loadCards();
    checkAddCardButtonVisibility()

})

cardContainer.on("click", ".remove-card-btn", function(){
    var cardID = $(this).data("id");

    console.log(cardID);
    cardToDelete = cardID;
    whatToDelete = "CARD";

    bootstrap.Modal.getOrCreateInstance(deleteConfirmationModal[0]).show();
})

function loadCards (){
    $("#payment-methods-grid .dynamic-card-col").remove(); //removes only the cards not the button
    
     $.ajax({
        url: "/paymentMethods",
        method:"GET",
        success: function(savedPaymentMethods){
            if (!savedPaymentMethods || savedPaymentMethods.length === 0){
                return;
            }

            var list = "";

            savedPaymentMethods.forEach(card =>{

            
                let lastfourDigits = card.cardNumber.slice(-4);
                let bg = ""

                if(card.network === "Visa"){
                    bg = "primary";
                }else if (card.network === "Mastercard"){
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
                            <button class="btn btn-sm btn-danger remove-card-btn w-30" data-id="${card.id}">Remove</button>
                        </div>
                    </div>
                
                
                
                `
            })

            cardContainer.prepend(list);
        },
        error: function(xhr){
            console.error("Error encounted while loading passengers", xhr);
            passengerList.append('<p class="text-danger text-center py-3">Error loading saved passengers. Please refresh.</p>');
        }
    })

}



function checkAddCardButtonVisibility(){
    var savedPaymentCount = savedPayments.length;

    if (savedPaymentCount >= 2){
        addPaymentContainer.addClass("d-none")
    }else if (savedPaymentCount < 2){
         addPaymentContainer.removeClass("d-none")
    }
}









