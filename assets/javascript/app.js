$(document).ready(function () {

	var options = ['', '', '', ''], optionPrefix = ['A: ', 'B: ', 'C: ', 'D: '];
	//need to save where in the multiple choice options array the correct Answere will be placed
	var correctKey = 0, optionCount = 4, userCorrectCount = 0, userIncorrectCount = 0, userUnansweredCount = 0, totalQuestions = 8, questionsGuessed = 0, intervalId, waitIntervalId;

	var timer = {
		timeRemaining: 30,
		waitTime: 3,
		start: function () {

			//  Time for questions.

			intervalId = setInterval(function () {
				timer.timeRemaining--;
				if (timer.timeRemaining > 0) {
					$('.timer').text(timer.timeRemaining);
				} else {
					userUnansweredCount++;
					displayFailure();
					timer.stop();
				}
			}, 1000);
		},
		stop: function () {

			//  Stop all timers and reset 
			clearInterval(intervalId);
			clearInterval(waitIntervalId);
			$('.timer').text(timer.timeRemaining);

		},
		timeBetweenQuestions: function () {
			waitIntervalId = setInterval(function () {
				if (timer.waitTime > 0) {
					timer.waitTime--;
					$('time').text(timer.waitTime);
				} else {
					timer.waitTime = 3;
					timer.stop();
					$('.view-result').attr('class', 'container view-result vertical-center col-center box hidden');
					$('.start-questions').attr('class', 'container start-questions box show');
					nextQuestion();
				}
			}, 1000);
		}
	}

	function resetTriviaValues() {
		options = ['', '', '', ''];
		correctKey = 0;
		optionCount = 4;
		userCorrectCount = 0;
		userIncorrectCount = 0;
		totalQuestions = 8;
		questionsGuessed = 0;
		timer.timeRemaining = 30;
		userUnansweredCount = 0;
	}

	function nextQuestion() {
		//Set API URL to get next question
		var queryURL = "https://opentdb.com/api.php?amount=1&encode=url3986";
		// var queryURL = "https://opentdb.com/api.php?amount=1&category=16&encode=url3986";

		//first clear any content if any
		$('.choices').html('');

		//Get API data
		$.ajax({
			url: queryURL,
			method: "GET"
		}).then(function (response) {
			//display question
			timer.timeRemaining = 30;
			timer.start();
			$('.question').text(decodeURIComponent(response.results[0].question));

			switch (response.results[0].type) {
				case 'multiple':
					optionCount = options.length;
					correctKey = Math.floor(Math.random() * Math.floor(4));
					break;
				case 'boolean':
					optionCount = 2;
					//if boolean we don't want random order for questions
					if ('true' === decodeURIComponent(response.results[0].correct_answer)) {
						correctKey = 0;
					} else {
						correctKey = 1;
					}
					// correctKey = Math.floor(Math.random() * Math.floor(2));
					break;
				default:
					optionCount = options.length;
					correctKey = Math.floor(Math.random() * Math.floor(4));
			}

			for (var i = 0; i < optionCount; i++) {
				if (i === correctKey) {
					options[i] = decodeURIComponent(response.results[0].correct_answer);
				} else {
					if (i >= correctKey) {
						options[i] = decodeURIComponent(response.results[0].incorrect_answers[i - 1]);
						console.log('greater' + i);
					} else {
						options[i] = decodeURIComponent(response.results[0].incorrect_answers[i]);
						console.log('less' + i);
					}
				}
				console.log(correctKey);
				//display choices
				var p = $('<p class="options" data-picked="' + i + '">').text(optionPrefix[i] + options[i]);
				console.log(p);
				$('.choices').append(p);
			}

		});
	}

	//Load another question if we haven't met the predetermined total question count
	// if ((userCorrectCount + userIncorrectCount) < totalQuestions) {
	// 	nextQuestion();
	// } else {
	// 	var startOverDiv = '<div class="start-over">Start Over</div>';
	// 	$('.choices').append(startOverDiv);
	// }

	//Start Trivia Game
	$('.btn-start').on('click', function () {
		$('.start-trivia').attr('class', 'start-trivia hidden');
		$('.start-questions').attr('class', 'container start-questions box show');
		nextQuestion();
		// timer.start;
	});

	function displayScores() {
		$('.correct-score').text('Correct: ' + userCorrectCount);
		$('.incorrect-score').text('Incorrect: ' + userIncorrectCount);
	}

	function displaySuccess() {
		$('.start-questions').attr('class', 'container start-questions box hidden');
		$('.correct-answer').text(options[correctKey]);
		$('.view-result').append('<h2>Q' + questionsGuessed + ': Success!</h2>');
		$('.view-result').attr('class', 'container view-result vertical-center col-center box show');
		displayScores();
	}

	function displayFailure() {
		$('.start-questions').attr('class', 'container start-questions box hidden');
		$('.correct-answer').text('Correct Answer: ' + options[correctKey]);
		$('.view-result').append('<h2>Q' + questionsGuessed + ': Failure :o(</h2>');
		$('.view-result').attr('class', 'container view-result vertical-center col-center box show');
		displayScores();
	}

	//Allow user to select an answer
	$(document).on('click', ".options", function () {
		timer.stop();
		questionsGuessed++;
		userChoice = $(this).attr('data-picked');
		console.log(userChoice, correctKey);
		if (userChoice == correctKey) {
			userCorrectCount++;
			displaySuccess();
		} else {
			userIncorrectCount++;
			displayFailure();
		}
		timer.timeBetweenQuestions();
	});

});



