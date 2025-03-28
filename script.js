document.addEventListener('DOMContentLoaded', () => {
    // Load tasks from localStorage
    loadTasks();
    loadLongTermTasks();
    
    // Set up calendar
    setupCalendar();
    
    // Add task form submission
    const taskForm = document.getElementById('task-form');
    taskForm.addEventListener('submit', addTask);
    
    // Toggle between views
    const weeklyToggle = document.getElementById('weekly-toggle');
    const monthlyToggle = document.getElementById('monthly-toggle');
    const weeklyView = document.getElementById('weekly-view');
    const monthlyView = document.getElementById('monthly-view');
    
    weeklyToggle.addEventListener('click', () => {
        weeklyToggle.classList.add('active');
        monthlyToggle.classList.remove('active');
        weeklyView.classList.remove('hidden');
        monthlyView.classList.remove('active');
    });
    
    monthlyToggle.addEventListener('click', () => {
        monthlyToggle.classList.add('active');
        weeklyToggle.classList.remove('active');
        weeklyView.classList.add('hidden');
        monthlyView.classList.add('active');
    });
    
    // Month navigation
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    
    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        setupCalendar();
    });
    
    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        setupCalendar();
    });
    
    // Long-term task modal
    const modal = document.getElementById('long-term-modal');
    const modalClose = document.getElementById('modal-close');
    const cancelBtn = document.getElementById('cancel-long-term');
    const saveBtn = document.getElementById('save-long-term');
    
    modalClose.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    saveBtn.addEventListener('click', saveLongTermTask);
});

// Current date for calendar
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Function to set up the calendar
function setupCalendar() {
    const calendarEl = document.getElementById('calendar');
    const monthTitleEl = document.getElementById('current-month');
    
    // Clear previous calendar
    calendarEl.innerHTML = '';
    
    // Update month title
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    monthTitleEl.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    // Add weekday headers
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekdays.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'weekday-header';
        dayHeader.textContent = day;
        calendarEl.appendChild(dayHeader);
    });
    
    // Get first day of month and last day
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    // Get previous month's days to fill in start of calendar
    const prevMonthDays = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Get days from previous month
    if (prevMonthDays > 0) {
        const prevMonth = new Date(currentYear, currentMonth, 0);
        const prevMonthLastDay = prevMonth.getDate();
        
        for (let i = prevMonthDays - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            const dayEl = createCalendarDay(day, true);
            calendarEl.appendChild(dayEl);
        }
    }
    
    // Current month's days
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const isToday = day === currentDate.getDate() && 
                         currentMonth === currentDate.getMonth() && 
                         currentYear === currentDate.getFullYear();
        
        const dayEl = createCalendarDay(day, false, isToday);
        calendarEl.appendChild(dayEl);
    }
    
    // Next month's days to fill out grid
    const totalDaysShown = prevMonthDays + lastDay.getDate();
    const nextMonthDays = 7 - (totalDaysShown % 7);
    
    if (nextMonthDays < 7) {
        for (let day = 1; day <= nextMonthDays; day++) {
            const dayEl = createCalendarDay(day, true);
            calendarEl.appendChild(dayEl);
        }
    }
    
    // Load long-term tasks for this month
    displayLongTermTasks();
}

