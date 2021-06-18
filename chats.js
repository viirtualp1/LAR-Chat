const database = firebase.database();
const mainChat = document.getElementById('mainChat');

function rooms(avatar, myName, myEmail) {
    firebase.database().ref(`rooms/`).on('child_added', (data) => {
        if (data.val().idRoom !== undefined) {
            document.getElementById('chats').innerHTML += `
                <li class="list-group-item d-flex justify-content-between align-items-start">
                    <div class="ms-2 me-auto">
                        <h5 class="card-title"><img alt="icon" style="width: 30px; height: 30px; border-radius: 50%;" id="avatar" src="${avatar}"> ${myName}</h5>
                        
                        <small class="text-muted">${myEmail}</small>
                    </div>
                </li>
                
                <li class="list-group-item d-flex justify-content-between align-items-start" style="cursor: pointer" onclick="chatRoom('${data.val().nameRoom}', '${data.val().idRoom}')">
                    <div class="ms-2 me-auto">
                        <i class="fas fa-users"></i>
                        Войти в комнату "${data.val().nameRoom}"
                    </div>
                </li>
            `;
        } else {

            document.getElementById('chats').innerHTML += `
                <li class="list-group-item d-flex justify-content-between align-items-start" style="cursor: pointer" onclick="chatRoom('${data.val().nameRoom}')">
                    <div class="ms-2 me-auto">
                        <i class="fas fa-users"></i>
                        Войти в комнату "${data.val().nameRoom}"
                    </div>
                </li>
            `;
        }
    });
}

function chats() {
    firebase.database().ref('users/').on('child_added', (data) => {
        if (data.val().username === myUsername || data.val().username === undefined) { } else {
            document.getElementById('chats').innerHTML += `
                <li class="list-group-item d-flex justify-content-between align-items-start" style="cursor: pointer" onclick="chatUser('${data.val().username}', '${myUsername}')">
                    <div class="ms-2 me-auto">
                        <img src="${data.val().photoUrl}" id="avatarUser${data.val().username}" style="width: 30px; height: 30px; border-radius: 50%;" alt="avatarUser">
                        ${data.val().username}
                    </div>
                </li>
            `;
        }

        try {
            if (data.val().photoUrl === undefined) {
                document.getElementById(`avatarUser${data.val().username}`).src = 'img/avatar.png';
            }
        } catch {}
    });
}

function createRoom() {
    Swal.mixin({
        input: 'text',
        confirmButtonText: 'Далее &rarr;',
        showCancelButton: true,
        progressSteps: ['1', '2']
    }).queue([
        {
            title: 'Имя комнаты',
            text: 'Введите имя вашей комнаты',
        },
        {
            title: 'Пароль комнаты',
            text: 'Введите пароль вашей комнаты',
            showDenyButton: true,
            denyButtonText: 'Без пароля',
        },
    ]).then((result) => {
        if (result.isDenied) {
            Swal.fire({
                title: 'Комната создана!',
                html: `
                    Имя комнаты: ${result.value[0]} <br />
                    Комната без пароля
                `,
                confirmButtonText: 'Ок'
            });

            firebase.database().ref(`rooms/room${result.value[0]}/`).set({ 
                nameRoom: result.value[0],
            });
      
            chatRoom(result.value[0]);
        } if (result.value) {
            Swal.fire({
                title: 'Комната создана!',
                html: `
                    Имя комнаты: ${result.value[0]} <br />
                    Пароль комнаты: ${result.value[1]}
                `,
                confirmButtonText: 'Ок'
            });

            firebase.database().ref(`rooms/room${result.value[0]}/`).set({ 
                nameRoom: result.value[0],
                idRoom: result.value[1],
            });
      
            chatRoom(result.value[0], result.value[1]);
        }
    })
}

async function chatRoom(roomName, roomId = false) {
    if (roomId === false) {
        mainChat.innerHTML = `
            <li class="list-group-item d-flex justify-content-between align-items-start">
                <div class="ms-2 me-auto">
                    <img src="" style="width: 30px; height: 30px;" alt="avatarUser">
                    ${roomName}
                </div>
            </li>
                            
            <form id="chat">
                <div class="mt-3" style="position: relative;" id="messages"></div>
            </form>

            <div class="align-bottom form-control mt-3" id="sendMsgDiv">
                <input type="text" id="message" class="form-control mt-2" placeholder="Сообщение">

                <button class="btn btn-success mt-2" id="sendMsg" onclick="sendMsgToChat('${roomName}')">Отправить</button>
                <button class="btn btn-danger mt-2" id="backToMenu" onclick="backToMenu()">Меню</button>
            </div> 
        `;

        const messages = firebase.database().ref(`rooms/room${roomName}/messages`).orderByChild('date/minutes');
        messages.on('child_added', (data) => {
            try {
                usernameDb = data.val().username;
                messageDb = data.val().message;
        
                hour = data.val().date.hour;
                minutes = data.val().date.minutes;
                seconds = data.val().date.seconds;
        
                day = data.val().date.day;
                month = data.val().date.month;
                year = data.val().date.year;
            
                document.getElementById('messages').innerHTML += `
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${usernameDb}</h5>
                            <span class="text-muted" style="float: right;">${hour}:${minutes}:${seconds}</span>
                            <span class="text-muted" style="margin-right: 0.5em; float: right;">${day}.${month}.${year}</span>
                            <p class="card-text">${messageDb}</p>
                        </div>
                    </div>
                `;
            } catch { }
        });
    } else if (roomId !== false) {
        const { value: password } = await Swal.fire({
            title: 'Введите пароль от комнаты',
            input: 'password',
            showCancelButton: true,
            inputPlaceholder: 'Пароль от комнаты',
            inputAttributes: {
              autocapitalize: 'off',
              autocorrect: 'off'
            }
        });

        console.log(roomId, password);

        if (password === roomId) {
            mainChat.innerHTML = `
                <form id="chat">
                    <div style="position: relative;" id="messages"></div>
                </form>

                <div class="form-control" id="sendMsgDiv">
                    <input type="text" id="message" class="form-control mt-2" placeholder="Сообщение">

                    <button class="btn btn-success mt-2" id="sendMsg" onclick="sendMsgToChat('${roomName}')">Отправить</button>
                    <button class="btn btn-danger mt-2" id="backToMenu" onclick="backToMenu()">Меню</button>
                </div> 
            `;

            const messages = firebase.database().ref(`rooms/room${roomName}/messages`).orderByChild('date/minutes');
            messages.on('child_added', (data) => {
                try {
                    usernameDb = data.val().username;
                    messageDb = data.val().message;
            
                    hour = data.val().date.hour;
                    minutes = data.val().date.minutes;
                    seconds = data.val().date.seconds;
            
                    day = data.val().date.day;
                    month = data.val().date.month;
                    year = data.val().date.year;
                
                    document.getElementById('messages').innerHTML += `
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">${usernameDb}</h5>
                                <span class="text-muted" style="float: right;">${hour}:${minutes}:${seconds}</span>
                                <span class="text-muted" style="margin-right: 0.5em; float: right;">${day}.${month}.${year}</span>
                                <p class="card-text">${messageDb}</p>
                            </div>
                        </div>
                    `;
                } catch { }
            });
        }
    }
}

