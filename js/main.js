import { messages, categories, patterns, markups } from './templates.js'

const addTaskForm = document.forms.addTask;
const formFields = addTaskForm.querySelectorAll('.form-field');
const taskList = document.querySelector('.task-list');
const notifications = document.querySelector('.notifications');
const filterItem = document.querySelector('.sorting');
const sortingCount = document.querySelector('.sorting__count');

let allTaskArr = JSON.parse(localStorage.getItem('allTasks')) || [];
const filterSettings = JSON.parse(localStorage.getItem('filters')) || {
  statusSort: 'all',
  timeSort: '',
  categorySort: '',
};

function updateTaskList(arr) {
  taskList.innerHTML = '';
  arr.forEach((task) => addTaskOnPage(task));
  toggleFilters(allTaskArr);
};
updateTaskList(allTaskArr);

function updateFiltersItems() {
  const allFilters = filterItem.querySelectorAll('.sort-radio__input');
  allFilters.forEach((filter) => {
    let isTrue = filter.value === filterSettings[filter.name];
    isTrue ? filter.checked = true : null;
  });
};
updateFiltersItems();

function toggleFilters(arr) {
  arr.length > 1 ?
    filterItem.classList.remove('hide') :
    filterItem.classList.add('hide');
};

function addFieldError(input, errorMessage) {
  const group = input.closest('.add-task__group');
  group.classList.remove('success');
  group.classList.add('error');
  group.querySelector('.form-error-msg').textContent = errorMessage;
};

function addFieldSuccess(input) {
  const group = input.closest('.add-task__group');
  group.classList.add('success');
  group.classList.remove('error');
  group.querySelector('.form-error-msg').textContent = '';
};

function checkTextLength(target, message) {
  if (!target.value.match(patterns.characters)) {
    addFieldError(target, message);
  } else {
    addFieldSuccess(target);
  };
};

function checkOnFocus(target) {
  if (target.value.length < 1) {
    addFieldError(target, messages.errorEmpty);
  };
};

function checkOnBlur(target) {
  if (target.closest('.add-task__group').classList.contains('success')) {
    target.closest('.add-task__group').
      querySelector('.form-error-msg').
      textContent = '';
  };
};

function checkDate(target, message) {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 1);
  const currentYear = new Date();
  currentYear.setDate(currentYear.getDate() + 365);
  if (new Date(addTaskForm.taskDate.value) < currentDate) {
    addFieldError(target, message.smDate);
  } else if (new Date(addTaskForm.taskDate.value) >= currentYear) {
    addFieldError(target, message.lgDate);
  } else {
    addFieldSuccess(target)
  };
};

function checkTime(target, message) {
  const nowDate = Date.now();
  const chosenDate = Date.parse(`${addTaskForm.taskDate.value}T${addTaskForm.taskTime.value}`);
  const differenceDate = chosenDate - nowDate;
  if (target.closest('.add-task__group').previousElementSibling.closest('.error')) {
    addFieldError(target, message.getDate);
  } else if (differenceDate <= 1800000) {
    addFieldError(target, message.smTime);
  } else {
    addFieldSuccess(target)
  };
};

function formInputHandler(e) {
  const target = e.target;
  if (target.name === 'taskText') {
    checkTextLength(target, messages.errorText);
  } else if (target.name === 'taskDate') {
    checkDate(target, messages.errorDate);
  } else if (target.name === 'taskTime') {
    checkTime(target, messages.errorTime);
  };
};

function addFormValidation(formName) {
  formName.addEventListener('input', formInputHandler);
  formFields.forEach((input) => {
    input.addEventListener('focus', () => checkOnFocus(input));
    input.addEventListener('blur', () => checkOnBlur(input));
  })
};

addFormValidation(addTaskForm);

// Submit

function checkFormSuccess(formName, groupClassName) {
  const allGroups = formName.querySelectorAll(groupClassName);
  return [...allGroups].every((group) => group.classList.contains('success'));
};

function markFieldsWithError(formName, groupClassName) {
  const allGroups = formName.querySelectorAll(groupClassName);
  [...allGroups].forEach((group) => !group.classList.contains('success') ?
    group.classList.add('error') :
    null)
};

// Create task

function createTask(form) {
  const taskObj = {
    isId: Date.now(),
    isText: form.taskText.value,
    isCategory: form.taskCategory.value,
    isDatetime: `${form.taskDate.value}T${form.taskTime.value}`,
    isDone: false,
    isArchive: false,
  };
  return taskObj;
};

function clearForm(formName, groupClassName) {
  const allGroups = formName.querySelectorAll(groupClassName);
  allGroups.forEach((group) => group.classList.remove('success'))
  formName.reset();
};

function updateLocalStorage(items) {
  localStorage.setItem('allTasks', JSON.stringify(items))
};

