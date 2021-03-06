$(function(){
  $("#chatinput form").live('ajax:beforeSend.rails', function(event) {
    $(this).children("input[type=text]").val("");
  });

  var room_id   = $(".room_id").data("id");
  var room_name = $(".room_id").data("name");
  var room_sha1 = $(".room_id").data("sha1");

  PrivatePub.subscribe("/rooms/" + room_sha1 + "/messages", function(data, channel) {
    user    = data.user;
    message = data.message;
    Chatterbox.user_chatted(user, message);
  });

  PrivatePub.subscribe("/rooms/" + room_sha1 + "/events", function(data, channel) {
    if(data.joined) {
      Chatterbox.user_joined(data.joined);
    }
    if(data.parted) {
      Chatterbox.user_parted(data.parted);
    }
  });

  $("#bigger").click(function() {
    size = $("#chatlog").height();
    size = size + 75;
    $("#chatlog").height(size);
    Chatterbox.scroll_down();
  });
  $("#smaller").click(function() {
    size = $("#chatlog").height();
    size = size - 75;
    $("#chatlog").height(size);
    Chatterbox.scroll_down();
  });

  $.ajax({
      url: "/rooms/" + room_sha1 + "/joined",
      type: "POST",
      success: function(data, status, xhr) {
        $("#chat_message, #chat_submit").removeAttr('disabled');
        $("#chat_message").focus();
      }
  });

  $(window).bind("blur", function() {
    Chatterbox.set_focused(false);
    $("#chatlog .last_chat_log").removeClass("last_chat_log");
    $("#chatlog p:last").addClass("last_chat_log");
  });

  $(window).bind("focus", function() {
    Chatterbox.set_focused(true);
  });

  $(window).unload(function(){
    $.ajax({
      url: "/rooms/" + room_sha1 + "/parted",
      async: false,
      type: "POST"
    });
  });
});
