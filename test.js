const crypto = require('crypto');
const Table = require('cli-table3');

class Validator {
    static validateMoves(moves) {
        if (moves.length % 2 === 0 || moves.length < 3) {
            return "Error: The number of moves must be an odd number and at least 3.";
        }
        if (new Set(moves).size !== moves.length) {
            return "Error: All moves must be unique.";
        }
        return null;
    }
}

class GameRules {
    constructor(moves) {
        this.moves = moves;
    }

    determineWinner(playerMove, computerMove) {
        const moveCount = this.moves.length;
        const playerIndex = this.moves.indexOf(playerMove);
        const computerIndex = this.moves.indexOf(computerMove);
        const half = Math.floor(moveCount / 2);

        if (playerIndex === computerIndex) {
            return "It's a draw!";
        }

        if ((playerIndex < computerIndex && computerIndex <= playerIndex + half) ||
            (playerIndex > computerIndex && computerIndex + moveCount <= playerIndex + half)) {
            return "Computer wins!";
        } else {
            return "Player wins!";
        }
    }

    generateHelpTable() {
        const table = new Table({
            head: ['', ...this.moves],
            colWidths: new Array(this.moves.length + 1).fill(10)
        });

        for (let i = 0; i < this.moves.length; i++) {
            const row = [this.moves[i]];
            for (let j = 0; j < this.moves.length; j++) {
                if (i === j) {
                    row.push('Draw');
                } else if ((i < j && j <= i + this.moves.length / 2) || (i > j && j + this.moves.length <= i + this.moves.length / 2)) {
                    row.push('Win');
                } else {
                    row.push('Lose');
                }
            }
            table.push(row);
        }

        return table.toString();
    }
}

class HMACGenerator {
    static generateKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    static calculateHMAC(key, message) {
        return crypto.createHmac('sha3-256', key).update(message).digest('hex');
    }
}

class Game {
    constructor(moves) {
        this.moves = moves;
        this.rules = new GameRules(moves);
    }

    start() {
        const key = HMACGenerator.generateKey();
        const computerMoveIndex = Math.floor(Math.random() * this.moves.length);
        const computerMove = this.moves[computerMoveIndex];
        const hmac = HMACGenerator.calculateHMAC(key, computerMove);

        console.log(`HMAC: ${hmac}`);
        console.log('Available moves:');
        this.moves.forEach((move, index) => {
            console.log(`${index + 1} - ${move}`);
        });
        console.log('0 - exit');
        console.log('? - help');

        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        process.stdin.on('data', (input) => {
            input = input.trim();
            if (input === '0') {
                console.log('Game exited.');
                process.exit();
            } else if (input === '?') {
                console.log(this.rules.generateHelpTable());
            } else {
                const playerMoveIndex = parseInt(input, 10) - 1;
                if (playerMoveIndex >= 0 && playerMoveIndex < this.moves.length) {
                    const playerMove = this.moves[playerMoveIndex];
                    console.log(`Your move: ${playerMove}`);
                    console.log(`Computer move: ${computerMove}`);
                    console.log(this.rules.determineWinner(playerMove, computerMove));
                    console.log(`HMAC key: ${key}`);
                    process.exit();
                } else {
                    console.log('Invalid move. Please try again.');
                }
            }
        });
    }
}

// Get command line arguments
const args = process.argv.slice(2);

// Validate input
const validationError = Validator.validateMoves(args);
if (validationError) {
    console.log(validationError);
    console.log("Example usage: node task.js Rock Paper Scissors");
} else {
    const game = new Game(args);
    game.start();
}
