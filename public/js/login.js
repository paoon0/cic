// 共通設定を読み込み
import { auth } from "./firebaseConfig.js";
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
//import { getFirestore, collection, getDoc, doc, setDoc, updateDoc, getDocs, addDoc, Timestamp, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// ログイン処理
const loginForm = document.querySelector('.login');
loginForm.addEventListener('submit', function (e) {
    e.preventDefault(); // フォームのデフォルトの送信動作をキャンセル
    var mailaddress = document.getElementById('mailaddress').value;
    var password = document.getElementById('password').value;
    // var username = document.getElementById('name').value;

    signInWithEmailAndPassword(auth, mailaddress, password)
        .then(async (userCredential) => {
            // ログイン成功時の処理
            const user = userCredential.user;
            const uid = user.uid;
            console.log("ログイン成功:", user);

            onAuthStateChanged(auth, (user
            ) => {
                if (user) {
                    const uid = user.uid;
                    const redirectUrl = './home.html';

                    // ユーザーをリダイレクト
                    window.location.href = redirectUrl;
                } else {
                }
            });
        })
        .catch(function (error) {
            alert('ログインできません（' + error.message + '）');
        });
});