// Function to create a calendar day element
function createCalendarDay(day, isOtherMonth, isToday = false) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    
    if (isOtherMonth) {
        dayEl.classList.add('other-month');
    }
    
    if (isToday) {
        dayEl.classList.add('today');
    }
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayEl.appendChild(dayNumber);
    
    // Add button to add long-term task
    const addBtn = document.createElement('button');
    addBtn.className = 'add-long-term';
    addBtn.innerHTML = '<i class="fas fa-plus"></i>';
    dayEl.appendChild(addBtn);
    
    // Store date info in the element
    const month = isOtherMonth ? 
        (day > 15 ? currentMonth - 1 : currentMonth + 1) : currentMonth;
    const year = currentYear;
    
    dayEl.setAttribute('data-date', `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
    
    // Add event listener to open modal
    addBtn.addEventListener('click', () => {
        openLongTermModal(dayEl.getAttribute('data-date'));
    });
    
    return dayEl;
}

// Function to open long-term task modal
function openLongTermModal(date) {
    const modal = document.getElementById('long-term-modal');
    document.getElementById('selected-date').value = date;
    
    // Set default dates for the form
    const selectedDate = new Date(date);
    document.getElementById('long-term-start').value = date;
    
    // Default end date is 7 days after start
    const endDate = new Date(selectedDate);
    endDate.setDate(selectedDate.getDate() + 7);
    const formattedEndDate = endDate.toISOString().slice(0, 10);
    document.getElementById('long-term-end').value = formattedEndDate;
    
    modal.classList.add('show');
}

// Function to close modal
function closeModal() {
    const modal = document.getElementById('long-term-modal');
    modal.classList.remove('show');
    document.getElementById('long-term-form').reset();
}

// Function to save long-term task
function saveLongTermTask() {
    const name = document.getElementById('long-term-name').value;
    const startDate = document.getElementById('long-term-start').value;
    const endDate = document.getElementById('long-term-end').value;
    const description = document.getElementById('long-term-desc').value;
    const taskId = Date.now().toString();
    
    const longTermTask = {
        id: taskId,
        name,
        startDate,
        endDate,
        description
    };
    
    // Save to localStorage
    let longTermTasks = JSON.parse(localStorage.getItem('longTermTasks')) || [];
    longTermTasks.push(longTermTask);
    localStorage.setItem('longTermTasks', JSON.stringify(longTermTasks));
    
    // Update calendar
    displayLongTermTasks();
    
    // Close modal
    closeModal();
}

// Function to display long-term tasks on calendar
function displayLongTermTasks() {
    const longTermTasks = JSON.parse(localStorage.getItem('longTermTasks')) || [];
    
    // Clear existing tasks from calendar
    document.querySelectorAll('.long-term-task').forEach(el => el.remove());
    document.querySelectorAll('.more-tasks').forEach(el => el.remove());
    
    // Group tasks by date
    const tasksByDate = {};
    
    longTermTasks.forEach(task => {
        const startDate = new Date(task.startDate);
        const endDate = new Date(task.endDate);
        
        // Skip if task is not in current month
        if ((startDate.getMonth() !== currentMonth && endDate.getMonth() !== currentMonth) ||
            (startDate.getFullYear() !== currentYear && endDate.getFullYear() !== currentYear)) {
            return;
        }
        
        // Find all days between start and end date that are in the current month
        const taskDates = getDatesInRange(startDate, endDate);
        
        taskDates.forEach(date => {
            // Skip if date is not in current month
            if (date.getMonth() !== currentMonth || date.getFullYear() !== currentYear) {
                return;
            }
            
            const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            
            if (!tasksByDate[dateStr]) {
                tasksByDate[dateStr] = [];
            }
            
            tasksByDate[dateStr].push(task);
        });
    });
    
    // Display tasks for each date (max 3 tasks per day)
    for (const dateStr in tasksByDate) {
        const dayEl = document.querySelector(`.calendar-day[data-date="${dateStr}"]`);
        if (!dayEl) continue;
        
        const tasks = tasksByDate[dateStr];
        const maxVisibleTasks = 2; // Show at most 2 tasks
        
        // Add visible tasks
        tasks.slice(0, maxVisibleTasks).forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = 'long-term-task';
            taskEl.textContent = task.name;
            taskEl.setAttribute('data-id', task.id);
            taskEl.setAttribute('title', task.description || task.name);
            
            // Add event listener to show task details
            taskEl.addEventListener('click', () => {
                showTaskDetails(task);
            });
            
            dayEl.appendChild(taskEl);
        });
        
        // Add "more" indicator if needed
        if (tasks.length > maxVisibleTasks) {
            const moreEl = document.createElement('div');
            moreEl.className = 'more-tasks';
            moreEl.textContent = `+${tasks.length - maxVisibleTasks} more`;
            moreEl.setAttribute('title', `${tasks.length - maxVisibleTasks} more tasks`);
            
            moreEl.addEventListener('click', () => {
                // Could show a modal with all tasks for this day
                alert(`${tasks.length - maxVisibleTasks} more tasks for this day`);
            });
            
            dayEl.appendChild(moreEl);
        }
    }
}

// Function to get all dates between start and end
function getDatesInRange(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
}

// Function to show task details (could be enhanced to edit/delete)
function showTaskDetails(task) {
    // In a real application, you'd show a modal with the task details
    // For now, we'll just log it to the console
    console.log('Task details:', task);
    
    // Create related weekly tasks
    const startDate = new Date(task.startDate);
    
    // Check if within a week, create task for that day of the week
    const today = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(today.getDate() + 7);
    
    if (startDate >= today && startDate <= oneWeekFromNow) {
        const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][startDate.getDay()];
        
        const weeklyTask = {
            id: Date.now().toString(),
            name: `${task.name} (from long-term plan)`,
            startTime: '09:00',
            endTime: '10:00',
            day: dayOfWeek,
            status: 'not-started',
            longTermId: task.id // Reference to the parent task
        };
        
        // Add weekly task
        addTaskToDOM(weeklyTask);
        saveTask(weeklyTask);
        
        // Show a notification
        alert(`Added "${task.name}" to ${dayOfWeek} tasks!`);
    }
}

// Load long-term tasks from localStorage
function loadLongTermTasks() {
    const longTermTasks = JSON.parse(localStorage.getItem('longTermTasks')) || [];
    
    // Nothing to do here - tasks will be displayed when calendar is set up
}

// Function to add a new task
function addTask(e) {
    e.preventDefault();
    
    const taskName = document.getElementById('task-name').value;
    const taskStartTime = document.getElementById('task-start-time').value;
    const taskEndTime = document.getElementById('task-end-time').value;
    const taskDay = document.getElementById('task-day').value;
    const taskDescription = document.getElementById('task-description')?.value || '';
    
    // Create unique ID for the task
    const taskId = Date.now().toString();
    
    const task = {
        id: taskId,
        name: taskName,
        startTime: taskStartTime,
        endTime: taskEndTime,
        day: taskDay,
        status: 'not-started',
        description: taskDescription
    };
    
    // Add task to the day's task list
    addTaskToDOM(task);
    
    // Save to localStorage
    saveTask(task);
    
    // Reset form
    document.getElementById('task-form').reset();
}

// Function to add task to the DOM
function addTaskToDOM(task, isHidden = false) {
    const dayTasks = document.querySelector(`#${task.day} .tasks`);
    
    const taskElement = document.createElement('div');
    taskElement.classList.add('task');
    if (isHidden) {
        taskElement.classList.add('hidden-task');
    }
    taskElement.setAttribute('data-id', task.id);
    
    // Format time range for display (12-hour format)
    const formattedStartTime = formatTime(task.startTime);
    const formattedEndTime = formatTime(task.endTime);
    
    // Include a description field (empty by default if not provided)
    const description = task.description || '';
    
    taskElement.innerHTML = `
        <div class="task-time">${formattedStartTime} - ${formattedEndTime}</div>
        <div class="task-name">${task.name}</div>
        <div class="task-description" style="display: none;">${description}</div>
        <div class="task-status">
            <span>Status: </span>
            <div class="status-options">
                <button class="status-not-started ${task.status === 'not-started' ? 'active' : ''}" 
                    onclick="updateTaskStatus('${task.id}', 'not-started')">
                    <i class="fas fa-clock"></i> Not Started
                </button>
                <button class="status-in-progress ${task.status === 'in-progress' ? 'active' : ''}" 
                    onclick="updateTaskStatus('${task.id}', 'in-progress')">
                    <i class="fas fa-spinner"></i> In Progress
                </button>
                <button class="status-completed ${task.status === 'completed' ? 'active' : ''}" 
                    onclick="updateTaskStatus('${task.id}', 'completed')">
                    <i class="fas fa-check"></i> Completed
                </button>
            </div>
        </div>
        <div class="task-actions">
            <button onclick="deleteTask('${task.id}')"><i class="fas fa-trash"></i></button>
            <button onclick="editTask('${task.id}')"><i class="fas fa-edit"></i></button>
            <button class="toggle-description" onclick="toggleDescription(this)"><i class="fas fa-chevron-down"></i></button>
        </div>
    `;
    
    dayTasks.appendChild(taskElement);
}

