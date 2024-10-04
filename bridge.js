import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

export class BridgeManager {
    constructor(scene) {
        this.scene = scene;
        this.bridgeWidth = 10;
        this.bridgeLength = 50;
        this.wallHeight = 2;
        this.bridgeSections = [
            this.createBridgeSection(0),
            this.createBridgeSection(-this.bridgeLength)
        ];
    }

    createBridgeSection(z) {
        const bridgeGroup = new THREE.Group();

        // Création des planches du pont
        const plankWidth = 1;
        const plankHeight = 0.1;
        const plankGap = 0.05;
        const numPlanks = Math.floor(this.bridgeLength / (plankWidth + plankGap));

        const plankGeometry = new THREE.BoxGeometry(this.bridgeWidth, plankHeight, plankWidth);
        const plankMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });

        for (let i = 0; i < numPlanks; i++) {
            const plank = new THREE.Mesh(plankGeometry, plankMaterial);
            plank.position.set(0, 0, -i * (plankWidth + plankGap));
            plank.receiveShadow = true;
            plank.castShadow = true;
            bridgeGroup.add(plank);
        }

        // Création des supports du pont
        const supportGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
        const supportMaterial = new THREE.MeshPhongMaterial({ color: 0x4a2801 });

        for (let i = 0; i < numPlanks; i += 5) {
            const leftSupport = new THREE.Mesh(supportGeometry, supportMaterial);
            leftSupport.position.set(-this.bridgeWidth/2 + 0.5, -0.5, -i * (plankWidth + plankGap));
            leftSupport.receiveShadow = true;
            leftSupport.castShadow = true;
            bridgeGroup.add(leftSupport);

            const rightSupport = new THREE.Mesh(supportGeometry, supportMaterial);
            rightSupport.position.set(this.bridgeWidth/2 - 0.5, -0.5, -i * (plankWidth + plankGap));
            rightSupport.receiveShadow = true;
            rightSupport.castShadow = true;
            bridgeGroup.add(rightSupport);
        }

        // Création des murs
        const wallGeometry = new THREE.BoxGeometry(0.5, this.wallHeight, this.bridgeLength);
        const wallMaterial = new THREE.MeshPhongMaterial({color: 0x808080});

        const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
        leftWall.position.set(-this.bridgeWidth/2, this.wallHeight/2, -this.bridgeLength/2);
        leftWall.receiveShadow = true;
        leftWall.castShadow = true;
        bridgeGroup.add(leftWall);

        const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
        rightWall.position.set(this.bridgeWidth/2, this.wallHeight/2, -this.bridgeLength/2);
        rightWall.receiveShadow = true;
        rightWall.castShadow = true;
        bridgeGroup.add(rightWall);

        // Ajout de détails aux murs (poteaux)
        const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, this.wallHeight, 8);
        const poleMaterial = new THREE.MeshPhongMaterial({color: 0x606060});

        for (let i = 0; i <= this.bridgeLength; i += 5) {
            const leftPole = new THREE.Mesh(poleGeometry, poleMaterial);
            leftPole.position.set(-this.bridgeWidth/2, this.wallHeight/2, -i);
            leftPole.receiveShadow = true;
            leftPole.castShadow = true;
            bridgeGroup.add(leftPole);

            const rightPole = new THREE.Mesh(poleGeometry, poleMaterial);
            rightPole.position.set(this.bridgeWidth/2, this.wallHeight/2, -i);
            rightPole.receiveShadow = true;
            rightPole.castShadow = true;
            bridgeGroup.add(rightPole);
        }

        bridgeGroup.position.set(0, -0.25, z);
        this.scene.add(bridgeGroup);

        return { bridgeGroup };
    }

    update(playerZ) {
        if (playerZ < this.bridgeSections[this.bridgeSections.length - 1].bridgeGroup.position.z + this.bridgeLength/2) {
            const newSection = this.createBridgeSection(this.bridgeSections[this.bridgeSections.length - 1].bridgeGroup.position.z - this.bridgeLength);
            this.bridgeSections.push(newSection);

            if (this.bridgeSections.length > 3) {
                const oldestSection = this.bridgeSections.shift();
                this.scene.remove(oldestSection.bridgeGroup);
            }
        }
    }
}