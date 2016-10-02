$('#addComment').submit(function (e) {
  $('.alert.alert-danger').hide();
  if (!$('textarea#comment').val()) {
    if ($('.alert.alert-danger').length) {
      $('.alert.alert-danger').show();
    } else {
      $(this).prepend('<div role="alert" class="alert alert-danger">Comment required, please try again</div>');
    }
    return false;
  }
});

/*
$('#addStateChange').submit(function (e) {
  $('.alert.alert-danger').hide();
  if (!$('select#state').val() || !$('textarea#comment').val()) {
    if ($('.alert.alert-danger').length) {
      $('.alert.alert-danger').show();
    } else {
      $(this).prepend('<div role="alert" class="alert alert-danger">All fields required, please try again</div>');
    }
    return false;
  }
});
*/