// Format time to 12-hour format
function formatTime(time) {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const amPm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${amPm}`;
}

// Save task to localStorage
function saveTask(task) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load tasks from localStorage
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Group tasks by day
    const tasksByDay = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
    };
    
    // Process tasks for backward compatibility and group by day
    tasks.forEach(task => {
        // Handle backward compatibility with old tasks that only have 'time'
        if (task.time && !task.startTime) {
            task.startTime = task.time;
            task.endTime = task.time;
        }
        
        // Group task by day
        if (tasksByDay[task.day]) {
            tasksByDay[task.day].push(task);
        }
    });
    
    // Sort tasks by start time for each day
    for (const day in tasksByDay) {
        tasksByDay[day].sort((a, b) => {
            return a.startTime.localeCompare(b.startTime);
        });
        
        // Add day header with task count if there are tasks
        if (tasksByDay[day].length > 0) {
            const dayContainer = document.querySelector(`#${day}`);
            const taskCount = tasksByDay[day].length;
            
            // Add task counter and collapse/expand button if there are multiple tasks
            if (taskCount > 3) {
                const tasksHeader = document.createElement('div');
                tasksHeader.className = 'tasks-header';
                tasksHeader.innerHTML = `
                    <span>${taskCount} tasks</span>
                    <button class="collapse-tasks" onclick="toggleDayTasks('${day}')">
                        <i class="fas fa-chevron-up"></i>
                    </button>
                `;
                dayContainer.querySelector('.tasks').appendChild(tasksHeader);
            }
        }
        
        // Add each task to the DOM
        tasksByDay[day].forEach((task, index) => {
            addTaskToDOM(task, index >= 3); // Hide tasks after the first 3
        });
    }
}

