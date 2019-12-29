let question = 0; //the question we are on
let ansSelected = null;
let mulAnsSelected = [];
let data = null; // set initial data to null
let resultData = null;
let points = 0;
let pointsPerc = 0;
let ansData = [];
let timer = 3000;
let elementSelect = false; //A flag to hide confirm answer button if user tries to select another answer during the duration of the timer.

const removeExistingClassAddSuccessClass = function(id) {
  $(id)
    .parent()
    .removeClass()
    .addClass("quesForm success");
};

const highlightCorrectAnswer = function() {
  let answers = document.forms[0];
  let correctAnswer = data.questions[question].correct_answer;
  switch (data.questions[question].question_type) {
    case "truefalse":
      if (correctAnswer !== ansSelected) {
        if (correctAnswer) {
          removeExistingClassAddSuccessClass("#0");
        } else {
          removeExistingClassAddSuccessClass("#1");
        }
      }
      break;
    case "mutiplechoice-single":
      for (let i = 0; i < answers.length; i++) {
        if (correctAnswer !== ansSelected) {
          let id = answers[i].id;
          removeExistingClassAddSuccessClass(`#${correctAnswer}`);
        }
      }
      break;
    case "mutiplechoice-multiple":
      for (let i = 0; i < answers.length; i++) {
        if (JSON.stringify(ansSelected) !== JSON.stringify(correctAnswer)) {
          correctAnswer.map(cAnswer => {
            removeExistingClassAddSuccessClass(`#${cAnswer}`);
          });
        }
      }
      break;
    default:
      break;
  }
};

const hideConfirmButtonShowResult = function(result, message) {
  $(".confirm").hide(); //hide the confirm button
  $(".result")
    .show() //show result
    .removeClass() //remove any existing css
    .addClass(`result ${result}`); //add success css
  $(`<p id="userres" >${message}</p>`).appendTo(".result"); //display correct answer
  highlightCorrectAnswer();
  setPoints(result);
  setTimeout(setNextQuestion, timer); //call nextquestion() in 3 seconds
};

const checkForCorrectAnswer = function() {
  return (
    JSON.stringify(ansSelected) ===
    JSON.stringify(data.questions[question].correct_answer)
  );
};

const showAnswerResult = function() {
  if (checkForCorrectAnswer(ansSelected)) {
    hideConfirmButtonShowResult("success", "Correct answer! Well done :)");
  } else {
    hideConfirmButtonShowResult("fail", "Incorrect answer :(");
  }
};

const setPoints = function(result) {
  if (result === "success") {
    points += data.questions[question].points; //add to total points
  }
};

const setAnswers = function() {
  $(".quesForm").remove();
  $(".quesList").remove();
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

const handleUserSelectedAnswers = function() {
  $("input").click(function() {
    switch (data.questions[question].question_type) {
      case "mutiplechoice-multiple":
        let answers = document.forms[0];
        mulAnsSelected = [];
        for (let i = 0; i < answers.length; i++) {
          if (answers[i].checked) {
            mulAnsSelected.push(answers[i].id);
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
        ansSelected = jQuery(this).attr("id"); //when an answer is clicked, set ansSelected variable to the value of id of the selected element.
        ansSelected = Number(ansSelected);
        break;
    }

    //below logic prevents users from selecting other answers when they have confirmed their answer through the elementSelect boolean.
    if (elementSelect) {
      $(".confirm").hide();
    } else {
      $(".confirm").show();
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

const resultHandler = function(res) {
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

const setNextQuestion = function() {
  elementSelect = false; //enables user to select answer.
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

const confirmAnswer = function() {
  switch (data.questions[question].question_type) {
    //ansSelected to be true or false if question type is a true or false question.
    case "truefalse":
      ansSelected = !Boolean(ansSelected);
      showAnswerResult();
      break;
    //below case will returns an array of numbers depending on the amount of answers selected.
    case "mutiplechoice-multiple":
      ansSelected = mulAnsSelected.map(str => {
        return Number(str);
      });
      showAnswerResult();
      break;
    default:
      showAnswerResult();
      break;
  }
};
