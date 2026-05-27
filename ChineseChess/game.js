const ROWS = 4;
const COLS = 8;

const PIECE_TYPES = {
    KING: { name: '將', rank: 1, symbol: '將' },
    GUARD: { name: '士', rank: 2, symbol: '士' },
    ELEPHANT: { name: '象', rank: 3, symbol: '象' },
    CHARIOT: { name: '車', rank: 4, symbol: '車' },
    HORSE: { name: '馬', rank: 5, symbol: '馬' },
    CANNON: { name: '炮', rank: 6, symbol: '炮' },
    SOLDIER: { name: '卒', rank: 7, symbol: '卒' }
};

class Game {
    constructor() {
        this.board = [];
        this.currentPlayer = 'red';
        this.selectedCell = null;
        this.captures = { red: [], black: [] };
        this.gameStarted = false;
        this.firstFlip = true;
        this.playerColors = { red: null, black: null };
        this.init();
    }

    init() {
        this.createBoard();
        this.renderBoard();
        this.bindEvents();
        this.updateStatus('点击任意暗棋开始游戏');
        this.updateTurnIndicator('等待开局');
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
                    pieceElement.textContent = piece.revealed ? PIECE_TYPES[piece.type].symbol : '?';
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
                    if (piece.color === this.currentPlayer) {
                        this.selectPiece(row, col);
                    }
                }
            } else {
                if (piece.color === this.currentPlayer) {
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
            this.playerColors.red = piece.color;
            this.playerColors.black = piece.color === 'red' ? 'black' : 'red';
            this.currentPlayer = piece.color;
            this.updatePlayerRepresent();
            this.updateTurnIndicator('红方下棋');
            this.updateStatus('游戏开始！点击己方棋子移动');
        } else {
            this.switchPlayer();
        }

        const pieceElement = document.querySelector(`[data-row="${row}"][data-col="${col}"] .piece`);
        pieceElement.classList.add('flipping');
        setTimeout(() => {
            pieceElement.classList.remove('flipping');
            pieceElement.className = `piece ${piece.color}`;
            pieceElement.textContent = PIECE_TYPES[piece.type].symbol;
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
                    } else if (targetPiece.color !== piece.color && targetPiece.revealed) {
                        const result = this.comparePieces(piece.type, targetPiece.type);
                        if (result !== 'defender_wins') {
                            moves.push([newRow, newCol, true]);
                        }
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
                this.captures[movingPiece.color].push(targetPiece.type);
                const targetCell = document.querySelector(`[data-row="${toRow}"][data-col="${toCol}"] .piece`);
                if (targetCell) targetCell.classList.add('captured');
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

    handleCapture(attacker, defender, defRow, defCol) {
        const result = this.comparePieces(attacker.type, defender.type, attacker.color, defender.color);

        if (result === 'attacker_wins') {
            this.captures[attacker.color].push(defender.type);
            const targetCell = document.querySelector(`[data-row="${defRow}"][data-col="${defCol}"] .piece`);
            if (targetCell) targetCell.classList.add('captured');
            return false;
        } else if (result === 'defender_wins') {
            this.captures[defender.color].push(attacker.type);
            return true;
        } else {
            this.captures[attacker.color].push(defender.type);
            this.captures[defender.color].push(attacker.type);
            this.board[defRow][defCol] = null;
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
        this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
        const playerName = this.playerColors[this.currentPlayer] === 'red' ? '红方' : '黑方';
        this.updateTurnIndicator(`${playerName}下棋`);
        this.updateStatus('点击己方棋子移动或翻暗棋');
    }

    updatePlayerRepresent() {
        const redRepresent = document.getElementById('represent-red');
        const blackRepresent = document.getElementById('represent-black');
        
        redRepresent.textContent = `代表${this.playerColors.red === 'red' ? '红' : '黑'}棋`;
        blackRepresent.textContent = `代表${this.playerColors.black === 'red' ? '红' : '黑'}棋`;
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
            this.endGame('black');
            return true;
        }
        if (blackCount === 0) {
            this.endGame('red');
            return true;
        }

        return false;
    }

    endGame(winnerColor) {
        const winnerName = this.playerColors[winnerColor] === 'red' ? '红方' : '黑方';
        document.getElementById('winner-text').textContent = `${winnerName}获胜！`;
        document.getElementById('game-over-modal').style.display = 'flex';
    }

    updateCaptures() {
        const redCaptures = document.getElementById('captures-red');
        const blackCaptures = document.getElementById('captures-black');

        const redCapturesHtml = this.captures.red.map(type => 
            `<span class="captured-piece">${PIECE_TYPES[type].symbol}</span>`
        ).join('');
        const blackCapturesHtml = this.captures.black.map(type => 
            `<span class="captured-piece">${PIECE_TYPES[type].symbol}</span>`
        ).join('');

        redCaptures.innerHTML = redCapturesHtml || '<span class="no-captures">无</span>';
        blackCaptures.innerHTML = blackCapturesHtml || '<span class="no-captures">无</span>';
    }

    updateStatus(text) {
        const statusElement = document.getElementById('game-status');
        statusElement.innerHTML = `<p>${text}</p>`;
    }

    updateTurnIndicator(text) {
        const indicator = document.getElementById('turn-indicator');
        indicator.textContent = text;
    }

    restart() {
        this.board = [];
        this.currentPlayer = 'red';
        this.selectedCell = null;
        this.captures = { red: [], black: [] };
        this.gameStarted = false;
        this.firstFlip = true;
        this.playerColors = { red: null, black: null };
        this.init();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game();
});