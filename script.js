const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const points = [
    { x: 100, y: 100, id: 1, color: 'pink', connections: 0 },
    { x: 300, y: 100, id: 3, color: 'yellow', connections: 0 },
    { x: 100, y: 500, id: 1, color: 'pink', connections: 0 },
    { x: 300, y: 500, id: 3, color: 'yellow', connections: 0 },
    { x: 100, y: 300, id: 2, color: 'blue', connections: 0 },
    { x: 300, y: 300, id: 2, color: 'blue', connections: 0 }
];

let lines = [];
let selectedPoint = null;
let isDrawing = false;
let currentPath = [];

canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('mouseup', onMouseUp);

function drawPoints() {
    for (let point of points) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = point.color;
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.fillText(point.id, point.x - 5, point.y + 5);
        ctx.closePath();
    }
}

function drawLines() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let line of lines) {
        ctx.beginPath();
        ctx.moveTo(line[0].x, line[0].y);
        for (let i = 1; i < line.length; i++) {
            ctx.lineTo(line[i].x, line[i].y);
        }
        ctx.stroke();
        ctx.closePath();
    }
    drawPoints();
}

function onMouseDown(e) {
    const { offsetX, offsetY } = e;
    for (let point of points) {
        if (Math.hypot(point.x - offsetX, point.y - offsetY) < 20 && point.connections < 3) {
            selectedPoint = point;
            isDrawing = true;
            currentPath = [{ x: offsetX, y: offsetY }];
            break;
        }
    }
}

function onMouseMove(e) {
    if (isDrawing) {
        const { offsetX, offsetY } = e;
        currentPath.push({ x: offsetX, y: offsetY });
        drawLines();
        drawCurrentPath();
    }
}

function onMouseUp(e) {
    if (isDrawing && selectedPoint) {
        const { offsetX, offsetY } = e;
        for (let point of points) {
            if (Math.hypot(point.x - offsetX, point.y - offsetY) < 20 && point !== selectedPoint && point.id === selectedPoint.id && point.connections < 3) {
                currentPath.push({ x: point.x, y: point.y });
                const newLine = currentPath;
                if (!checkLineIntersection(newLine)) {
                    lines.push(newLine);
                    selectedPoint.connections += 1;
                    point.connections += 1;
                }
                break;
            }
        }
        isDrawing = false;
        selectedPoint = null;
        currentPath = [];
        drawLines();
    }
}

function drawCurrentPath() {
    ctx.beginPath();
    ctx.moveTo(currentPath[0].x, currentPath[0].y);
    for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x, currentPath[i].y);
    }
    ctx.strokeStyle = 'gray';
    ctx.stroke();
    ctx.closePath();
}

function checkLineIntersection(newLine) {
    for (let line of lines) {
        if (linesIntersect(newLine, line)) {
            return true;
        }
    }
    return false;
}

function linesIntersect(line1, line2) {
    // Aquí se realiza una verificación simple por segmentos para detectar cruces.
    for (let i = 0; i < line1.length - 1; i++) {
        for (let j = 0; j < line2.length - 1; j++) {
            if (segmentsIntersect(line1[i], line1[i + 1], line2[j], line2[j + 1])) {
                return true;
            }
        }
    }
    return false;
}

function segmentsIntersect(p1, p2, p3, p4) {
    function ccw(A, B, C) {
        return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
    }
    return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
}

drawPoints();
