import playList from './playList.js';

/* Languages */
const ru = 'Ru';
const eng = 'Eng';

/* Audio-player */
const audio = new Audio();
const button = document.querySelector('.play');
const buttonPrev = document.querySelector('.play-prev');
const buttonNext = document.querySelector('.play-next');
let isPlay = false;
let playNum = 0;

const volumeBtn = document.querySelector('.volume-button');
const volumeSlider = document.querySelector('.volume-slider');
const timeLine = document.querySelector('.timeline');
const timeLength = document.querySelector('.length');


/* Image-slider */
const slidePrev = document.querySelector('.slide-prev');
const slideNext = document.querySelector('.slide-next');

/* Todo-list */
const todoForm = document.querySelector('.todo-form');
const todoInput = document.querySelector('.todo-input');
const todoItemsList = document.querySelector('.todo-items');
let todos = [];

let randomNum = getRandomNum(1, 20);

const changeQuote = document.querySelector('.change-quote');

const timeOfDay = getTimeOfDay();

const city = document.querySelector('.city');

const languages = document.querySelector('.languages-list');

window.onload = function() {
  /* Image-slider */
  slidePrev.addEventListener('click', getSlidePrev);
  slideNext.addEventListener('click', getSlideNext);

  /* Audio-player */
  button.addEventListener('click', toggleBtn);
  button.addEventListener('click', playAudio);
  buttonPrev.addEventListener('click', playPrev);
  buttonNext.addEventListener('click', playNext);
  audio.addEventListener('ended', playNext);

  audio.addEventListener('loadeddata', () => {
    timeLength.textContent = getTimeCode(audio.duration);
    audio.volume = 0.5;
  }, false);

  volumeBtn.addEventListener('click', () => {
    const volumeEl = document.querySelector('.volume-container .volume');

    audio.muted = !audio.muted;
    if (audio.muted) {
      volumeEl.classList.remove('icono-volumeMedium');
      volumeEl.classList.add('icono-volumeMute');
    } else {
      volumeEl.classList.add('icono-volumeMedium');
      volumeEl.classList.remove('icono-volumeMute');
    }
  });

  volumeSlider.addEventListener('click', event => {
    const sliderWidth = window.getComputedStyle(volumeSlider).width;
    const newVolume = event.offsetX / parseInt(sliderWidth);
    const volumePercentage = document.querySelector('.volume-percentage');

    audio.volume = newVolume;
    volumePercentage.style.width = newVolume * 100 + '%';
  }, false);

  timeLine.addEventListener('click', event => {
    const timeLineWidth = window.getComputedStyle(timeLine).width;
    const timeToSeek = event.offsetX / parseInt(timeLineWidth) * audio.duration;

    audio.currentTime = timeToSeek;
  }, false);

  setInterval(() => {
    const progressBar = document.querySelector('.progress');
    const currentTime = document.querySelector('.current');

    progressBar.style.width = audio.currentTime / audio.duration * 100 + '%';
    currentTime.textContent = getTimeCode(audio.currentTime);
  }, 500);


  /* Weather */
  city.addEventListener('change', getWeather);
  setTimeout(getWeather, 0);

  /* Quotes */
  changeQuote.addEventListener('click', getQuotes);
  getQuotes();

  /* User name */
  clearInput();
  setInputDefaultValue();

  /* Todo-list */
  todoForm.addEventListener('submit', event => {
    event.preventDefault();
    addTodo(todoInput.value);
  });
  getFromLocalStorage();
  todoItemsList.addEventListener('click', event => {
    if (event.target.type === 'checkbox') {
      toggleTodo(event.target.parentElement.getAttribute('data-key'));
    }

    if (event.target.classList.contains('delete-button')) {
      deleteTodo(event.target.parentElement.getAttribute('data-key'));
    }
  });

  showTime();

  setBg(randomNum, timeOfDay);

  renderPlayList();

  setLocalStorage();
  getLocalStorage();

  languages.addEventListener('click', toggleLang);
}

function showTime() {
  const time = document.querySelector('.time');
  const date = new Date();
  const currentTime = date.toLocaleTimeString('ru-RU');

  time.textContent = currentTime;
  showDay();
  showGreeting();
  setTimeout(showTime, 1000);
}

