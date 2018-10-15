/* global $,  ZAFClient */

var client = ZAFClient.init()

client.invoke('resize', { width: '100%', height: '300px' })

$(function () {
  $('#start_date').datepicker({
    autoclose: true,
    todayHighlight: true
  }).datepicker('update', new Date())

  $('#end_date').datepicker({
    autoclose: true,
    todayHighlight: true
  }).datepicker('update', new Date())
})

var first
var second
var resultValue

function refundCalculator () {
  var membership = $('#sel1').val()
  first = $('#start_date').data('datepicker').getFormattedDate('mm-dd-yyyy')
  second = $('#end_date').data('datepicker').getFormattedDate('mm-dd-yyyy')
  var discount = $('#discount').val()

  // new Date("dateString") is browser-dependent and discouraged, so we'll write
  // a simple parse function for U.S. date format (which does no error checking)
  function parseDate (str) {
    var mdy = str.split('-')
    return new Date(mdy[2], mdy[0] - 1, mdy[1])
  }

  function datediff (first, second) {
    // Take the difference between the dates and divide by milliseconds per day.
    // Round to nearest whole number to deal with DST.
    return Math.round((second - first) / (1000 * 60 * 60 * 24))
  }

  resultValue = '$' + (((datediff(parseDate(first), parseDate(second))) / 365) * (membership - discount)).toFixed(2)

  document.getElementById('result').innerHTML = resultValue
  document.getElementById('result').classList.add('text-success')
}

function copyToClipboard () {
  /* Get the text field */
  var copyText = document.getElementById('result')

  /* Select the text field */
  copyText.select()

  /* Copy the text inside the text field */
  document.execCommand('copy')
}

$('#refund').click(function () {
  refundCalculator()
  copyToClipboard()
})

$('#reply').click(function () {
  refundCalculator()
  copyToClipboard()
  client.invoke('ticket.comment.appendHtml', '<p>Hi {{ticket.requester.first_name}}‍,</p><br><p>I have completed the pro-rated refund in the amount of <b>' + resultValue + '</b>, equivalent to the unused portion of the membership between ' + first + ' and ' + second + '. It should fully process in 5-10 business days.</p><br><p>Let us know if you need help with anything else on this request. Have a great week!</p><br><p>Regards,<br>{{current_user.first_name}}‍</p>')
  client.set('ticket.customField:custom_field_360000188703', 'category__chore')
  client.set('ticket.customField:custom_field_360000187006', 'memberships__refunds__partial_refund')
})