function renderMessages(username, name) {
    const messagesFromMe = firebase.database().ref(`users/${username}/${name}`).orderByChild('date/minutes');
    messagesFromMe.on('child_added', (data) => {
        try {
            usernameDb = data.val().username;
            messageDb = data.val().message;

            hour = data.val().date.hour;
            minutes = data.val().date.minutes;
            seconds = data.val().date.seconds;

            day = data.val().date.day;
            month = data.val().date.month;
            year = data.val().date.year;

            document.getElementById('messages').innerHTML += `
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${usernameDb}</h5>
                        <span class="text-muted" style="float: right;">${hour}:${minutes}:${seconds}</span>
                        <span class="text-muted" style="margin-right: 0.5em; float: right;">${day}.${month}.${year}</span>
                        <p class="card-text">${messageDb} <span class="position-absolute top-0 start-100 translate-middle p-2 badge"></span></p>
                    </div>
                </div>
            `;
        } catch { }
    });

    const messagesToMe = firebase.database().ref(`users/${name}/${username}`).orderByChild('date/minutes');
    messagesToMe.on('child_added', (data) => {
        try {
            usernameDb = data.val().username;
            messageDb = data.val().message;

            hour = data.val().date.hour;
            minutes = data.val().date.minutes;
            seconds = data.val().date.seconds;

            day = data.val().date.day;
            month = data.val().date.month;
            year = data.val().date.year;

            document.getElementById('messages').innerHTML += `
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${usernameDb}</h5>
                        <span class="text-muted" style="float: right;">${hour}:${minutes}:${seconds}</span>
                        <span class="text-muted" style="margin-right: 0.5em; float: right;">${day}.${month}.${year}</span>
                        <p class="card-text">${messageDb}</p>
                    </div>
                </div>
            `;
        } catch { }
    });
}

function chatUser(username, myName) {
    mainChat.innerHTML = `
        <li class="list-group-item d-flex justify-content-between align-items-start">
            <div class="ms-2 me-auto">
                <img src="" id="avatar${username}" style="width: 30px; height: 30px; border-radius: 50%;" alt="avatarUser">
                ${username}
                <span class="badge secondary rounded-pill" id="isOnlineChat${username}"></span>
            </div>
       </li>
            
        <form id="chat">
            <div class="mt-3" style="position: relative;" id="messages"></div>
        </form>

        <div class="input-group mt-3" id="sendMsgDiv">
            <input type="text" id="message" class="form-control mt-2" placeholder="Сообщение">
        
            <button class="btn btn-success mt-2" id="sendMsg" onclick="sendMsgToUser('${username}', '${myName}')">Отправить</button>
        </div> 
    `;

    firebase.database().ref(`users/${username}/`).get().then((snapshot) => {
        document.getElementById(`avatar${username}`).src = snapshot.val().photoUrl;
    });

    firebase.database().ref(`users/`).on('value', (snapshot) => {
        for (let key in snapshot.val()) {
            firebase.database().ref(`users/${key}`).on('value', (snapshot) => {
                try {
                    const isOnline = snapshot.val().isOnline;
                    let isOnlineSpan = document.getElementById(`isOnlineChat${snapshot.val().username}`);

                    switch (isOnline) {
                        case true:
                            isOnlineSpan.innerHTML = `В сети`;
                            isOnlineSpan.className = `badge bg-success rounded-pill`;
                            break;
                        case false:
                            isOnlineSpan.innerHTML = `Не в сети`;
                            isOnlineSpan.className = `badge bg-secondary rounded-pill`;
                            break;
                    }
                } catch {}
            });
        }
    });

    renderMessages(`${username}`, `${myName}`);
}

window.onblur = () => {
    firebase.database().ref(`users/${myUsername}/isOnline`).set(false);
}

window.onfocus = () => {
    firebase.database().ref(`users/${myUsername}/isOnline`).set(true);
}
