/* global $,  ZAFClient */

var client = ZAFClient.init()

client.invoke('resize', { width: '100%', height: '300px' })

function getData(Url) {
  return $.ajax({
    url: Url,
    type: "GET",
    headers: {
      Authorization: "Bearer sk_test_Op7lb2k7gDf4C2fxSq3KjVxm"
    },
  });
}

  $(document).ready(function() {
    $(".btn").click(function() {
      var $this = $(this);
      $this.button("loading");
      $("#sub_results").empty();
      const subscriptionID = $("#subscriptionID").val();
      const subUrl =
            "https://api.stripe.com/v1/invoices?subscription=" + subscriptionID;

      getData(subUrl).done(function(result) {
        $this.button("reset");
        $("#sub_results").append('<div id="invoices"></div>');
        var subscriptionData = result.data;
        var id;
        for (id in subscriptionData) {
          const chargeID = subscriptionData[id].charge;

          $("#invoices").append(
            '<button class="btn btn-outline-info" data-toggle="collapse" data-target="#' +
            chargeID +
            '">' +
            chargeID +
            '</button><div id="' +
            chargeID +
            '" class="collapse">Lorem ipsum dolor text....</div>'
          );
        }
      });
    });
  });
