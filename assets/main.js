/* global $,  ZAFClient */

var client = ZAFClient.init()

client.invoke('resize', { width: '100%', height: '300px' })

$(document).ready(function() {
  $(".btn").click(function() {
    var $this = $(this);
    $this.button('loading');
    $("#sub_results").empty(
      );
    const subscription = $("#subscriptionID").val();
    const Url =
      "https://api.stripe.com/v1/invoices?subscription=" + subscription;
    $.ajax({
      url: Url,
      type: "GET",
      headers: {
        Authorization: "Bearer sk_test_Op7lb2k7gDf4C2fxSq3KjVxm"
      },
      success: function(result) {
        $this.button('reset');
        $("#sub_results").append(
          '<div id="invoices"></div>'
          );
        var invoicesList = result.data;
        var invoice;
        for (invoice in invoicesList) {
          var id = invoicesList[invoice].id;
          var date = invoicesList[invoice].date;
          $("#invoices").append(
            '<button class="btn btn-outline-info" data-toggle="collapse" data-target="#' + id + '">' +
              id +
              " " +
              date +
              '</button><div id="' + id + '" class="collapse">Lorem ipsum dolor text....</div>'
          );
        }
      },
      error: function(error) {
        console.log(`Error${error}`);
      }
    });
  });
});



