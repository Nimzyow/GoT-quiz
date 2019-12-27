let question = 0; //the question we are on
let ansSelected = null;
let mulAnsSelected = [];
let data = null; // set initial data to null
let resultData = null;
let points = 0;
let pointsPerc = 0;
let ansData = [];
let timer = 200;
let enSelect = false; //A flag to hide confirm answer button if user tries to select another answer during the duration of the timer.

let answerConfirm = function() {
  switch (data.questions[question].question_type) {
    //ansSelected to be true or false if question type is a true or false question.
    case "truefalse":
      ansSelected = !Boolean(ansSelected);
      break;
    //below case will returns an array of numbers depending on the amount of answers selected.
    case "mutiplechoice-multiple":
      ansSelected = mulAnsSelected.map(function(str) {
        return Number(str);
      });
    default:
      break;
  }

  //the below if else statement checks for correct answer, displays result to user and pushes the result to results array
  if (
    JSON.stringify(ansSelected) ===
    JSON.stringify(data.questions[question].correct_answer)
  ) {
    hideConfirmButtonShowResult("success", "Correct answer! Well done :)");
  } else {
    hideConfirmButtonShowResult("fail", "Incorrect answer :(");
  }
};

let hideConfirmButtonShowResult = function(result, message) {
  $(".confirm").hide(); //hide the confirm button
  $(".result")
    .show() //show result
    .removeClass() //remove any existing css
    .addClass(`result ${result}`); //add success css
  $(`<p id="userres" >${message}</p>`).appendTo(".result"); //display correct answer
  setPoints(result);
  setTimeout(setNextQuestion, timer); //call nextquestion() in 3 seconds
};

let setPoints = function(result) {
  switch (result) {
    case "success":
      points += data.questions[question].points; //add to total points
      break;
    default:
      break;
  }
  console.log(points);
};

let setNextQuestion = function() {
  enSelect = false; //enables user to select answer.
  ansSelected = null; //current answer removed and set to null
  mulAnsSelected = []; //current multiple choice answer set to empty array
  question += 1; //set question integer so we call correct question
  if (question < data.questions.length) {
    $("#userres").remove(); //removes results text
    $(".result").hide(); //hides previous result
    $(".quesImage").attr("src", data.questions[question].img); //sets image
    $("#question").text(question + 1 + ") " + data.questions[question].title); //sets question
    setAnswers();
  } else {
    $(".result").remove(); //set results text to empty string
    finalResults();
  }
};

let setAnswers = function() {
  $(".quesForm").remove();
  $(".quesList").remove(); //first remove the current answers.
  let form = $("form.quesForms");
  switch (data.questions[question].question_type) {
    //show possible answers for true or false question
    case "truefalse":
      let liTrue = $(setTrueFalseAnswer()).appendTo(form);
      break;
    case "mutiplechoice-single":
      //show possible answers for single choice question
      ansData = data.questions[question].possible_answers;
      setSingleQuestionOrMultipleQuestion(ansData, form, "radio");
      break;
    case "mutiplechoice-multiple":
      //show possible answers for multiple choice question
      ansData = data.questions[question].possible_answers;
      setSingleQuestionOrMultipleQuestion(ansData, form, "checkbox");
      break;
    default:
      break;
  }
  handleUserSelectedAnswers();
};

let handleUserSelectedAnswers = function() {
  $("input").click(function() {
    switch (data.questions[question].question_type) {
      case "mutiplechoice-multiple": //if its multiple choice answer
        let answers = document.forms[0]; //find form label.
        mulAnsSelected = []; // reset answers selected to empty array
        for (let i = 0; i < answers.length; i++) {
          if (answers[i].checked) {
            mulAnsSelected.push(answers[i].id); //push id of answer/s selected to mulAnsSelected array
          }
        }
        $("input").click(function() {
          if (mulAnsSelected.length === 0) {
            // hide confirm selection button if no answers are selected
            $(".confirm").hide();
          }
        });
        break;
      default:
        //if question is true/false answer or single choice answer
        ansSelected = jQuery(this).attr("id"); //when an answer is clicked, set ansSelected variable to the value of id of the selected element.
        ansSelected = Number(ansSelected); //convert string to Number
        break;
    }

    //below logic prevents users from selecting other answers when they have confirmed their answer through the enSelect boolean.
    switch (enSelect) {
      case true:
        $(".confirm").hide();
        break;
      case false:
        $(".confirm").show();
        break;
      default:
        break;
    }
  });
};

let setTrueFalseAnswer = function() {
  return '<label class="quesList" ><input id=0 type="radio" name="radio">True</label><label class="quesList" ><input id=1 type="radio" name="radio">False</label>';
};

let setSingleQuestionOrMultipleQuestion = function(ansData, form, type) {
  $.each(ansData, function(index, value) {
    //we create the <li></li> element with a class and an attribute and append it to <ul></ul> which we identify through the class quesLists
    let la = $("<label/>")
      .addClass("quesForm")
      .appendTo(form);

    //we create the <input> element with 2 attributes and append it to <li></li> and then add the anwer after the <input> element.
    let input = $("<input/>")
      .attr("type", type)
      .attr("name", type)
      .attr("id", value.a_id)
      .appendTo(la)
      .after(value.caption);
  });
};

let finalResults = function() {
  console.log("finalResults" + " " + ((points / 20) * 100).toFixed(0) + "%");
  resultData = $.parseJSON(
    $.ajax({
      url: "https://proto.io/en/jobs/candidate-questions/result.json",
      dataType: "json",
      async: false
    }).responseText
  );
  pointsPerc = ((points / 20) * 100).toFixed(0); //calculate points percentage
  console.log(pointsPerc);
  for (let i = 0; i < resultData.results.length; i++) {
    if (
      pointsPerc >= resultData.results[i].minpoints &&
      pointsPerc <= resultData.results[i].maxpoints
    ) {
      resultHandler(resultData.results[i]);
      break;
    }
  }
};

let resultHandler = function(res) {
  $(".quesForm").remove();
  $(".quesList").remove();
  $(".question").remove();
  $(".quesImage").attr("src", res.img);
  $(".finalResult").text(res.title);
  $(`<p class="resultMessageText">${res.message}</p>`).appendTo(
    ".resultMessage"
  );
  $(".pointsPercContiner").show();
  $("#pointsPerc").text(pointsPerc + "%");
  $(".resetGame").show();
};
