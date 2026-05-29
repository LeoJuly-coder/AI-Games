const ROWS = 8;
const COLS = 4;

const PIECE_TYPES = {
    KING: { name: '將', rank: 1, redSymbol: '帥', blackSymbol: '將' },
    GUARD: { name: '士', rank: 2, redSymbol: '仕', blackSymbol: '士' },
    ELEPHANT: { name: '象', rank: 3, redSymbol: '相', blackSymbol: '象' },
    CHARIOT: { name: '車', rank: 4, redSymbol: '車', blackSymbol: '車' },
    HORSE: { name: '馬', rank: 5, redSymbol: '馬', blackSymbol: '馬' },
    CANNON: { name: '炮', rank: 6, redSymbol: '炮', blackSymbol: '炮' },
    SOLDIER: { name: '卒', rank: 7, redSymbol: '兵', blackSymbol: '卒' }
};

class Game {
    constructor() {
        this.board = [];
        this.currentPlayer = '1';
        this.selectedCell = null;
        this.captures = { 1: [], 2: [] };
        this.gameStarted = false;
        this.firstFlip = true;
        this.playerColors = { 1: null, 2: null };
        this.init();
    }

    init() {
        this.createBoard();
        this.renderBoard();
        this.bindEvents();
        // 初始化棋子追踪系统
        this.updateCaptures();
        // 随机选择一方玩家开始行动
        this.currentPlayer = Math.random() < 0.5 ? '1' : '2';
        this.updateActivePlayer();
        this.updateStatus(`玩家${this.currentPlayer}先行动，点击任意暗棋开始游戏`);
    }

