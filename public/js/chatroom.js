// 共通設定を読み込み
import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getDoc, doc, setDoc, getDocs, addDoc, Timestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
// 現在のユーザーのIDを保持する変数
let currentUserId = null;

// ユーザーのログイン状態を確認
onAuthStateChanged(auth, (user) => {
    if (user) {
        const userId = user.uid;
        const userDocRef = doc(db, 'users', userId);

        getDoc(userDocRef)
            .then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    const userData = docSnapshot.data();
                    const fieldValue = userData.name;
                    console.log(`おかえりなさい、${fieldValue} さん`);
                    // ユーザーがログインしている場合
                    currentUserId = user.uid;
                    // ページがロードされた時に実行される処理
                    hyoji();
                    function hyoji() {
                        // 初期値を設定する要素を取得
                        const groupNameElement = document.getElementById('group-name');
                        // 初期値を設定
                        groupNameElement.textContent = 'まだグループが選択されていません';
                    };
                    // グループ一覧を表示
                    showGroupList();

                    // グループ一覧を表示する関数
                    function showGroupList() {
                        const groupList = document.getElementById('group-list');

                        // グループ一覧を取得
                        const groupsRef = collection(db, 'chatgroup');
                        getDocs(groupsRef)
                            .then(querySnapshot => {
                                // グループ一覧を表示
                                querySnapshot.forEach(doc => {
                                    const groupId = doc.id;
                                    const groupName = doc.data().className;
                                    //console.log(`グループID: ${groupId}, グループ名: ${groupName}`);

                                    // グループの参加者を確認
                                    const usersRef = collection(db, 'chatgroup', groupId, 'users');
                                    getDocs(usersRef)
                                        .then(querySnapshot => {
                                            // 参加しているユーザーのIDを格納する配列を作成
                                            const participantIds = [];
                                            querySnapshot.forEach(userDoc => {
                                                if (userDoc.exists) {
                                                    // ユーザーが参加している場合、IDを配列に追加
                                                    participantIds.push(userDoc.id);
                                                }
                                            });
                                            // 現在のユーザーが参加しているかを確認
                                            const currentUserId = auth.currentUser.uid;
                                            if (participantIds.includes(currentUserId)) {
                                                // ユーザーがグループに参加している場合、グループ一覧に表示
                                                const listItem = document.createElement('li');
                                                const link = document.createElement('a');
                                                link.href = '#';
                                                link.onclick = () => selectGroup(groupId);
                                                link.textContent = groupName;
                                                listItem.appendChild(link);
                                                groupList.appendChild(listItem);
                                            }
                                        })
                                        .catch(error => {
                                            console.error('Error fetching user document:', error);
                                        });
                                });
                            })
                            .catch(error => {
                                console.error('Error fetching groups:', error);
                            });
                    }

                    // 現在のグループのIDを保持する変数
                    let currentGroupId = null;

                    // グループを選択したときの処理
                    function selectGroup(groupId) {
                        currentGroupId = groupId;
                        const groupNameElement = document.getElementById('group-name');
                        const groupName = currentGroupId; // 実際のグループ名を取得する処理を追加する
                        // グループ名を groupNameElement のテキストにセット
                        groupNameElement.textContent = groupName;
                        // グループのチャットメッセージを表示
                        showChatMessages();
                    }
                    // チャットメッセージを表示する関数
                    function showChatMessages() {
                        // チャットメッセージのコンテナ要素を取得
                        const chatMessages = document.getElementById('output');

                        // グループが選択されていない場合
                        if (!currentGroupId) {
                            chatMessages.innerHTML = '<p>No group selected.</p>';
                            return;
                        }

                        // グループのチャットメッセージの参照を取得
                        const chatCollectionRef = collection(db, 'chatgroup', currentGroupId, 'messages');

                        // チャットメッセージのリアルタイム監視を開始
                        onSnapshot(chatCollectionRef, querySnapshot => {
                            // 既存のメッセージをクリア
                            chatMessages.innerHTML = '';

                            const messages = [];
                            querySnapshot.forEach(doc => {
                                const messageData = doc.data();
                                const name = messageData.sender;
                                const message = messageData.message;
                                const timestamp = messageData.timestamp;
                                const date = new Date(timestamp.toMillis());

                                messages.push({ name, message, date });
                            });

                            // メッセージを日付順に並び替え（新しいメッセージが下に表示されるようにする）
                            messages.sort((a, b) => a.date - b.date);

                            messages.forEach(messageData => {
                                const name = messageData.name;
                                const message = messageData.message;
                                const date = messageData.date;

                                const messageElement = document.createElement('p');
                                messageElement.textContent = `${message}`;
                                messageElement.classList.add('chat-message');

                                const timestampElement = document.createElement('p');
                                timestampElement.textContent = `${date.toLocaleString()}`;

                                const nameElement = document.createElement('p');
                                nameElement.textContent = `${name}`;

                                // Apply the appropriate class based on the sender
                                if (name === fieldValue) {
                                    messageElement.classList.add('right-bubble');
                                    timestampElement.classList.add('right-timestamp-class');
                                    nameElement.classList.add('right-name-class');
                                } else {
                                    messageElement.classList.add('left-bubble');
                                    timestampElement.classList.add('left-timestamp-class');
                                    nameElement.classList.add('left-name-class');
                                }

                                chatMessages.appendChild(nameElement);
                                chatMessages.appendChild(messageElement);
                                chatMessages.appendChild(timestampElement);

                                // 区切り線を追加
                                // const separatorElement = document.createElement('hr');
                                //chatMessages.appendChild(separatorElement);
                            });

                            // スクロールを一番下に移動（新しいメッセージが表示されるようにする）
                            chatMessages.scrollTop = chatMessages.scrollHeight;
                        }, error => {
                            console.error('Error fetching chat messages:', error);
                        });
                    }

                    // メッセージを送信する関数
                    $("#send").on("click", function () {
                        // 入力されたメッセージを取得
                        const messageInput = document.getElementById('message-input');
                        const message = messageInput.value.trim();
                        if (message === '') {
                            return;
                        }

                        // グループが選択されていない場合は送信しない
                        if (!currentGroupId) {
                            return;
                        }

                        // グループのチャットメッセージにメッセージを追加
                        const chatCollectionRef = collection(db, 'chatgroup', currentGroupId, 'messages');
                        const messageData = {
                            message: message,
                            timestamp: Timestamp.now(), // 現在の時刻を取得
                            sender: fieldValue
                        };
                        addDoc(chatCollectionRef, messageData)
                            .then(() => {
                            })
                            .catch(error => {
                                console.error('Error sending message:', error);
                            });

                        // メッセージ入力欄をクリア
                        messageInput.value = '';
                    });

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