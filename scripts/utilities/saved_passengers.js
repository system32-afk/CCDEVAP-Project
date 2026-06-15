var savedPassengers = [

    {
        id: 1,
        Fname: "Saimon",
        Lname: "Lumod",
        MI: "M",
        DOB: "08/11/2006",
        sex: "Male",
        ageClass: "Infant"
    },

    {
        id: 2,
        Fname: "Raphael Gabriel",
        Lname: "League",
        MI: "S",
        DOB: "04/11/2006",
        sex: "Male",
        ageClass: "Adult"
    },

    {
        id: 3,
        Fname: "Dominik",
        Lname: "Carreon",
        MI: "V",
        DOB: "08/01/2005",
        sex: "Male",
        ageClass: "Adult"
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
    var passengerList = getSavedPassengers();

    passengerList.forEach(passenger =>{
        list += `
        <div class="list-group-item d-flex flex-column flex-md-row justify-content-md-between align-items-start align-items-md-center px-0 py-3 border-bottom">
            
            <div class="mb-2 mb-md-0">
                <h6 class="passenger-name fw-bold text-dark mb-0">${passenger.Lname}, ${passenger.Fname} ${passenger.MI}.</h6>
                <small class="passenger-info text-secondary">${passenger.ageClass} | ${passenger.sex} | ${passenger.DOB}</small>
            </div>
            <div class="modify-buttons d-flex gap-3 align-items-center">
                <button type="button" class="btn btn-link link-info text-decoration-none btn-sm fw-bold p-0">Edit</button>
                <button type="button" class="btn btn-link link-danger text-decoration-none btn-sm fw-bold p-0">Remove</button>
            </div>
        </div>
        `
    });

    passengerListContainer.append(list);

}