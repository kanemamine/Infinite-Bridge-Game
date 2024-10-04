import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

export class Player {
    constructor(scene) {
        this.scene = scene;
        this.baseSpeed = 0.2;
        this.currentSpeed = this.baseSpeed;
        this.maxSpeed = 1.0;
        this.acceleration = 0.0001;
        this.deceleration = 0.0005;
        this.lateralSpeed = 0.1;
        this.bridgeWidth = 10;
        this.boostSpeed = 2.0;
        this.boostDuration = 2000; // 2 seconds
        this.boostCooldown = 5000; // 5 seconds
        this.lastBoostTime = 0;
        this.isBoosting = false;
        this.ballRadius = 0.5; // Rayon de la balle

        this.createBall();
        this.setupControls();
        this.createSpeedDisplay();
    }

    createBall() {
        const ballGeometry = new THREE.SphereGeometry(this.ballRadius, 32, 32);
        const ballMaterial = new THREE.MeshPhongMaterial({color: 0xff0000});
        this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
        this.ball.position.set(0, this.ballRadius, 0); // Positionner la balle sur le pont
        this.ball.castShadow = true;
        this.scene.add(this.ball);
    }

    setupControls() {
        this.keyState = {};
        document.addEventListener('keydown', (event) => {
            this.keyState[event.code] = true;
            if (event.code === 'Space') {
                this.activateBoost();
            }
        });
        document.addEventListener('keyup', (event) => {
            this.keyState[event.code] = false;
        });
    }

    createSpeedDisplay() {
        this.speedDisplay = document.createElement('div');
        this.speedDisplay.style.position = 'absolute';
        this.speedDisplay.style.top = '10px';
        this.speedDisplay.style.left = '10px';
        this.speedDisplay.style.color = 'white';
        this.speedDisplay.style.fontFamily = 'Arial, sans-serif';
        this.speedDisplay.style.fontSize = '20px';
        document.body.appendChild(this.speedDisplay);
    }

    activateBoost() {
        const currentTime = Date.now();
        if (currentTime - this.lastBoostTime > this.boostCooldown) {
            this.isBoosting = true;
            this.lastBoostTime = currentTime;
            setTimeout(() => {
                this.isBoosting = false;
            }, this.boostDuration);
        }
    }

    update() {
        // Accélération progressive
        if (this.keyState['ArrowUp'] && this.currentSpeed < this.maxSpeed) {
            this.currentSpeed = Math.min(this.currentSpeed + this.acceleration, this.maxSpeed);
        } else if (!this.keyState['ArrowUp'] && this.currentSpeed > this.baseSpeed) {
            this.currentSpeed = Math.max(this.currentSpeed - this.deceleration, this.baseSpeed);
        }

        // Appliquer le boost si actif
        const effectiveSpeed = this.isBoosting ? this.currentSpeed * this.boostSpeed : this.currentSpeed;

        this.ball.position.z -= effectiveSpeed;

        // Mouvement latéral avec gestion des collisions
        const potentialX = this.ball.position.x + 
            (this.keyState['ArrowLeft'] ? -this.lateralSpeed : 0) + 
            (this.keyState['ArrowRight'] ? this.lateralSpeed : 0);

        // Calculer les limites en tenant compte du rayon de la balle
        const leftLimit = -this.bridgeWidth / 2 + this.ballRadius;
        const rightLimit = this.bridgeWidth / 2 - this.ballRadius;

        // Appliquer le mouvement latéral tout en respectant les limites
        this.ball.position.x = Math.max(leftLimit, Math.min(rightLimit, potentialX));

        // Mise à jour de l'affichage de la vitesse
        this.updateSpeedDisplay(effectiveSpeed);
    }

    updateSpeedDisplay(speed) {
        const displaySpeed = Math.round(speed * 100);
        this.speedDisplay.textContent = `Vitesse: ${displaySpeed}`;
        
        // Changer la couleur en fonction de la vitesse
        if (this.isBoosting) {
            this.speedDisplay.style.color = 'yellow';
        } else if (speed > this.maxSpeed * 0.8) {
            this.speedDisplay.style.color = 'red';
        } else if (speed > this.maxSpeed * 0.5) {
            this.speedDisplay.style.color = 'orange';
        } else {
            this.speedDisplay.style.color = 'white';
        }
    }

    stop() {
        this.currentSpeed = 0;
        this.isBoosting = false;
    }
}