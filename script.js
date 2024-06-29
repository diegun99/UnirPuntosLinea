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
let newPointAllowed = false;

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
    ctx.lineWidth = 5;
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
    if (newPointAllowed) {
        // Si se permite crear un nuevo punto
        for (let line of lines) {
            for (let i = 0; i < line.length - 1; i++) {
                const distance = pointToSegmentDistance({ x: offsetX, y: offsetY }, line[i], line[i + 1]);
                if (distance < 5) {
                    const newPoint = { x: offsetX, y: offsetY, id: generateNewId(), color: generateRandomColor(), connections: 0 };
                    points.push(newPoint);
                    drawLines();
                    newPointAllowed = false;
                    return;
                }
            }
        }
    } else {
        // Selecciona un punto existente para empezar a dibujar una línea
        for (let point of points) {
            if (Math.hypot(point.x - offsetX, point.y - offsetY) < 20 && point.connections < 3) {
                selectedPoint = point;
                isDrawing = true;
                currentPath = [{ x: offsetX, y: offsetY }];
                break;
            }
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
            if (Math.hypot(point.x - offsetX, point.y - offsetY) < 20 && point !== selectedPoint && point.connections < 3) {
                currentPath.push({ x: point.x, y: point.y });
                const newLine = currentPath;
                if (!checkLineIntersection(newLine)) {
                    lines.push(newLine);
                    selectedPoint.connections += 1;
                    point.connections += 1;
                    newPointAllowed = true;
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

function pointToSegmentDistance(point, v, w) {
    const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
    if (l2 === 0) return Math.hypot(point.x - v.x, point.y - v.y);
    let t = ((point.x - v.x) * (w.x - v.x) + (point.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projection = { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) };
    return Math.hypot(point.x - projection.x, point.y - projection.y);
}

function generateNewId() {
    return Math.floor(Math.random() * 9) + 1;
}

function generateRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

drawPoints();