function getTimeLeft(datatime) {
  const currentDate = new Date();
  const targetDate = new Date(datatime);
  const diffInHours = Math.floor((targetDate - currentDate) / (3600 * 1000));
  const diffInMinutes = Math.floor((targetDate - currentDate) / (60 * 1000));

  if (diffInHours >= 24 * 30) {
    return `~ ${Math.round(diffInHours / (24 * 30))} months left until completion`;
  } else if (diffInHours >= 24) {
    return `~ ${Math.round(diffInHours / 24)} days left until completion`;
  } else if (diffInHours >= 1) {
    return `~ ${diffInHours} hours left until completion`;
  } else if (diffInHours >= 0) {
    return `~ ${diffInMinutes} minutes left until completion`;
  } else {
    return 'Task expired';
  };
};

function getTaskDone(target) {
  if (target.type !== 'checkbox') return;
  target.closest('.task').classList.toggle('done');
  const task = allTaskArr.find((el) => el.isId === +target.id);
  task.isDone = !task.isDone;
  updateLocalStorage(allTaskArr);
  updateTaskList(allTaskArr);
  filterAllTask()
  if (target.checked === true) createNotice(messages.notifications.typeDone, messages.notifications.textDone);
};

function getTaskArchive(target) {
  if (!target.classList.contains('task__btn--archive')) return;
  target.closest('.task').classList.toggle('archive');
  let taskId = target.closest('.task').querySelector('.checkbox-input').id;
  const task = allTaskArr.find((task) => task.isId === +taskId);
  task.isArchive = !task.isArchive;
  updateLocalStorage(allTaskArr);
  updateTaskList(allTaskArr);
  filterAllTask()
  target.closest('.task').classList.contains('archive') ?
    createNotice(messages.notifications.typeArchive, messages.notifications.textArchive) :
    createNotice(messages.notifications.typeArchive, messages.notifications.textUnarchive);
};

function getEditTask(target) {
  if (!target.classList.contains('task__btn--edit')) return;
  let taskId = target.closest('.task').querySelector('.checkbox-input').id;
  const task = allTaskArr.find((el) => el.isId === +taskId);
  const taskWrapper = target.closest('.task');
  taskWrapper.insertAdjacentHTML('afterbegin', markups.editable);
  const formEdit = document.forms.editTask;
  formEdit.taskText.textContent = task.isText;
  addFormValidation(formEdit);
};

function removeEditForm(target) {
  if (!target.classList.contains('js_reject-changes')) return;
  const formEdit = document.forms.editTask;
  formEdit.remove();
};

function saveEditTask(target) {
  if (!target.classList.contains('js_save-changes')) return;
  let taskId = target.closest('.task').querySelector('.checkbox-input').id;
  const task = allTaskArr.find((el) => el.isId === +taskId);
  const taskText = target.closest('.add-task').querySelector('.add-task__group');
  if (taskText.classList.contains('error')) return;
  task.isText = taskText.querySelector('.form-field').value;
  updateLocalStorage(allTaskArr);
  updateTaskList(allTaskArr);
  filterAllTask()
  removeEditForm(target);
  createNotice(messages.notifications.typeEdit, messages.notifications.testEdit);
};

const removeTaskFromList = (target) => {
  if (!target.classList.contains('task__btn--remove')) return;
  let taskId = target.closest('.task').querySelector('.checkbox-input').id;
  target.closest('.task-list__item').remove();
  allTaskArr = allTaskArr.filter((el) => el.isId !== +taskId);
  updateLocalStorage(allTaskArr);
  updateTaskList(allTaskArr);
  filterAllTask()
  createNotice(messages.notifications.typeRemove, messages.notifications.textRemove);
};

function addTaskOnPage(task) {
  const categoryName = categories[task.isCategory];
  const taskTime = getTimeLeft(task.isDatetime);
  // Create task
  taskList.insertAdjacentHTML('afterbegin', markups.task);
  // Find element
  const taskElement = taskList.querySelector('.task');
  const taskCheckboxInput = taskList.querySelector('.checkbox-input');
  const taskCheckboxLabel = taskList.querySelector('.task__checkbox');
  const taskName = taskList.querySelector('.task__name');
  const taskCategory = taskList.querySelector('.task__category');
  const taskDate = taskList.querySelector('.task__date');
  const taskInput = taskList.querySelector('.checkbox-input');
  // Add attributes
  taskElement.classList.add(task.isCategory);
  taskCheckboxInput.setAttribute('name', task.isId);
  taskCheckboxInput.setAttribute('id', taskCheckboxInput.name);
  taskCheckboxLabel.setAttribute('for', taskCheckboxInput.name);
  taskName.textContent = task.isText;
  taskCategory.setAttribute('title', categoryName);
  taskDate.textContent = taskTime;
  // Add or remove statuses
  task.isDone ? taskElement.classList.add('done') : taskElement.classList.remove('done');
  task.isDone ? taskInput.checked = true : taskInput.checked = false;
  task.isArchive ? taskElement.classList.add('archive') : taskElement.classList.remove('archive');
};

