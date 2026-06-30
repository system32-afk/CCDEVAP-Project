var savedPaymentMethods = [
    {
        id: 1,
        cardHolder: "Juan Dela Cruz",
        expDate: "2/31",
        cvv: "111",
        cardNumber: "4123456789098765432",
        network: "Mastercard",
    }

]

function getSavedPayment(){
    return savedPaymentMethods;
}

function loadCards (){
    $("#payment-methods-grid .dynamic-card-col").remove(); //removes only the cards not the button
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
}


function addCard(cardHolder, cardNumber, expDate, cvv){

    var storedCardNumber = cardNumber.toString();
    var network = "";
    if(storedCardNumber.startsWith("4")){
        network =  "Visa";
    }else if (storedCardNumber.startsWith("5")){
        network = "Mastercard";
    }

    var newCard = {
        id: Date.now(),
        cardHolder: cardHolder,
        expDate: expDate,
        cvv: cvv,
        cardNumber: storedCardNumber,
        network: network, 
    }

    savedPaymentMethods.push(newCard);
    console.log(savedPaymentMethods)
}

function removePaymentMethod(ID){
    var index = savedPaymentMethods.findIndex(card => card.id == ID);

    console.log("Card ID to be deleted", ID);
    savedPaymentMethods.splice(index,1); //removes card

    loadCards();
    checkAddCardButtonVisibility()
}