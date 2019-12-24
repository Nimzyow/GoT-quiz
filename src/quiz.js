var question = 0;
var ansSelected = null;
var mulAnsSelected = [];
var data = null; // set initial data to null
var resultData = null;
var points = 0;
var pointsPerc = 0;
var ansData = [];
var timer = 200;
var enSelect = false;

var answerConfirm = function() {
  //check if answer is a true or false answer. if yes, switch 0 int to true and 1 int to false.
  if (data.questions[question].question_type === "truefalse") {
    if (ansSelected === 0) {
      ansSelected = true;
    } else {
      ansSelected = false;
    }
  }

  if (data.questions[question].question_type === "mutiplechoice-multiple") {
    ansSelected = mulAnsSelected.map(function(str) {
      return Number(str);
    });
  }

  //the below if else statement checks for correct answer, displays result to user and pushes the result to results array
  if (
    JSON.stringify(ansSelected) ===
    JSON.stringify(data.questions[question].correct_answer)
  ) {
    $(".confirm").hide(); //hide the confirm button
    $(".result")
      .show()
      .removeClass()
      .addClass("result success");
    points += data.questions[question].points; //add to total points
    console.log(`Points: ${points}`);
    $('<p id="userres" >Correct answer! Well done :)</p>').appendTo(".result"); //display correct answer text to user

    setTimeout(nextQuestion, timer); //call nextquestion() in 3 seconds
  } else {
    $(".confirm").hide(); //hide button
    $(".result")
      .show()
      .removeClass()
      .addClass("result fail");
    $('<p id="userres">Incorrect answer :(</p>').appendTo(".result"); //display incorrect answer text to user

    setTimeout(nextQuestion, timer); //call nextquestion() in 3 seconds
  }
};

var nextQuestion = function() {
  enSelect = false;
  ansSelected = null;
  mulAnsSelected = [];
  question += 1; //set question integer so we call correct question
  if (question < data.questions.length) {
    $("#userres").remove(); //set results text to empty string

    $(".quesImage").attr("src", data.questions[question].img); //sets image
    $("#question").text(question + 1 + ") " + data.questions[question].title); //sets question

    setAnswers();
  } else {
    $(".result").remove(); //set results text to empty string
    finalResults();
  }
};

var setAnswers = function() {
  $(".quesForm").remove();
  $(".quesList").remove(); //first remove the current answers.
  if (data.questions[question].question_type === "truefalse") {
    var trueFalseList = $("form.quesForms");
    var liTrue = $(
      '<label class="quesList" ><input id=0 type="radio" name="radio">True</label>'
    ).appendTo(trueFalseList);

    var liFalse = $(
      '<label class="quesList" ><input id=1 type="radio" name="radio">False</label>'
    ).appendTo(trueFalseList);
  } else if (
    data.questions[question].question_type === "mutiplechoice-single"
  ) {
    ansData = data.questions[question].possible_answers; // store answers array

    var aList = $("form.quesForms");
    //use the each method to iterate through the answer array variable, ansData
    $.each(ansData, function(index, value) {
      //we create the <li></li> element with a class and an attribute and append it to <ul></ul> which we identify through the class quesLists
      var li = $("<label/>")
        .addClass("quesList")
        .appendTo(aList);

      //we create the <input> element with 2 attributes and append it to <li></li> and then add the anwer after the <input> element.
      var input = $("<input/>")
        .attr("type", "radio")
        .attr("name", "radio")
        .attr("id", value.a_id)
        .appendTo(li)
        .after(value.caption);
    });
  } else if (
    data.questions[question].question_type === "mutiplechoice-multiple"
  ) {
    ansData = data.questions[question].possible_answers; // store answers array

    var aForm = $("form.quesForms");
    //use the each method to iterate through the answer array variable, ansData
    $.each(ansData, function(index, value) {
      //we create the <li></li> element with a class and an attribute and append it to <ul></ul> which we identify through the class quesLists
      var li = $("<label/>")
        .addClass("quesForm")
        .appendTo(aForm);
      //we create the <input> element with 2 attributes and append it to <li></li> and then add the anwer after the <input> element.
      var input = $("<input/>")
        .addClass("quesForm")
        .attr("type", "checkbox")
        .attr("name", "checkbox")
        .attr("id", value.a_id)
        .appendTo(li)
        .after(value.caption);
    });
  }
  $("input").click(function() {
    if (data.questions[question].question_type === "mutiplechoice-multiple") {
      var answers = document.forms[0];

      mulAnsSelected = [];
      for (var i = 0; i < answers.length; i++) {
        if (answers[i].checked) {
          mulAnsSelected.push(answers[i].id);
        }
      }
      $("input").click(function() {
        if (
          data.questions[question].question_type === "mutiplechoice-multiple"
        ) {
          if (mulAnsSelected.length === 0) {
            $(".confirm").hide();
          }
        }
      });
    } else {
      ansSelected = jQuery(this).attr("id"); //when an answer is clicked, set ansSelected variable to the value of id of the selected element.
      ansSelected = Number(ansSelected);
    }

    //below logic prevents users from selecting other answers when they have confirmed their answer through the enSelect boolean.
    if (enSelect) {
      $(".confirm").hide();
    } else {
      $(".confirm").show();
    }
  });
};

var finalResults = function() {
  console.log("finalResults" + " " + ((points / 20) * 100).toFixed(0) + "%");
  resultData = $.parseJSON(
    $.ajax({
      url: "https://proto.io/en/jobs/candidate-questions/result.json",
      dataType: "json",
      async: false
    }).responseText
  );
  pointsPerc = ((points / 20) * 100).toFixed(0);

  for (var i = 0; i < resultData.results.length; i++) {
    if (pointsPerc <= resultData.results[i].maxpoints) {
      resultHandler(resultData.results[i]);
      break;
    }
  }
};

var resultHandler = function(res) {
  $(".quesForm").remove();
  $(".quesList").remove();
  $(".question").remove();
  $(".quesImage").attr("src", res.img);
  $(".finalResult").text(res.title);
  $(`<p style="text-align: center">${res.message}</p>`).appendTo(
    ".resultMessage"
  );
  $(".pointsPercContiner").show();
  $("#pointsPerc").text(pointsPerc + "%");
  $(".resetGame").show();
  //$(".resultMessage").text(res.message); //display incorrect answer text to user
  console.log(res.message);
};
