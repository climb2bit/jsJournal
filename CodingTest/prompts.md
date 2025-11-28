This guide is designed to be saved as a **"System Instruction"** or **"Context Prompt"**. When you want to generate new questions in the future using ChatGPT, Claude, or any AI, you can simply paste the **"The Master Prompt"** section below.

---

### Part 1: The Structure (For your understanding)

The `challenges.json` file is a list of objects. Each object represents one level.

#### The Fields:
1.  **`id`** *(Integer)*: A unique number for sorting (e.g., 10, 11, 12).
2.  **`title`** *(String)*: A fun, catchy name for the challenge.
3.  **`description`** *(String)*:
    *   The instructions shown to the kid.
    *   **Important:** You can use HTML tags here. Use `<code>...</code>` for variables and `<br>` for line breaks.
4.  **`starterCode`** *(String)*:
    *   The code that appears in the editor when the level starts.
    *   **Important:** Use `\n` for new lines.
    *   **Important:** Use 4 spaces for indentation.
5.  **`testCode`** *(String)*:
    *   The invisible code that runs *after* the user's code.
    *   It must use a `try: ... except:` block.
    *   It uses `assert` to check values.
    *   It must `print('Correct! ...')` if successful, or `print` an error message if failed.

---

### Part 2: The Master Prompt (Copy & Paste this into AI)

Save the text block below. When you need new questions, paste this entire block into an AI:

***

**ACT AS A PYTHON TUTOR FOR KIDS.**
I have a custom web-based Python testing platform. I need you to generate a valid JSON array containing coding challenges.

**THE FORMAT:**
Please output a raw JSON list. Each item must follow this exact schema:

```json
{
  "id": [Integer],
  "title": "[String]",
  "description": "[String with HTML tags like <code> and <br>]",
  "starterCode": "[String with \\n for newlines]",
  "testCode": "[String with \\n for newlines]"
}
```

**CONSTRAINTS & RULES:**

1.  **JSON Formatting:**
    *   All Python code inside `starterCode` and `testCode` must be a single line string with `\n` representing newlines.
    *   Double quotes inside the code must be escaped (e.g., `\"Hello\"`).

2.  **Starter Code:**
    *   Provide a function definition (e.g., `def my_func():`).
    *   Include a comment `# Write code here`.
    *   Include a default return statement (e.g., `return 0` or `return False`) so the code runs without crashing immediately.

3.  **Test Code Logic (CRITICAL):**
    *   The `testCode` runs *immediately after* the `starterCode`.
    *   It **MUST** be wrapped in a `try: ... except:` block.
    *   Use `assert function_name(input) == expected_output` to verify answers.
    *   If the assertions pass, it **MUST** print a string containing the word **"Correct!"**.
    *   If an assertion fails, catch `AssertionError` and print a hint.
    *   **Example of Test Code format:**
        ```python
        try:\n    assert my_func(2) == 4\n    print('Correct! Good job.')\nexcept AssertionError:\n    print('Incorrect. Try again.')\nexcept Exception as e:\n    print(f'Error: {e}')
        ```

**TARGET AUDIENCE:**
*   Python experience: [INSERT EXPERIENCE LEVEL, e.g., Beginner, 1 Year, etc.]
*   Topics to cover: [INSERT TOPIC, e.g., Lists, Loops, Strings, Math]

**TASK:**
Generate [INSERT NUMBER] new challenges starting from ID [INSERT START ID].

***

### Part 3: Example of how to use it

**You:**
*(Pastes the Master Prompt above)*
> "Target Audience: Kids with 6 months experience. Topics: Python Lists and appending items. Generate 2 challenges starting from ID 10."

**AI Response:**
```json
[
  {
    "id": 10,
    "title": "The Shopping List",
    "description": "Write a function <code>add_apple</code> that takes a list of fruits and adds 'Apple' to the end of it using <code>.append()</code>.",
    "starterCode": "def add_apple(fruit_list):\n    # Use .append() here\n    return fruit_list",
    "testCode": "try:\n    result = add_apple(['Banana'])\n    assert result == ['Banana', 'Apple']\n    print('Correct! Apple added.')\nexcept AssertionError:\n    print('Incorrect. The list should end with Apple.')\nexcept Exception as e:\n    print(f'Error: {e}')"
  },
  {
    "id": 11,
    "title": "List Counter",
    "description": "Write a function <code>how_many</code> that returns the number of items in a list using <code>len()</code>.",
    "starterCode": "def how_many(items):\n    return 0",
    "testCode": "try:\n    assert how_many([1, 2, 3]) == 3\n    assert how_many([]) == 0\n    print('Correct! You can count.')\nexcept AssertionError:\n    print('Incorrect count.')\nexcept Exception as e:\n    print(f'Error: {e}')"
  }
]
```