function showDay() {
  const lang = document.querySelector('.lang-active');
  const dateNode = document.querySelector('.date');
  const date = new Date();
  const options = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }
  let currentDate;
  if (lang.textContent === eng) {
    currentDate = date.toLocaleDateString('en-US', options);
  } else if (lang.textContent === ru) {
    currentDate = date.toLocaleDateString('ru-RU', options);
  }

  dateNode.textContent = currentDate;
}

function showGreeting() {
  const lang = document.querySelector('.lang-active');
  const greeting = document.querySelector('.greeting');
  const timeOfDay = getTimeOfDay();
  let greetingText;

  if (lang.textContent === eng) {
    greetingText = `Good ${ timeOfDay }, `;
  } else if (lang.textContent === ru) {
    if (timeOfDay === 'ночи') {
      greetingText = `Доброй ${ timeOfDay }, `;
    } else if (timeOfDay === 'утро') {
      greetingText = `Доброе ${ timeOfDay }, `;
    } else if (timeOfDay === 'день' || timeOfDay === 'вечер') {
      greetingText = `Добрый ${ timeOfDay }, `;
    }
  }

  greeting.textContent = greetingText;
}

/*
  * night: 00:00 - 05:59 equal 0
  * morning: 06:00 - 11:59 equal 1
  * afternoon: 12:00 - 17:59 equal 2
  * evening: 18:00 - 23:59 equal 3
*/
function getTimeOfDay() {
  const lang = document.querySelector('.lang-active');
  const date = new Date();
  const hours = date.getHours();
  const arr = [ 'night', 'morning', 'afternoon', 'evening', 'ночи', 'утро', 'день', 'вечер'];
  const partOfDay = Math.floor(hours / 6);
  let res;

  if (lang.textContent === eng) {
    if (partOfDay === 0) {
      res = arr[0];
    } else if (partOfDay === 1) {
      res = arr[1];
    } else if (partOfDay === 2) {
      res = arr[2];
    } else if (partOfDay === 3) {
      res = arr[3];
    }
  } else if (lang.textContent === ru) {
    if (partOfDay === 0) {
      res = arr[4];
    } else if (partOfDay === 1) {
      res = arr[5];
    } else if (partOfDay === 2) {
      res = arr[6];
    } else if (partOfDay === 3) {
      res = arr[7];
    }
  }

  return res;
}

/* Including min and max */
function getRandomNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function setBg(randomNum, timeOfDay) {
  let bgNum = randomNum.toString();

  if (bgNum.length === 1) {
    bgNum = bgNum.padStart(2, '0');
  }

  document.body.style.backgroundImage = `url('https://raw.githubusercontent.com/penguin-one/images/main/${ timeOfDay }/${ bgNum }.webp')`;
}

function getSlideNext() {
  const img = new Image();

  if (randomNum === 20) {
    randomNum = 1;

    img.src = `https://raw.githubusercontent.com/penguin-one/images/main/${ timeOfDay }/01.webp`;
    img.onload = () => {
      document.body.style.backgroundImage = `url(${ img.src })`;
    }
  } else {
    randomNum += 1;

    let bgNum = randomNum.toString();

    if (bgNum.length === 1) {
      bgNum = bgNum.padStart(2, '0');
    }

    img.src = `https://raw.githubusercontent.com/penguin-one/images/main/${ timeOfDay }/${ bgNum }.webp`;
    img.onload = () => {
      document.body.style.backgroundImage = `url(${ img.src })`;
    }
  }
}

function getSlidePrev() {
  const img = new Image();

  if (randomNum === 1) {
    randomNum = 20;

    img.scr = `https://raw.githubusercontent.com/penguin-one/images/main/${ timeOfDay }/20.webp`;
    img.onload = () => {
      document.body.style.backgroundImage = `url(${ img.src })`;
    }
  } else {
    randomNum -= 1;

    let bgNum = randomNum.toString();

    if (bgNum.length === 1) {
      bgNum = bgNum.padStart(2, '0');
    }

    img.src = `https://raw.githubusercontent.com/penguin-one/images/main/${ timeOfDay }/${ bgNum }.webp`;
    img.onload = () => {
      document.body.style.backgroundImage = `url(${ img.src })`;
    }
  }
}

