
//direct flights section================================
const directFlights = $("#direct-flight-checkbox");

directFlights.on("change", function(){
    var value = this.checked;
    filter_options.isDirectFlight = value
    console.log(value);
});


//flexible dates section================================
const flexibleDates = $("#flexible-dates-checkbox");

flexibleDates.on("change", function(){
    
    var value = this.checked; 
    filter_options.isFlexible = value;

    console.log(value);
});

//price range option section================================
const progress = $(".slider-progress");
const minPriceInput = $(".min-price");
const maxPriceInput = $(".max-price");

// Sliders (handles)
const minInput = $(".min-input");
const maxInput = $(".max-input");

function getPrices(){
    return {
        minPrice: Number(minInput.val()),
        maxPrice: Number(maxInput.val()),
    };
}

$(function () {
    updateProgress();
});

const updateProgress = () => {
    var { minPrice, maxPrice } = getPrices();
    var minAttr = Number(minInput.attr("min"));
    var maxAttr = Number(maxInput.attr("max"));
    var range = maxAttr - minAttr;

    
    var leftPercent = ((minPrice - minAttr) / range) * 100;
    var rightPercent = 100 - ((maxPrice - minAttr) / range) * 100;

    progress.css("left", leftPercent + "%");
    progress.css("right", rightPercent + "%");
};

minInput.on("input", function () {
    var { minPrice, maxPrice } = getPrices();

    if (minPrice >= maxPrice) {
        maxInput.val(minInput.val());
        maxPriceInput.val(minInput.val());
    }
    minPriceInput.val(minInput.val());
    minPriceInput.val(minInput.val());
    filter_options.minPrice = Number(minInput.val());
    updateProgress();
});

maxInput.on("input", function () {
    var { minPrice, maxPrice } = getPrices();
    if (maxPrice <= minPrice) {
        minInput.val(maxInput.val());
        minPriceInput.val(maxInput.val());
    }
    maxPriceInput.val(maxInput.val());
    filter_options.maxPrice = Number(maxInput.val());
    updateProgress();
});

// Typing into number fields updates slider handles
minPriceInput.on("change", function(){
    minInput.val($(this).val());
    updateProgress();
});

maxPriceInput.on("change", function(){
    var inputVal = Number($(this).val());

    maxInput.val(inputVal);
    maxInput.trigger('input');
    minInput.attr("max", inputVal); //changes the max value of min input text field
    maxInput.attr("max", inputVal);//changes the max value of max input text field
    updateProgress();
});




const applyFilter = $("#apply-filter");

applyFilter.on("click", () =>{
    SearchFlight()
}); 