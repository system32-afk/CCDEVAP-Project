// Automatically format YYYY/MM/DD and block letters
$("#DOB-field, #passenger-DOB").on("input", function() {
    
    let value = $(this).val().replace(/\D/g, "");
    
    
    if (value.length > 8) {
        value = value.slice(0, 8);
    }
    
    
    let formattedValue = "";
    if (value.length > 0) {
        formattedValue += value.substring(0, 4); // Year
    }
    if (value.length >= 5) {
        formattedValue += "/" + value.substring(4, 6); // Month
    }
    if (value.length >= 7) {
        formattedValue += "/" + value.substring(6, 8); // Day
    }
    
    
    $(this).val(formattedValue);
});

$("#DOB-field, #passenger-DOB").on("keydown", function(e) {
    const value = $(this).val();
    
    if (e.which === 8 && (value.length === 5 || value.length === 8)) {
        $(this).val(value.substring(0, value.length - 1));
    }
});