function clearInput() {
  const nameInput = document.querySelector('.name');

  nameInput.onclick = () => {
    if (nameInput.placeholder === '[Enter name]') {
      nameInput.placeholder = '';
    }
  }
}

function setInputDefaultValue() {
  const nameInput = document.querySelector('.name');

  window.onclick = (event) => {
    if (event.target !== nameInput && nameInput.placeholder === '') {
      nameInput.placeholder = '[Enter name]';
    }
  }
}

function setLocalStorage() {
  const nameInput = document.querySelector('.name');
  const city = document.querySelector('.city');
  const lang = document.querySelectorAll('.languages-item');

  nameInput.oninput = () => {
    localStorage.setItem('name', nameInput.value);
  }
  city.oninput = () => {
    localStorage.setItem('city', city.value);
  }

  lang.forEach(item => {
    item.onclick = () => {
      localStorage.setItem('lang', item.textContent);
    }
  });
}

function getLocalStorage() {
  const nameInput = document.querySelector('.name');
  nameInput.value = localStorage.getItem('name');

  const city = document.querySelector('.city');
  city.value = localStorage.getItem('city');
  if (city.value === '') {
    city.value = 'Minsk';
  }

  if (localStorage.getItem('lang') != null) {
    const lang = document.querySelectorAll('.languages-item');
    lang.forEach(item => {
      if (item.textContent == localStorage.getItem('lang')) {
        item.textContent = localStorage.getItem('lang');
        item.classList.add('lang-active');
      } else {
        item.classList.remove('lang-active');
      }
    });

    togglePlaceholderGreeting();
    togglePlaceholderAndValueCity();
    getQuotes();
    getWeather();
    translateTodo();
    translateSetting();
  }
}

/* Audio-player */
function playAudio() {
  let audioList = document.querySelectorAll('.play-item');
  const trackName = document.querySelector('.track-name');

  audio.src = playList[playNum].src;

  if (!isPlay) {
    audio.currentTime = 0;
    audio.play();
    isPlay = true;
    trackName.style.opacity = "1";
    trackName.textContent = playList[playNum].title;
    audioList[playNum].style.color = '#C5B358';
  } else {
    audio.pause();
    isPlay = false;
  }
}

function playAudioAdd() {
  if (!button.classList.contains('pause')) {
    button.classList.toggle('pause');
  }
  audio.src = playList[playNum].src;
  audio.currentTime = 0;
  audio.play();
  isPlay = true;
}

function playPrev() {
  let audioList = document.querySelectorAll('.play-item');
  const trackName = document.querySelector('.track-name');

  if (playNum === 0) {
    audioList[playNum].style.color = '#fff';
    playNum = 3;
    playAudioAdd();
    trackName.style.opacity = "1";
    trackName.textContent = playList[playNum].title;
    audioList[playNum].style.color = '#C5B358';
  } else {
    playNum -= 1;
    playAudioAdd();
    trackName.style.opacity = "1";
    trackName.textContent = playList[playNum].title;
    audioList[playNum].style.color = '#C5B358';
    audioList[playNum+1].style.color = '#fff';
  }
}

function playNext() {
  let audioList = document.querySelectorAll('.play-item');
  const trackName = document.querySelector('.track-name');

  if (playNum === 3) {
    audioList[playNum].style.color = '#fff';
    playNum = 0;
    playAudioAdd();
    trackName.style.opacity = "1";
    trackName.textContent = playList[playNum].title;
    audioList[playNum].style.color = '#C5B358';
  } else {
    playNum += 1;
    playAudioAdd();
    trackName.style.opacity = "1";
    trackName.textContent = playList[playNum].title;
    audioList[playNum].style.color = '#C5B358';
    audioList[playNum-1].style.color = '#fff';
  }
}

function toggleBtn() {
  button.classList.toggle('pause');
}

function renderPlayList() {
  const playListContainer = document.querySelector('.play-list');
  playList.forEach((item) => {
    const li = document.createElement('li');
    li.classList.add('play-item');
    li.textContent = item.title;
    playListContainer.append(li);
  });
}

