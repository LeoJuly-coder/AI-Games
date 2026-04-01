import * as THREE from 'three';

export class WeaponSystem {
    constructor(gameScene) {
        this.gameScene = gameScene;
        this.scene = gameScene.scene;
        this.camera = gameScene.camera;
        
        this.weapons = [
            {
                name: 'assault_rifle',
                ammo: 30,
                maxAmmo: 30,
                reserveAmmo: 90,
                fireRate: 0.1,
                reloadTime: 2,
                recoil: 0.1,
                damage: 60,
                headDamage: 100
            },
            {
                name: 'shotgun',
                ammo: 8,
                maxAmmo: 8,
                reserveAmmo: 24,
                fireRate: 0.5,
                reloadTime: 2.5,
                recoil: 0.2,
                damage: 25,
                headDamage: 75
            },
            {
                name: 'sniper',
                ammo: 5,
                maxAmmo: 5,
                reserveAmmo: 15,
                fireRate: 1,
                reloadTime: 3,
                recoil: 0.3,
                damage: 100,
                headDamage: 150
            }
        ];
        
        this.currentWeaponIndex = 0;
        this.currentWeapon = this.weapons[this.currentWeaponIndex];
        
        this.lastFireTime = 0;
        this.recoil = 0;
        this.recoilRecovery = 5;
        
        this.isReloading = false;
        this.isFiring = false;
        
        this.raycaster = new THREE.Raycaster();
        
        this.createWeapons();
        this.createCrosshair();
        this.updateAmmoDisplay();
        this.setupEventListeners();
    }

    setDependencies(playerController, enemyManager, effectSystem) {
        this.playerController = playerController;
        this.enemyManager = enemyManager;
        this.effectSystem = effectSystem;
    }

    createWeapons() {
        this.weaponModels = [];
        
        // 创建突击步枪
        const assaultRifle = new THREE.Group();
        const arBodyGeometry = new THREE.BoxGeometry(0.1, 0.15, 0.5);
        const arBodyMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const arBody = new THREE.Mesh(arBodyGeometry, arBodyMaterial);
        arBody.position.y = -0.05;
        assaultRifle.add(arBody);
        
        const arBarrelGeometry = new THREE.CylinderGeometry(0.02, 0.025, 0.3, 8);
        const arBarrelMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const arBarrel = new THREE.Mesh(arBarrelGeometry, arBarrelMaterial);
        arBarrel.rotation.x = Math.PI / 2;
        arBarrel.position.z = -0.4;
        arBarrel.position.y = -0.05;
        assaultRifle.add(arBarrel);
        
        const arMagGeometry = new THREE.BoxGeometry(0.05, 0.2, 0.08);
        const arMagMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
        const arMag = new THREE.Mesh(arMagGeometry, arMagMaterial);
        arMag.position.y = -0.2;
        arMag.position.z = 0.1;
        assaultRifle.add(arMag);
        
        const arSightGeometry = new THREE.BoxGeometry(0.02, 0.05, 0.02);
        const arSightMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        const arSight = new THREE.Mesh(arSightGeometry, arSightMaterial);
        arSight.position.y = 0.03;
        arSight.position.z = -0.1;
        assaultRifle.add(arSight);
        
        assaultRifle.position.set(0.3, -0.25, -0.5);
        this.camera.add(assaultRifle);
        this.weaponModels.push(assaultRifle);
        
        // 创建霰弹枪
        const shotgun = new THREE.Group();
        const sgBodyGeometry = new THREE.BoxGeometry(0.15, 0.2, 0.6);
        const sgBodyMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
        const sgBody = new THREE.Mesh(sgBodyGeometry, sgBodyMaterial);
        sgBody.position.y = -0.1;
        shotgun.add(sgBody);
        
        const sgBarrelGeometry = new THREE.CylinderGeometry(0.04, 0.05, 0.4, 8);
        const sgBarrelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const sgBarrel = new THREE.Mesh(sgBarrelGeometry, sgBarrelMaterial);
        sgBarrel.rotation.x = Math.PI / 2;
        sgBarrel.position.z = -0.5;
        sgBarrel.position.y = -0.1;
        shotgun.add(sgBarrel);
        
        const sgMagGeometry = new THREE.BoxGeometry(0.08, 0.25, 0.1);
        const sgMagMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
        const sgMag = new THREE.Mesh(sgMagGeometry, sgMagMaterial);
        sgMag.position.y = -0.25;
        sgMag.position.z = 0.1;
        shotgun.add(sgMag);
        
        shotgun.position.set(0.3, -0.25, -0.5);
        shotgun.visible = false;
        this.camera.add(shotgun);
        this.weaponModels.push(shotgun);
        
        // 创建狙击枪
        const sniper = new THREE.Group();
        const snBodyGeometry = new THREE.BoxGeometry(0.08, 0.12, 0.8);
        const snBodyMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const snBody = new THREE.Mesh(snBodyGeometry, snBodyMaterial);
        snBody.position.y = -0.03;
        sniper.add(snBody);
        
        const snBarrelGeometry = new THREE.CylinderGeometry(0.03, 0.035, 0.5, 8);
        const snBarrelMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const snBarrel = new THREE.Mesh(snBarrelGeometry, snBarrelMaterial);
        snBarrel.rotation.x = Math.PI / 2;
        snBarrel.position.z = -0.65;
        snBarrel.position.y = -0.03;
        sniper.add(snBarrel);
        
        const snMagGeometry = new THREE.BoxGeometry(0.06, 0.15, 0.06);
        const snMagMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const snMag = new THREE.Mesh(snMagGeometry, snMagMaterial);
        snMag.position.y = -0.15;
        snMag.position.z = 0.1;
        sniper.add(snMag);
        
        const snSightGeometry = new THREE.BoxGeometry(0.03, 0.1, 0.03);
        const snSightMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const snSight = new THREE.Mesh(snSightGeometry, snSightMaterial);
        snSight.position.y = 0.05;
        snSight.position.z = -0.2;
        sniper.add(snSight);
        
        sniper.position.set(0.3, -0.25, -0.5);
        sniper.visible = false;
        this.camera.add(sniper);
        this.weaponModels.push(sniper);
        
        this.weapon = this.weaponModels[0];
    }

