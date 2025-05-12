const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const prioritySelect = document.getElementById('priority');
const dueDateInput = document.getElementById('dueDate');
const toggleDarkModeButton = document.getElementById('toggleDarkMode');
const filterSelect = document.getElementById('filterTasks');
const searchInput = document.getElementById('searchInput');
const completionPercentage = document.getElementById('completionPercentage');

let darkMode = false;

// Load tasks from local storage
const loadTasks = () => {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => addTaskToList(task.text, task.priority, task.dueDate, task.completed));
    updateCompletionPercentage();
};

// Function to validate task input
const validateTaskInput = (taskText, dueDate) => {
    if (taskText === '') {
        alert('Task cannot be empty.');
        return false;
    }
    if (taskText.length > 100) {
        alert('Task cannot exceed 100 characters.');
        return false;
    }
    const regex = /^[a-zA-Z0-9\s]*$/; // Only allows letters, numbers, and spaces
    if (!regex.test(taskText)) {
        alert('Task can only contain letters, numbers, and spaces.');
        return false;
    }
    if (new Date(dueDate) < new Date()) {
        alert('Due date cannot be in the past.');
        return false;
    }
    return true;
};

const addTaskToList = (taskText, priority, dueDate, completed) => {
    const li = document.createElement('li');
    li.textContent = `${taskText} (Due: ${dueDate}) [${priority}]`;
    if (completed) li.classList.add('completed');

    const completeButton = document.createElement('button');
    completeButton.textContent = '✓';
    completeButton.addEventListener('click', function() {
        li.classList.toggle('completed');
        saveTasks();
        updateCompletionPercentage();
    });

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.className = 'remove';
    removeButton.addEventListener('click', function() {
        li.remove();
        saveTasks();
        updateCompletionPercentage();
    });

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.className = 'edit';
    editButton.addEventListener('click', function() {
        const newTaskText = prompt("Edit your task:", taskText);
        if (newTaskText !== null && validateTaskInput(newTaskText, dueDate)) {
            li.firstChild.textContent = `${newTaskText} (Due: ${dueDate}) [${priority}]`;
            saveTasks();
        }
    });

    li.appendChild(completeButton);
    li.appendChild(removeButton);
    li.appendChild(editButton);
    taskList.appendChild(li);
};

const saveTasks = () => {
    const tasks = Array.from(taskList.children).map(li => {
        const parts = li.textContent.split(' (Due: ');
        const taskText = parts[0];
        const details = parts[1].split(') [');
        const dueDate = details[0];
        const priority = details[1].replace(']', '');
        const completed = li.classList.contains('completed');
        return { text: taskText, priority, dueDate, completed };
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
};

const applyFilter = () => {
    const filterValue = filterSelect.value;
    const tasks = Array.from(taskList.children);
    
    tasks.forEach(task => {
        if (filterValue === 'all') {
            task.style.display = 'flex';
        } else if (filterValue === 'active' && task.classList.contains('completed')) {
            task.style.display = 'none';
        } else if (filterValue === 'completed' && !task.classList.contains('completed')) {
            task.style.display = 'none';
        } else {
            task.style.display = 'flex';
        }
    });
};

const updateCompletionPercentage = () => {
    const tasks = Array.from(taskList.children);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.classList.contains('completed')).length;
    const percentage = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
    completionPercentage.textContent = `Completion: ${percentage}%`;
};

const sortTasksByDate = () => {
    const tasks = Array.from(taskList.children);
    tasks.sort((a, b) => {
        const dateA = new Date(a.textContent.match(/\(Due: (.*?)\)/)[1]);
        const dateB = new Date(b.textContent.match(/\(Due: (.*?)\)/)[1]);
        return dateA - dateB;
    });
    taskList.innerHTML = ''; // Clear the current list
    tasks.forEach(task => taskList.appendChild(task)); // Re-add sorted tasks
};

document.getElementById('addTaskButton').addEventListener('click', function() {
    const taskText = taskInput.value.trim();
    const priority = prioritySelect.value;
    const dueDate = dueDateInput.value;

    if (validateTaskInput(taskText, dueDate)) {
        addTaskToList(taskText, priority, dueDate, false);
        saveTasks();
        updateCompletionPercentage();
        taskInput.value = ''; // Clear input field
        dueDateInput.value = ''; // Clear date field
    }
});

taskInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        document.getElementById('addTaskButton').click();
    }
});

loadTasks();

toggleDarkModeButton.addEventListener('click', function() {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
});

// Load dark mode preference from local storage
const storedDarkMode = JSON.parse(localStorage.getItem('darkMode'));
if (storedDarkMode) {
    darkMode = true;
    document.body.classList.add('dark-mode');
}

filterSelect.addEventListener('change', applyFilter);

// Implement search functionality
searchInput.addEventListener('input', function() {
    const searchTerm = searchInput.value.toLowerCase();
    const tasks = Array.from(taskList.children);

    tasks.forEach(task => {
        const taskText = task.textContent.toLowerCase();
        if (taskText.includes(searchTerm)) {
            task.style.display = 'flex';
        } else {
            task.style.display = 'none';
        }
    });
});