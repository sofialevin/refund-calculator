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