    createCrosshair() {
        this.crosshair = document.getElementById('crosshair');
    }

    setupEventListeners() {
        document.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.isFiring = true;
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.isFiring = false;
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyR' && !this.isReloading && this.currentWeapon.ammo < this.currentWeapon.maxAmmo && this.currentWeapon.reserveAmmo > 0) {
                this.reload();
            }
            
            // 武器切换
            if (e.code === 'Digit1') {
                this.switchWeapon(0);
            } else if (e.code === 'Digit2') {
                this.switchWeapon(1);
            } else if (e.code === 'Digit3') {
                this.switchWeapon(2);
            }
        });
    }
    
    switchWeapon(index) {
        if (index === this.currentWeaponIndex) return;
        
        // 隐藏当前武器
        this.weaponModels[this.currentWeaponIndex].visible = false;
        
        // 显示新武器
        this.currentWeaponIndex = index;
        this.currentWeapon = this.weapons[index];
        this.weapon = this.weaponModels[index];
        this.weapon.visible = true;
        
        this.updateAmmoDisplay();
    }

    fire() {
        const now = Date.now();
        if (now - this.lastFireTime < this.currentWeapon.fireRate * 1000) return;
        if (this.currentWeapon.ammo <= 0) return;
        if (this.isReloading) return;
        
        this.lastFireTime = now;
        this.currentWeapon.ammo--;
        this.updateAmmoDisplay();
        
        this.applyRecoil();
        this.effectSystem.createMuzzleFlash(this.weapon);
        
        // 从枪口位置发射射线
        const muzzlePosition = new THREE.Vector3();
        const muzzleDirection = new THREE.Vector3();
        
        // 计算枪口世界位置
        const weaponWorldPosition = new THREE.Vector3();
        this.weapon.getWorldPosition(weaponWorldPosition);
        muzzlePosition.copy(weaponWorldPosition);
        
        // 计算枪口方向（沿武器前方）
        const weaponWorldQuaternion = new THREE.Quaternion();
        this.weapon.getWorldQuaternion(weaponWorldQuaternion);
        muzzleDirection.set(0, 0, -1).applyQuaternion(weaponWorldQuaternion);
        
        // 实现弹道下坠和穿透效果
        this.simulateBallistics(muzzlePosition, muzzleDirection);
        
        if (this.currentWeapon.ammo <= 0 && this.currentWeapon.reserveAmmo > 0) {
            this.reload();
        }
    }
    
    simulateBallistics(startPosition, direction) {
        const bulletSpeed = 1000;
        const gravity = 9.8;
        const maxDistance = 1000;
        const stepSize = 0.1;
        
        let currentPosition = startPosition.clone();
        let currentDirection = direction.clone();
        let distanceTraveled = 0;
        
        while (distanceTraveled < maxDistance) {
            // 计算下一步位置
            const step = currentDirection.clone().multiplyScalar(bulletSpeed * stepSize);
            const nextPosition = currentPosition.clone().add(step);
            
            // 应用重力
            nextPosition.y -= gravity * stepSize * stepSize * 50;
            
            // 检查碰撞
            this.raycaster.set(currentPosition, nextPosition.clone().sub(currentPosition).normalize());
            this.raycaster.far = step.length();
            
            const intersects = this.raycaster.intersectObjects([
                ...this.gameScene.colliders,
                ...this.enemyManager.enemies
            ], true);
            
            if (intersects.length > 0) {
                const hit = intersects[0];
                this.effectSystem.createBulletHole(hit);
                
                if (this.enemyManager.enemies.includes(hit.object.parent || hit.object)) {
                    const enemy = hit.object.parent || hit.object;
                    const damage = this.calculateDamage(hit);
                    this.enemyManager.hitEnemy(enemy, damage);
                    // 子弹击中敌人后停止
                    break;
                } else {
                    // 子弹穿透效果
                    const penetrationPower = this.getPenetrationPower();
                    if (penetrationPower > 0) {
                        // 减少穿透能力并继续模拟
                        currentPosition = hit.point.clone();
                        currentDirection = currentDirection.clone().multiplyScalar(0.7);
                        distanceTraveled += hit.distance;
                    } else {
                        // 穿透能力耗尽，停止模拟
                        break;
                    }
                }
            } else {
                // 没有碰撞，继续模拟
                currentPosition = nextPosition;
                distanceTraveled += step.length();
            }
        }
    }
    
    getPenetrationPower() {
        // 根据武器类型返回穿透能力
        switch (this.currentWeapon.name) {
            case 'assault_rifle':
                return 2;
            case 'shotgun':
                return 1;
            case 'sniper':
                return 3;
            default:
                return 1;
        }
    }
    
    calculateDamage(hit) {
        // 根据击中部位计算伤害
        // 检查是否击中头部
        if (hit.object.name === 'head' || hit.object.parent?.name === 'head') {
            return this.currentWeapon.headDamage; // 头部伤害
        } else {
            return this.currentWeapon.damage; // 身体伤害
        }
    }

    applyRecoil() {
        this.recoil = 0.1;
        // 随机后坐力方向，增加真实感
        const randomRecoilX = -0.1 + Math.random() * 0.05;
        const randomRecoilY = (Math.random() - 0.5) * 0.05;
        
        this.weapon.position.z = -0.55;
        this.weapon.rotation.x = randomRecoilX;
        this.weapon.rotation.y = randomRecoilY;
    }

    reload() {
        if (this.isReloading) return;
        if (this.currentWeapon.reserveAmmo <= 0) return;
        
        this.isReloading = true;
        const ammoToReload = Math.min(this.currentWeapon.maxAmmo - this.currentWeapon.ammo, this.currentWeapon.reserveAmmo);
        
        setTimeout(() => {
            this.currentWeapon.ammo += ammoToReload;
            this.currentWeapon.reserveAmmo -= ammoToReload;
            this.isReloading = false;
            this.updateAmmoDisplay();
        }, this.currentWeapon.reloadTime * 1000);
    }

    updateAmmoDisplay() {
        const ammoElement = document.getElementById('ammo');
        if (ammoElement) {
            ammoElement.textContent = `${this.currentWeapon.ammo} / ${this.currentWeapon.reserveAmmo}`;
        }
    }

    update(delta) {
        if (this.isFiring) {
            this.fire();
        }
        
        if (this.recoil > 0) {
            this.recoil -= delta * this.recoilRecovery;
            if (this.recoil <= 0) {
                this.recoil = 0;
                this.weapon.position.z = -0.5;
                this.weapon.rotation.x = 0;
                this.weapon.rotation.y = 0;
            } else {
                // 平滑恢复后坐力
                const recoilFactor = this.recoil / 0.1;
                this.weapon.position.z = -0.55 + (0.05 * (1 - recoilFactor));
                this.weapon.rotation.x *= 0.95;
                this.weapon.rotation.y *= 0.95;
            }
        }
    }
}
