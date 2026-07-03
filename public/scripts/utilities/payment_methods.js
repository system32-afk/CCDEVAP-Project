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