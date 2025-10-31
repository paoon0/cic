// 共通設定を読み込み
import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

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

                    //保存ボタンをクリックすると呼び出される
                    document.getElementById('btn').addEventListener('click',
                        function saveClass(event) {
                            event.preventDefault(); // フォームのデフォルトの送信をキャンセル
                            var className = document.getElementById("class-name").value;
                            var day = document.getElementById("day").value;
                            var time = document.getElementById("time").value;
                            var Tname = document.getElementById("teacher-name").value;
                            var place = document.getElementById("class-place").value;
                            // コンソールに入力された授業名と選択された曜日・時間帯を表示
                            console.log("授業名:", className);
                            console.log("選択された曜日:", day);
                            console.log("選択された時間帯:", time);
                            convertToValue(day, time, className, Tname, place);
                        }

                    )
                    function convertToValue(day, time, className, Tname, place) {
                        if (!day.trim() || !time.trim() || !className.trim() || !Tname.trim() || !place.trim()) {
                            alert("入力されていない箇所があります")
                            return;
                        }
                        var dayNumber = getDayNumber(day);
                        var timeNumber = parseInt(time);
                        var value = (dayNumber - 1) * 5 + timeNumber;
                        let i = value;
                        const documentPath = doc(db, "table", day, time, className);
                        const data = {
                            // サブコレクション内のドキュメントのデータ
                            teachername: Tname,
                            place: place,
                            className: className,
                            roomId: className
                        };
                        //classname講義の登録
                        setDoc(documentPath, data)
                            .then(() => {
                                console.log('サブコレクションが正常に作成されました。');
                                const documentPath2 = doc(db, "chatgroup", className);
                                const data2 = {
                                    className: className
                                }
                                setDoc(documentPath2, data2)
                                    .then(() => {
                                        alert('時間割が作成されました');
                                        // フォームをクリアする
                                        document.getElementById("class-name").value = "";
                                        document.getElementById("day").value = "monday";
                                        document.getElementById("time").value = "1";
                                        document.getElementById("teacher-name").value = "";
                                        document.getElementById("class-place").value = "";
                                    })
                                    .catch((error) => {
                                        console.error('ルームの作成に失敗しました:', error);
                                    });


                            })
                            .catch((error) => {
                                console.error('サブコレクションの作成に失敗しました:', error);
                            });
                    }
                    function getDayNumber(day) {
                        switch (day) {
                            case "Mon":
                                return 1;
                            case "Tue":
                                return 2;
                            case "Tue":
                                return 3;
                            case "Thu":
                                return 4;
                            case "Fri":
                                return 5;
                            default:
                                return 0;
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