import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    const className = 'square' + (props.highlight ? ' highlight' : '');
    return (
        <button
            className={className}
            onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {

    renderSquare(i) {
        const winLine = this.props.winLine;
        return (
            <Square
                key={i}
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                highlight={winLine && winLine.includes(i)}
            />
        );
    }

    render() {
        const boardSize = 3;
        let squares = [];
        for (let i = 0; i < boardSize; ++i) {
            let row = [];
            for (let j = 0; j < boardSize; ++j) {
                let squareId = i * boardSize + j;
                row.push(this.renderSquare(squareId));
            }
            squares.push(<div key={i} className="board-row">{row}</div>);
        }

        return (
            <div>{squares}</div>
        );
    }
}

export class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
            }],
            xIsNext: true,
            stepNumber: 0,
            moveSorted: true
        };
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares).winner || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares,
                i
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }

    revertSort() {
        const newSort = !this.state.moveSorted;
        this.setState({
            moveSorted: newSort
        })
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winnerInfo = calculateWinner(current.squares)
        const winner = winnerInfo.winner;
        const moves = history.map((step, move) => {
            const desc = move ?
                'Go to move #' + move + ' played (' + Math.floor(step.i / 3) + ',' + step.i % 3 + ') by ' + (move % 2 === 0 ? 'O' : 'X') :
                'Go to game start';
            return (
                <li key={move}>
                    <button className={move === this.state.stepNumber ? 'move-list-item-selected' : ''}
                            onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });
        if(!this.state.moveSorted) {
            moves.reverse()
        }

        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        } else {
            if(moves.length === 10) {
                status = 'Draw';
            } else {
                status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
            }
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        winLine={winnerInfo.line}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <button onClick={() => this.revertSort()}>Revert Move Sort</button>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {
                winner: squares[a],
                line: lines[i],
            };
        }
    }
    return {
        winner:null
    };
}