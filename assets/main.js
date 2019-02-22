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

function doRefund(chargeID, amountToRefund, $this, typeOfRefund) {
  $( ".alert" ).remove();
  $.ajax({
    url: "https://api.stripe.com/v1/refunds",
    type: "POST",
    headers: {
      Authorization: "Bearer sk_test_Op7lb2k7gDf4C2fxSq3KjVxm"
    },
    data: {
      charge: chargeID,
      amount: amountToRefund
    },
    success: function(response) {
      console.log(response);
      $('#accordion-' + chargeID).append(
        '<div class="alert alert-success"><strong>Success!</strong></div>');
      $this.button("reset");
      submitReply(typeOfRefund, amountToRefund);
    },
    error: function(error) {
      $('#accordion-' + chargeID).append(
        '<div class="alert alert-danger"><strong>Error!</strong>' + Error + '</div>');
      $this.button("reset");
    }
  });

}

function submitReply(typeOfRefund, amountToRefund) {
  client.invoke(
      "ticket.comment.appendHtml",
      "<p>Hi {{ticket.requester.first_name}},</p><br><p>I have completed the" + typeOfRefund + "refund in the amount of <b>$" + insertDecimal(parseInt(amountToRefund)) + "</b>. It should fully process in 5-10 business days.</p><br><p>Let us know if you need help with anything else on this request. Have a great week!</p><br><p>Regards,<br>{{current_user.first_name}}</p>"
    );
    client.set(
      "ticket.customField:custom_field_360000188703",
      "category__chore"
    );
    client.set(
      "ticket.customField:custom_field_360000187006",
      "memberships__refunds__partial_refund"
    );
    client.set("ticket.status", "solved");
  }


function showCalculator() {
  if (
    $("#calculatorApp").css("display") === "none" &&
    $("#refundApp").css("display") === "block"
  ) {
    $("#calculatorApp").css("display", "block");
    $("#refundApp").css("display", "none");
  } 
}

function hideCalculator() {
  if (
    $("#calculatorApp").css("display") === "block" &&
    $("#refundApp").css("display") === "none"
    ) {
    $("#calculatorApp").css("display", "none");
    $("#refundApp").css("display", "block");
}
}

function removeDecimalPoint(amountInDollars) {
  let s = amountInDollars + '';
  s =s.replace('.', '');
  s = parseInt(s);
  return s;
}

function disableRefund(chargeID, amountRemaining) {
  if (amountRemaining == 0) {
    $("#refund-btn-" + chargeID).prop("disabled",true);
    $("#input-" + chargeID).prop("disabled",true);
    $("#calculator-btn-" + chargeID).prop("disabled",true);
  }
}

function refundType(amountRemaining, amountToRefund) {
  if (amountRemaining == amountToRefund && amountRemaining != chargeAmount) {
    return " remaining ";
  } else if (
    amountRemaining == amountToRefund && amountRemaining == chargeAmount) {
    return " full ";
  } else if (
    amountRemaining != amountToRefund) {
    return " partial ";
  }
}

