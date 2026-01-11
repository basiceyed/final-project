import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export const WalkingController = () => {
  const { camera } = useThree();
  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const moveLeft = useRef(false);
  const moveRight = useRef(false);
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const PI_2 = Math.PI / 2;

  // Movement speed
  const moveSpeed = 5;
  const lookSpeed = 0.002;

  useEffect(() => {
    // Keyboard controls
    const onKeyDown = (event) => {
      switch (event.code) {
        case "KeyW":
        case "ArrowUp":
          moveForward.current = true;
          break;
        case "KeyS":
        case "ArrowDown":
          moveBackward.current = true;
          break;
        case "KeyA":
        case "ArrowLeft":
          moveLeft.current = true;
          break;
        case "KeyD":
        case "ArrowRight":
          moveRight.current = true;
          break;
      }
    };

    const onKeyUp = (event) => {
      switch (event.code) {
        case "KeyW":
        case "ArrowUp":
          moveForward.current = false;
          break;
        case "KeyS":
        case "ArrowDown":
          moveBackward.current = false;
          break;
        case "KeyA":
        case "ArrowLeft":
          moveLeft.current = false;
          break;
        case "KeyD":
        case "ArrowRight":
          moveRight.current = false;
          break;
      }
    };

    // Pointer lock for mouse look
    const onPointerLockChange = () => {
      setIsPointerLocked(
        document.pointerLockElement === document.body ||
        document.pointerLockElement === document.querySelector("canvas")
      );
    };

    const onPointerLockError = () => {
      console.error("Pointer lock error");
    };

    const requestPointerLock = () => {
      const canvas = document.querySelector("canvas");
      if (canvas) {
        canvas.requestPointerLock =
          canvas.requestPointerLock ||
          canvas.mozRequestPointerLock ||
          canvas.webkitRequestPointerLock;
        canvas.requestPointerLock();
      }
    };

    // Click to lock pointer
    const onClick = (event) => {
      // Don't lock if clicking on UI elements (chat button, etc)
      if (event.target.closest('.chat-component') || event.target.closest('.chat-box')) {
        return;
      }
      
      if (!isPointerLocked) {
        requestPointerLock();
      }
    };

    // Set initial camera position (at teacher's eye level)
    // Classroom floor is at y=-8, teacher at y=-7.95 with scale 7x
    // Teacher is scaled 7x, so if normal human eye level is ~1.6 units, at 7x scale that's ~11.2 units
    // Eye level = -7.95 + (1.6 * 7) = approximately -2.5 to -3.5 range
    camera.position.set(0, -3.0, 0);

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("click", onClick, true);
    document.addEventListener("pointerlockchange", onPointerLockChange);
    document.addEventListener("pointerlockerror", onPointerLockError);
    document.addEventListener("mozpointerlockchange", onPointerLockChange);
    document.addEventListener("webkitpointerlockchange", onPointerLockChange);

    // Mouse movement for looking around
    const onMouseMove = (event) => {
      if (!isPointerLocked) return;

      const movementX =
        event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      const movementY =
        event.movementY || event.mozMovementY || event.webkitMovementY || 0;

      euler.current.setFromQuaternion(camera.quaternion);

      euler.current.y -= movementX * lookSpeed;
      euler.current.x -= movementY * lookSpeed;

      euler.current.x = Math.max(-PI_2, Math.min(PI_2, euler.current.x));

      camera.quaternion.setFromEuler(euler.current);
    };

    document.addEventListener("mousemove", onMouseMove);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("click", onClick);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      document.removeEventListener("pointerlockerror", onPointerLockError);
      document.removeEventListener("mozpointerlockchange", onPointerLockChange);
      document.removeEventListener(
        "webkitpointerlockchange",
        onPointerLockChange
      );
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [camera, isPointerLocked]);

  useFrame((state, delta) => {
    if (!isPointerLocked) return;

    // Move camera relative to its current rotation
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3(1, 0, 0);
    right.applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    const moveX = (moveRight.current ? 1 : 0) - (moveLeft.current ? 1 : 0);
    const moveZ = (moveForward.current ? 1 : 0) - (moveBackward.current ? 1 : 0);

    camera.position.addScaledVector(forward, moveZ * moveSpeed * delta);
    camera.position.addScaledVector(right, moveX * moveSpeed * delta);

    // Keep camera at teacher's eye level (teacher scaled 7x, eye level approximately -3.0)
    camera.position.y = -3.0;
  });

  return null;
};
