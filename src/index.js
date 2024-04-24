let terminalOutput;
let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";

const API_KEY = "901a73-14a331"; // Your Aviation Edge API key
const BASE_URL = "https://aviation-edge.com/v2/public"; // Aviation Edge base URL

// Function to fetch route details by airline IATA code and flight number
async function fetchRouteDetails(airlineIata, flightNumber) {
  const endpoint = `${BASE_URL}/routes?key=${API_KEY}&airlineIata=${airlineIata}&flightNumber=${flightNumber}`; // Construct the endpoint
  console.log("Requesting from endpoint:", endpoint); // Debugging the endpoint

  try {
    const response = await fetch(endpoint); // Fetch data from API
    console.log("Response status:", response.status); // Debugging response status

    if (!response.ok) { // If the response is not OK
      console.error("HTTP Error:", response.statusText); // HTTP error
      return null;
    }

    const data = await response.json(); // Parse the JSON response
    console.log("Received data:", data); // Debugging the fetched data

    if (data && data.length > 0) { // Check if data is returned
      return data[0]; // Return the first route
    } else {
      console.warn("No route data found for the provided inputs.");
      return null;
    }
  } catch (error) { // Handle network or fetch errors
    console.error("Error fetching route details:", error); // Catch errors
    return null;
  }
}

// Function to display route details
function displayRouteDetails(route) {
  if (!route) {
    console.log("No route information found.");
    return;
  }

  const {
    departureIata,
    departureTerminal,
    departureTime,
    arrivalIata,
    arrivalTerminal,
    arrivalTime
  } = route;

  printToTerminal('<br>');
  printToTerminal(`Departure: <span class ="directory">${departureIata}</span> Time:<span class = "code"> ${departureTime}</span> Terminal: ${departureTerminal}`);
  printToTerminal(`Arrival: <span class ="directory">${arrivalIata}</span> Time:<span class = "code"> ${arrivalTime}</span> Terminal: ${arrivalTerminal}`);
  printToTerminal('<br>');
}

// Test with example data
// (async () => {
//   const routeDetails = await fetchRouteDetails("AI", "101"); // Fetch route details for AI101
//   displayRouteDetails(routeDetails); // Display route details
// })();


const app = () => {
  window.userInput = document.getElementById("userInput");
  terminalOutput = document.getElementById("terminalOutput");
  document.getElementById("dummyKeyboard").focus();

  document.addEventListener('keydown', keyEvent);
  document.addEventListener('keydown', backSpaceKeyEvent);
};

document.addEventListener("DOMContentLoaded", app);

function keyEvent(e) {
  const userInput = window.userInput;

  if (e.key === "Enter") {
    e.preventDefault();
    execute(userInput.textContent);
    userInput.textContent = "";
  } else if (e.key.length === 1) {
    userInput.textContent += e.key;
  }
}

function backSpaceKeyEvent(e) {
  const userInput = window.userInput;

  if (e.key === 'Backspace') {
    e.preventDefault();
    userInput.textContent = userInput.textContent.slice(0, -1);
  }
}

async function execute(input) {
  input = input.toLowerCase();
  const parts = input.split(" "); // Split command into words


  if (input === 'clear') {
    clearTerminal();
  } else if (input === 'play') {
    printToTerminal("Change directory to tic, use <span class='code'> cd -tic</span>");
  }
  else if(input === "cd -tic") {
      startTicTacToe();
    }
  else if (input === "cd amol/docs/resume") {
    downloadResume(); // Implement this function
    printToTerminal("Check your downloads folder");

  } else if (input.startsWith('move')) {
    const position = parseInt(input.split(" ")[1]);
    if (!isNaN(position) && position >= 1 && position <= 9) {
      makeMove(position - 1);
    } else {
      printToTerminal("Invalid move. Please enter a number between 1 and 9.");
    }
  } 

  if (parts[0] === 'flight') { // Handle "flight <code>" command
    if(!parts[1]) { 
      printToTerminal("<br>");
      printToTerminal("Usage: flight 'flight-number', Example: <span class = 'directory'>flight AI101</span>")}
      const airlineAndFlight = parts[1]; // Airline code and flight number
      const airlineCode = airlineAndFlight.substring(0, 2).toUpperCase(); // Extract airline IATA code
      const flightNumber = airlineAndFlight.substring(2); // Extract flight number
      
      const routeDetails = await fetchRouteDetails(airlineCode, flightNumber); // Fetch route details
      if (routeDetails) {
        displayRouteDetails(routeDetails); // Display route details
      } else {
        printToTerminal(`No route information found for ${airlineCode}${flightNumber}.`);
      }
  }

  else if(parts[0] == "move" || parts[0] == "cd") {
    printToTerminal(" ");
  }

  else if (!COMMANDS.hasOwnProperty(input)) {
    printToTerminal(`no such command: "${input}"`);
  } 
  else {
    printToTerminal(COMMANDS[input]);
  }
}

