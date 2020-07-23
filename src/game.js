// 起動されたときに呼ばれる関数を登録する
window.addEventListener("load", () => {
    // まずステージを整える
    initialize();
    var clickFlag = false;

	document.body.addEventListener("click", () => {
      	if(!clickFlag) {
			clickFlag = true;
    		document.getElementById('bgm').volume = 0.1;
    		document.getElementById('bgm').currentTime = 0;
			document.getElementById('bgm').play();

    // ゲームを開始する
    loop();
            }
    });
});

let mode; // ゲームの現在の状況
let frame; // ゲームの現在フレーム（1/60秒ごとに1追加される）
let combinationCount = 0; // 何連鎖かどうか

function initialize() {
    // 画像を準備する
    PuyoImage.initialize();
    // ステージを準備する
    Stage.initialize();
    // ユーザー操作の準備をする
    Player.initialize();
    // シーンを初期状態にセットする
    Score.initialize();
    // スコア表示の準備をする
    mode = 'start';
    // フレームを初期化する
    frame = 0;
}

function loop() {
    switch(mode) {
        case 'start':
            // 最初は、もしかしたら空中にあるかもしれないぷよを自由落下させるところからスタート
            mode = 'checkFall';
            break;
        case 'checkFall':
            // 落ちるかどうか判定する
            if(Stage.checkFall()) {
                mode = 'fall'
            } else {
                // 落ちないならば、ぷよを消せるかどうか判定する
                mode = 'checkErase';
            }
            break;
        case 'fall':
            if(!Stage.fall()) {
                // すべて落ちきったら、ぷよを消せるかどうか判定する
                mode = 'checkErase';
            }
            break;
        case 'checkErase':
            // 消せるかどうか判定する
            const eraseInfo = Stage.checkErase(frame);
            if(eraseInfo) {
                mode = 'erasing';
                combinationCount++;
              	if(combinationCount == 2) {
                	document.getElementById("ren2").currentTime = 0;
              		document.getElementById("ren2").play();
                } else if(combinationCount == 3) {
                	document.getElementById("ren3").currentTime = 0;
              		document.getElementById("ren3").play();
                } else if(combinationCount == 4) {
                	document.getElementById("ren4").currentTime = 0;
              		document.getElementById("ren4").play();
                } else if(combinationCount == 5) {
                	document.getElementById("ren5").currentTime = 0;
              		document.getElementById("ren5").play();
                } else if(combinationCount == 6) {
                	document.getElementById("ren6").currentTime = 0;
              		document.getElementById("ren6").play();
                } else if(combinationCount >= 7) {
                	document.getElementById("ren7").currentTime = 0;
              		document.getElementById("ren7").play();
                } else {
                	document.getElementById("ren1").currentTime = 0;
              		document.getElementById("ren1").play();
                }


                // 得点を計算する
                Score.calculateScore(combinationCount, eraseInfo.piece, eraseInfo.color);
                Stage.hideZenkeshi();
            } else {
                if(Stage.puyoCount === 0 && combinationCount > 0) {
                    // 全消しの処理をする
                    document.getElementById("allg").currentTime = 0;
              		document.getElementById("allg").play();
                    Stage.showZenkeshi();
                    Score.addScore(3600);
                }
                combinationCount = 0;
                // 消せなかったら、新しいぷよを登場させる
                mode = 'newPuyo'
            }
            break;
        case 'erasing':
            if(!Stage.erasing(frame, combinationCount)) {
                // 消し終わったら、再度落ちるかどうか判定する
                mode = 'checkFall';
            }
            break;
        case 'newPuyo':
            if(!Player.createNewPuyo()) {
                // 新しい操作用ぷよを作成出来なかったら、ゲームオーバー
                mode = 'gameOver';
            } else {
                // プレイヤーが操作可能
                mode = 'playing';
            }
            break;
        case 'playing':
            // プレイヤーが操作する
            const action = Player.playing(frame);
            mode = action; // 'playing' 'moving' 'rotating' 'fix' のどれかが帰ってくる
            break;
        case 'moving':
            if(!Player.moving(frame)) {
                // 移動が終わったので操作可能にする
                mode = 'playing';
            }
            break;
        case 'rotating':
            if(!Player.rotating(frame)) {
                // 回転が終わったので操作可能にする
                mode = 'playing';
            }
            break;
        case 'fix':
            // 現在の位置でぷよを固定する
            Player.fix();
            // 固定したら、まず自由落下を確認する
            mode = 'checkFall'
            break;
        case 'gameOver':
            // ばたんきゅーの準備をする
            PuyoImage.prepareBatankyu(frame);
            mode = 'batankyu';
            break;
        case 'batankyu':
            PuyoImage.batankyu(frame);
            Player.batankyu();
            break;
    }
    frame++;
    requestAnimationFrame(loop); // 1/60秒後にもう一度呼び出す
}
