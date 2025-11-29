let pyodide = null;
let challenges = [];
let currentChallengeIndex = 0;

const runBtn = document.getElementById('run-btn');
const outputConsole = document.getElementById('output-console');
const editor = document.getElementById('code-editor');
const titleEl = document.getElementById('challenge-title');
const descEl = document.getElementById('challenge-desc');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const levelIndicator = document.getElementById('level-indicator');
const loadingIndicator = document.getElementById('loading-indicator');

// 1. Initialize Pyodide
async function main() {
    try {
        pyodide = await loadPyodide();
        loadingIndicator.textContent = "Python Ready!";
        loadingIndicator.style.background = "#d4edda";
        loadingIndicator.style.color = "#155724";
        setTimeout(() => { loadingIndicator.style.display = 'none'; }, 2000);
        runBtn.disabled = false;
        await loadChallenges();
    } catch (err) {
        loadingIndicator.textContent = "Error loading Python.";
        console.error(err);
    }
}

// 2. Load Challenges
async function loadChallenges() {
    try {
        const response = await fetch('challenges.json');
        if (!response.ok) throw new Error("Could not load challenges.json");
        challenges = await response.json();
        challenges = challenges.reverse().slice(0, 10);
        loadLevel(0);
    } catch (err) {
        descEl.innerHTML = `<span style="color:red">Error: ${err.message}</span>`;
    }
}

// 3. Load specific level
function loadLevel(index) {
    currentChallengeIndex = index;
    const challenge = challenges[index];
    titleEl.textContent = challenge.title;
    descEl.innerHTML = challenge.description;
    editor.value = challenge.starterCode;
    outputConsole.textContent = "Ready to run...";
    outputConsole.style.color = "#00ff00";
    levelIndicator.textContent = `Question ${index + 1} / ${challenges.length}`;
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === challenges.length - 1;
}

// --- THE FIX: Helper to indent code so it fits inside the Python 'try' block ---
function indentCode(code) {
    if (!code) return "";
    // Split the code by lines, add 4 spaces to every line, and join them back
    return code.split('\n').map(line => '    ' + line).join('\n');
}

// 4. Run Code Logic
runBtn.addEventListener('click', async () => {
    outputConsole.textContent = "Running...";
    outputConsole.style.color = "#00ff00";
    
    const userCode = editor.value;
    const currentTest = challenges[currentChallengeIndex].testCode;

    // We wrap everything in a Python try-except block.
    // Because of this wrapper, we MUST indent the user's code and test code.
    const completeScript = `
import sys
from io import StringIO

# Capture output (print statements)
old_stdout = sys.stdout
sys.stdout = mystdout = StringIO()

try:
${indentCode(userCode)}

    # --- Run Verification Code ---
${indentCode(currentTest)}

except Exception as e:
    # If anything goes wrong, print the error
    print(f"Error: {e}")

# Restore output and get the result
sys.stdout = old_stdout
mystdout.getvalue()
    `;

    try {
        const result = await pyodide.runPythonAsync(completeScript);
        outputConsole.textContent = result;
        
        // Coloring based on result
        if(result.includes("Correct!")) {
             outputConsole.style.color = "#00ff00";
        } else if (result.includes("Error") || result.includes("Incorrect")) {
             outputConsole.style.color = "#ff6b6b";
        }
    } catch (err) {
        outputConsole.textContent = err;
        outputConsole.style.color = "#ff6b6b";
    }
});

// Navigation
prevBtn.addEventListener('click', () => loadLevel(currentChallengeIndex - 1));
nextBtn.addEventListener('click', () => loadLevel(currentChallengeIndex + 1));

main();
