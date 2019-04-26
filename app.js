//to do list
function newItem() {
  var item = document.getElementById("input").value;
  var ul = document.getElementById("list");
  var li = document.createElement("li");
  li.appendChild(document.createTextNode("- " + item));
  ul.appendChild(li);
  document.getElementById("input").value = "";
  li.onclick = removeItem;
}

document.body.onkeyup = function(e) {
  if (e.keyCode == 13) {
    newItem();
  }
};

function removeItem(e) {
  e.target.parentElement.removeChild(e.target);
}
// Globally head date object for the month shown
var date = new Date();
date.setDate(1);
date.setMonth(0);

window.onload = function() {
    // Add the current month on load
    createMonth();
};

document.onkeydown = function(evt) {
    evt = evt || window.event;
    switch (evt.keyCode) {
        case 37:
            previousMonth();
            break;
        case 39:
            nextMonth();
            break;
    }
};

// Converts day ids to the relevant string
function dayOfWeekAsString(dayIndex) {
        return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayIndex];
    }
    // Converts month ids to the relevant string
function monthsAsString(monthIndex) {
    return ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][monthIndex];
}

// Creates a day element
function createCalendarDay(num, day, mon, year) {
    var currentCalendar = document.getElementById("calendar");

    var newDay = document.createElement("div");
    var date = document.createElement("p");
    var dayElement = document.createElement("p");

    date.innerHTML = num;
    dayElement.innerHTML = day;

    newDay.className = "calendar-day ";

    // Set ID of element as date formatted "8-January" etc
    newDay.id = num + "-" + mon + "-" +year;

    newDay.appendChild(date);
    newDay.appendChild(dayElement);
    currentCalendar.appendChild(newDay);
}

// Clears all days from the calendar
function clearCalendar() {
    var currentCalendar = document.getElementById("calendar");

    currentCalendar.innerHTML = "";

}

// Clears the calendar and shows the next month
function nextMonth() {
    clearCalendar();

    date.setMonth(date.getMonth() + 1);

    createMonth(date.getMonth());
}

// Clears the calendar and shows the previous month
function previousMonth() {
    clearCalendar();
    date.setMonth(date.getMonth() - 1);
    var val = date.getMonth();
    createMonth(date.getMonth());
}

// Creates and populates all of the days to make up the month
function createMonth() {
    var currentCalendar = document.getElementById("calendar");

    var dateObject = new Date();
    dateObject.setDate(date.getDate());
    dateObject.setMonth(date.getMonth());
    dateObject.setYear(date.getFullYear());

    createCalendarDay(dateObject.getDate(), dayOfWeekAsString(dateObject.getDay()), monthsAsString(dateObject.getMonth()), dateObject.getFullYear());

    dateObject.setDate(dateObject.getDate() + 1);

    while (dateObject.getDate() != 1) {
        createCalendarDay(dateObject.getDate(), dayOfWeekAsString(dateObject.getDay()), monthsAsString(dateObject.getMonth()), dateObject.getFullYear());
        dateObject.setDate(dateObject.getDate() + 1);
    }

    // Set the text to the correct month
    var currentMonthText = document.getElementById("current-month");
    currentMonthText.innerHTML = monthsAsString(date.getMonth()) + " " + date.getFullYear();

    getCurrentDay();
}


function getCurrentDay() {

    // Create a new date that will set as default time
    var todaysDate = new Date();
    var today = todaysDate.getDate();
    var currentMonth = todaysDate.getMonth();
    var currentYear = todaysDate.getFullYear();
    var thisMonth = monthsAsString(currentMonth);
    // Find element with the ID for today
    currentDay = document.getElementById(today + "-" + thisMonth + "-" + currentYear);
    currentDay.className = "calendar-day today";
}

//javascript for notifications 
function PageNotifications(args = {width:360}) {
    //constructor

    //theme
    if(args.theme=="dark") {
        this.theme = "dark";
    } else {
        this.theme = "light";
    }
    //parent element
    if(args.parentDiv&&document.getElementById(args.parentDiv)) {
        this.parentDiv = document.getElementById(args.parentDiv);
    } else {
        this.parentDiv = document.body;
    }
    //target width of notifications
    if(args.width&&!isNaN(args.width)) {
        this.width = args.width;
    } else {
        console.log(this.parentDiv.offsetWidth)
        this.width = this.parentDiv.offsetWidth;
    }

    this.pageNotifications = [];
    this.lastNotificationIdNumber = 0;

    this.notificationsDurationsTimers = {};
    this.notificationsDurationsTimeouts = {};
    this.notificationsDurationsLoop = null;

    this.deltaLastUpdate =  Date.now();

    this.container = document.createElement('div');
    this.container.id = 'page-notifications-container';
    this.container.style.maxWidth = this.width+"px";
    this.parentDiv.appendChild(this.container);

    this.update = setInterval(function() {
        var now = Date.now();
        var deltaTime = now-this.deltaLastUpdate;
        this.deltaLastUpdate = now;

        for(let id = 0; id < this.pageNotifications.length; id++) {
            this.pageNotifications[id].update(deltaTime);
            if(this.pageNotifications[id].toDelete) {
                this.pageNotifications.splice(id,1);
            }
        }

    }.bind(this),17);

    this.push = function(title,content,type,duration) {
        this.lastNotificationIdNumber++;
        var notificationId = "pn"+this.lastNotificationIdNumber;
        this.pageNotifications.push(new PageNotification(notificationId,title,content,type,duration,this.container,this.theme,this.width));
    }
    this.closeAll = function(){
        for(let id = 0; id < this.pageNotifications.length; id++) {
            this.pageNotifications[id].close();
        }
    }
}

