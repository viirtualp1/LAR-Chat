const getRandId = () => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString();

function sendMsgToChat(roomName) {
    const message = document.getElementById('message').value;
    const date = new Date();

    firebase.database().ref(`rooms/room${roomName}/messages/${getRandId()}`).set({
        username: `${myUsername}`,
        message: message,
        date: {
            hour: date.getHours(),
            minutes: date.getMinutes(),
            seconds: date.getSeconds(),
            day: date.getDate(),
            month: date.getMonth() + 1,
            year: date.getFullYear(),
        }
    });
};

function sendMsgToUser(username) {
    const message = document.getElementById('message').value;
    const date = new Date();

    firebase.database().ref(`users/${username}/${myUsername}/${getRandId()}`).set({
        username: `${myUsername}`,
        message: message,
        date: {
            hour: date.getHours(),
            minutes: date.getMinutes(),
            seconds: date.getSeconds(),
            day: date.getDate(),
            month: date.getMonth() + 1,
            year: date.getFullYear(),
        }
    });

    message.value = '';
}