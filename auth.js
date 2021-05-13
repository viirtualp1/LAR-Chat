let myUsername;

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        document.getElementById('chatUI').style.display = 'block';
        document.getElementById('signInForm').style.display = 'none';

        name = user.displayName;
        email = user.email;
        photoUrl = user.photoURL;

        usernameLC = localStorage.getItem('username');

        if (usernameLC != null) {
            myUsername = usernameLC;
        }

        rooms(`${photoUrl}`, `${name}`, `${email}`);
        chats();
    }
});

function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

    firebase.auth().signInWithPopup(provider).then((result) => {
        firebase.database().ref(`users/${result.user.displayName}/`).set({
            email: result.user.email,
            username: result.user.displayName,
            photoUrl: result.user.photoURL,
        });

        localStorage.setItem('username', result.user.displayName);
    }).catch((error) => {
        alert(`${error.code} ${error.message}`);
    });
}

function signOut() {
    let chatUI = document.getElementById('chatUI');
    chatUI.style.display = 'none';

    document.getElementById('chats').innerHTML = ``;

    let signInForm = document.getElementById('signInForm').style.display = 'block';

    document.getElementById('searchFriend').className = '';
    document.getElementById('searchFriend').style.display = 'none';

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

