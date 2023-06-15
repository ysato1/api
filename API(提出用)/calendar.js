"use strict";

// GoogleカレンダーAPIのクライアントライブラリを読み込む
gapi.load("client", init);

// GoogleカレンダーAPIの初期化
function init() {
  gapi.client
    .init({
      apiKey: "",//提出用省略
      discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
      ],
    })
    .then(function () {
      // カレンダーのイベントを取得して表示する
      let currentDate = new Date();
      getCalendarEvents(currentDate);
    });
}

// カレンダーのイベントを取得して表示する関数
function getCalendarEvents(date) {
    let currentYear = date.getFullYear();
    let currentMonth = date.getMonth();
  
    let firstDay = new Date(currentYear, currentMonth, 1);
    let lastDay = new Date(currentYear, currentMonth + 1, 0);
  
    let pastDate = new Date(currentYear, currentMonth - 1, 1);
    let futureDate = new Date(currentYear, currentMonth + 1, 1);
  
    const calendarIds = [
      "a30ef456db244a09056ce2239493c34d5de07a9bd28ffa97099dd6a69a1900c5@group.calendar.google.com",
      "3b9c255eec03398c9c4a71a5fc00bd82b007cbb8054f57e2e413767360251c79@group.calendar.google.com",
    ]; // カレンダーIDの配列
  
    // 各カレンダーのイベントを取得
    let promises = calendarIds.map(function (calendarId) {
      return gapi.client.calendar.events.list({
        calendarId: calendarId,
        timeMin: pastDate.toISOString(),
        timeMax: futureDate.toISOString(),
        maxResults: 100,
        singleEvents: true,
        orderBy: "startTime",
      });
    });
  
    // イベントの取得が完了したら処理を実行
    Promise.all(promises)
      .then(function (responses) {
        let events = [];
        responses.forEach(function (response) {
          events = events.concat(response.result.items);
        });

      // 以下、イベントを表示する処理などを記述します

      const calendarElement = document.getElementById("calendar");
      const prevMonthButton = document.getElementById("prev-month");
      const nextMonthButton = document.getElementById("next-month");

      // イベントの詳細を表示する関数
      function showEventDetails(event) {
        const modalContainer = document.getElementById("modal-container");

        const modalBackdrop = document.createElement("div");
        modalBackdrop.className = "modal-backdrop";
        modalBackdrop.addEventListener("click", function () {
          modalElement.remove();
          modalBackdrop.remove();
        });

        const modalElement = document.createElement("div");
        modalElement.className = "modal";

        const modalContent = document.createElement("div");
        modalContent.className = "modal-content";

        const closeButton = document.createElement("span");
        closeButton.className = "close-button";
        closeButton.textContent = "×";
        closeButton.addEventListener("click", function () {
          modalElement.remove();
          modalBackdrop.remove();
        });

        const eventSummary = document.createElement("h2");
        eventSummary.textContent = event.summary;

        const eventStart = document.createElement("p");
        eventStart.textContent =
          "開始時刻: " + formatTime(event.start.date || event.start.dateTime);

        const eventEnd = document.createElement("p");
        eventEnd.textContent =
          "終了時刻: " + formatTime(event.end.date || event.end.dateTime);

        const eventDescription = document.createElement("p");
        eventDescription.textContent =
          "説明: " + (event.description || "説明はありません");

        function formatTime(dateTime) {
          const date = new Date(dateTime);
          const hours = date.getHours();
          const minutes = date.getMinutes();
          const period = hours < 12 ? "午前" : "午後";
          hours = hours % 12;
          hours = hours ? hours : 12;
          minutes = minutes < 10 ? "0" + minutes : minutes;
          return period + " " + hours + ":" + minutes;
        }

        modalContent.appendChild(closeButton);
        modalContent.appendChild(eventSummary);
        modalContent.appendChild(eventStart);
        modalContent.appendChild(eventEnd);
        modalContent.appendChild(eventDescription);

        modalElement.appendChild(modalContent);
        modalContainer.appendChild(modalBackdrop); // modalBackdropを先に追加する
        modalContainer.appendChild(modalElement);
      }

      // カレンダーを更新する関数
      function updateCalendar() {
        calendarElement.innerHTML = "";

        const calendarHeader = document.createElement("div");
        calendarHeader.className = "calendar-header";
        calendarHeader.textContent =
          currentYear + "年 " + (currentMonth + 1) + "月";
        calendarElement.appendChild(calendarHeader);

        // 曜日の表示
        const calendarWeekdays = document.createElement("div");
        calendarWeekdays.className = "calendar";
        calendarElement.appendChild(calendarWeekdays);

        const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        for (let i = 0; i < weekDays.length; i++) {
          const weekday = document.createElement("div");
          weekday.className = "calendar-weekday";
          weekday.textContent = weekDays[i];
          calendarWeekdays.appendChild(weekday);
        }

        const calendarDays = document.createElement("div");
        calendarDays.className = "calendar";
        calendarElement.appendChild(calendarDays);

        const firstDayOfWeek = firstDay.getDay(); // 月の最初の曜日のインデックスを取得
        const daysInMonth = lastDay.getDate(); // 月の日数を取得

        for (let i = 0; i < firstDayOfWeek; i++) {
          const emptyDayContainer = document.createElement("div");
          emptyDayContainer.className = "day-container";
          calendarDays.appendChild(emptyDayContainer);

          const emptyDay = document.createElement("div");
          emptyDay.className = "calendar-day";
          emptyDayContainer.appendChild(emptyDay);

          const emptyEventContainer = document.createElement("div");
          emptyEventContainer.className = "event-container";
          emptyDayContainer.appendChild(emptyEventContainer);
        }

        for (let day = 1; day <= daysInMonth; day++) {
          const calendarDayContainer = document.createElement("div");
          calendarDayContainer.className = "day-container";
          calendarDays.appendChild(calendarDayContainer);

          const calendarDay = document.createElement("div");
          calendarDay.className = "calendar-day";
          calendarDay.textContent = day;
          calendarDayContainer.appendChild(calendarDay);

          const eventContainer = document.createElement("div");
          eventContainer.className = "event-container";
          calendarDayContainer.appendChild(eventContainer);

          const eventsForDay = getEventsForDay(
            events,
            currentYear,
            currentMonth,
            day
          );

          eventsForDay.forEach(function (event) {
            const eventElement = document.createElement("div");
            eventElement.className = "event";
            eventElement.textContent = event.summary;
            eventElement.addEventListener("click", function () {
              showEventDetails(event);
            });
            eventContainer.appendChild(eventElement);
          });
        }

        // 高さを揃える
        adjustDayContainerHeight();
      }

      // day-containerの高さを調整する関数
      function adjustDayContainerHeight() {
        const dayContainers = document.getElementsByClassName("day-container");
        let maxHeight = 0;

        for (let i = 0; i < dayContainers.length; i++) {
          let height = dayContainers[i].clientHeight;
          if (height > maxHeight) {
            maxHeight = height;
          }
        }

        for (let i = 0; i < dayContainers.length; i++) {
          dayContainers[i].style.height = maxHeight + "px";
        }
      }

      // 指定した日のイベントを取得する関数
      function getEventsForDay(events, year, month, day) {
        let eventsForDay = [];
        for (let i = 0; i < events.length; i++) {
          let event = events[i];
          let start = new Date(event.start.dateTime || event.start.date);
          if (
            start.getFullYear() === year &&
            start.getMonth() === month &&
            start.getDate() === day
          ) {
            eventsForDay.push(event);
          }
        }
        return eventsForDay;
      }

      // 月を変更してカレンダーを更新する関数
      function changeMonth(direction) {
        if (direction === "prev") {
          currentMonth--;
          if (currentMonth < 0) {
            currentYear--;
            currentMonth = 11;
          }
        } else if (direction === "next") {
          currentMonth++;
          if (currentMonth > 11) {
            currentYear++;
            currentMonth = 0;
          }
        }
        let newDate = new Date(currentYear, currentMonth);
        getCalendarEvents(newDate);
      }

      // 月の変更ボタンのクリックイベント
      prevMonthButton.addEventListener("click", function () {
        changeMonth("prev");
      });

      nextMonthButton.addEventListener("click", function () {
        changeMonth("next");
      });

      // 日付をフォーマットする関数
      function formatDate(date) {
        let options = {
          year: "numeric",
          month: "short",
          day: "numeric",
          weekday: "short",
        };
        return new Date(date).toLocaleDateString("en-US", options);
      }

      // カレンダーを初期表示する
      updateCalendar();
    });
}
