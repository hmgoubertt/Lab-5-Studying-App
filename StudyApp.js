// studyApp.js
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function loadJsonFile(fileName) {
  const fileContent = fs.readFileSync(fileName, 'utf-8');
  try {
    return JSON.parse(fileContent);
  } catch (error) {
    throw new Error(`Error parsing JSON file: ${fileName}`);
  }
}

function displayMainMenu() {
  console.log("Study App\nModes:\n1. Multiple Choice\n2. Vocabulary Drill\n3. Exit");
}

async function multipleChoiceMode() {
  const questions = loadJsonFile('multipleChoice.json');
  let score = 0;

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    console.log(`Q: ${question.question}`);
    question.possibleAnswers.forEach((answer, index) => console.log(`${index + 1}. ${answer}`));

    const userAnswer = await getUserInput(" > ");

    if (userAnswer === "q") {
      console.log(`Score: ${score}/${questions.length}`);
      return;
    }

    const selectedAnswer = parseInt(userAnswer, 10) - 1;

    if (selectedAnswer >= 0 && selectedAnswer < question.possibleAnswers.length) {
      if (selectedAnswer === question.correctAnswer) {
        console.log("Correct\n");
        score++;
      } else {
        console.log(`Incorrect. The correct answer is: ${question.correctAnswer + 1}\n`);
      }
    } else {
      console.log("Invalid option. Please enter a valid number or 'q' to quit.\n");
      i--; // Reprint the same question
    }
  }

  console.log(`Score: ${score}/${questions.length}`);
}
//start of voca drill mode
async function vocabularyDrillMode() {
  const definitions = loadJsonFile('definitions.json');
  let score = 0;
  const defBegin = definitions.length;

  async function drillTerm(currentDefinition) {
    console.log(`Definition: ${currentDefinition.definition}`);
    currentDefinition.possibleTerms.forEach((term, index) => console.log(`${index + 1}. ${term}`));

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        resolve({ success: false, term: "timeout" });
      }, 5000);


      rl.question(" > ", (userAnswer) => {
        clearTimeout(timer);

        if (userAnswer.toLowerCase() === "q") {
          // If user entered 'q'
          resolve({ success: false, term: "q" });
        } else {
          const selectedAnswer = parseInt(userAnswer, 10) - 1;

          if (!isNaN(selectedAnswer) && selectedAnswer >= 0 && selectedAnswer <= 3) {
            // If user entered a valid numeric answer
            resolve({ success: selectedAnswer === currentDefinition.correctDefinition, term: selectedAnswer });
          } else {
            // If user entered an invalid numeric answer or non-numeric input
            resolve({ success: false, term: userAnswer });
          }
        }
      });
    });
  }

  let quitDrill = false;

  while (definitions.length > 0 && !quitDrill) {
    const randomIndex = Math.floor(Math.random() * definitions.length);
    const currentDefinition = definitions[randomIndex];

    const result = await drillTerm(currentDefinition);

    if (result.success) {
      score++;
      definitions.splice(randomIndex, 1);
      console.log("Correct\n");
    } else if (result.term === "q") {
      quitDrill = true;
    } else if (result.term === "timeout") {
      console.log("Please answer with 5 seconds");
    }else if(isNaN(result.term) && result.term != "q"){
      console.log("Please enter a number 1-4 or 'q' to quit the program");
    } else if(result.term > 3 || result.term < 0){
      console.log("Please enter a number 1-4 or 'q' to quit the program");
    } else {
      console.log("Incorrect.");
    }
  }

  if(quitDrill === true){
    console.log(`Incomplete: User quit the drill. Score: ${score}/${defBegin}`);
  }
  else{
    console.log(`Complete: Score - ${score}/${score}`);
  }

// end of vocabularyDrillMode
}

function getUserInput(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

module.exports = {
  main: async function () {
    while (true) {
      displayMainMenu();
      const userChoice = await getUserInput(" > ");

      switch (userChoice) {
        case "1":
          await multipleChoiceMode();
          break;
        case "2":
          await vocabularyDrillMode();
          break;
        case "3":
          rl.close();
          return;
        default:
          console.log("Invalid choice. Please enter a number between 1-3 or 'q' to quit.");
      }
    }
  },
};
