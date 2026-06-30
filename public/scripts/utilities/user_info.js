var userInformation = {
    Fname: "Juan",
    Lname: "Dela Cruz",
    MI: "P",
    DOB: "24/10/2005",
    mobileNum: "9364663229",
    nationality: "Filipino",
    emailAddress: "juandelacruz@gmail.com",
    sex: "Male"
}

function getPersonalInfo(){
    return userInformation;
}

function loadInformation(){
    personalInfoFields.each(function(){
        let field = $(this).data("field");

        if (userInformation[field] !== undefined){
            $(this).val(userInformation[field]);
        }
    })


    fullNameDisplay.text(`${userInformation.Fname} ${userInformation.Lname}`)
}


function updateUserInformation(){
    personalInfoFields.each(function(){
        let field = $(this).data("field");
        var mobileNum = "";

        if(field){
            let valueToSave = $(this).val();

            if (field === "mobileNum" && valueToSave){
                let mobileNum = valueToSave.toString().trim();

                if(mobileNum.startsWith("0")){
                    mobileNum  = mobileNum.slice(1);
                }

                valueToSave = mobileNum;
            }
            userInformation[field] = valueToSave;
        }
    })

    console.log(userInformation);
}