$(document).ready(function() {
  $(".search-btn").click(function() {
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
          const amountRefunded = insertDecimal(chargesData.amount_refunded);
          const customerID = chargesData.source.customer;
          const chargeAmount = chargesData.amount;
          const amountRemaining = insertDecimal(
            chargesData.amount - chargesData.amount_refunded
          );
          const customerURL = "https://api.stripe.com/v1/customers/" + customerID;
          const chargeDate = new Date(
            chargesData.created * 1000
          ).toLocaleDateString();

          getData(customerURL).done(function(customerData) {
            const customerEmail = customerData.email;
          $("#charges-list").append(
            '<div class="panel-group" id="accordion"><div class="panel panel-default"><div class="charge-header panel-heading"><h4 class="panel-title"><a data-toggle="collapse" data-parent="#accordion" href="#accordion-' +
              chargeID +
              '"><table style="display:block;"><tbody style="display:block;"><tr style="display:block;"><td class="charge-amount">$' +
              insertDecimal(chargeAmount) +
              '</td><td class="charge-date" style="padding-left:160px">' +
              chargeDate +
              '</td></tr></tbody></table></a></h4></div><div class="charge-detail collapse panel-collapse" id="accordion-' +
              chargeID +
              '"><div class="panel-body style="padding-bottom:0"><ul class="list-group list-group-flush"><li class="list-group-item"><strong>Email: </strong>' + customerEmail + '</li><li class="list-group-item"><strong>Amount Refunded:</strong> $' + amountRefunded + '</li></ul><form class="form-inline"><div class="form-group mb-2" id="' + chargeID + '"><div class="input-group"><span class="input-group-addon">$</span><input id="input-' + chargeID + '" type="text" aria-describedby="basic-addon1" class="form-control" aria-label="Refund amount" value="' +
              amountRemaining +
              '"><span class="input-group-btn"><button class="btn btn-warning mb-2" id="calculator-btn-' + chargeID + '"><i class="fas fa-calculator"></i></button><button type="submit" class="refund-btn btn btn-primary mb-2" id="refund-btn-' +
              chargeID +
              '">Refund</button></span></div></div></form></div></div></div></div>'
          );
          disableRefund(chargeID, amountRemaining);

          $("#calculator-btn-" + chargeID).on("click", function(event) {
            event.preventDefault();
            showCalculator();
          });
          $("#refund-btn-" + chargeID).on("click", function(event) {
            event.preventDefault();
            var $this = $(this);
            $this.button("loading");
            const amountInDollars = ($("#input-" + chargeID).val());
            const amountToRefund = removeDecimalPoint((amountInDollars) * 100);          
            const typeOfRefund = refundType(amountRemaining, amountToRefund);
            doRefund(chargeID, amountToRefund, $this, typeOfRefund);
            console.log(typeOfRefund);
          });
        });
        }
          );
      }
    });
  });

//   $( "form" ).submit(function( event ) {
//   console.log( $( this ).serializeArray() );
//   event.preventDefault();
// });

  // Calculator Code:

  $(function() {
    $("#start_date")
      .datepicker({
        autoclose: true,
        todayHighlight: true
      })
      .datepicker("update", new Date());

    $("#end_date")
      .datepicker({
        autoclose: true,
        todayHighlight: true
      })
      .datepicker("update", new Date());
  });

  var first;
  var second;
  var resultValue;

  function refundCalculator() {
    var membership = $("#sel1").val();
    first = $("#start_date")
      .data("datepicker")
      .getFormattedDate("mm-dd-yyyy");
    second = $("#end_date")
      .data("datepicker")
      .getFormattedDate("mm-dd-yyyy");
    var discount = $("#discount").val();

    // new Date("dateString") is browser-dependent and discouraged, so we'll write
    // a simple parse function for U.S. date format (which does no error checking)
    function parseDate(str) {
      var mdy = str.split("-");
      return new Date(mdy[2], mdy[0] - 1, mdy[1]);
    }

    function datediff(first, second) {
      // Take the difference between the dates and divide by milliseconds per day.
      // Round to nearest whole number to deal with DST.
      return Math.round((second - first) / (1000 * 60 * 60 * 24));
    }

    resultValue = (
      datediff(parseDate(first), parseDate(second)) /
      365 *
      (membership - discount)
    ).toFixed(2);

    document.getElementById("result").innerHTML = "$" + resultValue;
    document.getElementById("result").classList.add("text-success");
  }

  function copyToClipboard() {
    var textArea = document.createElement("textarea");
    textArea.value = resultValue;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
  }

  $("#refund").click(function() {
    refundCalculator();
    copyToClipboard();
    $("#refund").tooltip("toggle");
  });

  $("#reply").click(function() {
    refundCalculator();
    copyToClipboard();
    $("#reply").tooltip("toggle");
    client.invoke(
      "ticket.comment.appendHtml",
      "<p>Hi {{ticket.requester.first_name}},</p><br><p>I have completed the pro-rated refund in the amount of <b>$" +
        resultValue +
        "</b>, equivalent to the unused portion of the membership between <b>" +
        first +
        "</b> and <b>" +
        second +
        "</b>. It should fully process in 5-10 business days.</p><br><p>Let us know if you need help with anything else on this request. Have a great week!</p><br><p>Regards,<br>{{current_user.first_name}}</p>"
    );
    client.set(
      "ticket.customField:custom_field_360000188703",
      "category__chore"
    );
    client.set(
      "ticket.customField:custom_field_360000187006",
      "memberships__refunds__partial_refund"
    );
    client.set("ticket.status", "solved");
  });

  $("#done-btn").on('click', function() {
    hideCalculator();
  });


});