function startTicTacToe() {
  board.fill("");
  currentPlayer = "X";
  printToTerminal("Tic-Tac-Toe started.  <span class='code'>X begins.</span>");
  printToTerminal("Format: <span class = 'code'>move grid-number</span>");
  printToTerminal("<br>");


  displayBoard();
}

function displayBoard() {
  let boardElement = document.querySelector('.board-container');
  // If the board container doesn't exist, create it
  if (!boardElement) {
    boardElement = document.createElement('div');
    boardElement.classList.add('board-container');
    terminalOutput.appendChild(boardElement);
  }

  let output = '';
  board.forEach((cell, index) => {
    output += cell || (index + 1);
    if ((index + 1) % 3 === 0 && index < 8) {
      output += '<br>'; // End the current row and start a new one
    } else if (index < 8) {
      output += '&nbsp;|&nbsp;'; // Add space around the vertical lines
    }
  });

  // Set the innerHTML of the board container to the new board layout
  boardElement.innerHTML = `<div class="board-display">${output}</div>`;
  // Scroll to the bottom of the terminal output to bring the board into view
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function printToTerminal(message) {
  const newLine = document.createElement('div');
  newLine.classList.add('terminal-line');
  newLine.innerHTML = message;
  terminalOutput.appendChild(newLine);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}


function makeMove(position) {
  if (board[position] === "") {
    board[position] = currentPlayer;
    if (checkWin()) {
      printToTerminal(`${currentPlayer} <span class = "code">wins!</span>`);
      printToTerminal("<br>");
    } else if (!board.includes("")) {
      printToTerminal("It's a tie!");
      startTicTacToe(); // Restart after tie
    } else {
      currentPlayer = currentPlayer === "X" ? "O" : "X";
      displayBoard();
      printToTerminal(`Player ${currentPlayer}'s turn. Type "move <cell-number>" to make a move.`);
    }
  } else {
    printToTerminal("Cell is already taken, choose another.");
    displayBoard();
  }
}

function checkWin() {
  const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  return winConditions.some(condition => {
    const [a, b, c] = condition;
    return board[a] && board[a] === board[b] && board[a] === board[c];
  });
}

function clearTerminal() {
  terminalOutput.innerHTML = "";
  printToTerminal(COMMANDS['help']);
}

function downloadResume() {
  const resumeLink = document.createElement("a"); // Create an anchor element
  resumeLink.href = "src/Amol.pdf"; // Path to the resume file
  resumeLink.download = "Amol_Mendonca_Resume.pdf"; // File name for the download
  resumeLink.style.display = "none"; // Hide the link
  document.body.appendChild(resumeLink); // Append to the body
  resumeLink.click(); // Simulate a click to start the download
  document.body.removeChild(resumeLink); // Clean up
}


const COMMANDS = {
  help: '[amolmendonca] ~ $ Supported commands: <span class="code">["about", "experience", "education", "skills", "contact", "resume", "play", "flight", "clear"]</span><br>[amolmendonca] ~ $ Recommended commands: <span class = "hack">["flight", "resume", "play"]</span>',
  about: "[amolmendonca] ~ $ Hello! I'm Amol Mendonca. I’m a 19 year old developer with expertise in full-stack development!",
  skills: '[amolmendonca] ~ $ Frontend: Swift, SwiftUI, HTML, CSS, JavaScript<br>Backend: C++, Java, Python, MongoDB, MySQL, R',
  education: "[amolmendonca] ~ $ Bachelors of Science in Computer Science @ University of Michigan - Ann Arbor",
  experience: "[amolmendonca] ~ $ I'm currently working on a startup - MediGate, with 2 of my best friends. Would love to chat if you're interested in learning more!",
  contact: '[amolmendonca] ~ $ You can contact me on: amolm@umich.edu or (248)-832-3029',
  play: 'moves available (1 to 8)',
  resume: 'hint: <span class = "hack">cd</span> <span class = "directory">amol/docs/resume</span>',
  clear: 'Clears the terminal.',
};