// Function to toggle all tasks in a day
function toggleDayTasks(day) {
    const dayContainer = document.querySelector(`#${day}`);
    const hiddenTasks = dayContainer.querySelectorAll('.hidden-task');
    const button = dayContainer.querySelector('.collapse-tasks i');
    
    let isExpanded = button.classList.contains('fa-chevron-up');
    
    if (isExpanded) {
        // Collapse
        hiddenTasks.forEach(task => {
            task.style.display = 'none';
        });
        button.classList.remove('fa-chevron-up');
        button.classList.add('fa-chevron-down');
    } else {
        // Expand
        hiddenTasks.forEach(task => {
            task.style.display = 'block';
        });
        button.classList.remove('fa-chevron-down');
        button.classList.add('fa-chevron-up');
    }
}

// Update task status
function updateTaskStatus(taskId, status) {
    // Update in DOM
    const taskElement = document.querySelector(`.task[data-id="${taskId}"]`);
    
    // Remove all status classes and add the new one
    taskElement.querySelectorAll('.status-options button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    taskElement.querySelector(`.status-${status}`).classList.add('active');
    
    // Add a subtle animation effect
    taskElement.classList.add('status-updated');
    setTimeout(() => {
        taskElement.classList.remove('status-updated');
    }, 500);
    
    // Update in localStorage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
        tasks[taskIndex].status = status;
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}

// Delete task
function deleteTask(taskId) {
    // Remove from DOM
    const taskElement = document.querySelector(`.task[data-id="${taskId}"]`);
    taskElement.remove();
    
    // Remove from localStorage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(task => task.id !== taskId);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Edit task
function editTask(taskId) {
    // Get task data
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = tasks.find(task => task.id === taskId);
    
    if (!task) return;
    
    // Populate form with task data
    document.getElementById('task-name').value = task.name;
    
    // Handle backward compatibility with old tasks that have only 'time'
    if (task.startTime && task.endTime) {
        document.getElementById('task-start-time').value = task.startTime;
        document.getElementById('task-end-time').value = task.endTime;
    } else if (task.time) {
        document.getElementById('task-start-time').value = task.time;
        document.getElementById('task-end-time').value = task.time;
    }
    
    document.getElementById('task-day').value = task.day;
    
    // Handle description field
    if (document.getElementById('task-description')) {
        document.getElementById('task-description').value = task.description || '';
    }
    
    // Delete the task since we're editing it
    deleteTask(taskId);
    
    // Focus on the task name input
    document.getElementById('task-name').focus();
}

// Function to toggle description visibility
function toggleDescription(button) {
    const task = button.closest('.task');
    const description = task.querySelector('.task-description');
    const icon = button.querySelector('i');
    
    if (description.style.display === 'none') {
        description.style.display = 'block';
        task.classList.add('expanded');
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    } else {
        description.style.display = 'none';
        task.classList.remove('expanded');
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    }
} 