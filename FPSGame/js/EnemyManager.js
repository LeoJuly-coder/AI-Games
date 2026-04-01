import * as THREE from 'three';

export class EnemyManager {
    constructor(gameScene) {
        this.gameScene = gameScene;
        this.scene = gameScene.scene;
        this.camera = gameScene.camera;
        
        this.enemies = [];
        this.score = 0;
        this.effectSystem = null;
        
        this.updateScoreDisplay();
    }

    setDependencies(playerController, effectSystem) {
        this.playerController = playerController;
        this.effectSystem = effectSystem;
        this.spawnEnemies();
    }

    spawnEnemies() {
        const spawnPositions = [
            { x: 20, z: 20 },
            { x: -20, z: 20 },
            { x: 20, z: -20 },
            { x: -20, z: -20 },
            { x: 0, z: 30 },
            { x: 0, z: -30 },
            { x: -5, z: -35 },
            { x: 5, z: -35 },
        ];

        spawnPositions.forEach((pos, index) => {
            this.createEnemy(pos.x, pos.z);
        });
    }

    createEnemy(x, z) {
        const group = new THREE.Group();
        
        const bodyGeometry = new THREE.CapsuleGeometry(0.4, 1, 4, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.name = 'body';
        body.position.y = 1.2;
        body.castShadow = true;
        group.add(body);
        
        const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xff4444 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.name = 'head';
        head.position.y = 2.1;
        head.castShadow = true;
        group.add(head);
        
        const eyeGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 0.5 });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.12, 2.15, 0.25);
        group.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.12, 2.15, 0.25);
        group.add(rightEye);
        
        group.position.set(x, 0, z);
        group.userData = {
            health: 100,
            maxHealth: 100,
            speed: 3 + Math.random() * 2,
            attackRange: 2,
            attackCooldown: 0,
            attackRate: 1,
            damage: 10,
            state: 'patrol',
            patrolTarget: new THREE.Vector3(
                (Math.random() - 0.5) * 40,
                0,
                (Math.random() - 0.5) * 40
            )
        };
        
        this.scene.add(group);
        this.enemies.push(group);
    }

    hitEnemy(enemy, damage) {
        enemy.userData.health -= damage;
        this.effectSystem.createHitEffect(enemy.position.clone());
        
        if (enemy.userData.health <= 0) {
            this.killEnemy(enemy);
        }
    }

    killEnemy(enemy) {
        this.effectSystem.createExplosion(enemy.position.clone());
        this.scene.remove(enemy);
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }
        
        this.score += 100;
        this.updateScoreDisplay();
        
        setTimeout(() => {
            const x = (Math.random() - 0.5) * 50;
            const z = (Math.random() - 0.5) * 50;
            this.createEnemy(x, z);
        }, 5000);
    }

    updateScoreDisplay() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = `得分: ${this.score}`;
        }
    }

    update(delta) {
        const playerPos = this.camera.position;
        
        this.enemies.forEach(enemy => {
            const enemyPos = enemy.position;
            const distanceToPlayer = enemyPos.distanceTo(playerPos);
            
            enemy.userData.attackCooldown -= delta;
            
            if (enemy.userData.health < 30) {
                // 低血量时逃跑
                enemy.userData.state = 'flee';
                this.handleFlee(enemy, playerPos, delta);
            } else if (distanceToPlayer < 3) {
                // 近距离攻击
                enemy.userData.state = 'attack';
                this.handleAttack(enemy, playerPos, delta);
            } else if (distanceToPlayer < 8) {
                // 中距离寻找掩护
                enemy.userData.state = 'cover';
                this.handleCover(enemy, playerPos, delta);
            } else if (distanceToPlayer < 15) {
                // 远距离追击
                enemy.userData.state = 'chase';
                this.handleChase(enemy, playerPos, delta);
            } else {
                // 远距离巡逻
                enemy.userData.state = 'patrol';
                this.handlePatrol(enemy, delta);
            }
        });
    }
    
    handlePatrol(enemy, delta) {
        const patrolTarget = enemy.userData.patrolTarget;
        const distanceToPatrol = enemy.position.distanceTo(patrolTarget);
        
        if (distanceToPatrol < 2) {
            enemy.userData.patrolTarget.set(
                (Math.random() - 0.5) * 40,
                0,
                (Math.random() - 0.5) * 40
            );
        } else {
            const direction = new THREE.Vector3()
                .subVectors(patrolTarget, enemy.position)
                .normalize();
            direction.y = 0;
            
            enemy.position.addScaledVector(direction, enemy.userData.speed * 0.5 * delta);
            enemy.lookAt(patrolTarget.x, enemy.position.y, patrolTarget.z);
        }
    }
    
    handleChase(enemy, playerPos, delta) {
        const direction = new THREE.Vector3()
            .subVectors(playerPos, enemy.position)
            .normalize();
        direction.y = 0;
        
        enemy.position.addScaledVector(direction, enemy.userData.speed * delta);
        enemy.lookAt(playerPos.x, enemy.position.y, playerPos.z);
    }
    
    handleCover(enemy, playerPos, delta) {
        // 寻找最近的掩体
        const cover = this.findNearestCover(enemy.position);
        
        if (cover) {
            const distanceToCover = enemy.position.distanceTo(cover.position);
            
            if (distanceToCover > 1) {
                // 移动到掩体后面
                const direction = new THREE.Vector3()
                    .subVectors(cover.position, enemy.position)
                    .normalize();
                direction.y = 0;
                
                enemy.position.addScaledVector(direction, enemy.userData.speed * delta);
                enemy.lookAt(cover.position.x, enemy.position.y, cover.position.z);
            } else {
                // 在掩体后面对准玩家
                enemy.lookAt(playerPos.x, enemy.position.y, playerPos.z);
                
                // 尝试攻击
                if (enemy.userData.attackCooldown <= 0) {
                    this.attackPlayer(enemy);
                    enemy.userData.attackCooldown = enemy.userData.attackRate;
                }
            }
        } else {
            // 没有掩体，直接攻击
            this.handleAttack(enemy, playerPos, delta);
        }
    }
    
    handleAttack(enemy, playerPos, delta) {
        enemy.lookAt(playerPos.x, enemy.position.y, playerPos.z);
        
        if (enemy.userData.attackCooldown <= 0) {
            this.attackPlayer(enemy);
            enemy.userData.attackCooldown = enemy.userData.attackRate;
        }
    }
    
    handleFlee(enemy, playerPos, delta) {
        // 远离玩家
        const direction = new THREE.Vector3()
            .subVectors(enemy.position, playerPos)
            .normalize();
        direction.y = 0;
        
        enemy.position.addScaledVector(direction, enemy.userData.speed * 1.5 * delta);
        enemy.lookAt(enemy.position.x + direction.x, enemy.position.y, enemy.position.z + direction.z);
    }
    
    findNearestCover(position) {
        // 简化的掩体寻找逻辑
        // 在实际游戏中，这里应该使用更复杂的算法来寻找合适的掩体
        const coverPositions = [
            new THREE.Vector3(10, 0, 0),
            new THREE.Vector3(-10, 0, 0),
            new THREE.Vector3(0, 0, 10),
            new THREE.Vector3(0, 0, -10),
            new THREE.Vector3(5, 0, -35),
            new THREE.Vector3(-5, 0, -35),
        ];
        
        let nearestCover = null;
        let minDistance = Infinity;
        
        coverPositions.forEach(coverPos => {
            const distance = position.distanceTo(coverPos);
            if (distance < minDistance) {
                minDistance = distance;
                nearestCover = { position: coverPos };
            }
        });
        
        return nearestCover;
    }

    attackPlayer(enemy) {
        this.effectSystem.createDamageEffect();
        
        const healthFill = document.getElementById('health-fill');
        if (healthFill) {
            const currentWidth = parseFloat(healthFill.style.width) || 100;
            const newWidth = Math.max(0, currentWidth - enemy.userData.damage);
            healthFill.style.width = `${newWidth}%`;
            
            if (newWidth <= 0) {
                this.gameOver();
            }
        }
    }

    gameOver() {
        alert(`游戏结束！最终得分: ${this.score}`);
        location.reload();
    }
}
