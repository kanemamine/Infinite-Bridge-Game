import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

export class ObstacleManager {
    constructor(scene, bridgeWidth) {
        this.scene = scene;
        this.bridgeWidth = bridgeWidth;
        this.obstacles = [];
        this.obstacleTypes = [this.createBox, this.createSphere, this.createCylinder];
        this.movementPatterns = [this.moveHorizontal, this.moveVertical, this.moveCircular];
    }

    createObstacle(z) {
        const type = this.obstacleTypes[Math.floor(Math.random() * this.obstacleTypes.length)];
        const obstacle = type.call(this, z);
        obstacle.movementPattern = this.movementPatterns[Math.floor(Math.random() * this.movementPatterns.length)];
        obstacle.movementSpeed = Math.random() * 0.05 + 0.02;
        obstacle.movementOffset = 0;
        obstacle.initialY = obstacle.position.y; // Sauvegarde la position Y initiale
        this.obstacles.push(obstacle);
        return obstacle;
    }

    createBox(z) {
        const size = Math.random() * 0.5 + 1;
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        const box = new THREE.Mesh(geometry, material);
        box.position.set(
            (Math.random() - 0.5) * (this.bridgeWidth - size),
            size / 2,
            z
        );
        box.castShadow = true;
        this.scene.add(box);
        return box;
    }

    createSphere(z) {
        const radius = Math.random() * 0.25 + 0.5;
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshPhongMaterial({ color: 0x0000ff });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(
            (Math.random() - 0.5) * (this.bridgeWidth - radius * 2),
            radius,
            z
        );
        sphere.castShadow = true;
        this.scene.add(sphere);
        return sphere;
    }

    createCylinder(z) {
        const radius = Math.random() * 0.25 + 0.5;
        const height = Math.random() * 0.5 + 1;
        const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
        const material = new THREE.MeshPhongMaterial({ color: 0xff00ff });
        const cylinder = new THREE.Mesh(geometry, material);
        cylinder.position.set(
            (Math.random() - 0.5) * (this.bridgeWidth - radius * 2),
            height / 2,
            z
        );
        cylinder.castShadow = true;
        this.scene.add(cylinder);
        return cylinder;
    }

    moveHorizontal(obstacle) {
        const amplitude = this.bridgeWidth / 3;
        const newX = obstacle.position.x + Math.cos(obstacle.movementOffset) * obstacle.movementSpeed;
        
        // Limiter le mouvement à la largeur du pont
        const obstacleWidth = obstacle.geometry.parameters.width || obstacle.geometry.parameters.radius * 2;
        const minX = -this.bridgeWidth / 2 + obstacleWidth / 2;
        const maxX = this.bridgeWidth / 2 - obstacleWidth / 2;
        obstacle.position.x = Math.max(minX, Math.min(maxX, newX));

        obstacle.movementOffset += obstacle.movementSpeed;
    }

    moveVertical(obstacle) {
        const amplitude = 1;
        const newY = obstacle.initialY + Math.abs(Math.sin(obstacle.movementOffset) * amplitude);
        
        // Limiter le mouvement vertical
        const obstacleHeight = obstacle.geometry.parameters.height || obstacle.geometry.parameters.radius * 2;
        const minY = obstacleHeight / 2;
        const maxY = obstacle.initialY + amplitude;
        obstacle.position.y = Math.max(minY, Math.min(maxY, newY));

        obstacle.movementOffset += obstacle.movementSpeed;
    }

    moveCircular(obstacle) {
        const radius = Math.min(this.bridgeWidth / 6, 1); // Limiter le rayon du mouvement circulaire
        const newX = obstacle.position.x + Math.cos(obstacle.movementOffset) * obstacle.movementSpeed * radius;
        const newY = obstacle.initialY + Math.sin(obstacle.movementOffset) * obstacle.movementSpeed * radius;

        // Limiter le mouvement à la largeur du pont et à une hauteur raisonnable
        const obstacleSize = obstacle.geometry.parameters.width || obstacle.geometry.parameters.radius * 2;
        const minX = -this.bridgeWidth / 2 + obstacleSize / 2;
        const maxX = this.bridgeWidth / 2 - obstacleSize / 2;
        const minY = obstacleSize / 2;
        const maxY = obstacle.initialY + radius;

        obstacle.position.x = Math.max(minX, Math.min(maxX, newX));
        obstacle.position.y = Math.max(minY, Math.min(maxY, newY));

        obstacle.movementOffset += obstacle.movementSpeed;
    }

    update(playerZ) {
        if (this.obstacles.length === 0 || playerZ < this.obstacles[this.obstacles.length - 1].position.z + 20) {
            this.createObstacle(playerZ - 50);
        }

        this.obstacles = this.obstacles.filter(obstacle => {
            if (obstacle.position.z > playerZ + 10) {
                this.scene.remove(obstacle);
                return false;
            }
            obstacle.movementPattern.call(this, obstacle);
            return true;
        });
    }

    checkCollisions(playerPosition, playerRadius) {
        for (let obstacle of this.obstacles) {
            const distance = playerPosition.distanceTo(obstacle.position);
            let collisionThreshold = playerRadius;

            if (obstacle.geometry instanceof THREE.BoxGeometry) {
                collisionThreshold += Math.max(
                    obstacle.geometry.parameters.width,
                    obstacle.geometry.parameters.height,
                    obstacle.geometry.parameters.depth
                ) / 2;
            } else if (obstacle.geometry instanceof THREE.SphereGeometry) {
                collisionThreshold += obstacle.geometry.parameters.radius;
            } else if (obstacle.geometry instanceof THREE.CylinderGeometry) {
                collisionThreshold += Math.max(
                    obstacle.geometry.parameters.radiusTop,
                    obstacle.geometry.parameters.radiusBottom,
                    obstacle.geometry.parameters.height / 2
                );
            }

            if (distance < collisionThreshold) {
                return true; // Collision détectée
            }
        }
        return false; // Pas de collision
    }
}