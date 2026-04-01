import * as THREE from 'three';

export class EffectSystem {
    constructor(gameScene) {
        this.gameScene = gameScene;
        this.scene = gameScene.scene;
        
        this.effects = [];
        this.particleSystems = [];
        
        this.createDamageOverlay();
    }

    createDamageOverlay() {
        this.damageOverlay = document.createElement('div');
        this.damageOverlay.className = 'damage-overlay';
        document.body.appendChild(this.damageOverlay);
    }

    createMuzzleFlash(weapon) {
        const flashGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const flashMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffff00,
            transparent: true,
            opacity: 1
        });
        const flash = new THREE.Mesh(flashGeometry, flashMaterial);
        
        flash.position.copy(weapon.position);
        flash.position.z -= 0.7;
        flash.position.y -= 0.05;
        
        this.gameScene.camera.add(flash);
        
        this.effects.push({
            mesh: flash,
            type: 'muzzleFlash',
            lifetime: 0.05,
            age: 0,
            parent: this.gameScene.camera
        });
    }

    createBulletHole(hit) {
        const holeGeometry = new THREE.CircleGeometry(0.05, 16);
        const holeMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x000000,
            side: THREE.DoubleSide
        });
        const hole = new THREE.Mesh(holeGeometry, holeMaterial);
        
        hole.position.copy(hit.point);
        hole.position.addScaledVector(hit.normal, 0.01);
        hole.lookAt(hit.point.clone().add(hit.normal));
        
        this.scene.add(hole);
        
        this.effects.push({
            mesh: hole,
            type: 'bulletHole',
            lifetime: 10,
            age: 0
        });
    }

    createHitEffect(position) {
        const particleCount = 20;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = position.x;
            positions[i * 3 + 1] = position.y + 1;
            positions[i * 3 + 2] = position.z;
            
            velocities.push(new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                Math.random() * 10,
                (Math.random() - 0.5) * 10
            ));
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0xff0000,
            size: 0.1,
            transparent: true,
            opacity: 1
        });
        
        const particleSystem = new THREE.Points(particles, particleMaterial);
        this.scene.add(particleSystem);
        
        this.particleSystems.push({
            system: particleSystem,
            velocities: velocities,
            lifetime: 1,
            age: 0
        });
    }

    createExplosion(position) {
        const particleCount = 50;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const velocities = [];
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = position.x;
            positions[i * 3 + 1] = position.y + 1;
            positions[i * 3 + 2] = position.z;
            
            const color = new THREE.Color();
            color.setHSL(Math.random() * 0.1, 1, 0.5);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
            
            velocities.push(new THREE.Vector3(
                (Math.random() - 0.5) * 15,
                Math.random() * 10 + 5,
                (Math.random() - 0.5) * 15
            ));
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.2,
            transparent: true,
            opacity: 1,
            vertexColors: true
        });
        
        const particleSystem = new THREE.Points(particles, particleMaterial);
        this.scene.add(particleSystem);
        
        this.particleSystems.push({
            system: particleSystem,
            velocities: velocities,
            lifetime: 1.5,
            age: 0
        });
    }

    createDamageEffect() {
        this.damageOverlay.classList.add('active');
        this.createBlurEffect();
        setTimeout(() => {
            this.damageOverlay.classList.remove('active');
        }, 100);
    }
    
    createBlurEffect() {
        const blurOverlay = document.createElement('div');
        blurOverlay.className = 'blur-overlay';
        document.body.appendChild(blurOverlay);
        
        setTimeout(() => {
            blurOverlay.classList.add('active');
        }, 10);
        
        setTimeout(() => {
            blurOverlay.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(blurOverlay);
            }, 300);
        }, 100);
    }
    
    toggleNightVision() {
        document.body.classList.toggle('night-vision');
    }

    update(delta) {
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            effect.age += delta;
            
            if (effect.type === 'muzzleFlash') {
                const opacity = 1 - (effect.age / effect.lifetime);
                effect.mesh.material.opacity = opacity;
                effect.mesh.scale.setScalar(1 + effect.age * 10);
            }
            
            if (effect.age >= effect.lifetime) {
                if (effect.parent) {
                    effect.parent.remove(effect.mesh);
                } else {
                    this.scene.remove(effect.mesh);
                }
                this.effects.splice(i, 1);
            }
        }
        
        for (let i = this.particleSystems.length - 1; i >= 0; i--) {
            const ps = this.particleSystems[i];
            ps.age += delta;
            
            const positions = ps.system.geometry.attributes.position.array;
            const opacity = 1 - (ps.age / ps.lifetime);
            ps.system.material.opacity = opacity;
            
            for (let j = 0; j < ps.velocities.length; j++) {
                positions[j * 3] += ps.velocities[j].x * delta;
                positions[j * 3 + 1] += ps.velocities[j].y * delta;
                positions[j * 3 + 2] += ps.velocities[j].z * delta;
                
                ps.velocities[j].y -= 20 * delta;
            }
            
            ps.system.geometry.attributes.position.needsUpdate = true;
            
            if (ps.age >= ps.lifetime) {
                this.scene.remove(ps.system);
                this.particleSystems.splice(i, 1);
            }
        }
    }
}
