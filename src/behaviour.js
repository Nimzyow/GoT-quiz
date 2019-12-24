//put all behavioural events here
$(document).ready(function() {
  $(".confirm").hide(); //hide the confirm button
  $(".result").hide(); //set results text to empty string
  $(".resetGame").hide();
  $(".pointsPercContiner").hide(); //set results text to empty string
  $("#quesImage").on("click", function() {
    console.log("clicked");
  });

  //we make a get request here and store it in a variable called res
  data = $.parseJSON(
    $.ajax({
      url: "https://proto.io/en/jobs/candidate-questions/quiz.json",
      dataType: "json",
      async: false
    }).responseText
  );

  $("#quizTitle").text(data.title); //set main title
  $(".quesImage").attr("src", data.questions[question].img);
  $("#question").text(question + 1 + ") " + data.questions[question].title); //sets question
  setAnswers();
  // ansData = data.questions[question].possible_answers; // store answers array

  $(".resetGame").on("click", function() {
    location.reload(true);
  });

  $(".confirm").on("click", function() {
    enSelect = true;
    answerConfirm();
    $("input").on("click", function(e) {
      if (enSelect) {
        e.preventDefault();
      }
    });
  });
});
