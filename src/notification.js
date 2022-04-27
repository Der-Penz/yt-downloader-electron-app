const notificationContainer = document.querySelector('.notification-container');

const DEFAULT_DISPLAY_TIME = 1000;
const MAX_ITEMS = 3;

function showError(message, displayTime) {
	createNotification(message, notificationType.error, displayTime);
}

function showSuccess(message, displayTime) {
	createNotification(message, notificationType.success, displayTime);
}

function showInfo(message, displayTime) {
	createNotification(message, notificationType.info, displayTime);
}

function createNotification(message, type, displayTime = DEFAULT_DISPLAY_TIME) {
	const notification = document.createElement('div');
	const icon = document.createElement('i');
    
    notification.classList.add("notification");
    notification.classList.add(type[0]);
    notification.innerText = message;

    icon.classList.add(type[1]);
    notification.prepend(icon);

    if(notificationContainer.childElementCount >= MAX_ITEMS){
        notificationContainer.firstChild.classList.remove("show");

        setTimeout(() => {
            notificationContainer.removeChild(notificationContainer.firstChild);
        }, 200);
    }
        
        
    notificationContainer.appendChild(notification);
    setTimeout(() => {
        notification.classList.add("show");
    }, 0);

    setTimeout(() => {
        notification?.classList.remove("show");

        setTimeout(() => {
            notification?.remove();
        }, 200);
    }, displayTime);
}

const notificationType = Object.freeze({
	error: ['error',"gg-danger"],
	success: ['success',"gg-check-o"],
	info: ['info',"gg-info"],
});

export { showError, showSuccess, showInfo };
