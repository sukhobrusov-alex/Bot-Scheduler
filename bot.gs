
// Функция отправки сообщеняи пользователю, используем токен бота и chat_id
function sendText(chatId, text, keyBoard) {
  try{
    var token = 'TOKEN';
    var telegramUrl = "https://api.telegram.org/bot" + token + '/';
  
    var data = {
      'method': "post",
      'payload': {
        'method': "sendMessage",
        'chat_id': String(chatId),
        'text': text,
        'parse_mode': "HTML",
        'reply_markup': JSON.stringify(keyBoard)
      }
    };
    UrlFetchApp.fetch(telegramUrl, data);
  } catch(err) {
    Logger.log(String(chatId), String(err));
  }
}

// Функция отправки сообщеняи пользователю, используем токен бота и chat_id
function editMessageReplyMarkup(chatId, message_id) {
try{
  var token = 'TOKEN';
  var telegramUrl = "https://api.telegram.org/bot" + token + '/';
  
  var data = {
    'method': "post",
    'payload': {
      'method': "editMessageReplyMarkup",
      'chat_id': String(chatId),
      'message_id': String(message_id),
      'parse_mode': "HTML",
    }
  };
  UrlFetchApp.fetch(telegramUrl, data);
  } catch(err){
    Logger.log(String(chatId), String(err));
  }
}
// Функция, которая обрабатывает действия пользователя
function doPost(e) {

  const CYCLE_TIME_MINUTES = 30;
  const CYCLE_TIME_HOUR_MULTIPLIER = 2;
  // получаем сигнал от бота
  var contents = JSON.parse(e.postData.contents);
  //var test_sheet = SpreadsheetApp.getActiveSpreadsheet().guetSheets()[5]
  //test_sheet.appendRow([JSON.stringify(contents)]);
  
  // проверяем тип полученного, нам нужен только тип "Message" или "CallbackQuery" из Telegram API 
  if (contents.callback_query){
    // В данном блоке обрабатываются  нажатая пользователя. В соответствии с Telegram API, мы должны ответить на нажатие пользователя, исользую метод [aswerCallBackQuery] с [id_callback]
    var id_callback = contents.callback_query.id;
    // Получаем id пользовтеля, чтобы ответить ему, и id сообщения, чтобы в случае необходимости изменить его
    var id = contents.callback_query.from.id;
    var message_id = contents.callback_query.message.message_id;
    
    var data = JSON.parse(contents.callback_query.data);
    answerCallbackQuery(id_callback);
    
    // Наш бот отправляет следующие команды пользователю на выбор:
    //  1) start_test_now - callback начала теста, пользователь нажал на кнопку "Начать тест!"
    //  2) now - callback получения материала, пользователь нажал на "Начать изучених сейчас!"
    //  3) later_one_hour - пользователь отложил изучение материала на 1 час нажав "Начать через час!"
    //  4) later_six_hours - пользователь отложил изучение материала на 6 часов нажав "Начать через 6 часов!"
    //  5) later_one_day - пользователь отложил изучение материала на 24 часа нажав "Начать завтра!"
    //  6) answer - callback теста, пользователь выбрал один из вариантов
    switch(data.text) {
      case 'start_test_now': 
        const START_ROW = 17;
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[4];
        var range = sheet.getDataRange();
        var values = range.getValues();
        
        for (var i = START_ROW; i < values.length; i++) {
          if (values[i][0]){
            if(values[i][0] == id) {
              if (values[i][2] >= 30) {
                sendText(id, "Необходимо ознакомиться с материалом в течение более продолжительного времени!");
              } else {
                startTest(id);
                editMessageReplyMarkup(id, message_id);
              }
            }
          } else {
            break;
          }
        }
        break;
      case 'now':
        //sendText(id, 'За работу, мой кожанный друг 🧐 \nВот что нужно сделать:\n');
        delay(id, 60, data.task_no + 1);
        delay(id, 0, data.task_no);
        
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[4];
        var data_range = sheet.getDataRange(); 
        var values = data_range.getValues();
              
        //var additional_sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[3];
        //var additional_messages = additional_sheet.getDataRange().getValues()[data.task_no];
        //for (var i = 0; i < additional_messages.length; i++) {
         // sendText(id, additional_messages[i]);
        //}

        // Отправляем пользователю материал из таблицы
        sendText(id, "Материал: " + values[5][2]);
        sendText(id, "Через 30 минут вы сможете приступить к выполнению теста.");
        editMessageReplyMarkup(id, message_id);
  
        // }
        //var test_sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[3];
        //test_sheet.appendRow([data.task_no,"123", task_data]);
        
        break;
      case 'later_one_hour':
        sendText(id, 'Через 1 час мы вернемся к вопросу подготовки к семинару!');
        delay(id, CYCLE_TIME_HOUR_MULTIPLIER * CYCLE_TIME_MINUTES, data.task_no);
        editMessageReplyMarkup(id, message_id);
        break;
      case 'later_six_hours':
        sendText(id, 'Через 6 часов мы вернемся к вопросу подготовки к семинару!');
        delay(id, CYCLE_TIME_HOUR_MULTIPLIER * CYCLE_TIME_MINUTES * 6, data.task_no);
        editMessageReplyMarkup(id, message_id);
        break;
      case 'later_twelve_hours':
        sendText(id, 'Через 12 часов мы вернемся к вопросу подготовки к семинару!');
        delay(id, CYCLE_TIME_HOUR_MULTIPLIER * CYCLE_TIME_MINUTES * 12, data.task_no);
        editMessageReplyMarkup(id, message_id);
        break;
      case 'later_one_day':
        sendText(id, 'Завтра мы вернемся к вопросу подготовки к семинару!');
        delay(id, CYCLE_TIME_HOUR_MULTIPLIER * CYCLE_TIME_MINUTES * 24, data.task_no);
        editMessageReplyMarkup(id, message_id);
        break;
      case 'answer': 
        var column  = data.column;
        var row     = data.row;
        var answer  = data.answer_no;
        var question = data.question;
        
        //
        setAnswer(id, question, answer);
        // Проверяем ответ
        checkAnswer(id, column, row, answer);
        // Удаляем сообщение, чтобы у пользователя не было возможности изменить ответ
        editMessageReplyMarkup(id, message_id);
        break;
    }
    return HtmlService.createHtmlOutput("Ok");
  } else if (contents.message) {
  
    // В данном блоке пользователь написал сообщение. Сообщение может явеяться как обычным текстом, так и командой
    var msg = contents.message;
    var chatId = msg.chat.id;
    var first_name = msg.chat.first_name;
    var last_name = msg.chat.last_name;
    var faq_re = new RegExp("\s*Тема:.*\n.*");
    
    // проверяем, является ли сообщение командой к боту
    if (msg.hasOwnProperty('entities') && msg.entities[0].type == 'bot_command') {
      if (msg.text == "/start") {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
        var data_range= sheet.getDataRange().getValues();
        var column = data_range.map(function(row) {
          return row[0];});
        
        if (!contains(column, chatId)) {
          sheet.appendRow([String(chatId), String(first_name), String(last_name)]); }
        sendText(chatId, "Добрый день, уважаемый студент! Занятия по дисциплине 'Проектная документация' организованы по модели 'Перевернутый класс'! Это предполагает интенсивное изучение материала дома и решение на занятиях практических задач!");
        sendText(chatId, "Я - бот, который будет помогать Вам готовиться к семинарам! Со мной можно общаться и получать от меня некоторую информацию. Я буду напоминать о времени проведения семинаров, необходимости чтения материала, сообщу ссылки на материал, который необходимо изучить перед семинаром. По окончании изучения материала я выведу контрольный тест для закрепления изученного и оценки понимания темы.");
        sendText(chatId, "У Вас есть возможность задавать организационные вопросы преподавателю, а также вопросы по материалу для их рассмотрения на семинаре! Для этого перед Вашим вопросом напишите `?`");
        sendText(chatId, "Вы можете использовать следующие команды:\n/help - для получения справки по работе бота;\n/faq - для чтения ответов на некоторые вопросы;\n/cumul - для получения накопленного балла по дисциплине;\n/data - для получения даты и времени проводимых семинаров;\n/topic - для получения списка изучаемых в курсе тем;\n/liter - для получения списка рекомендуемой литературы.");
      } else if (msg.text == "/faq"){
        sendText(chatId, "Если у Вас есть вопросы или пожелания, вы можете написать их здесь в следующем формате: \n?Ваш вопрос");
      } else if (msg.text == "/help") {
        sendText(chatId, "Я - бот, который поможет Вам подготовиться к дисциплине 'Проектная документация'.\nЯ напомню о семинаре, необходимости чтения материала, сообщу ссылку на материал, который необходимо изучить перед семинаром. По окончании изучения материала я выведу контрольный тест для закрепления изученного и оценки понимания темы. \nУ Вас есть возможность задать вопросы по материалу для их рассмотрения на семинаре, а также задать организационные вопросы преподавателю. Для этого напишите ваш вопрос и перед ним поставьте ‘?’.");
      } else if (msg.text == "/data"){
        sendText(chatId, "Даты семинаров:\n27.11 - в 13.40;\n04.12 - в 10.30;\n04.12 - в 12.10.");
      }
      else if (msg.text == "/cumul"){
        sendText(chatId, "Накопленный балл пока не формировался!");
      }
      else if (msg.text == "/topic"){
        sendText(chatId, "В текущем модуле мы изучаем следующие темы:\n1. Основы документирования. Виды научно-исследовательских и проектных документов.\n2. Основы подготовки обзора литературы.\n3. Основы подготовки научных статей.\n4. Основы подготовки конкурсных заявок.");
      }
      else if (msg.text == "/liter"){
        sendText(chatId, "Список литературы представлен в online-курсе. Вы также можете использовать http://www.swrit.ru/gost-eskd.html и http://rugost.com.");
      }
      
      else {
        sendText(chatId, "Я не знаю данной команды! :( - " + msg.text);
      }
     
    }
    
    // Проверяем ялвяется ли обращение вопросом
    //if (msg.text.match(faq_re)) {
    if (msg.text[0] == "?"){
      sendText(chatId, "Ваш вопрос записан. Мы разберем его на семинаре!");
      var faq_sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[2];
      faq_sheet.appendRow([chatId, msg.text]);
    }
  } else {
    sendText(chatId, "Unrealized command - " + msg.text);
  }
  return HtmlService.createHtmlOutput("Ok");
}