function handleAddTaskBtn(e) {
  e.preventDefault();
  const error = document.querySelector('.form-error');
  if (checkFormSuccess(addTaskForm, '.add-task__group')) {
    const newTask = createTask(addTaskForm);
    allTaskArr.push(newTask);
    error.classList.remove('show');
    updateLocalStorage(allTaskArr);
    addTaskOnPage(newTask);
    clearForm(addTaskForm, '.add-task__group');
    updateTaskList(allTaskArr)
    filterAllTask()
    createNotice(messages.notifications.typeAdd, messages.notifications.textAdd);
  } else {
    markFieldsWithError(addTaskForm, '.add-task__group');
    error.classList.add('show');
  };
};

addTaskForm.addEventListener('submit', (e) => handleAddTaskBtn(e));
taskList.addEventListener('click', (e) => getTaskDone(e.target));
taskList.addEventListener('click', (e) => getTaskArchive(e.target));
taskList.addEventListener('click', (e) => getEditTask(e.target));
taskList.addEventListener('click', (e) => removeEditForm(e.target));
taskList.addEventListener('click', (e) => saveEditTask(e.target));
taskList.addEventListener('click', (e) => removeTaskFromList(e.target));

function createNotice(type, text) {
  notifications.insertAdjacentHTML('afterbegin', markups.notification);
  notifications.firstElementChild.classList.add(type);
  notifications.firstElementChild.firstElementChild.textContent = text;
  setTimeout(() => {
    notifications.lastElementChild.remove();
  }, 3000)
};

// Filtering
function getTimeInMinutes(datetime) {
  return Math.floor((new Date(datetime) - new Date()) / (1000 * 60));
};

function getTimeInDays(datetime) {
  return Math.floor((new Date(datetime) - new Date()) / (1000 * 60 * 60 * 24));
};

function filterAllTask() {
  const statusArr = sortByStatus(allTaskArr);
  const categoryArr = sortByCategory(statusArr);
  const timeArr = sortByTime(categoryArr)
  updateTaskList(timeArr);
  sortingCount.textContent = timeArr.length;
};

function sortByStatus(arr) {
  let sorted = [];
  const sortStatus = filterSettings.statusSort;
  switch (sortStatus) {
    case 'done':
      sorted = arr.filter((task) => task.isDone === true && task.isArchive === false);
      break;
    case 'undone':
      sorted = arr.filter((task) => task.isDone === false && task.isArchive === false);
      break;
    case 'archive':
      sorted = arr.filter((task) => task.isArchive === true);
      break;
    default:
      sorted = arr;
      break;
  };
  return sorted;
};

function sortByCategory(arr) {
  let sorted = [];
  const sortCategory = filterSettings.categorySort;
  switch (sortCategory) {
    case 'urgent':
      sorted = arr.filter((task) => task.isCategory === 'urgent');
      break;
    case 'study':
      sorted = arr.filter((task) => task.isCategory === 'study');
      break;
    case 'work':
      sorted = arr.filter((task) => task.isCategory === 'work');
      break;
    case 'hobby':
      sorted = arr.filter((task) => task.isCategory === 'hobby');
      break;
    default:
      sorted = arr;
      break;
  };
  return sorted;
};

function sortByTime(arr) {
  let sorted = [];
  const sortTime = filterSettings.timeSort;
  switch (sortTime) {
    case 'new':
      sorted = arr.filter((task) => getTimeInDays(task.isDatetime) < 1 && getTimeLeft(task.isDatetime) !== 'Task expired');
      break;
    case 'expired':
      sorted = arr.filter((task) => getTimeLeft(task.isDatetime) === 'Task expired');
      break;
    case 'oneWeek':
      sorted = arr.filter((task) => getTimeInDays(task.isDatetime) <= 7 && getTimeLeft(task.isDatetime) !== 'Task expired');
      break;
    case 'oneMonth':
      sorted = arr.filter((task) => getTimeInDays(task.isDatetime) <= 30 && getTimeLeft(task.isDatetime) !== 'Task expired');
      break;
    case 'closest':
      sorted = [...arr].sort((a, b) => getTimeInMinutes(b.isDatetime) - getTimeInMinutes(a.isDatetime))
      break;
    case 'distance':
      sorted = [...arr].sort((a, b) => getTimeInMinutes(a.isDatetime) - getTimeInMinutes(b.isDatetime))
      break;
    default:
      sorted = arr;
      break;
  };
  return sorted;
};

function updateFilters(target) {
  if (!target.classList.contains('sort-radio__input')) return;
  filterSettings[target.name] = target.value;
  localStorage.setItem('filters', JSON.stringify(filterSettings));
  filterAllTask();
};
filterItem.addEventListener('click', (e) => updateFilters(e.target));