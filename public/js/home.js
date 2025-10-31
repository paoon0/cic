// 共通設定を読み込み
import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";


onAuthStateChanged(auth, async (user) => {
    if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        console.log(docSnap.data());
    }
});
// ユーザーの認証情報を取得する
const user = auth.currentUser;

// 認証状態の変化を受ける
onAuthStateChanged(auth, (user) => {
    if (user) {
        const userId = user.uid;
        const userDocRef = doc(db, 'users', userId);

        getDoc(userDocRef)
            .then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    const userData = docSnapshot.data();
                    const fieldValue = userData.name;
                    console.log(`おかえりなさい`, fieldValue, 'さん');
                    alert(`おかえりなさい、${fieldValue} さん`);
                    for (let i = 0; i < 5; i++) {
                        for (let j = 0; j < 5; j++) {
                            const cellId = `${i}-${j}`;
                            const cellElement = document.getElementById(cellId);
                            const fieldName = `${i}-${j}`; // フィールド名はセルのidと同じと仮定

                            if (cellElement && fieldName in userData) {
                                const fieldValue = userData[fieldName];
                                cellElement.innerHTML = fieldValue;
                            }
                        }
                    }
                } else {
                    console.log('ユーザードキュメントが存在しません');
                }
            })
            .catch((error) => {
                console.error('エラー:', error);
            });
    } else {
        alert('ログインしてください');
        const loginUrl = './login.html';
        window.location.href = loginUrl;
    }
});