function PageNotification(pnId,title,content,type,duration,container,theme,width) {
    this.pnId = pnId;
    this.title = title;
    this.content = content;
    this.type = type;
    this.duration = duration;
    this.durationLeft = duration;
    this.theme = theme;
    this.width = width;

    this.heightScale = 0;  //from 0 to 1, variable used to make animations of showing/hiding
    this.heightCurrentAnimation = 1 // 0 - nothing, 1 - showup, 2 - hide
    this.heightAnimationProgress = 0

    this.timerScale = 0;  //from 0 to 1, variable used to make animations of showing/hiding
    this.timerCurrentAnimation = 1 // 0 - nothing, 1 - timing-out
    this.timerAnimationProgress = 0

    this.notification = document.createElement('div');
    this.fullHeight = 0;

    this.toDelete = false; // make true if this should be removed from array

    //constructor
    let _this = this;

    if(type!="event"&&type!="warning")
        type = "info";

    this.notification.className = "page-notifications-body"+" page-notifications-"+this.theme+" page-notifications-"+this.type;
    this.notification.setAttribute('notificationid', this.pnId);
    this.notification.style.maxWidth = this.width+"px";

    let left = document.createElement('div');
    left.className = "page-notifications-left";

    if(type=="info") left.innerHTML = "i";
	else if(type=="event") left.innerHTML = "i";
    else if(type=="warning") left.innerHTML = "!";

    let right = document.createElement('div');
    right.className = "page-notifications-right";

    let timer = document.createElement('div');
    timer.className = "page-notifications-timer";

    let closeButton = document.createElement('div');
    closeButton.className = "page-notifications-close";
    closeButton.innerHTML = "&#215";

    closeButton.onclick = function() {
       _this.close();
    }

    let h1 = document.createElement('h1');
    let h2 = document.createElement('h2');
    let h3 = document.createElement('h3');

    let date = new Date();

    h1.innerHTML = title;
    h2.innerHTML = content;
    let minutes = date.getMinutes();
    if(minutes <= 10) minutes = "0"+minutes;
    h3.innerHTML = date.getHours() + ":" + minutes;

    right.appendChild(h1);
    right.appendChild(closeButton);
    right.appendChild(h2);
    right.appendChild(timer);
    right.appendChild(h3);

    this.notification.appendChild(left);
    this.notification.appendChild(right);

    container.appendChild(this.notification);

    this.fullHeight = this.notification.offsetHeight;
    this.notification.style.height = "0px";

    this.close = function() {
        if(this.heightCurrentAnimation==0) {
            var notifications = container.getElementsByClassName('page-notifications-body');
            for(let notification of notifications) {
                if(notification.getAttribute('notificationId')==this.pnId) {
                    this.heightCurrentAnimation = 2;
                    this.heightAnimationProgress = 0;
                    setTimeout(function(){
                        _this.toDelete = true;
                        notification.parentNode.removeChild(notification);
                    },300);
                    return;
                }
            }
        }
    }
    this.changeDuration = function(duration) {
        if(!isNaN(duration)) {
            this.duration = duration;
            this.timerAnimationProgress = 0;
            this.timerCurrentAnimation = 1;
        } else if(duration == 'unknown') {
            this.timerAnimationProgress = 0;
            this.duration = false;
            this.timerCurrentAnimation = 0;
            this.timerScale = 1;
        } else if(duration == false) {
            this.timerAnimationProgress = 0;
            this.duration = false;
            this.timerCurrentAnimation = 0;
            this.timerScale = 0;
        }
    }
    this.update = function(deltaTime) {
        //showing and hiding
        if(this.heightCurrentAnimation==1) {
            this.heightAnimationProgress += deltaTime
            if(this.heightAnimationProgress>= 300) this.heightAnimationProgress = 300;

            this.heightScale = this.easeOutQuint(this.heightAnimationProgress/300.0);
            if(this.heightAnimationProgress == 300) this.heightCurrentAnimation = 0;
        }
        else if(this.heightCurrentAnimation==2) {
            this.heightAnimationProgress += deltaTime
            if(this.heightAnimationProgress>= 300) this.heightAnimationProgress = 300;

            this.heightScale = 1-this.easeOutQuint(this.heightAnimationProgress/300.0);
            if(this.heightAnimationProgress == 300) this.heightCurrentAnimation = 0;
        }
        this.notification.style.marginTop = this.heightScale*10+"px";
        this.notification.style.height = this.heightScale*this.fullHeight+"px";
        //timer
        if(this.timerCurrentAnimation==1) {
            this.timerAnimationProgress += deltaTime
            if(this.timerAnimationProgress>= this.duration) this.timerAnimationProgress = this.duration;

            this.timerScale = 1-this.timerAnimationProgress/this.duration;
            if(this.timerAnimationProgress == this.duration) {
                this.close();
                this.timerCurrentAnimation = 0;
            }
        }
        console.log(this.timerScale);
        this.notification.getElementsByClassName('page-notifications-timer')[0].style.width = this.timerScale*(this.width-40)+"px";
    }

    this.easeOutQuint = function(t)
    { return 1+(--t)*t*t*t*t }

    if(!isNaN(duration)&&duration!=false) {
        let _this = this;

        this.notification.onmouseover = function() {
            _this.changeDuration('unknown');
        }
        this.notification.onmouseleave = function() {
            _this.changeDuration(duration);
        }
         _this.changeDuration(duration);

    } else {
        _this.changeDuration(false);
    }

}