function doGet(e){
  return HtmlService.createHtmlOutput("OK!!!!");
}

// Функция, которая проверяет наличие объекта в массиве
function contains(array, object){
  for (var i = 0; i < array.length; i++){
    if (array[i] == object)
      return true;
  }
  
  return false;
}

// Функция которая задает время, через которое бот напомнит юзеру о задании.
function delay(user_id, time, delay_row) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheets()[4];
  var range = sheet.getDataRange()
  var values = range.getValues()
  
  const START_ROW = 17;
  
  
  for (var i = START_ROW; i < values.length; i++) {
    if (values[i][0]){
      if(values[i][0] == user_id) {
        range.getCell(i + 1, delay_row + 1).setValue(time)
      }
    } else {
      break;
    }
  }
}


// Функиця начала теста
// Наччинает тест для пользователя с [user_id]
function startTest(user_id) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheets()[4];
  var range = sheet.getDataRange();
  var values = range.getValues();
  
  const START_ROW = 17;

  const FIRST_QUESTION_ROW = 8;
  const LAST_QUESTION_ROW = 11;
  const ANSWER_COLUMN = 6;
  
  for (var i = START_ROW; i < values.length; i++) {
    // Нзаходим пользователя с user_id
    if (values[i][0]){
      if(values[i][0] == user_id) {
        refreshTestForPerson(user_id);
        var material_cell = range.getCell(i + 1, 3);
        var is_test_completed_cell = range.getCell(i + 1, 4);
        var test_mark_cell = range.getCell(i + 1, 5);
        var test_answers_quantity = range.getCell(i+1, 6)
        
        // задаем таймер теста и обнуляем все значения
        is_test_completed_cell.setValue(60);
        material_cell.setValue(0);
        test_mark_cell.setValue(0);
        test_answers_quantity.setValue(0);

        var keyboard =  {inline_keyboard: []};
   
        // отправляем вопросы, которые мы получкем из таблички
        for (var j = FIRST_QUESTION_ROW; j <= LAST_QUESTION_ROW; j++) {
          var question_number = j - FIRST_QUESTION_ROW + 1;
          keyboard.inline_keyboard[0] = [{text: values[j][2], callback_data: JSON.stringify({text: "answer", question : question_number, column: ANSWER_COLUMN, row: j, answer_no: 1})}];
          keyboard.inline_keyboard[1] = [{text: values[j][3], callback_data: JSON.stringify({text: "answer", question : question_number, column: ANSWER_COLUMN, row: j, answer_no: 2})}];
          keyboard.inline_keyboard[2] = [{text: values[j][4], callback_data: JSON.stringify({text: "answer", question : question_number, column: ANSWER_COLUMN, row: j, answer_no: 3})}];
          keyboard.inline_keyboard[3] = [{text: values[j][5], callback_data: JSON.stringify({text: "answer", question : question_number, column: ANSWER_COLUMN, row: j, answer_no: 4})}];
          sendText(user_id, values[j][1], keyboard);
        }  
      }
    } else {
      break;
    }
  }
}

