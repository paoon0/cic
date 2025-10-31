// 共通設定を読み込み
import { auth, db } from "./firebaseConfig.js";
import { getAuth,onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { collection, getDoc, doc, setDoc, updateDoc, getDocs, deleteField, deleteDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

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
                    const day = document.getElementById("day").value;
                    const time = document.getElementById("time").value;
                    // 時間割のセルのidとフィールド名が一致する場合に、フィールドの値をセルに表示
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



                    const deletebutton = document.getElementById("deletebutton");
                    deletebutton.addEventListener("click", function () {
                        // 選択された曜日と時間を取得
                        const day = document.getElementById("day").value;
                        const time = document.getElementById("time").value;

                        // 関数を呼び出す
                        deleteclick(day, time);
                    });

                    const scrollBar = document.getElementById("scrollBar");
                    //console.log("jdsnjnjna");
                    scrollBar.addEventListener("change", handleSelectChange);
                    // スクロールバーの項目をクリックしたときの処理を割り当て
                    scrollBar.addEventListener("click", handleScrollBarClick);
                    const daySelect = document.getElementById("day");
                    const timeSelect = document.getElementById("time");
                    handleSelectionChange();
                    daySelect.addEventListener("change", handleSelectionChange);
                    timeSelect.addEventListener("change", handleSelectionChange);

                    function handleSelectionChange() {
                        const selectedDay = daySelect.value;
                        const selectedTime = timeSelect.value;
                        const day = document.getElementById("day").value;
                        const time = document.getElementById("time").value;

                        // 選択が変更されたときに実行される処理を記述します
                        //console.log("選択された時間変数:", time);
                        //console.log("選択された曜日変数:", day);
                        updateScrollBarContent(day, time);
                        // 他の処理を実行するなど、必要な操作を行います
                    }

                    function deleteclick(day, time) {
                        const elementId = `${day}-${time}`;
                        const element = document.getElementById(elementId);
                        const classname = element.innerHTML;
                        console.log(userId);
                        if (element.innerHTML === "") {
                            alert("授業が登録されていません");
                            return;
                        }
                        const confirmMessage = `${element.innerHTML}を時間割から削除しますか？`;
                        if (!confirm(confirmMessage)) {
                            return;
                        } else if (element) {
                            //console.log("消せてるよう");
                            element.innerHTML = "";
                            const classDocRef = doc(db, "users", userId);
                            const data = {
                                [`${day}-${time}`]: deleteField()
                            };
                            // ドキュメントを更新
                            updateDoc(classDocRef, data)
                                .then(() => {
                                    console.log("フィールドの削除が成功しました");
                                })
                                .catch((error) => {
                                    console.error("フィールドの削除に失敗しました:", error);
                                });
                            const classnameDocRef = doc(db, "chatgroup", classname, "users", userId);
                            deleteDoc(classnameDocRef, classnameDocRef)
                                .then(() => {
                                    console.log("フィールドの削除が成功しました");
                                })
                                .catch((error) => {
                                    console.error("フィールドの削除に失敗しました:", error);
                                });
                        }
                    }
                    // スクロールバーの内容を更新する関数
                    function updateScrollBarContent(day, time) {
                        // 曜日に応じて適切な値に変換する
                        let dayString;
                        if (day === "0") {
                            dayString = "Mon";
                        } else if (day === "1") {
                            dayString = "Tue";
                        } else if (day === "2") {
                            dayString = "Wed";
                        } else if (day === "3") {
                            dayString = "Thu";
                        } else if (day === "4") {
                            dayString = "Fri";
                        } else {
                            return; // それ以外の値の場合は処理を中断
                        }
                        let timeString;
                        if (time === "0") {
                            timeString = "1";
                        } else if (time === "1") {
                            timeString = "2";
                        } else if (time === "2") {
                            timeString = "3";
                        } else if (time === "3") {
                            timeString = "4";
                        } else if (time === "4") {
                            timeString = "5";
                        } else {
                            return; // それ以外の値の場合は処理を中断
                        }

                        // Firebaseから授業データを取得してスクロールバーを更新する処理を実行する
                        const docRef = doc(db, "table", dayString);
                        const subCollectionRef = collection(docRef, timeString);
                        // 授業の受け取り
                        getDocs(subCollectionRef)
                            .then((querySnapshot) => {
                                scrollBar.innerHTML = ""; // スクロールバーの内容をクリア
                                querySnapshot.forEach((doc) => {
                                    const className = doc.data().className;
                                    const option = document.createElement("option");
                                    option.textContent = className;
                                    scrollBar.appendChild(option);
                                });
                            })
                            .catch((error) => {
                                console.error("サブコレクションの取得に失敗しました:", error);
                            });
                    }

                    //授業名を受け取る関数
                    function handleSelectChange() {
                        const selectedOption = this.options[this.selectedIndex];
                        const selectedClassName = selectedOption.textContent;
                        console.log("選択された授業名:", selectedClassName);
                    }
                    // 同じ曜日と時間に授業名が既に登録されているかチェックする関数
                    function isClassAlreadyAddedSameDayTime(className, day, time) {
                        for (let i = 0; i < 5; i++) {
                            for (let j = 0; j < 5; j++) {
                                const element = document.getElementById(`${i}-${j}`);
                                if (element.innerHTML === className && i.toString() === day && j.toString() === time) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    }

                    // スクロールバーの項目をクリックしたときの処理
                    function handleScrollBarClick() {
                        // 選択された授業名を取得

                        const selectedOption = this.options[this.selectedIndex];
                        //console.log(selectedOption.textContent);
                        const selectedClassName = selectedOption.textContent;
                        console.log(selectedClassName);
                        // 選択された曜日と時間を取得
                        const day = document.getElementById("day").value;
                        const time = document.getElementById("time").value;


                        // 既に時間割に授業名が登録されているかチェック
                        if (isClassAlreadyAddedSameDayTime(selectedClassName, day, time)) {
                            alert("この授業は既に時間割に登録されています。");
                            return;
                        }
                        const elementId = `${day}-${time}`;
                        const element = document.getElementById(elementId);
                        //console.log(element.innerHTML);
                        if (element && element.innerHTML !== selectedClassName && element.innerHTML.trim() !== '') {
                            const confirmMessage = "別の授業名が既に登録されています。\n上書きしますか？";
                            //console.log(element.innerHTML);
                            //console.log(selectedClassName);
                            if (!confirm(confirmMessage)) {
                                return;
                            }
                        }
                        //console.log("通った384");
                        if (element.innerHTML != "") {
                            //console.log("通った386");
                            //firebaseからすでにあった授業名をチャットグループから削除
                            const classnameDocRef2 = doc(db, "chatgroup", element.innerHTML, "users", userId);
                            deleteDoc(classnameDocRef2, classnameDocRef2)
                                .then(() => {
                                    console.log("フィールドの削除が成功しました");
                                })
                                .catch((error) => {
                                    console.error("フィールドの削除に失敗しました:", error);
                                });
                        }
                        element.innerHTML = selectedClassName;
                        for (let i = 0; i < 5; i++) {
                            let day1;
                            if (i == 0) {
                                day1 = "Mon";
                            } else if (i == 1) {
                                day1 = "Tue";
                            } else if (i == 2) {
                                day1 = "Wed";
                            } else if (i == 3) {
                                day1 = "Tur";
                            } else if (i == 4) {
                                day1 = "Fri";
                            }
                            if (elementId == `${i}-0`) {
                                const userDocRef = doc(db, "users", userId);
                                const data = {
                                    [`${i}-0`]: selectedClassName
                                };
                                //userDocRefにdataを入れる

                                //userドキュメントに授業データを入れる
                                updateDoc(userDocRef, data)
                                const chatDocRef = doc(db, "chatgroup", selectedClassName, "users", userId)
                                const data2 = {
                                    name: fieldValue
                                }
                                setDoc(chatDocRef, data2)
                            }
                            if (elementId == `${i}-1`) {
                                const userDocRef = doc(db, "users", userId);
                                const data = {
                                    [`${i}-1`]: selectedClassName
                                };
                                updateDoc(userDocRef, data)
                                const chatDocRef = doc(db, "chatgroup", selectedClassName, "users", userId)
                                const data2 = {
                                    name: fieldValue
                                }
                                setDoc(chatDocRef, data2)
                            }
                            if (elementId == `${i}-2`) {
                                const userDocRef = doc(db, "users", userId);
                                const data = {
                                    [`${i}-2`]: selectedClassName
                                };
                                updateDoc(userDocRef, data)
                                const chatDocRef = doc(db, "chatgroup", selectedClassName, "users", userId)
                                const data2 = {
                                    name: fieldValue
                                }
                                setDoc(chatDocRef, data2)
                            }
                            if (elementId == `${i}-3`) {
                                const userDocRef = doc(db, "users", userId);
                                const data = {
                                    [`${i}-3`]: selectedClassName
                                };
                                updateDoc(userDocRef, data)
                                const chatDocRef = doc(db, "chatgroup", selectedClassName, "users", userId)
                                const data2 = {
                                    name: fieldValue
                                }
                                setDoc(chatDocRef, data2)
                            }
                            if (elementId == `${i}-4`) {
                                const userDocRef = doc(db, "users", userId);
                                const data = {
                                    [`${i}-4`]: selectedClassName
                                };
                                updateDoc(userDocRef, data)
                                const chatDocRef = doc(db, "chatgroup", selectedClassName, "users", userId)
                                const data2 = {
                                    name: fieldValue
                                }
                                setDoc(chatDocRef, data2)
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