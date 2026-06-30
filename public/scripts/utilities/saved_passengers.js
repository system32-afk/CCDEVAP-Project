var savedPassengers = [

    {
        id: 1,
        Fname: "Saimon",
        Lname: "Lumod",
        MI: "M",
        DOB: "08/11/2006",
        sex: "Male",
        ageClass: "Infant",
        nationality: "Filipino",
        mobileNum: "1234567890",
        emailAddress: "lumod123@gmail.com"
    },

    {
        id: 2,
        Fname: "Raphael Gabriel",
        Lname: "League",
        MI: "S",
        DOB: "04/11/2006",
        sex: "Male",
        ageClass: "Adult",
        nationality: "Filipino",
        mobileNum: "91234567890",
        emailAddress: "Rapgabriel@gmail.com"
    },

    {
        id: 3,
        Fname: "Dominik",
        Lname: "Carreon",
        MI: "V",
        DOB: "08/01/2005",
        sex: "Male",
        ageClass: "Adult",
        nationality: "Filipino",
        mobileNum: "91234567890",
        emailAddress: "dominikcarreon@gmail.com"
    },


]

const passengerListContainer = $("#saved-passengers-list");
const toSavedPassengerPane = $("#pane-passengers-tab");

toSavedPassengerPane.on("click", ()=>{
    loadSavedPassengers();
})


function getSavedPassengers(){
    return savedPassengers;
}

function loadSavedPassengers(){
    passengerListContainer.empty();

    var list = "";
    

    savedPassengers.forEach(passenger =>{
        list += `
        <div class="list-group-item d-flex flex-column flex-md-row justify-content-md-between align-items-start align-items-md-center px-0 py-3 border-bottom" id = "passenger-list">
            
            <div class="mb-2 mb-md-0">
                <h6 class="passenger-name fw-bold text-dark mb-0">${passenger.Lname}, ${passenger.Fname} ${passenger.MI}.</h6>
                <small class="passenger-info text-secondary">${passenger.ageClass} | ${passenger.sex} | ${passenger.DOB} | ${passenger.emailAddress} | +63 ${passenger.mobileNum}</small>
            </div>
            <div class="modify-buttons d-flex gap-3 align-items-center">
                <button type="button" class="btn btn-link link-info text-decoration-none btn-sm fw-bold p-0 edit-passenger-btn" data-id="${passenger.id}">Edit</button>
                <button type="button" class="btn btn-link link-danger text-decoration-none btn-sm fw-bold p-0 remove-passenger-btn" data-id="${passenger.id}" data-bs-toggle="modal" data-bs-target="#confirm-remove">Remove</button>
            </div>
        </div>
        `
    });

    passengerListContainer.append(list);

}

function submitPassengerInfo(){
    
    var editId = Number( $("#edit-passenger-id").val());

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

    console.log("mobile num: ",mobileNum)
    //if form is in edit mode
    if (editId){
        let index = getPassenger(editId,"index");

        console.log("index: ",index);
        if(index !== -1){
            savedPassengers[index] = {
            id: editId,
            Fname: Fname,
            Lname: Lname,
            MI: MI,
            DOB: DOB,
            sex: sex,
            ageClass: ageClass,
            nationality: nationality,
            mobileNum: mobileNum,
            emailAddress: email
            }
        }else{
            showAlert("Could not retrieve passenger index","danger")
        }
       
    }
    //form is in add passenger mode
    else{
        var newPassenger = {
        id: Date.now(),
        Fname: Fname,
        Lname: Lname,
        MI: MI,
        DOB: DOB,
        sex: sex,
        ageClass: ageClass,
        nationality: nationality,
        mobileNum: mobileNum,
        emailAddress: email
    }
        savedPassengers.push(newPassenger)
    }

    
    console.log(savedPassengers);
    loadSavedPassengers();
}

function getPassenger(ID,mode){

    if(mode === "ID"){
        return savedPassengers.find(passenger => passenger.id == ID);   
    }else if (mode === "index"){
        return savedPassengers.findIndex(passenger => passenger.id == ID); 
    }
}

function editPassengerInfo(ID){

    var passenger = getPassenger(ID,"ID");

    //confirm passnger exists
    if (!passenger){
        showAlert("Error: Error in getting Passenger ID. Passenger may not exist.","danger");
    }

    //puts the ID to the hidden input field to track which passenger we are editing
    hiddenPassengerID.val(passenger.id);

    passengerFormFields.each(function(){
        let field = $(this).data("field");

        if(passenger[field] !== undefined){
            $(this).val(passenger[field]);
        }
    })
}


function removePassenger(ID){
    var index = getPassenger(ID,"index");

    savedPassengers.splice(index,1); //removes passenger

    loadSavedPassengers();
    
}