// Функция проверки ответа
// Когда пользователь нажимнет на кнопку в inline_keyboard, бот отправлет на [doPost] запрос с [callback_query], в которой у нас содержится информация о вопросе
// и месте поиска правильного ответа в таблице (мы не можем отправнять информациб о правильном ответе по сети, чтобы ее не могли перехватить)
function checkAnswer(id, column, row, answer){
  const START_ROW = 17;
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[4];
  var data = sheet.getDataRange(); 
  var values = data.getValues();
  
  for (var i = START_ROW; i < values.length; i++) {
    // Ищем пользователя, который нажал на кнопку
    if (values[i][0]){
      if(values[i][0] == id) {
        
        var is_ready_cell = data.getCell(i + 1, 2);
        var is_material_learned_cell = data.getCell(i + 1, 3);
        var is_test_completed_cell = data.getCell(i + 1, 4);
        var mark_cell = data.getCell(i + 1, 5);
        var quantity_cell = data.getCell(i + 1, 6);

        // Проверяем ответ (если ответ верный, мы увеличиваем итоговую оценку на 1
        if (values[row][column] == answer){
          mark_cell.setValue(mark_cell.getValue() + 1);
        }
        
        quantity_cell.setValue(values[i][5] + 1);
        // Как только пользователь ответил на 4 вопроса, тест заканчивается, если пользователь закончил тест неудовлетверительной, то ему нужно будет пройти его снова позже
        if (quantity_cell.getValue() == 4){
          var mark = mark_cell.getValue();
          if (mark >= 3){
            is_ready_cell.setValue(-1);
            sendText(id, "Вы ответили правильно на " + mark + " вопросов. Результат - успешный!");
          } else {
            is_ready_cell.setValue(1);
            is_material_learned_cell.setValue(-1);
            is_test_completed_cell.setValue(-1);
            quantity_cell.setValue(0);
            sendText(id,"Вы ответили правильно только на " + mark +  " вопросов. Результат - неуспешный! Вам необходимо прочитать материал еще раз!");
          }
        }

        
      }
    } else {
      break;
    }
  }
}