    createBoard() {
        const pieces = [];
        
        const redPieces = [
            { type: 'KING', color: 'red' },
            { type: 'GUARD', color: 'red' },
            { type: 'GUARD', color: 'red' },
            { type: 'ELEPHANT', color: 'red' },
            { type: 'ELEPHANT', color: 'red' },
            { type: 'CHARIOT', color: 'red' },
            { type: 'CHARIOT', color: 'red' },
            { type: 'HORSE', color: 'red' },
            { type: 'HORSE', color: 'red' },
            { type: 'CANNON', color: 'red' },
            { type: 'CANNON', color: 'red' },
            { type: 'SOLDIER', color: 'red' },
            { type: 'SOLDIER', color: 'red' },
            { type: 'SOLDIER', color: 'red' },
            { type: 'SOLDIER', color: 'red' },
            { type: 'SOLDIER', color: 'red' }
        ];

        const blackPieces = [
            { type: 'KING', color: 'black' },
            { type: 'GUARD', color: 'black' },
            { type: 'GUARD', color: 'black' },
            { type: 'ELEPHANT', color: 'black' },
            { type: 'ELEPHANT', color: 'black' },
            { type: 'CHARIOT', color: 'black' },
            { type: 'CHARIOT', color: 'black' },
            { type: 'HORSE', color: 'black' },
            { type: 'HORSE', color: 'black' },
            { type: 'CANNON', color: 'black' },
            { type: 'CANNON', color: 'black' },
            { type: 'SOLDIER', color: 'black' },
            { type: 'SOLDIER', color: 'black' },
            { type: 'SOLDIER', color: 'black' },
            { type: 'SOLDIER', color: 'black' },
            { type: 'SOLDIER', color: 'black' }
        ];

        pieces.push(...redPieces, ...blackPieces);
        this.shuffleArray(pieces);

        let index = 0;
        for (let row = 0; row < ROWS; row++) {
            this.board[row] = [];
            for (let col = 0; col < COLS; col++) {
                this.board[row][col] = {
                    ...pieces[index],
                    revealed: false
                };
                index++;
            }
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    renderBoard() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const cell = document.createElement('div');
                cell.className = `cell ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                cell.dataset.row = row;
                cell.dataset.col = col;

                const piece = this.board[row][col];
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = `piece ${piece.revealed ? piece.color : 'dark-side'}`;
                    const typeInfo = PIECE_TYPES[piece.type];
                    pieceElement.textContent = piece.revealed ? (piece.color === 'red' ? typeInfo.redSymbol : typeInfo.blackSymbol) : '?';
                    cell.appendChild(pieceElement);
                }

                boardElement.appendChild(cell);
            }
        }
    }

    bindEvents() {
        const boardElement = document.getElementById('board');
        boardElement.addEventListener('click', (e) => {
            const cell = e.target.closest('.cell');
            if (cell) {
                this.handleCellClick(parseInt(cell.dataset.row), parseInt(cell.dataset.col));
            }
        });

        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
        document.getElementById('modal-restart-btn').addEventListener('click', () => {
            document.getElementById('game-over-modal').style.display = 'none';
            this.restart();
        });
        
        document.getElementById('rules-btn').addEventListener('click', () => {
            document.getElementById('rules-modal').style.display = 'flex';
        });
        
        document.getElementById('rules-close-btn').addEventListener('click', () => {
            document.getElementById('rules-modal').style.display = 'none';
        });
    }

    handleCellClick(row, col) {
        const piece = this.board[row][col];

        if (!piece) {
            if (this.selectedCell) {
                const [selRow, selCol] = this.selectedCell;
                if (this.canMove(selRow, selCol, row, col)) {
                    this.movePiece(selRow, selCol, row, col);
                } else {
                    this.clearSelection();
                }
            }
            return;
        }

        if (!piece.revealed) {
            // 检查是否有选中的炮可以隔子打这个暗棋
            if (this.selectedCell) {
                const [selRow, selCol] = this.selectedCell;
                const selectedPiece = this.board[selRow][selCol];
                if (selectedPiece && selectedPiece.type === 'CANNON' && this.canMove(selRow, selCol, row, col)) {
                    // 炮隔子打暗棋，直接吃掉
                    this.movePiece(selRow, selCol, row, col);
                    return;
                }
            }
            this.flipPiece(row, col);
        } else {
            if (this.selectedCell) {
                const [selRow, selCol] = this.selectedCell;
                const selectedPiece = this.board[selRow][selCol];
                
                if (row === selRow && col === selCol) {
                    this.clearSelection();
                    return;
                }

                if (this.canMove(selRow, selCol, row, col)) {
                    this.movePiece(selRow, selCol, row, col);
                } else {
                    this.clearSelection();
                    if (piece.color === this.playerColors[this.currentPlayer]) {
                        this.selectPiece(row, col);
                    }
                }
            } else {
                if (piece.color === this.playerColors[this.currentPlayer]) {
                    this.selectPiece(row, col);
                }
            }
        }
    }

    flipPiece(row, col) {
        const piece = this.board[row][col];
        
        if (!piece || piece.revealed) return;

        this.clearSelection();
        piece.revealed = true;

        if (this.firstFlip) {
            this.firstFlip = false;
            this.gameStarted = true;
            const currentPlayer = this.currentPlayer;
            const otherPlayer = currentPlayer === '1' ? '2' : '1';
            this.playerColors[currentPlayer] = piece.color;
            this.playerColors[otherPlayer] = piece.color === 'red' ? 'black' : 'red';
            this.updatePlayerColors();
        }
        // 翻棋就算行动了一步，切换到对方玩家
        this.switchPlayer();

        const pieceElement = document.querySelector(`[data-row="${row}"][data-col="${col}"] .piece`);
        pieceElement.classList.add('flipping');
        setTimeout(() => {
            pieceElement.classList.remove('flipping');
            pieceElement.className = `piece ${piece.color}`;
            const typeInfo = PIECE_TYPES[piece.type];
            pieceElement.textContent = piece.color === 'red' ? typeInfo.redSymbol : typeInfo.blackSymbol;
        }, 500);

        this.checkWin();
    }

    selectPiece(row, col) {
        this.clearSelection();
        this.selectedCell = [row, col];
        
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add('selected');
        
        const piece = cell.querySelector('.piece');
        if (piece) {
            piece.classList.add('selected');
            // 添加四角元素
            const corners = ['corner-tl', 'corner-tr', 'corner-bl', 'corner-br'];
            corners.forEach(corner => {
                const cornerEl = document.createElement('div');
                cornerEl.className = corner;
                piece.appendChild(cornerEl);
            });
        }

        this.showValidMoves(row, col);
    }

    showValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece || !piece.revealed) return;

        const moves = this.getValidMoves(row, col);
        
        moves.forEach(([moveRow, moveCol, isCapture]) => {
            const cell = document.querySelector(`[data-row="${moveRow}"][data-col="${moveCol}"]`);
            if (isCapture === 'cannon_capture') {
                cell.classList.add('valid-capture');
            } else if (isCapture) {
                cell.classList.add('valid-capture');
            } else {
                cell.classList.add('valid-move');
            }
        });
    }

    getValidMoves(row, col) {
        const piece = this.board[row][col];
        const moves = [];

        if (!piece || !piece.revealed) return moves;

        if (piece.type === 'CANNON') {
            const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
            
            directions.forEach(([dr, dc]) => {
                let r = row + dr;
                let c = col + dc;
                let foundObstacle = false;

                while (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
                    const targetPiece = this.board[r][c];
                    
                    if (targetPiece && !foundObstacle) {
                        foundObstacle = true;
                    } else if (targetPiece && foundObstacle) {
                        if (!targetPiece.revealed || targetPiece.color !== piece.color) {
                            moves.push([r, c, 'cannon_capture']);
                        }
                        break;
                    }
                    
                    r += dr;
                    c += dc;
                }
            });

            const adjacentDirections = [[0, 1], [0, -1], [1, 0], [-1, 0]];
            adjacentDirections.forEach(([dr, dc]) => {
                const newRow = row + dr;
                const newCol = col + dc;
                if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
                    const targetPiece = this.board[newRow][newCol];
                    if (!targetPiece) {
                        moves.push([newRow, newCol, false]);
                    }
                }
            });
        } else {
            const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

            directions.forEach(([dr, dc]) => {
                const newRow = row + dr;
                const newCol = col + dc;

                if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
                    const targetPiece = this.board[newRow][newCol];
                    
                    if (!targetPiece) {
                        moves.push([newRow, newCol, false]);
                    } else if (targetPiece.color !== piece.color && targetPiece.revealed) {
                        const result = this.comparePieces(piece.type, targetPiece.type);
                        if (result !== 'defender_wins') {
                            moves.push([newRow, newCol, true]);
                        }
                    }
                }
            });
        }

        return moves;
    }

    canMove(fromRow, fromCol, toRow, toCol) {
        const moves = this.getValidMoves(fromRow, fromCol);
        return moves.some(([r, c]) => r === toRow && c === toCol);
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        const movingPiece = this.board[fromRow][fromCol];
        const targetPiece = this.board[toRow][toCol];
        const moves = this.getValidMoves(fromRow, fromCol);
        const move = moves.find(([r, c]) => r === toRow && c === toCol);
        const isCannonCapture = move && move[2] === 'cannon_capture';

        let attackerCaptured = false;

        if (targetPiece) {
            if (isCannonCapture) {
                const movingPlayer = this.getPlayerByColor(movingPiece.color);
                // 如果炮打的是暗棋，且暗棋的颜色与炮的所有者相同，则被吃的棋进入对手的池子
                if (!targetPiece.revealed && targetPiece.color === movingPiece.color) {
                    const opponentPlayer = movingPlayer === '1' ? '2' : '1';
                    this.captures[opponentPlayer].push({ type: targetPiece.type, color: targetPiece.color });
                } else {
                    this.captures[movingPlayer].push({ type: targetPiece.type, color: targetPiece.color });
                }
                const targetCell = document.querySelector(`[data-row="${toRow}"][data-col="${toCol}"] .piece`);
                if (targetCell) targetCell.classList.add('captured');
                this.updateCaptures();
            } else {
                attackerCaptured = this.handleCapture(movingPiece, targetPiece, toRow, toCol);
            }
        }

        if (!attackerCaptured) {
            this.board[toRow][toCol] = { ...movingPiece };
        }
        this.board[fromRow][fromCol] = null;

        this.clearSelection();
        this.renderBoard();

        if (!this.checkWin()) {
            this.switchPlayer();
        }
    }

    getPlayerByColor(color) {
        if (this.playerColors[1] === color) return '1';
        if (this.playerColors[2] === color) return '2';
        return null;
    }

    handleCapture(attacker, defender, defRow, defCol) {
        const result = this.comparePieces(attacker.type, defender.type, attacker.color, defender.color);
        const attackerPlayer = this.getPlayerByColor(attacker.color);
        const defenderPlayer = this.getPlayerByColor(defender.color);

        if (result === 'attacker_wins') {
            this.captures[attackerPlayer].push({ type: defender.type, color: defender.color });
            const targetCell = document.querySelector(`[data-row="${defRow}"][data-col="${defCol}"] .piece`);
            if (targetCell) targetCell.classList.add('captured');
            this.updateCaptures();
            return false;
        } else if (result === 'defender_wins') {
            this.captures[defenderPlayer].push({ type: attacker.type, color: attacker.color });
            this.updateCaptures();
            return true;
        } else {
            this.captures[attackerPlayer].push({ type: defender.type, color: defender.color });
            this.captures[defenderPlayer].push({ type: attacker.type, color: attacker.color });
            this.board[defRow][defCol] = null;
            this.updateCaptures();
            return true;
        }
    }

    comparePieces(attackerType, defenderType) {
        const attackerRank = PIECE_TYPES[attackerType].rank;
        const defenderRank = PIECE_TYPES[defenderType].rank;

        if (attackerType === 'SOLDIER' && defenderType === 'KING') {
            return 'attacker_wins';
        }

        if (attackerType === 'KING' && defenderType === 'SOLDIER') {
            return 'defender_wins';
        }

        if (attackerType === 'SOLDIER' && defenderType !== 'KING') {
            if (attackerType === defenderType) {
                return 'draw';
            }
            return 'defender_wins';
        }

        if (attackerRank < defenderRank) {
            return 'attacker_wins';
        } else if (attackerRank > defenderRank) {
            return 'defender_wins';
        } else {
            return 'draw';
        }
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === '1' ? '2' : '1';
        this.updateStatus('点击己方棋子移动或翻暗棋');
        this.updateActivePlayer();
    }

    updatePlayerColors() {
        const player1 = document.getElementById('player-1');
        const player2 = document.getElementById('player-2');
        const avatar1 = player1.querySelector('.player-avatar');
        const avatar2 = player2.querySelector('.player-avatar');
        
        player1.classList.remove('yellow', 'red', 'black');
        player2.classList.remove('yellow', 'red', 'black');
        
        if (this.playerColors[1]) {
            player1.classList.add(this.playerColors[1]);
            avatar1.textContent = this.playerColors[1] === 'red' ? '帥' : '將';
            avatar1.classList.add(this.playerColors[1]);
        } else {
            player1.classList.add('yellow');
            avatar1.textContent = '?';
            avatar1.classList.remove('red', 'black');
        }
        
        if (this.playerColors[2]) {
            player2.classList.add(this.playerColors[2]);
            avatar2.textContent = this.playerColors[2] === 'red' ? '帥' : '將';
            avatar2.classList.add(this.playerColors[2]);
        } else {
            player2.classList.add('yellow');
            avatar2.textContent = '?';
            avatar2.classList.remove('red', 'black');
        }
    }

    updateActivePlayer() {
        const player1 = document.getElementById('player-1');
        const player2 = document.getElementById('player-2');
        
        player1.classList.remove('active');
        player2.classList.remove('active');
        
        const activePlayer = document.getElementById(`player-${this.currentPlayer}`);
        activePlayer.classList.add('active');
    }

    clearSelection() {
        this.selectedCell = null;
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('selected', 'valid-move', 'valid-capture');
        });
        document.querySelectorAll('.piece').forEach(piece => {
            piece.classList.remove('selected');
            // 清除四角元素
            const corners = ['corner-tl', 'corner-tr', 'corner-bl', 'corner-br'];
            corners.forEach(corner => {
                const cornerEl = piece.querySelector(`.${corner}`);
                if (cornerEl) cornerEl.remove();
            });
        });
    }

    checkWin() {
        let redCount = 0;
        let blackCount = 0;

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    if (piece.color === 'red') redCount++;
                    else blackCount++;
                }
            }
        }

        if (!this.gameStarted) {
            return false;
        }

        if (redCount === 0) {
            const winner = this.playerColors[1] === 'black' ? '1' : '2';
            this.endGame(winner);
            return true;
        }
        if (blackCount === 0) {
            const winner = this.playerColors[1] === 'red' ? '1' : '2';
            this.endGame(winner);
            return true;
        }

        return false;
    }

    endGame(winner) {
        document.getElementById('winner-text').textContent = `玩家${winner}获胜！`;
        document.getElementById('game-over-modal').style.display = 'flex';
    }

    updateCaptures() {
        const captures1 = document.getElementById('captures-1');
        const captures2 = document.getElementById('captures-2');

        // 统计被吃掉的棋子数量
        const countCaptures = (player) => {
            const counts = {};
            this.captures[player].forEach(captured => {
                const key = `${captured.type}-${captured.color}`;
                counts[key] = (counts[key] || 0) + 1;
            });
            return counts;
        };

        const player1Captures = countCaptures(1);
        const player2Captures = countCaptures(2);

        // 按rank顺序定义棋子显示顺序
        const pieceOrder = ['KING', 'GUARD', 'ELEPHANT', 'CHARIOT', 'HORSE', 'CANNON', 'SOLDIER'];
        // 玩家2的顺序反转，实现对称显示
        const pieceOrderReversed = ['SOLDIER', 'CANNON', 'HORSE', 'CHARIOT', 'ELEPHANT', 'GUARD', 'KING'];

        // 生成被吃掉棋子的HTML（每个格子固定对应一个棋子类型）
        const generateCapturesHtml = (captures, order) => {
            let html = '';
            
            // 每个格子固定对应一个棋子类型
            for (const type of order) {
                // 检查红方和黑方是否被吃（优先显示红方）
                const redKey = `${type}-red`;
                const blackKey = `${type}-black`;
                const redCount = captures[redKey] || 0;
                const blackCount = captures[blackKey] || 0;
                
                if (redCount > 0) {
                    const typeInfo = PIECE_TYPES[type];
                    const symbol = typeInfo.redSymbol;
                    let className = `captured-piece red`;
                    let dataCount = '';
                    
                    if (redCount > 1) {
                        className += ' has-badge';
                        dataCount = `data-count="${redCount}"`;
                    }
                    
                    html += `<span class="${className}" ${dataCount}>${symbol}</span>`;
                } else if (blackCount > 0) {
                    const typeInfo = PIECE_TYPES[type];
                    const symbol = typeInfo.blackSymbol;
                    let className = `captured-piece black`;
                    let dataCount = '';
                    
                    if (blackCount > 1) {
                        className += ' has-badge';
                        dataCount = `data-count="${blackCount}"`;
                    }
                    
                    html += `<span class="${className}" ${dataCount}>${symbol}</span>`;
                } else {
                    // 该类型棋子未被吃，显示空占位格子
                    html += '<span class="captured-piece empty"></span>';
                }
            }
            
            return html;
        };

        captures1.innerHTML = generateCapturesHtml(player1Captures, pieceOrder);
        captures2.innerHTML = generateCapturesHtml(player2Captures, pieceOrderReversed);
    }

    updateStatus(text) {
        const statusElement = document.getElementById('game-status');
        statusElement.innerHTML = `<p>${text}</p>`;
    }

    restart() {
        this.board = [];
        this.currentPlayer = '1';
        this.selectedCell = null;
        this.captures = { 1: [], 2: [] };
        this.gameStarted = false;
        this.firstFlip = true;
        this.playerColors = { 1: null, 2: null };
        this.init();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game();
});