/* global $,  ZAFClient */

var client = ZAFClient.init()

client.invoke('resize', { width: '100%', height: '300px' })

function getData(Url) {
  return $.ajax({
    url: Url,
    type: "GET",
    headers: {
      Authorization: "Bearer sk_test_Op7lb2k7gDf4C2fxSq3KjVxm"
    }
  });
}

function insertDecimal(num) {
  return (num / 100).toFixed(2);
}

function doRefund(chargeToRefund) {
  $.ajax({
    url: "https://api.stripe.com/v1/refunds",
    type: "POST",
    headers: {
      Authorization: "Bearer sk_test_Op7lb2k7gDf4C2fxSq3KjVxm"
    },
    data: {
      charge: chargeToRefund,
      amount: amountToRefund
    },
    success: function(response) {
      console.log(response);
    }
  });
}

$(document).ready(function() {
  $(".btn").click(function() {
    var $this = $(this);
    $this.button("loading");
    $("#sub-results").empty();
    const subscriptionID = $("#subscriptionID").val();
    const subUrl =
      "https://api.stripe.com/v1/invoices?subscription=" + subscriptionID;

    getData(subUrl).done(function(result) {
      $this.button("reset");
      $("#sub-results").append(
        '<div id="charges-list" class="accordion"></div>'
      );
      const subscriptionData = result.data;
      for (let id in subscriptionData) {
        const chargeID = subscriptionData[id].charge;
        const chargeURL = "https://api.stripe.com/v1/charges/" + chargeID;
        getData(chargeURL).done(function(chargesData) {
          const chargeAmount = "$" + insertDecimal(chargesData.amount);
          const amountRemaining = insertDecimal(
            chargesData.amount - chargesData.amount_refunded
          );
          const chargeDate = new Date((chargesData.created) * 1000).toLocaleDateString();
          $("#charges-list").append(
            '<div class="panel-group" id="accordion"><div class="panel panel-default"><div class="charge-header panel-heading"><h4 class="panel-title"><a data-toggle="collapse" data-parent="#accordion" href="#' +
              chargeID +
              '"><table><tr><td class="charge-amount">' +
              chargeAmount +
              '</td><td class="charge-date">' +
              chargeDate +
              '</td></tr></table></a></h4></div><div class="charge-detail collapse panel-collapse" id="' +
              chargeID +
              '"><div class="panel-body"><form class="form-inline"><div class="form-group mb-2"><div class="input-group"><span class="input-group-addon">$</span><input type="text" aria-describedby="basic-addon1" class="form-control" aria-label="Refund amount" value="' +
              amountRemaining +
              '"><span class="input-group-btn"><button id="btnFA" class="btn btn-warning"><i class="fas fa-calculator"></i></button><button type="submit" class="refund-btn btn btn-primary mb-2"id="refund-btn-' +
              chargeID +
              '">Refund</button></span></div></div></form></div></div></div></div>'
          );
          $("#refund-btn-" + chargeID).on("click", function() {
            const chargeToRefund = $(this)
              .parents(".input-group")
              .find("input-group")
              .id();
            const amountToRefund = $(this)
              .parents(".input-group")
              .find("input")
              .val();
            console.log(chargeToRefund, amountToRefund);
          });
        });
      }
    });
  });
});












