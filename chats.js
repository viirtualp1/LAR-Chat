const database = firebase.database();
const chatsDiv = document.getElementById('chats');
const mainDiv = document.getElementById('main');

function rooms() {
    document.getElementById('searchFriend').className = 'd-flex';
    document.getElementById('searchFriend').style.display = 'block';

    document.getElementById('startChat').onclick = () => {
        const username = document.getElementById('usernameFriend').value;

        if (username == myUsername) {
            Swal.fire({
                icon: 'error',
                title: 'Ошибка!',
                text: 'Вы не можете начать беседу с собой!'
            });
        } else {
            mainDiv.innerHTML = `
                <form id="chat">
                    <div class="mt-3" style="position: relative;" id="messages"></div>
                </form>
        
                <div class="align-bottom form-control mt-3" id="sendMsgDiv">
                    <input type="text" id="message" class="form-control mt-2" placeholder="Сообщение">
        
                    <button class="btn btn-success mt-2" id="sendMsg" onclick="sendMsgToUser('${username}')">Отправить</button>
                    <button class="btn btn-danger mt-2" id="backToMenu" onclick="backToMenu()">Меню</button>
                </div> 
            `;
    
            renderMessages(username);
        }
    }

    firebase.database().ref(`rooms/`).on('child_added', (data) => {
        document.getElementById('chats').innerHTML += `
            <button class="btn btn-outline-primary" onclick="chatRoom('${data.val().nameRoom}', '${data.val().idRoom}')">
                Войти в комнату "${data.val().nameRoom}"
            </button>
        `;
    });
}

function renderMessages(username) {
    const messagesFromMe = firebase.database().ref(`users/${username}/${myUsername}`).orderByChild('date/minutes');
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
                        <p class="card-text">${messageDb}</p>
                    </div>
                </div>
            `;
        } catch { }
    });

    const messagesToMe = firebase.database().ref(`users/${myUsername}/${username}`).orderByChild('date/minutes');
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

function backToMenu() {
    mainDiv.innerHTML = `
        <div class="row" id="chatUI">
            <div class="btn-group-vertical" id="chats"></div>

            <div class="btn-group-vertical fixed-bottom" style="padding: 0;">
                <button class="btn btn-success mt-2" style="border-radius: 0;" onclick="createRoom()">Создать комнату</button>
                <button class="btn btn-danger" style="border-radius: 0;" onclick="signOut()">Выйти из аккаунта</button>
            </div>
        </div>
    `;

    rooms();
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
        },
    ]).then((result) => {
        if (result.value) {
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
      
            chatRoom(result.value[0]);
        }
    })
}

async function chatRoom(roomName, roomId) {
    const { value: password } = await Swal.fire({
        title: 'Введите пароль от комнаты',
        input: 'password',
        inputPlaceholder: 'Пароль от комнаты',
        inputAttributes: {
          autocapitalize: 'off',
          autocorrect: 'off'
        }
    });

    if (password == roomId) {
        mainDiv.innerHTML = `
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
    }
}