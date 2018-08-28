$(function() {
  var client = ZAFClient.init();
  client.invoke('resize', { width: '100%', height: '200px' });
});

$(function () {
  $("#start_date").datepicker({ 
        autoclose: true, 
        todayHighlight: true
  }).datepicker('update', new Date());
});

$(function () {
  $("#end_date").datepicker({ 
        autoclose: true, 
        todayHighlight: true
  }).datepicker('update', new Date());
});


$("#refund").click(function() {
    var membership = $("#sel1").val();
  var first = $("#start_date").data("datepicker").getFormattedDate('mm-dd-yyyy');
  var second = $("#end_date").data("datepicker").getFormattedDate('mm-dd-yyyy');

// new Date("dateString") is browser-dependent and discouraged, so we'll write
// a simple parse function for U.S. date format (which does no error checking)
function parseDate(str) {
    var mdy = str.split('-');
    return new Date(mdy[2], mdy[0]-1, mdy[1]);
}

function datediff(first, second) {
    // Take the difference between the dates and divide by milliseconds per day.
    // Round to nearest whole number to deal with DST.
    return Math.round((second-first)/(1000*60*60*24));
}

$("#result").val( '$' + (((datediff(parseDate(first), parseDate(second)))/365) * membership ).toFixed(2));

});