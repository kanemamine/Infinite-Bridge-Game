import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { BridgeManager } from './bridge.js';
import { Player } from './player.js';
import { ObstacleManager } from './obstacles.js';

export class Game {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.isGameOver = false;

        this.setupLighting();
        this.setupFog();

        this.bridgeManager = new BridgeManager(scene);
        this.player = new Player(scene);
        this.obstacleManager = new ObstacleManager(scene, this.bridgeManager.bridgeWidth);

        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(this.player.ball.position);

        this.setupResizeHandler();
        this.createGameOverDisplay();
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(5, 10, 7.5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
    }

    setupFog() {
        const fogColor = new THREE.Color(0xcccccc);
        this.scene.fog = new THREE.Fog(fogColor, 1, 50);
        this.scene.background = fogColor;
    }

    setupResizeHandler() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    createGameOverDisplay() {
        this.gameOverDisplay = document.createElement('div');
        this.gameOverDisplay.style.position = 'absolute';
        this.gameOverDisplay.style.top = '50%';
        this.gameOverDisplay.style.left = '50%';
        this.gameOverDisplay.style.transform = 'translate(-50%, -50%)';
        this.gameOverDisplay.style.color = 'red';
        this.gameOverDisplay.style.fontFamily = 'Arial, sans-serif';
        this.gameOverDisplay.style.fontSize = '48px';
        this.gameOverDisplay.style.display = 'none';
        this.gameOverDisplay.textContent = 'Game Over';
        document.body.appendChild(this.gameOverDisplay);
    }

    update() {
        if (this.isGameOver) return;

        this.player.update();
        this.bridgeManager.update(this.player.ball.position.z);
        this.obstacleManager.update(this.player.ball.position.z);
        this.updateCamera();

        if (this.obstacleManager.checkCollisions(this.player.ball.position, this.player.ballRadius)) {
            this.gameOver();
        }
    }

    updateCamera() {
        const cameraOffset = 10 + this.player.currentSpeed * 10;
        this.camera.position.z = this.player.ball.position.z + cameraOffset;
        this.camera.position.y = 5 + this.player.currentSpeed * 2;
        this.camera.lookAt(this.player.ball.position);
    }

    gameOver() {
        this.isGameOver = true;
        this.gameOverDisplay.style.display = 'block';
        // Arrêter le mouvement du joueur
        this.player.stop();
    }
}