function getTimeCode(num) {
  let seconds = parseInt(num);
  let minutes = parseInt(seconds / 60);
  const hours = parseInt(minutes / 60);

  seconds -= minutes * 60;
  minutes -= hours * 60;

  if (hours === 0) {
    return `${ minutes }:${ String(seconds % 60).padStart(2, 0) }`;
  }
  return `${ String(hours).padStart(2, 0) }:${ minutes }:${ String(seconds % 60).padStart(2, 0)}`;
}
/* Audio-player end */

async function getWeather() {
  const lang = document.querySelector('.lang-active');
  const weatherError = document.querySelector('.weather-error');
  const weatherIcon = document.querySelector('.weather-icon');
  const temperature = document.querySelector('.temperature');
  const weatherDescription = document.querySelector('.weather-description');
  const wind = document.querySelector('.wind');
  const humidity = document.querySelector('.humidity');
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${ city.value }&lang=${ lang.textContent }&appid=e162cba305583b3e549398a7798223b4&units=metric`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    weatherError.textContent = '';

    weatherIcon.className = 'weather-icon owf';
    weatherIcon.classList.add(`owf-${ data.weather[0].id }`);
    temperature.textContent = `${ data.main.temp.toFixed(0) }°C`;
    weatherDescription.textContent = data.weather[0].description;
    if (lang.textContent === eng) {
      wind.textContent = `Wind speed: ${ data.wind.speed.toFixed(0) } m/s`;
      humidity.textContent = `Humidity: ${ data.main.humidity }%`;
    } else if (lang.textContent === ru) {
      wind.textContent = `Ветер: ${ data.wind.speed.toFixed(0) } м/с`;
      humidity.textContent = `Влажность: ${ data.main.humidity }%`;
    }
  } catch (error) {
    if (lang.textContent === eng) {
      weatherError.textContent = 'No data for this city';
    } else if (lang.textContent === ru) {
      weatherError.textContent = 'Нет данных для этого города';
    }

    temperature.textContent = '';
    wind.textContent = '';
    humidity.textContent = '';
    weatherDescription.textContent = '';
  }
}

async function getQuotes() {
  const lang = document.querySelector('.lang-active');
  const quote = document.querySelector('.quote');
  const author = document.querySelector('.author');
  let randomNum = getRandomNum(0, 9);
  let quotes;

  if (lang.textContent === eng) {
    quotes = 'https://raw.githubusercontent.com/penguin-one/quotes/main/dataEn.json';
  } else if (lang.textContent === ru) {
    quotes = 'https://raw.githubusercontent.com/penguin-one/quotes/main/data.json';
  }

  const res = await fetch(quotes);
  const data = await res.json();

  quote.textContent = data[randomNum].text;
  author.textContent = data[randomNum].author;
}

function toggleLang(event) {
  const langArr = document.querySelectorAll('.languages-item');
  let target = event.target;

  if (!target.classList.contains('languages-item')) {
    return;
  }

  if (target.classList.contains('lang-active')) {
    return;
  } else {
    langArr.forEach(item => item.classList.remove('lang-active'));
    target.classList.add('lang-active');

    togglePlaceholderGreeting();
    togglePlaceholderAndValueCity();
    getQuotes();
    getWeather();
    translateTodo();
    translateSetting();
  }
}

function togglePlaceholderGreeting() {
  const lang = document.querySelector('.lang-active');
  const nameInput = document.querySelector('.name');
  if (lang.textContent === eng) {
    nameInput.placeholder = '[Enter name]';
  } else if (lang.textContent === ru) {
    nameInput.placeholder = '[Введите имя]';
  }
}

function togglePlaceholderAndValueCity() {
  const lang = document.querySelector('.lang-active');
  if (lang.textContent === eng) {
    city.placeholder = 'City';

    if (city.value === 'Минск') {
      city.value = 'Minsk';
    }
  } else if (lang.textContent === ru) {
    city.placeholder = 'Город';

    if (city.value === 'Minsk') {
      city.value = 'Минск';
    }
  }
}

/* Todo-list */
function translateTodo() {
  const lang = document.querySelector('.lang-active');
  const header = document.querySelector('.todo-header');
  const todoInput = document.querySelector('.todo-input');
  const todoBtn = document.querySelector('.add-button');

  if (lang.textContent === eng) {
    header.textContent = 'Todo-list';
    todoInput.placeholder = 'Add a new task';
    todoBtn.textContent = 'Add';
  } else if (lang.textContent === ru) {
    header.textContent = 'Список дел';
    todoInput.placeholder = 'Добавить новую задачу';
    todoBtn.textContent = 'Добавить';
  }
}

function addTodo(item) {
  if (item !== '') {
    const todo = {
      id: Date.now(),
      name: item,
      completed: false
    };

    todos.push(todo);
    addToLocalStorage(todos);

    todoInput.value = '';
  }
}

function renderTodos(todos) {
  todoItemsList.innerHTML = '';

  todos.forEach(item => {
    const checked = item.completed ? 'checked' : null;
    const li = document.createElement('li');

    li.setAttribute('class', 'item');
    li.setAttribute('data-key', item.id);

    if (item.completed === true) {
      li.classList.add('checked');
    }

    li.innerHTML = `<input type="checkbox" class="checkbox" ${ checked }>
    ${ item.name }
    <button class="delete-button">X</button>`;

    todoItemsList.append(li);
  });
}

function addToLocalStorage(todos) {
  localStorage.setItem('todos', JSON.stringify(todos));
  renderTodos(todos);
}

function getFromLocalStorage() {
  const reference = localStorage.getItem('todos');

  if (reference) {
    todos = JSON.parse(reference);
    renderTodos(todos);
  }
}

/*
  * item.id { number }
  * id { string }
*/
function toggleTodo(id) {
  todos.forEach(item => {
    if (item.id == id) {
      item.completed = !item.completed;
    }
  });
  addToLocalStorage(todos);
}

function deleteTodo(id) {
  todos = todos.filter(item => {
    return item.id != id;
  });

  addToLocalStorage(todos);
}
/* Todo-list end */

/* Settings */
const settingHeader = document.querySelector('.settings-header');
const closeBtn = document.querySelector('.close-btn');
const settingForm = document.querySelector('.settings-form');
const checkedItems = document.querySelectorAll('.settings-checkbox');
const resetBtn = document.querySelector('.reset-btn');
let arrSetting = [];
const player = document.querySelector('.player');
const todoList = document.querySelector('.todolist');
const weather = document.querySelector('.weather');
const time = document.querySelector('.time');
const date = document.querySelector('.date');
const greeting = document.querySelector('.greeting-container');
const quotes = document.querySelector('.quotes');

settingHeader.addEventListener('click', toggleVisibilitySettings);

closeBtn.addEventListener('click', toggleVisibilitySettings);

settingForm.addEventListener('submit', event => {
  event.preventDefault();

  setSetting();
  toggleVisibilityBlocks();
});

resetBtn.addEventListener('click', function() {
  checkedItems.forEach(item => {
    if (item.classList.contains('checked')) {
      item.classList.remove('checked');
      item.removeAttribute('checked');
    }

    arrSetting = [];
  })
});

defineSetting();

checkVisibilityBlocks();

function toggleVisibilitySettings() {
  const settingDetails = document.querySelector('.settings-details');
  settingDetails.classList.toggle('visibility');
}

function setSetting() {
  checkedItems.forEach(item => {
    if (item.classList.contains('checked')) {
      if (!arrSetting.includes(item.value)) {
        arrSetting.push(item.value);
      }
    }
  });

  addToLocalStorageSetting(arrSetting);
}

function defineSetting() {
  checkedItems.forEach(item => {
    item.addEventListener('click', function(){
      item.classList.toggle('checked');

      if (!item.classList.contains('checked')) {
        let pos = arrSetting.indexOf(item.value, 0);

        arrSetting.splice(pos, 1);
      }
    });
  });
}

function checkVisibilityBlocks() {
  getFromLocalStorageSetting();

  if (arrSetting.length !== 0) {
    arrSetting.forEach(block => {
      if (block === 'audio-player') {
        player.classList.add('hide-settings');
        checkedItems[0].classList.add('checked');
        checkedItems[0].setAttribute('checked', '');
      }
      if (block === 'todo-list') {
        todoList.classList.add('hide-settings');
        checkedItems[1].classList.add('checked');
        checkedItems[1].setAttribute('checked', '');
      }
      if (block === 'weather-forecast') {
        weather.classList.add('hide-settings');
        checkedItems[2].classList.add('checked');
        checkedItems[2].setAttribute('checked', '');
      }
      if (block === 'time') {
        time.classList.add('hide-settings');
        checkedItems[3].classList.add('checked');
        checkedItems[3].setAttribute('checked', '');
      }
      if (block === 'date') {
        date.classList.add('hide-settings');
        checkedItems[4].classList.add('checked');
        checkedItems[4].setAttribute('checked', '');
      }
      if (block === 'greeting') {
        greeting.classList.add('hide-settings');
        checkedItems[5].classList.add('checked');
        checkedItems[5].setAttribute('checked', '');
      }
      if (block === 'quotes') {
        quotes.classList.add('hide-settings');
        checkedItems[6].classList.add('checked');
        checkedItems[6].setAttribute('checked', '');
      }
    });
  }
}

function toggleVisibilityBlocks() {
  player.classList.remove('hide-settings');
  todoList.classList.remove('hide-settings');
  weather.classList.remove('hide-settings');
  time.classList.remove('hide-settings');
  date.classList.remove('hide-settings');
  greeting.classList.remove('hide-settings');
  quotes.classList.remove('hide-settings');

  if (arrSetting.length !== 0) {
    arrSetting.forEach(block => {
      if (block === 'audio-player') {
        player.classList.add('hide-settings');
      }
      if (block === 'todo-list') {
        todoList.classList.add('hide-settings');
      }
      if (block === 'weather-forecast') {
        weather.classList.add('hide-settings');
      }
      if (block === 'time') {
        time.classList.add('hide-settings');
      }
      if (block === 'date') {
        date.classList.add('hide-settings');
      }
      if (block === 'greeting') {
        greeting.classList.add('hide-settings');
      }
      if (block === 'quotes') {
        quotes.classList.add('hide-settings');
      }
    });
  }
}

function addToLocalStorageSetting(arr) {
  localStorage.setItem('settings', JSON.stringify(arr));
}

function getFromLocalStorageSetting() {
  const reference = localStorage.getItem('settings');

  if (reference) {
    arrSetting = JSON.parse(reference);
  }
}

function translateSetting() {
  const lang = document.querySelector('.lang-active');
  const saveBtn = document.querySelector('.save-btn');
  const settingListHeader = document.querySelector('.settings-list-header');
  const audioPlayer = document.querySelector('.span-audioplayer');
  const todoList = document.querySelector('.span-todolist');
  const weather = document.querySelector('.span-weather');
  const time = document.querySelector('.span-time');
  const date = document.querySelector('.span-date');
  const greeting = document.querySelector('.span-greeting');
  const quotes = document.querySelector('.span-quotes');

  if (lang.textContent === eng) {
    settingHeader.textContent = 'Settings';
    settingListHeader.textContent = 'Select items you want to hide:';
    resetBtn.textContent = 'Reset';
    saveBtn.textContent = 'Save';
    audioPlayer.textContent = 'Audio player';
    todoList.textContent = 'Todo-list';
    weather.textContent = 'Weather forecast';
    time.textContent = 'Time';
    date.textContent = 'Date';
    greeting.textContent = 'Greeting';
    quotes.textContent = 'Quotes';
  } else if (lang.textContent === ru) {
    settingHeader.textContent = 'Настройки';
    settingListHeader.textContent = 'Выберите блоки, которые вы хотите скрыть:';
    resetBtn.textContent = 'Сбросить';
    saveBtn.textContent = 'Сохранить';
    audioPlayer.textContent = 'Аудиоплеер';
    todoList.textContent = 'Список дел';
    weather.textContent = 'Прогноз погоды';
    time.textContent = 'Время';
    date.textContent = 'Дата';
    greeting.textContent = 'Приветствие';
    quotes.textContent = 'Цитаты';
  }
}
/* Settings end */