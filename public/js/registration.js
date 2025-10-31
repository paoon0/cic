// 共通設定を読み込み
import { auth, db } from "./firebaseConfig.js";
import {createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const registerButton = document.getElementById('register');
registerButton.addEventListener('click', function (e) {
    e.preventDefault();

    var mailAddress = document.getElementById('Address').value;
    var password = document.getElementById('Password').value;
    var password2 = document.getElementById('password').value;
    var name = document.getElementById('Name').value;
    if (password === password2) {
        createUserWithEmailAndPassword(auth, mailAddress, password)
            .then((userCredential) => {
                const user = userCredential.user;
                const uid = user.uid;
                setDoc(doc(db, "users", uid), {
                    name: name,
                })
                    .then(() => {
                        console.log('ユーザーのドキュメントが正常に作成されました。');
                        alert('アカウント作成が完了しました、次の画面でログインしてください')
                        const redirectUrl = './login.html';
                        // ユーザーを別のファイルにリダイレクトする
                        window.location.href = redirectUrl;
                    })
                    .catch((error) => {
                        console.error('ドキュメントの作成に失敗しました:', error);
                    });
            })
            .catch((error) => {
                alert('登録できません（' + error.message + '）');
            });
    } else {
        alert("パスワードが一致しません");
        return;
    }
});