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



var whatToDelete = "" //GLOBAL (file scope) VAR TO REUSE CONFIRM DELETE MODAL
$(document).ready(function() {
    
    userInformation = getPersonalInfo();
    loadInformation();
    savedPayments = getSavedPayment();
    
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
    personalInfoFields.removeAttr("disabled");
    editDetailsBtn.addClass("d-none");
    buttonsContainer.removeClass("d-none");
   uploadBtn.removeClass("d-none");
})


cancelChanges.on("click", ()=>{
    personalInfoFields.attr("disabled",true);
   
    buttonsContainer.addClass("d-none")
    editDetailsBtn.removeClass("d-none");
    uploadBtn.addClass("d-none");

    loadInformation(); // reset forms
})


saveChanges.on("click", ()=>{
    updateUserInformation();

    personalInfoFields.attr("disabled",true);
    uploadBtn.addClass("d-none");
    
    buttonsContainer.addClass("d-none")
    editDetailsBtn.removeClass("d-none");

    loadInformation();
})





//===SAVED PASSENGERS SECTION=======

const addPassengerBtn = $(".add-passenger");
const passengerForm= $("#passengers-form");
const passengerFormFields = $("#passengers-form input, #passengers-form select");
const hiddenPassengerID = $("#edit-passenger-id");
const formModal = $("#passenger-modal");
const deleteConfirmationModal = $("#confirm-remove")
const confirmDeleteBtn = $("#confirm-delete-btn");

const passengerList = $("#saved-passengers-list");
var passengerToDelete = null;

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




function checkAddCardButtonVisibility(){
    var savedPaymentCount = savedPayments.length;

    if (savedPaymentCount >= 2){
        addPaymentContainer.addClass("d-none")
    }else if (savedPaymentCount < 2){
         addPaymentContainer.removeClass("d-none")
    }
}









