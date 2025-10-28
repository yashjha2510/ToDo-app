// script.js

// 1. Select DOM elements
const form = document.querySelector('form');
const input = document.querySelector('input[placeholder="write your task"]');
const taskList = document.querySelector('.task-list');
const progress = document.getElementById('progress');
const numbers = document.getElementById('numbers');

// 2. Load tasks from localStorage or start empty
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

// 3. Utility: save tasks to localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// 4. Utility: update progress bar and numbers
function updateProgress() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  // update numbers like "2/3"
  numbers.textContent = `${completed}/${total || 0}`;
  // percentage for progress bar; if total = 0 set 0%
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  progress.style.width = pct + '%';
}

// 5. Render all tasks into the UL
function renderTasks() {
  // clear existing
  taskList.innerHTML = '';

  // create li for each task
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.id = task.id;

    // checkbox for complete toggle
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!task.completed;
    checkbox.className = 'task-checkbox';
    checkbox.title = 'Mark complete';

    // task text (span)
    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text;
    text.style.margin = '0 0.6rem';
    text.style.flex = '1';
    // style when completed
    if (task.completed) {
      text.style.textDecoration = 'line-through';
      text.style.opacity = '0.6';
    }

    // edit button
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'task-edit';
    editBtn.title = 'Edit task';
    editBtn.style.marginRight = '0.4rem';

    // delete button
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.className = 'task-delete';
    delBtn.title = 'Delete task';

    // layout container for item; use flex so buttons align
    li.style.display = 'flex';
    li.style.alignItems = 'center';
    li.style.gap = '0.4rem';
    li.style.padding = '0.6rem 0';
    li.style.borderBottom = '1px solid rgba(255,255,255,0.05)';

    // append children
    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(editBtn);
    li.appendChild(delBtn);
    taskList.appendChild(li);

    // -------- event handlers for this li --------

    // toggle complete
    checkbox.addEventListener('change', () => {
      task.completed = checkbox.checked;
      if (task.completed) {
        text.style.textDecoration = 'line-through';
        text.style.opacity = '0.6';
      } else {
        text.style.textDecoration = 'none';
        text.style.opacity = '1';
      }
      saveTasks();
      updateProgress();
    });

    // delete task
    delBtn.addEventListener('click', () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
      updateProgress();
    });

    // edit task (inline)
    editBtn.addEventListener('click', () => {
      // replace span with input
      const editInput = document.createElement('input');
      editInput.type = 'text';
      editInput.value = task.text;
      editInput.style.flex = '1';
      editInput.style.padding = '0.25rem';
      editInput.style.fontSize = '1rem';

      // swap elements
      li.replaceChild(editInput, text);
      editInput.focus();
      // select all text
      editInput.setSelectionRange(0, editInput.value.length);

      // save handler (on Enter or blur)
      function finishEdit(save) {
        const newVal = editInput.value.trim();
        if (save && newVal) {
          task.text = newVal;
        }
        // if empty and user saved, do not overwrite (keep old)
        // restore span
        text.textContent = task.text;
        li.replaceChild(text, editInput);
        saveTasks();
        renderTasks(); // re-render to ensure UI consistency
        updateProgress();
      }

      // enter saves
      editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          finishEdit(true);
        } else if (e.key === 'Escape') {
          finishEdit(false);
        }
      });

      // blur saves automatically
      editInput.addEventListener('blur', () => finishEdit(true));
    });

  }); // end forEach

  updateProgress();
}

// 6. Add new task from form
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return; // do nothing on empty
  const newTask = {
    id: Date.now().toString(), // unique id
    text,
    completed: false
  };
  tasks.push(newTask);
  saveTasks();
  input.value = '';
  renderTasks();
  // focus back to input for faster entry
  input.focus();
});

// 7. Initialize UI on first load
renderTasks();
