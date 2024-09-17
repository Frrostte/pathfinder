document.addEventListener('DOMContentLoaded', (event) => {
    const grid = document.querySelector('.grid');
    const buttons = document.querySelectorAll('button');
    let startNode = null;
    let targetNode = null;
    let isSettingStart = false;
    let isSettingTarget = false;
    let isAddingWalls = false;
    let walls = new Set();
    let isDragging = false;


    // Create the grid
    function createGrid() {
        for (let i = 0; i < 400; i++) {
            const cell = document.createElement('div');
            cell.dataset.index = i;
            grid.appendChild(cell);
        }
    }

    // Handle button clicks
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            switch (button.id) {
                case 'setStartNode':
                    resetModes();
                    isSettingStart = true;
                    break;
                case 'setTargetNode':
                    resetModes();
                    isSettingTarget = true;
                    break;
                case 'addWalls':
                    resetModes();
                    isAddingWalls = true;
                    break;
                case 'clearBoard':
                    clearBoard();
                    break;
                case 'runAlgorithm':
                    runAlgorithm();
                    break;
                default:
                    break;
            }
        });
    });




    // Add event listener to grid cells
    grid.addEventListener('click', (e) => {
        const cell = e.target;
        const index = parseInt(cell.dataset.index);

        if (isSettingStart) {
            if (startNode !== null) {
                document.querySelector(`[data-index='${startNode}']`).classList.remove('start');
            }
            cell.classList.add('start');
            startNode = index;
            isSettingStart = false;
        } else if (isSettingTarget) {
            if (targetNode !== null) {
                document.querySelector(`[data-index='${targetNode}']`).classList.remove('target');
            }
            cell.classList.add('target');
            targetNode = index;
            isSettingTarget = false;
        } else if (isAddingWalls) {
            if (!walls.has(index)) {
                cell.classList.add('wall');
                walls.add(index);
            } else {
                cell.classList.remove('wall');
                walls.delete(index);
            }
        }
    });
    grid.addEventListener('mousedown', (e) => {
        if (isAddingWalls) {
            isDragging = true;
            e.preventDefault(); // Prevent default behavior like text selection
            toggleWall(e);
        }
    });

    grid.addEventListener('mouseup', () => {
        isDragging = false;
    });

    grid.addEventListener('mouseleave', () => {
        isDragging = false; // Stop dragging when mouse leaves the grid
    });

    grid.addEventListener('mousemove', (e) => {
        if (isDragging && isAddingWalls) {
            toggleWall(e);
        }
    });

    //adding walls
    function toggleWall(e) {
        const cell = e.target;
        const index = parseInt(cell.dataset.index);

        if (!walls.has(index)) {
            cell.classList.add('wall');
            walls.add(index);
        }
    }
    
    // Reset mode flags
    function resetModes() {
        isSettingStart = false;
        isSettingTarget = false;
        isAddingWalls = false;
    }

    // Clear the board
    function clearBoard() {
        document.querySelectorAll('.grid div').forEach(cell => {
            cell.classList.remove('start', 'target', 'wall', 'visited', 'shortest-path');
        });
        startNode = null;
        targetNode = null;
        walls.clear();
    }

    // Run Dijkstra's Algorithm
    function runAlgorithm() {
        if (startNode === null || targetNode === null) {
            alert('Please set both start and target nodes.');
            return;
        }
        const distances = {};
        const previous = {};
        const pq = new PriorityQueue((a, b) => distances[a] < distances[b]);
        const visited = new Set();

        for (let i = 0; i < 400; i++) {
            distances[i] = Infinity;
            previous[i] = null;
        }

        distances[startNode] = 0;
        pq.enqueue(startNode);

        const interval = setInterval(() => {
            if (pq.isEmpty()) {
                clearInterval(interval);
                alert('No path found.');
                return;
            }

            const node = pq.dequeue();
            if (node === targetNode) {
                clearInterval(interval);
                reconstructPath(previous);
                return;
            }

            if (!visited.has(node)) {
                visited.add(node);
                document.querySelector(`[data-index='${node}']`).classList.add('visited');

                getNeighbors(node).forEach(neighbor => {
                    if (!visited.has(neighbor) && !walls.has(neighbor)) {
                        const alt = distances[node] + 1;
                        if (alt < distances[neighbor]) {
                            distances[neighbor] = alt;
                            previous[neighbor] = node;
                            pq.enqueue(neighbor);
                        }
                    }
                });
            }
        }, 50);
    }

    // Get neighbors of a node
    function getNeighbors(index) {
        const neighbors = [];
        const row = Math.floor(index / 20);
        const col = index % 20;

        if (row > 0 && !walls.has(index - 20)) neighbors.push(index - 20); // Top
        if (row < 19 && !walls.has(index + 20)) neighbors.push(index + 20); // Bottom
        if (col > 0 && !walls.has(index - 1)) neighbors.push(index - 1);  // Left
        if (col < 19 && !walls.has(index + 1)) neighbors.push(index + 1); // Right

        return neighbors;
    }


    // Reconstruct the shortest path
    function reconstructPath(previous) {
        let node = targetNode;
        while (node !== null) {
            document.querySelector(`[data-index='${node}']`).classList.add('shortest-path');
            node = previous[node];
        }
    }

    // Priority Queue implementation
    class PriorityQueue {
        constructor(comparator = (a, b) => a > b) {
            this._heap = [];
            this._comparator = comparator;
        }

        size() {
            return this._heap.length;
        }

        isEmpty() {
            return this.size() === 0;
        }

        peek() {
            return this._heap[0];
        }

        enqueue(value) {
            this._heap.push(value);
            this._siftUp();
        }

        dequeue() {
            const poppedValue = this.peek();
            const bottom = this.size() - 1;
            if (bottom > 0) {
                this._swap(0, bottom);
            }
            this._heap.pop();
            this._siftDown();
            return poppedValue;
        }

        _greater(i, j) {
            return this._comparator(this._heap[i], this._heap[j]);
        }

        _swap(i, j) {
            [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
        }

        _siftUp() {
            let node = this.size() - 1;
            while (node > 0 && this._greater(node, Math.floor((node - 1) / 2))) {
                this._swap(node, Math.floor((node - 1) / 2));
                node = Math.floor((node - 1) / 2);
            }
        }

        _siftDown() {
            let node = 0;
            while (
                (node * 2 + 1 < this.size() && this._greater(node * 2 + 1, node)) ||
                (node * 2 + 2 < this.size() && this._greater(node * 2 + 2, node))
            ) {
                let maxChild = (node * 2 + 2 < this.size() && this._greater(node * 2 + 2, node * 2 + 1)) ? (node * 2 + 2) : (node * 2 + 1);
                this._swap(node, maxChild);
                node = maxChild;
            }
        }
    }

    // Initialize the grid
    createGrid();
});
