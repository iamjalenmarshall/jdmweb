import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { metalness } from 'three/tsl';


function createRoundedSquare(width, height, radius) {
  const shape = new THREE.Shape();

  shape.moveTo(radius, 0);
  shape.lineTo(width - radius, 0);
  shape.quadraticCurveTo(width, 0, width, radius);
  shape.lineTo(width, height - radius);
  shape.quadraticCurveTo(width, height, width - radius, height);
  shape.lineTo(radius, height);
  shape.quadraticCurveTo(0, height, 0, height - radius);
  shape.lineTo(0, radius);
  shape.quadraticCurveTo(0, 0, radius, 0);

  return shape;
}

const ThreeScene = () => {
  const mountRef = useRef(null);

  useEffect(() => {

    // Scene
    const scene = new THREE.Scene();

    // Camera of website
    const camera = new THREE.PerspectiveCamera(
      110,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.z = 2;

    // Renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Earth
    const geometry = new THREE.SphereGeometry(1,32,32);
    const texture = new THREE.TextureLoader().load('/earthmap1k.jpg');     // Image from https://planetpixelemporium.com/earth.html
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    //Moons / Links Rotating
    const moons =[];
    const moonCount = 4;


    //TODO !! Fix Moon sizes
    for(let i = 0; i < moonCount; i++){

      const roundedSquare = createRoundedSquare(1, 1, 0.2);
      const moonGeometry = new THREE.ExtrudeGeometry(roundedSquare, {
        depth: 0.01,
        bevelEnabled: true,
        bevelThickness: 0.02, // super thin
        bevelSize: 0.02,
        bevelSegments: 2
      });


      const moonMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffcc00,
        roughness: 0.5,
        metalness: 0.5
      });

      const moon = new THREE.Mesh(moonGeometry, moonMaterial);
      moon.geometry.center(); // Important to center it
      scene.add(moon)

        // Set initial angle (equally spaced)
        moons.push({
            mesh: moon,
            angle: (i / moonCount) * Math.PI * 2,
            radius: 2 + i * 0.5, // each moon a bit further out
            speed: 0.001 // optional variation -> + i * 0.005 
        });
    }

    // Animation
    const animate = () => {
        sphere.rotation.x += 0.0001;
        sphere.rotation.y += 0.01;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);


      //Moon / App Rotations 
      moons.forEach(moon => {
        moon.angle += moon.speed;

        // Update position on XZ plane (unit circle behavior)
        moon.mesh.position.x = moon.radius * Math.cos(moon.angle);
        moon.mesh.position.y = moon.radius * Math.sin(moon.angle);
        moon.mesh.position.z = 0;
        
      });
    };

    animate();

    // Cleanup on unmount
    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef}></div>;
};

export default ThreeScene;
