import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

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

    // Image from https://planetpixelemporium.com/earth.html
    const texture = new THREE.TextureLoader().load('/earthmap1k.jpg');
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    //Moons / Links Rotating
    const moons =[];
    const moonCount = 4;

    for(let i = 0; i < moonCount; i++){
        const moonGeometry = new THREE.SphereGeometry(0.5, 16, 8);
        const moonMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
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
