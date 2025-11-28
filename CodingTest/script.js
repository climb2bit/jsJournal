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

async function loadChallenges() {
    try {
        const response = await fetch('challenges.json');
        if (!response.ok) throw new Error("Could not load challenges.json");
        challenges = await response.json();
        loadLevel(0);
    } catch (err) {
        descEl.innerHTML = `<span style="color:red">Error: ${err.message}</span>`;
    }
}

function loadLevel(index) {
    currentChallengeIndex = index;
    const challenge = challenges[index];
    titleEl.textContent = challenge.title;
    descEl.innerHTML = challenge.description;
    editor.value = challenge.starterCode;
    outputConsole.textContent = "Ready to run...";
    outputConsole.style.color = "#00ff00";
    levelIndicator.textContent = `Level ${index + 1} / ${challenges.length}`;
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === challenges.length - 1;
}

runBtn.addEventListener('click', async () => {
    outputConsole.textContent = "Running...";
    outputConsole.style.color = "#00ff00";
    const userCode = editor.value;
    const currentTest = challenges[currentChallengeIndex].testCode;
    const completeScript = `
import sys
from io import StringIO
old_stdout = sys.stdout
sys.stdout = mystdout = StringIO()
try:
${userCode}
${currentTest}
except Exception as e:
    print(f"Error: {e}")
sys.stdout = old_stdout
mystdout.getvalue()
    `;
    try {
        const result = await pyodide.runPythonAsync(completeScript);
        outputConsole.textContent = result;
        if(result.includes("Correct!")) outputConsole.style.color = "#00ff00";
        else outputConsole.style.color = "#ff6b6b";
    } catch (err) { outputConsole.textContent = err; }
});

prevBtn.addEventListener('click', () => loadLevel(currentChallengeIndex - 1));
nextBtn.addEventListener('click', () => loadLevel(currentChallengeIndex + 1));
main();