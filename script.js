const record = document.getElementById("record"),
      shot = document.getElementById("shot"),
      hit = document.getElementById("hit"),
      dead = document.getElementById("dead"),
      enemy = document.getElementById("enemy"),
      again = document.getElementById("again"),
      header = document.querySelector(".header");


const game = {
    ships: [],
    shipCount: 0,
    optionShip: {
        count: [1, 2, 3, 4],
        size: [4, 3, 2, 1]
    },
    collision: new Set(),                       // Новая коллекция
    generateShip() {
        // Количество кораблей
        for(let i = 0; i < this.optionShip.count.length; i++) {
            // Количество кораболей определённого размера
            for(let j = 0; j < this.optionShip.count[i]; j++) {
                const size = this.optionShip.size[i];
                const ship = this.generetaOptionsShip(size);
                this.ships.push(ship);
                this.shipCount++;
            }
        }
    },
    generetaOptionsShip(shipSize) {
        const ship = {
            hit: [],
            location: []
        };

        // direction - true или false
        const direction = Math.random() < 0.5;
        // Координаты корабля
        let x, y;

        if(direction) {
            x = Math.floor(Math.random() * 10);
            y = Math.floor(Math.random() * (10 - shipSize));
        } else {
            x = Math.floor(Math.random() * (10 - shipSize));
            y = Math.floor(Math.random() * 10);
        }

        // Добавление координат в объект
        for(let i = 0; i < shipSize; i++) {
            if(direction) {
                ship.location.push(x + '' + (y + i));
            } else {
                ship.location.push((x + i) + '' + y);
            }
            ship.hit.push('');
        }

        // Проверка на расположение кораблей
        if(this.checkCollision(ship.location)) {
            return this.generetaOptionsShip(shipSize);
        }

        // Добавление координат, куда нельзя ставить корабль, Безопасная зона
        this.addCollision(ship.location);
        
        return ship;
    },
    checkCollision(location) {
        for(const coord of location) {
            if(this.collision.has(coord)) {
                return true;
            }
        }
        //return false;
    },
    addCollision(location) {
        // Обработка безопасной зоны идёт тремя прямоугольниками
        for(let i = 0; i < location.length; i++) {
            const startCoordX = location[i][0] - 1;
            for(let j = startCoordX; j < startCoordX + 3; j++) {
                const startCoordY = location[i][1] - 1;
                for(let k = startCoordY; k < startCoordY + 3; k++) {
                    if(j >= 0 && j < 10 && k >= 0 && k < 10) {
                        const coord = j + '' + k;
                        // Проверка на многократное добавление одинаковых координат безопасной зоны через коллекцию
                        this.collision.add(coord);
                    }
                }
            }
        }
    } 
}

const play = {
    record: localStorage.getItem('seaBattleRecord') || 0,
    shot: 0,
    hit: 0,
    dead: 0,
    set updateData(data) {
        this[data]++;
        this.render();
    },
    render() {
        record.textContent = this.record;
        shot.textContent = this.shot;
        hit.textContent = this.hit;
        dead.textContent = this.dead;
    }
};

const show = {
    hit(element) {
        this.changeClass(element, 'hit');
    },
    miss(element) {
        this.changeClass(element, 'miss');
    },
    dead(element) {
        this.changeClass(element, 'dead');
    },
    changeClass(element, value) {
        element.className = value;
    }
}

const fire = (event) => {
    const target = event.target;
    if(target.classList.length !== 0 || target.tagName !== 'TD') return;
    if(header.textContent == 'Игра окончена!') return;
    show.miss(target);
    play.updateData = 'shot';

    for(let i = 0; i < game.ships.length; i++) {
        const ship = game.ships[i];
        const index = ship.location.indexOf(target.id);
        if (index >= 0) {
            show.hit(target);
            play.updateData = 'hit';
            ship.hit[index] = 'x';
            const life = ship.hit.indexOf('');
            if(life < 0) {
                play.updateData = 'dead';
                for(const id of ship.location) {
                    show.dead(document.getElementById(id))
                }
                
                game.shipCount--;
                if(game.shipCount < 1) {
                    header.textContent = 'Игра окончена!';
                    header.style.color = 'red';

                    if(play.shot < play.record || play.record === 0) {
                        localStorage.setItem('seaBattleRecord', play.shot);
                        play.record = play.shot;
                        play.render();
                    }
                }

            }
        }
    }
};

const init = () => {
    enemy.addEventListener('click', fire);
    play.render();
    game.generateShip();

    again.addEventListener('click', () => {
        location.reload();
    });

    record.addEventListener('dblclick', () => {
        localStorage.clear();
        play.record = 0;
        play.render();
    });
};

init();