function checkTestCompletion(user_id){
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheets()[0];
  var data_range = sheet.getDataRange();
  var values = data_range.getValues();

  
}

function refreshTestForPerson(id) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheets()[0];
  var data_range = sheet.getDataRange();
  var values = data_range.getValues();

  const START_ROW = 1;
  for (var chat_id_ind = START_ROW; chat_id_ind < values.length; chat_id_ind++) {
    if (values[chat_id_ind][0]){
      if (values[chat_id_ind][0] == id) {
        data_range.getCell(chat_id_ind + 1, 6).setValue(-1);
        data_range.getCell(chat_id_ind + 1, 7).setValue(-1);
        data_range.getCell(chat_id_ind + 1, 8).setValue(-1);
        data_range.getCell(chat_id_ind + 1, 9).setValue(-1);

        var test_runs = data_range.getCell(chat_id_ind + 1, 10);
        if (test_runs.isBlank()){
          test_runs.setValue(1);
        } else {
          test_runs.setValue(test_runs.getValue() + 1);
        }

        return;
      }
    }
  }
}

// Функция, которая отмечает в табличке на что нажал пользователь
function setAnswer(id, question, answer_no) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheets()[0];
  
  var data_range = sheet.getDataRange();
  var values = data_range.getValues();
  
  const START_ROW = 1;
  
  for (var chat_id_ind = START_ROW; chat_id_ind < values.length; chat_id_ind++) {
    if (values[chat_id_ind][0]){
      if (values[chat_id_ind][0] == id) {
        var answer_cell = data_range.getCell(chat_id_ind + 1, question + 5);
        answer_cell.setValue(answer_no);
        return;
      }
    }
  }
}

