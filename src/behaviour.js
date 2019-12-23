//put all behavioural events here
$(document).ready(function() {
  $("#confirm").hide(); //hide the confirm button

  $("#quesImage").on("click", function() {
    console.log("clicked");
  });

  //we make a get request here and store it in a variable called res
  var data = $.parseJSON(
    $.ajax({
      url: "https://proto.io/en/jobs/candidate-questions/quiz.json",
      dataType: "json",
      async: false
    }).responseText
  );

  $("#quizTitle").text(data.title); //set main title
  $("#quesImage").attr("src", data.questions[0].img);
  $("#question").text(data.questions[0].title); //sets question
  var ansData = data.questions[0].possible_answers; // store answers array

  var ansSelected;
  var aList = $("ul.quesLists");
  //use the each method to iterate through the answer array variable, ansData
  $.each(ansData, function(index, value) {
    //we create the <li></li> element with a class and an attribute and append it to <ul></ul> which we identify through the class quesLists
    var li = $("<li/>")
      .addClass("quesList")
      .attr("id", value.a_id)
      .appendTo(aList);
    //we create the <input> element with 2 attributes and append it to <li></li> and then add the anwer after the <input> element.
    var input = $("<input/>")
      .attr("type", "radio")
      .attr("name", "radio")
      .appendTo(li)
      .after(value.caption);
  });

  //show confirm button on click
  $("input").on("click", function() {
    $("#confirm").show();
  });
});
