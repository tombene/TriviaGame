$(document).ready(function () {

	var options = ['', '', '', ''], optionPrefix = ['A: ', 'B: ', 'C: ', 'D: '];
	//need to save where in the multiple choice options array the correct Answere will be placed
	var correctKey = 0, optionCount = 4, userCorrectCount = 0, userIncorrectCount = 0, userUnansweredCount = 0, totalQuestions = 8, questionsGuessed = 0, intervalId, waitIntervalId;

	var timer = {
		timeRemaining: 30,
		waitTime: 2,
		start: function () {

			//  Time for questions.

			intervalId = setInterval(function () {
				timer.timeRemaining--;
				if (timer.timeRemaining > 0) {
					$('.timer').text(timer.timeRemaining);
				} else {
					userUnansweredCount++;
					questionsGuessed++;
					displayUnanswered();
					timer.stop();
					timer.timeBetweenQuestions();
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
			//Check if the game is over before displaying a new question
			if (questionsGuessed < totalQuestions) {
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
			} else {
				console.log('game over');
				timer.stop();
				gameOver();
			}
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
		$('.choices').empty();
		$('.question').empty();
		$('#result-gif').empty();
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

			//Set multiple choice option array
			for (var i = 0; i < optionCount; i++) {
				if (i === correctKey) {
					options[i] = decodeURIComponent(response.results[0].correct_answer);
				} else {
					if (i >= correctKey) {
						options[i] = decodeURIComponent(response.results[0].incorrect_answers[i - 1]);
					} else {
						options[i] = decodeURIComponent(response.results[0].incorrect_answers[i]);
					}
				}
				//display choices
				var p = $('<p class="options" data-picked="' + i + '">').text(optionPrefix[i] + options[i]);

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
	$('#start').on('click', function () {
		$('.start-trivia').attr('class', 'start-trivia hidden');
		$('.start-questions').attr('class', 'container start-questions box show');
		nextQuestion();
		// timer.start;
	});

	function displayScores() {
		$('.start-questions').attr('class', 'container start-questions box hidden');
		$('.correct-score').text('Correct: ' + userCorrectCount);
		$('.incorrect-score').text('Incorrect: ' + userIncorrectCount);
		$('.unanswered-score').text('UnAnswered: ' + userUnansweredCount);
		$('.view-result').attr('class', 'container view-result vertical-center col-center box show');
	}

	function displaySuccess() {
		$('.correct-answer').text(options[correctKey]);
		$('#question-result').append('<h2>Q' + questionsGuessed + ': Success!</h2>');
		$('#result-gif').empty();
		//https://media.giphy.com/media/nXxOjZrbnbRxS/giphy.gif
		$('#result-gif').append('<img class="img-gif" src="https://media.giphy.com/media/nXxOjZrbnbRxS/giphy.gif">');

		displayScores();
	}

	function displayFailure() {
		$('.correct-answer').text('Correct Answer: ' + options[correctKey]);
		$('#question-result').append('<h2>Q' + questionsGuessed + ': Failure :o(</h2>');
		$('#result-gif').empty();
		//https://media.giphy.com/media/26ybwvTX4DTkwst6U/giphy-downsized.gif
		$('#result-gif').append('<img class="img-gif" width="width" height="height" src="https://media.giphy.com/media/26ybwvTX4DTkwst6U/giphy-downsized.gif">');

		displayScores();
	}

	function displayUnanswered() {
		$('.correct-answer').text('Correct Answer: ' + options[correctKey]);
		$('#question-result').append('<h2>Q' + questionsGuessed + ': Time Ran Out :o(</h2>');
		$('#result-gif').empty();
		//https://media.giphy.com/media/26ybwvTX4DTkwst6U/giphy-downsized.gif
		$('#result-gif').append('<img class="img-gif" src="https://media.giphy.com/media/9YhoD4RQeFkT6/giphy-downsized.gif">');
		displayScores();
	}

	function gameOver() {
		displayScores();
		$('#btn-restart').attr('class', 'btn-restart col-center show');
		resetTriviaValues();
	}

	//Allow user to select an answer
	$(document).on('click', ".options", function () {
		timer.stop();
		questionsGuessed++;
		userChoice = $(this).attr('data-picked');
		console.log('qg: ' + questionsGuessed, correctKey, 'TOTq: ' + totalQuestions);
		if (userChoice == correctKey) {
			userCorrectCount++;
			displaySuccess();
		} else {
			userIncorrectCount++;
			displayFailure();
		}
		timer.timeBetweenQuestions();
	});

	$(document).on('click', "#btn-restart", function () {
		$('.view-result').attr('class', 'container view-result vertical-center col-center box hidden');
		$('#question-result').empty();
		$('#btn-restart').attr('class', 'btn-restart hidden');
		$('.start-questions').attr('class', 'container start-questions box show');
		nextQuestion();
	});

});