// Функция, которая выполняется триггером, служит для информирования пользоватей
function informUsers() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheets()[4];

  // Задаем места в таблице
  const ACTIVE_ROW = 0;
  const TASK_ROW = 1;
  const READY_ROW = 3;
  const MESSAGE_ROW = 4;
  const START_ROW = 17;
  // получаем данные таблицы
  var data = sheet.getDataRange();
  var values = data.getValues();
  
  var task_column = 1;

  // проверяем включен ли бот
  var is_active = data.getCell(ACTIVE_ROW + 1, 1);
  if (!is_active){
    return;
  }
  // проверяем дедлайн бота
  var is_ready_to_inform = data.getCell(READY_ROW + 1, 1);
  if (!is_ready_to_inform){
    return;
  }

  // Цикл, который проходится по всем существующим chat_id, начиная с START_ROW, если
  for (var chat_id_ind = START_ROW; chat_id_ind < values.length; chat_id_ind++) {
    if (values[chat_id_ind][0]){

      var is_ready_cell = data.getCell(chat_id_ind + 1, task_column + 1);

      // 3 cond:
      // 1) -1: material is not studied
      // 2) 0: material is studied
      // 3) >0 : materal is being stuided
      var is_material_learned_cell = data.getCell(chat_id_ind + 1, task_column + 2); 
      var is_test_completed_cell = data.getCell(chat_id_ind + 1, task_column + 3);
      var test_final_mark_cell = data.getCell(chat_id_ind + 1, task_column + 4);  
      var test_answers_quantity_cell = data.getCell(chat_id_ind + 1, task_column + 5);

      if (is_ready_cell.isBlank()) {
        is_ready_cell.setValue(0);
        is_material_learned_cell.setValue(-1);
        is_test_completed_cell.setValue(-1);
        test_final_mark_cell.setValue(0);
        test_answers_quantity_cell.setValue(0);
      }

     // Проверяем, готов ли пользователь получить уведемоление о задании.
      var is_ready_value      = is_ready_cell.getValue();
      var is_material_learned = is_material_learned_cell.getValue();
      var is_test_completed   = is_test_completed_cell.getValue();
      var test_final_mark     = test_final_mark_cell.getValue();


      switch (true) {
        // Таймер первой рассылки
        case (is_ready_value > 0): 
          is_ready_cell.setValue(is_ready_value - 1);
          break;
        // Первая стадия, выполняется рассылка, информируя пользователей о текущем задании
        case (is_ready_value == 0 && is_material_learned == -1):
          var message_text = values[MESSAGE_ROW][task_column]
          var keyboard =  {
            inline_keyboard: [
              [{ text: 'Начать изучение сейчас!',    callback_data: JSON.stringify({text: "now",             task_no: task_column}) }],
              [{ text: 'Напомнить через 1 час!',     callback_data: JSON.stringify({text: "later_one_hour",  task_no: task_column}) }],
              [{ text: 'Напомнить через 6 часов!',   callback_data: JSON.stringify({text: "later_six_hours", task_no: task_column}) }],
              [{ text: 'Напомнить через 12 часов!',  callback_data: JSON.stringify({text: "later_twelve_hours", task_no: task_column}) }],
              [{ text: 'Напомнить завтра!',          callback_data: JSON.stringify({text: "later_one_day",   task_no: task_column}) }]
            ]
          }
          sendText(values[chat_id_ind][0], message_text);
          sendText(values[chat_id_ind][0],"Вы хотите прочитать этот материал сейчас?", keyboard);
          delay(values[chat_id_ind][0], 60, 1);
          break;
        
        // После изучения материала на протяжении 30 минут, пользователю отправяется сообщение о возможности начать тест
        case (is_ready_value == 0 && is_material_learned == 30): 
          is_material_learned_cell.setValue(is_material_learned - 1);
          var keyboard =  {
            inline_keyboard: [[{ text: 'Начать выполнение теста!',callback_data: JSON.stringify({text: "start_test_now"}) }]]
          };
          sendText(values[chat_id_ind][0],"Вы готовы приступить к выполнению теста?", keyboard);
          break;
          
        // Таймер изучения материала
        case (is_ready_value == 0 && is_material_learned > 0):
          is_material_learned_cell.setValue(is_material_learned - 1)
          break;
          
        // После изучения бота на протяжении 60 минут и если пользователь не начал тест заранее, мы автоматически начианем тест
        case (is_ready_value == 0 && is_material_learned == 0 && is_test_completed == -1): 
          //begin test
          startTest(values[chat_id_ind][0]);
          break;

        // Таймер теста
        case (is_ready_value == 0 && is_material_learned == 0 && is_test_completed > 0): 
          //test in process
          is_test_completed_cell.setValue(is_test_completed - 1);
          break;

        // Пользователь не успел выполнить тест за час, тест заканчивается
        case (is_ready_value == 0 && is_material_learned == 0 && is_test_completed == 0):
          is_ready_cell.setValue(1);
          is_material_learned_cell.setValue(-1);
          is_test_completed_cell.setValue(-1);
          test_answers_quantity_cell.setValue(0);
          sendText(values[chat_id_ind][0], "У вас закончилось время на сдачу теста. Вам необходимо изучить материал еще раз и повторить попытку!");
          break;
      }
    } else {
      break;
    }
  }
}


//UTITLITY
//==========================================================================================
// Функция ответа на inline_keyboard
function answerCallbackQuery(callback_query_id){
  //var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]
  var token = 'TOKEN';
  var telegramUrl = "https://api.telegram.org/bot"+token+"/answerCallbackQuery?callback_query_id=";
  
  UrlFetchApp.fetch(telegramUrl + callback_query_id);
}

