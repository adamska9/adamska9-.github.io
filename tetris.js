const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const boom = document.getElementById("boom");
const applause = document.getElementById("applause");

context.scale(20, 20);
document.getElementById('userName').innerText = localStorage.getItem('username');

const arenaSweep = () => {
    let rowCount = 1;

    outer: for (let y = arena.length - 1; y > 0; --y) {
        for(let x = 0; x < arena[y].length; ++x){
            if (arena[y][x] === 0){
                continue outer;
            }
        }
        
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        boom.play();

        player.score += rowCount*10;
        rowCount *= 2;
        if (player.score%200 === 0)
            applause.play();
    }
}

const collide = (arena, player) => {
    const [m, o] = [player.matrix, player.pos];
    for(let y = 0, len = m.length; y < len; ++y) {
        for(let x = 0, leny = m[y].length; x < leny; ++x){
            if(m[y][x] !== 0 &&
                (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0)
                return true;
        }
    }
    return false;
}

const createMatrix = (w, h) => {
    const matrix = [];
    while(h--){
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

const createPiece = (type) => {
    switch(type){
    case 'T':
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
            ];
    case 'O':
        return [
            [2, 2],
            [2, 2],
            ];
    case 'L':
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3],
            ];
    case 'J':
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0],
            ];
    case 'I':
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            ];
    case 'S':
        return [
            [6, 0, 0],
            [6, 6, 0],
            [0, 6, 0],
            ];
    case 'Z':
        return [
            [0, 0, 7],
            [0, 7, 7],
            [0, 7, 0],
            ];
    }
}

const draw = () => {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);


    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

const drawMatrix = (matrix, offset) => {
matrix.forEach((row, y) => {
    row.forEach((value, x) => {
        if (value !== 0){
            context.fillStyle = colors[value];
            context.fillRect(x + offset.x, 
                             y + offset.y, 1, 1)
        }
    });
});
}

const colors = [
    null,
    'red',
    'blue',
    'cyan',
    'green',
    'purple',
    'orange',
    'magenta'
];

const arena = createMatrix(12, 20);
const merge = (arena, player) => {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        })
    })
}

const playerDrop = () => {
    player.pos.y++;
    if(collide(arena, player)){
        player.pos.y--;
        merge(arena, player);
        player.pos.y = 0;
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

const playerMove = (dir) => {
    player.pos.x += dir;
    if (collide(arena,player)){
        player.pos.x -= dir;
    }

}


const playerReset = () => {
    const pieces = 'ILJOTSZ';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - 
                    (player.matrix[0].length / 2 | 0);
    if(collide(arena,player)){
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

const playerRotate = (dir) =>{
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while(collide(arena,player)){
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if(offset > player.matrix[0].length){
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

const rotate = (matrix, dir) => {
    for(let y = 0, len = matrix.length; y < len; ++y){
        for(let x = 0; x < y; ++x){
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }
    if(dir > 0)
        matrix.forEach(row => row.reverse());
    else matrix.reverse();
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
const update = (time = 0) => {
    const deltaTime = time - lastTime;
    lastTime = time

    dropCounter += deltaTime;
    if(dropCounter > dropInterval){
        playerDrop();
        dropCounter = 0;
    }

    draw();
    requestAnimationFrame(update);
}

const updateScore = () => {
    document.getElementById('score').innerText = player.score;
}

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
}

document.addEventListener('keydown', event => {
    switch(event.key){
    case "ArrowLeft":
        playerMove(-1);
        break;
    case "ArrowRight":
        playerMove(1);
        break;
    case "ArrowDown":
        playerDrop();
        break;
    case "ArrowUp":
        playerRotate(1);
        break;
    }
})


playerReset();
update();