import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { InputState } from '../core/Input';
import { CharacterModel } from './CharacterModel';

export class Player {
  public body: RAPIER.RigidBody;
  private collider: RAPIER.Collider;
  private controller: RAPIER.KinematicCharacterController;
  private model: CharacterModel;

  private readonly walkSpeed = 5.0;
  private readonly sprintMult = 1.7;
  private readonly jumpForce = 6.5;
  private velocity = new THREE.Vector3();
  private grounded = false;
  private facingYaw = 0;

  private coyoteTimer = 0;
  private jumpBufferTimer = 0;
  private wasGrounded = true;
  private justLanded = false;
  private justJumped = false;
  private readonly COYOTE_TIME = 0.15;
  private readonly JUMP_BUFFER = 0.15;

  constructor(
    private scene: THREE.Scene,
    private world: RAPIER.World,
    spawnPos: THREE.Vector3
  ) {
    // Visual: stylized character
    this.model = new CharacterModel();
    this.scene.add(this.model.root);

    // Physics: kinematic position-based body + capsule collider
    const bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased()
      .setTranslation(spawnPos.x, spawnPos.y, spawnPos.z);
    this.body = this.world.createRigidBody(bodyDesc);
    const colliderDesc = RAPIER.ColliderDesc.capsule(0.5, 0.5);
    this.collider = this.world.createCollider(colliderDesc, this.body);

    this.controller = this.world.createCharacterController(0.05);
    this.controller.enableAutostep(0.3, 0.15, true);
    this.controller.enableSnapToGround(0.3);
    this.controller.setApplyImpulsesToDynamicBodies(false);
  }

  get maxAnimSpeed() { return this.walkSpeed * this.sprintMult; }

  update(dt: number, input: InputState, cameraYaw: number) {
    // Desired horizontal movement relative to camera
    const moveDir = new THREE.Vector3(input.move.x, 0, input.move.z);
    if (moveDir.lengthSq() > 1) moveDir.normalize();
    moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw);

    const speed = this.walkSpeed * (input.sprint ? this.sprintMult : 1);
    this.velocity.x = moveDir.x * speed;
    this.velocity.z = moveDir.z * speed;

    // Gravity
    this.velocity.y += this.world.gravity.y * dt;

    // Ground state from previous solve
    this.grounded = this.controller.computedGrounded();
    this.justLanded = this.grounded && !this.wasGrounded && this.velocity.y <= 0;

    if (this.grounded) {
      this.coyoteTimer = this.COYOTE_TIME;
      this.velocity.y = Math.max(this.velocity.y, -2.0); // stick to ground
    } else {
      this.coyoteTimer -= dt;
    }

    // Jump buffering
    if (input.jumpHeld) this.jumpBufferTimer = this.JUMP_BUFFER;
    else this.jumpBufferTimer -= dt;

    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      this.velocity.y = this.jumpForce;
      this.jumpBufferTimer = 0;
      this.coyoteTimer = 0;
      this.justJumped = true;
    }

    // Solve movement against colliders
    const desired = new THREE.Vector3(this.velocity.x * dt, this.velocity.y * dt, this.velocity.z * dt);
    this.controller.computeColliderMovement(this.collider, desired);
    const mv = this.controller.computedMovement();

    const pos = this.body.translation();
    this.body.setNextKinematicTranslation({ x: pos.x + mv.x, y: pos.y + mv.y, z: pos.z + mv.z });

    // Cancel upward velocity if we hit a ceiling
    if (mv.y < desired.y - 1e-4 && this.velocity.y > 0) this.velocity.y = 0;

    this.wasGrounded = this.grounded;

    // --- Face travel direction ---
    const horizSpeed = Math.hypot(this.velocity.x, this.velocity.z);
    if (horizSpeed > 0.5) {
      const target = Math.atan2(this.velocity.x, this.velocity.z);
      this.facingYaw = lerpAngle(this.facingYaw, target, Math.min(1, dt * 12));
    }
    this.model.root.rotation.y = this.facingYaw;

    // Drive procedural animation
    this.model.update({
      dt,
      speed: horizSpeed,
      maxSpeed: this.maxAnimSpeed,
      grounded: this.grounded,
      vy: this.velocity.y,
    });
  }

  updateRender(_alpha: number) {
    const pos = this.body.translation();
    // Offset model so feet (-0.71 local) match capsule bottom (-1.0 local)
    this.model.root.position.set(pos.x, pos.y - 0.29, pos.z);
  }

  /** @param faceYaw  if given, snap the character (and animation) to face this yaw. */
  respawn(pos: THREE.Vector3, faceYaw?: number) {
    this.body.setNextKinematicTranslation({ x: pos.x, y: pos.y, z: pos.z });
    this.velocity.set(0, 0, 0);
    if (faceYaw !== undefined) {
      this.facingYaw = faceYaw;
      this.model.root.rotation.y = faceYaw;
    }
  }

  getPosition(): THREE.Vector3 {
    const p = this.body.translation();
    return new THREE.Vector3(p.x, p.y, p.z);
  }

  getHorizontalSpeed(): number { return Math.hypot(this.velocity.x, this.velocity.z); }
  getFacing(): number { return this.facingYaw; }
  isGrounded(): boolean { return this.grounded; }
  consumeJustLanded(): boolean { const v = this.justLanded; this.justLanded = false; return v; }
  consumeJustJumped(): boolean { const v = this.justJumped; this.justJumped = false; return v; }
  setModelVisible(v: boolean) { this.model.setVisible(v); }
}

/** Shortest-path angular interpolation. */
function lerpAngle(a: number, b: number, t: number): number {
  let diff = (b - a) % (Math.PI * 2);
  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}
