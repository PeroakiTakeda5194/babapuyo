class Stage {
    // static stageElement;
    // static scoreElement;
    // static zenkeshiImage;
    // static board;
    // static puyoCount;
    // static fallingPuyoList = [];
    // static eraseStartFrame;
    // static erasingPuyoInfoList = [];

    static initialize() {
        // HTML からステージの元となる要素を取得し、大きさを設定する
        const stageElement = document.getElementById("stage");
        stageElement.style.width = Config.puyoImgWidth * Config.stageCols + 'px';
        stageElement.style.height = Config.puyoImgHeight * Config.stageRows + 'px';
        stageElement.style.backgroundColor = Config.stageBackgroundColor;
        this.stageElement = stageElement;
        
        const zenkeshiImage = document.getElementById("zenkeshi");
        zenkeshiImage.width = Config.puyoImgWidth * 6;
        zenkeshiImage.style.position = 'absolute';
        zenkeshiImage.style.display = 'none';        
        this.zenkeshiImage = zenkeshiImage;
        stageElement.appendChild(zenkeshiImage);

        for(let i = 0; i < 6; i++) {
            const combImages = document.getElementById(`rensa${i + 1}`);
            combImages.width = Config.puyoImgWidth * 6;
            combImages.style.position = 'absolute';
            combImages.style.display = 'none';  
            switch(i) {
                case 0:
                    this.combImage2 = combImages;
                    stageElement.appendChild(this.combImage2);
                    break;
                case 1:
                    this.combImage3 = combImages;
                    stageElement.appendChild(this.combImage3);
                    break;
                case 2:
                    this.combImage4 = combImages;
                    stageElement.appendChild(this.combImage4);
                    break;
                case 3:
                    this.combImage5 = combImages;
                    stageElement.appendChild(this.combImage5);
                    break;
                case 4:
                    this.combImage6 = combImages;
                    stageElement.appendChild(this.combImage6);
                    break;
                case 5:
                    this.combImage7 = combImages;
                    stageElement.appendChild(this.combImage7);
                    break;
            };
        }


        const scoreElement = document.getElementById("score");
        scoreElement.style.backgroundColor = Config.scoreBackgroundColor;
        scoreElement.style.top = Config.puyoImgHeight * Config.stageRows + 'px';
        scoreElement.style.width = Config.puyoImgWidth * Config.stageCols + 'px';
        scoreElement.style.height = Config.fontHeight + "px";
        this.scoreElement = scoreElement;

        // メモリを準備する
        this.board = [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ];
        let puyoCount = 0;
        for(let y = 0; y < Config.stageRows; y++) {
            const line = this.board[y] || (this.board[y] = []);
            for(let x = 0; x < Config.stageCols; x++) {
                const puyo = line[x];
                if(puyo >= 1 && puyo <= 5) {
                    // line[x] = {puyo: puyo, element: this.setPuyo(x, y, puyo)};
                    this.setPuyo(x, y, puyo);
                    puyoCount++;
                } else {
                    line[x] = null;
                }
            }
        }
        this.puyoCount = puyoCount;
    }

    // 画面とメモリ両方に puyo をセットする
    static setPuyo(x, y, puyo) {
        // 画像を作成し配置する
        const puyoImage = PuyoImage.getPuyo(puyo);
        puyoImage.style.left = x * Config.puyoImgWidth + "px";
        puyoImage.style.top = y * Config.puyoImgHeight + "px";
        this.stageElement.appendChild(puyoImage);
        // メモリにセットする
        this.board[y][x] = {
            puyo: puyo,
            element: puyoImage
        }
    }

    // 自由落下をチェックする
    static checkFall() {
        this.fallingPuyoList.length = 0;
        let isFalling = false;
        // 下の行から上の行を見ていく
        for(let y = Config.stageRows - 2; y >= 0; y--) { 
            const line = this.board[y];
            for(let x = 0; x < line.length; x++) {
                if(!this.board[y][x]) {
                    // このマスにぷよがなければ次
                    continue;
                }
                if(!this.board[y + 1][x]) {
                    // このぷよは落ちるので、取り除く
                    let cell = this.board[y][x];
                    this.board[y][x] = null;
                    let dst = y;
                    while(dst + 1 < Config.stageRows && this.board[dst + 1][x] == null) {
                        dst++;
                    }
                    // 最終目的地に置く
                    this.board[dst][x] = cell;
                    // 落ちるリストに入れる
                    this.fallingPuyoList.push({
                        element: cell.element,
                        position: y * Config.puyoImgHeight,
                        destination: dst * Config.puyoImgHeight,
                        falling: true
                    });
                    // 落ちるものがあったことを記録しておく
                    isFalling = true;
                }
            }
        }
        return isFalling;
    }
    // 自由落下させる
    static fall() {
        let isFalling = false;
        for(const fallingPuyo of this.fallingPuyoList) {
            if(!fallingPuyo.falling) {
                // すでに自由落下が終わっている
                continue;
            }
            let position = fallingPuyo.position;
            position += Config.freeFallingSpeed;
            if(position >= fallingPuyo.destination) {
                // 自由落下終了
                position = fallingPuyo.destination;
                fallingPuyo.falling = false;
            } else {
                // まだ落下しているぷよがあることを記録する
                isFalling = true;
            }
            // 新しい位置を保存する
            fallingPuyo.position = position;
            // ぷよを動かす
            fallingPuyo.element.style.top = position + 'px';
        }
        return isFalling;
    }

    // 消せるかどうか判定する
    static checkErase(startFrame) {
        this.eraseStartFrame = startFrame;
        this.erasingPuyoInfoList.length = 0;

        // 何色のぷよを消したかを記録する
        const erasedPuyoColor = {};

        // 隣接ぷよを確認する関数内関数を作成
        const sequencePuyoInfoList = [];
        const existingPuyoInfoList = [];
        const checkSequentialPuyo = (x, y) => {
            // ぷよがあるか確認する
            const orig = this.board[y][x];
            if(!orig) {
                // ないなら何もしない
                return;
            }
            // あるなら一旦退避して、メモリ上から消す
            const puyo = this.board[y][x].puyo;
            sequencePuyoInfoList.push({
                x: x,
                y: y,
                cell: this.board[y][x]
            });
            this.board[y][x] = null;

            // 四方向の周囲ぷよを確認する
            const direction = [[0, 1], [1, 0], [0, -1], [-1, 0]];
            for(let i = 0; i < direction.length; i++) {
                const dx = x + direction[i][0];
                const dy = y + direction[i][1];
            if(dx < 0 || dy < 0 || dx >= Config.stageCols || dy >= Config.stageRows) {
                    // ステージの外にはみ出た
                    continue;
            }
                const cell = this.board[dy][dx];
            if(!cell || cell.puyo !== puyo) {
                // ぷよの色が違う
                continue;
            }
            // そのぷよのまわりのぷよも消せるか確認する
            checkSequentialPuyo(dx, dy);    
            };
        };
        
        // 実際に削除できるかの確認を行う
        for(let y = 0; y < Config.stageRows; y++) {
            for(let x = 0; x < Config.stageCols; x++) {
                sequencePuyoInfoList.length = 0;
                const puyoColor = this.board[y][x] && this.board[y][x].puyo;
                checkSequentialPuyo(x, y);
                if(sequencePuyoInfoList.length == 0 || sequencePuyoInfoList.length < Config.erasePuyoCount) {
                    // 連続して並んでいる数が足りなかったので消さない
                    if(sequencePuyoInfoList.length) {
                        // 退避していたぷよを消さないリストに追加する
                        existingPuyoInfoList.push(...sequencePuyoInfoList);
                    }
                } else {
                    // これらは消して良いので消すリストに追加する
                    this.erasingPuyoInfoList.push(...sequencePuyoInfoList);
                    erasedPuyoColor[puyoColor] = true;
                }
            }
        }
        this.puyoCount -= this.erasingPuyoInfoList.length;

        // 消さないリストに入っていたぷよをメモリに復帰させる
        for(const info of existingPuyoInfoList) {
            this.board[info.y][info.x] = info.cell;
        }

        if(this.erasingPuyoInfoList.length) {
            // もし消せるならば、消えるぷよの個数と色の情報をまとめて返す
            return {
                piece: this.erasingPuyoInfoList.length,
                color: Object.keys(erasedPuyoColor).length
            };
        }
        return null;
    }
    // 消すアニメーションをする
    static erasing(frame, combinationCount) {
        const elapsedFrame = frame - this.eraseStartFrame;
        const ratio = elapsedFrame / Config.eraseAnimationDuration;
        if(combinationCount == 2) { // 騾｣骼悶き繝�ヨ繧､繝ｳ
            this.combImage2.style.display = 'block';
            this.combImage2.style.opacity = '1';
            this.combImage2.style.top = Config.puyoImgHeight * Config.stageRows / 3 + 'px';
            const startLeft = -Config.puyoImgWidth * Config.stageCols;
            const endLeft = Config.puyoImgWidth * Config.stageCols / 12;
            const animation = () => {
                this.combImage2.style.left = (endLeft - startLeft) * ratio / 0.25 + startLeft + 'px';
                if(ratio !== 0.25) {
                    requestAnimationFrame(animation);
                }
            };
            if(ratio <= 0.25) {
                animation();
            }
        }else if(combinationCount == 3) {
            this.combImage3.style.display = 'block';
            this.combImage3.style.opacity = '1';
            this.combImage3.style.top = Config.puyoImgHeight * Config.stageRows / 4 + 'px';
            const startLeft = Config.puyoImgWidth * Config.stageCols;
            const endLeft = -Config.puyoImgWidth * Config.stageCols / 12;
            const animation = () => {
                this.combImage3.style.left = (endLeft - startLeft) * ratio / 0.25 + startLeft + 'px';
                if(ratio !== 0.25) {
                    requestAnimationFrame(animation);
                }
            };
            if(ratio <= 0.25) {
                animation();
            }
        }else if(combinationCount == 4) {
            this.combImage4.style.display = 'block';
            this.combImage4.style.opacity = '1';
            const startTop = -Config.puyoImgHeight * Config.stageRows * 0.6;
            const endTop = Config.puyoImgHeight * Config.stageRows / 6;
            const animation = () => {
                this.combImage4.style.top = (endTop - startTop) * ratio / 0.25 + startTop + 'px';
                if(ratio !== 0.25) {
                    requestAnimationFrame(animation);
                }
            };
            if(ratio <= 0.25) {
                animation();
            }
        }else if(combinationCount == 5) {
            this.combImage5.style.display = 'block';
            this.combImage5.style.opacity = '1';
            const startTop = Config.puyoImgHeight * Config.stageRows;
            const endTop = Config.puyoImgHeight * Config.stageRows / 24;
            const startLeft = Config.puyoImgWidth * Config.stageCols;
            const endLeft = 0;
            const animation = () => {
                this.combImage5.style.opacity = String((ratio / 0.25) ** 2);
                this.combImage5.style.top = (endTop - startTop) * (1 - (1 - ratio / 0.25) ** 2) + startTop + 'px';
                this.combImage5.style.left = (endLeft - startLeft) * ratio / 0.25 + startLeft + 'px';
                if(ratio !== 0.25) {
                    requestAnimationFrame(animation);
                }
            };
            if(ratio <= 0.25) {
                animation();
            }
        }else if(combinationCount == 6) {
            this.combImage6.style.display = 'block';
            this.combImage6.style.opacity = '1';
            const startTop = Config.puyoImgHeight * Config.stageRows;
            const endTop = 0
            const startLeft = -Config.puyoImgWidth * Config.stageCols;
            const endLeft = -Config.puyoImgWidth * Config.stageCols / 12;
            const animation = () => {
                this.combImage6.style.opacity = String((ratio / 0.25) ** 2);
                this.combImage6.style.top = (endTop - startTop) * (1 - (1 - ratio / 0.25) ** 2) + startTop + 'px';
                this.combImage6.style.left = (endLeft - startLeft) * ratio / 0.25 + startLeft + 'px';
                if(ratio !== 0.25) {
                    requestAnimationFrame(animation);
                }
            };
            if(ratio <= 0.25) {
                animation();
            }
        }else if(combinationCount >= 7) {
            this.combImage7.style.display = 'block';
            this.combImage7.style.opacity = '1';
            const startTop = Config.puyoImgHeight * Config.stageRows / 4;
            const startLeft = 0;
            const animation = () => {
                this.combImage7.style.top = (-6 * Math.cos(2 * Math.PI * ratio)) ** 3 + startTop + 'px';
                this.combImage7.style.left = (3 * Math.sin(2 * Math.PI * ratio)) ** 3 + startLeft + 'px';
                if(ratio !== 1) {
                    requestAnimationFrame(animation);
                }
            };
            if(ratio <= 1) {
                animation();
            }
        }




        if(ratio > 1) {
            // アニメーションを終了する
            for(const info of this.erasingPuyoInfoList) {
                var element = info.cell.element;
                this.stageElement.removeChild(element);

                if(combinationCount > 1) {
                    this.combImage2.style.display = 'none';
                    this.combImage3.style.display = 'none';
                    this.combImage4.style.display = 'none';
                    this.combImage5.style.display = 'none';
                    this.combImage6.style.display = 'none';
                    this.combImage7.style.display = 'none';
                }

            }
            return false;
        } else if(ratio > 0.75) {
            for(const info of this.erasingPuyoInfoList) {
                var element = info.cell.element;
                element.style.display = 'block';
            }
            return true;
        } else if(ratio > 0.50) {
            for(const info of this.erasingPuyoInfoList) {
                var element = info.cell.element;
                element.style.display = 'none';
            }
            return true;
        } else if(ratio > 0.25) {
            for(const info of this.erasingPuyoInfoList) {
                var element = info.cell.element;
                element.style.display = 'block';
            }
            return true;
        } else {
            for(const info of this.erasingPuyoInfoList) {
                var element = info.cell.element;
                element.style.display = 'none';
            }
            return true;
        }
    }

    static showZenkeshi() {
        // 全消しを表示する
        this.zenkeshiImage.style.display = 'block';
        this.zenkeshiImage.style.opacity = '1';
        const startTime = Date.now();
        const startTop = Config.puyoImgHeight * Config.stageRows;
        const endTop = Config.puyoImgHeight * Config.stageRows / 3;
        const animation = () => {
            const ratio = Math.min((Date.now() - startTime) / Config.zenkeshiDuration, 1);
            this.zenkeshiImage.style.top = (endTop - startTop) * ratio + startTop + 'px';
            if(ratio !== 1) {
                requestAnimationFrame(animation);
            }
        };
        animation();
    }
    static hideZenkeshi() {
        // 全消しを消去する
        const startTime = Date.now();
        const animation = () => {
            const ratio = Math.min((Date.now() - startTime) / Config.zenkeshiDuration, 1);
            this.zenkeshiImage.style.opacity = String(1 - ratio);
            if(ratio !== 1) {
                requestAnimationFrame(animation);
            } else {
                this.zenkeshiImage.style.display = 'none';
            }
        };
        animation();
    }
}
Stage.fallingPuyoList = [];
Stage.erasingPuyoInfoList = [];
