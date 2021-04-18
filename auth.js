let myUsername;

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        document.getElementById('chatUI').style.display = 'block';
        document.getElementById('signInForm').style.display = 'none';

        usernameLC = localStorage.getItem('username');
        
        if (usernameLC != null) {
            myUsername = usernameLC;
        }

        rooms();
    }
});

function signUp() {
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;

    let username = document.getElementById('username').value;

    firebase.auth().createUserWithEmailAndPassword(email, password).then(() => {
        firebase.database().ref(`users/${username}/`).set({
            email: email,
            password: password,
            username: username,
        });

        localStorage.setItem('username', username);

        myUsername = username;
    }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        console.log(errorCode, errorMessage);

        alert('Неправильный Email или Пароль');
    });
}

function signIn() {
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;

    firebase.auth().signInWithEmailAndPassword(email, password).catch((error) => {
        const errorMessage = error.message;

        console.log(errorCode, errorMessage);

        alert('Неправильный Email или Пароль');
    });

    firebase.database().ref(`users`).on('child_added', (data) => {
        if (email == data.val().email) {
            myUsername = data.val().username;

            localStorage.setItem('username', myUsername);
        }
    });
}

function switchForm() {
    document.getElementById('signInForm').innerHTML = `
        <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" class="form-control" id="email" aria-describedby="emailHelp">
        </div>
        <div class="mb-3">
            <label for="password" class="form-label">Пароль</label>
            <input type="password" class="form-control" id="password">
        </div>
        <div class="btn-group">
            <button type="button" class="btn btn-success" onclick="signIn()">Войти</button>
            <button type="button" class="btn btn-primary" onclick="switchFormSignUp()">Нет аккаунта</button>
        </div>
    `;
}

function switchFormSignUp() {
    document.getElementById('signInForm').innerHTML = `
        <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" class="form-control" id="email" aria-describedby="emailHelp">
        </div>
        <div class="mb-3">
            <label for="password" class="form-label">Пароль</label>
            <input type="password" class="form-control" id="password">
        </div>
        <div class="input-group mb-3">
            <span class="input-group-text">Никнейм</span>
            <input type="text" id="username" class="form-control">
        </div>
        <div class="btn-group">
            <button type="button" class="btn btn-success" onclick="signUp()">Зарегистрироваться</button>
            <button type="button" class="btn btn-primary" onclick="switchForm()">Уже есть аккаунт</button>
        </div>
    `;
}

function signOut() {
    document.getElementById('chatUI').style.display = 'none';     
    let signInForm = document.getElementById('signInForm').style.display = 'block';
    document.getElementById('searchFriend').style.display = `none`;
    signInForm.innerHTML = `
        <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" class="form-control" id="email" aria-describedby="emailHelp">
        </div>
        <div class="mb-3">
            <label for="password" class="form-label">Пароль</label>
            <input type="password" class="form-control" id="password">
        </div>
        <div class="input-group mb-3">
            <span class="input-group-text">Имя и фамилия</span>
            <input type="text" id="username" class="form-control">
        </div>
        <div class="mb-3 form-check">
            <input type="checkbox" class="form-check-input" id="exampleCheck1">
            <label class="form-check-label" for="exampleCheck1">Запомнить меня</label>
        </div>
        <div class="btn-group">
            <button type="button" class="btn btn-success" onclick="signUp()">Зарегистрироваться</button>
            <button type="button" class="btn btn-primary" onclick="switchForm()">Уже есть аккаунт</button>
        </div>
    `;

    firebase.auth().signOut();
}