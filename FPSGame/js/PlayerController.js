import * as THREE from 'three';

export class PlayerController {
    constructor(camera) {
        this.camera = camera;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.moveSpeed = 10;
        this.jumpForce = 8;
        this.gravity = -20;
        this.isOnGround = true;
        
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        
        this.colliders = [];
        
        this.initEventListeners();
    }

    initEventListeners() {
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
    }

    onKeyDown(event) {
        switch (event.code) {
            case 'KeyW':
                this.moveForward = true;
                break;
            case 'KeyA':
                this.moveLeft = true;
                break;
            case 'KeyS':
                this.moveBackward = true;
                break;
            case 'KeyD':
                this.moveRight = true;
                break;
            case 'Space':
                if (this.isOnGround) {
                    this.velocity.y = this.jumpForce;
                    this.isOnGround = false;
                }
                break;
        }
    }

    onKeyUp(event) {
        switch (event.code) {
            case 'KeyW':
                this.moveForward = false;
                break;
            case 'KeyA':
                this.moveLeft = false;
                break;
            case 'KeyS':
                this.moveBackward = false;
                break;
            case 'KeyD':
                this.moveRight = false;
                break;
        }
    }

    onMouseMove(event) {
        if (document.pointerLockElement) {
            this.euler.setFromQuaternion(this.camera.quaternion);
            this.euler.y -= event.movementX * 0.002;
            this.euler.x -= event.movementY * 0.002;
            this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));
            this.camera.quaternion.setFromEuler(this.euler);
        }
    }

    onPointerLockChange() {
        if (!document.pointerLockElement) {
            const instructions = document.getElementById('instructions');
            if (instructions) {
                instructions.classList.remove('hidden');
            }
        }
    }

    setColliders(colliders) {
        this.colliders = colliders;
    }

    checkCollision(newPosition) {
        const playerRadius = 0.5;
        const playerHeight = 1.6;
        
        for (const collider of this.colliders) {
            const box = new THREE.Box3().setFromObject(collider);
            
            const playerBox = new THREE.Box3(
                new THREE.Vector3(newPosition.x - playerRadius, newPosition.y, newPosition.z - playerRadius),
                new THREE.Vector3(newPosition.x + playerRadius, newPosition.y + playerHeight, newPosition.z + playerRadius)
            );
            
            if (box.intersectsBox(playerBox)) {
                return true;
            }
        }
        return false;
    }

    update(delta) {
        this.velocity.x = 0;
        this.velocity.z = 0;

        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize();

        if (this.moveForward || this.moveBackward) {
            this.velocity.z -= this.direction.z * this.moveSpeed;
        }
        if (this.moveLeft || this.moveRight) {
            this.velocity.x -= this.direction.x * this.moveSpeed;
        }

        this.velocity.y += this.gravity * delta;

        const newPosition = this.camera.position.clone();
        
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        forward.y = 0;
        forward.normalize();
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
        right.y = 0;
        right.normalize();

        newPosition.addScaledVector(forward, -this.velocity.z * delta);
        newPosition.addScaledVector(right, -this.velocity.x * delta);
        
        if (this.checkCollision(newPosition)) {
            newPosition.x = this.camera.position.x;
            newPosition.z = this.camera.position.z;
        }

        newPosition.y += this.velocity.y * delta;
        
        if (newPosition.y <= 1.6) {
            newPosition.y = 1.6;
            this.velocity.y = 0;
            this.isOnGround = true;
        }

        if (this.checkCollision(newPosition)) {
            if (this.velocity.y < 0) {
                this.isOnGround = true;
            }
            this.velocity.y = 0;
            newPosition.y = this.camera.position.y;
        }

        this.camera.position.copy(newPosition);
    }
}
