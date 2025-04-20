import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { metalness } from 'three/tsl';

// App Icon Shape (Look to clean up position)
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

    // ----- Scene Set Up -----
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

    // ----- Earth / Middle object -----
    const geometry = new THREE.SphereGeometry(1,32,32);
    const texture = new THREE.TextureLoader().load('/earthmap1k.jpg');     // Image from https://planetpixelemporium.com/earth.html
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // ----- Moons / Link Icons -----
    const moons =[];
    const moonCount = 4;
    const appIcons = [
      'Instagram_Icon1.png',
      'App_Icon2.png',
      'App_Icon3_3.png',
      'App_Icon4.png',
    ];

    // ----- Event (Click) Listeners -----
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    //TODO !! Fix Moon sizes (WIP 04/19)
    for(let i = 0; i < moonCount; i++){
      const IconTexture = new THREE.TextureLoader().load(appIcons[i]);
      const roundedSquare = createRoundedSquare(1, 1, 0.2);
      const moonGeometry = new THREE.ExtrudeGeometry(roundedSquare, {
        depth: 0.01,
        bevelEnabled: true,
        bevelThickness: 0.001, // super thin
        bevelSize: 0.001,
        bevelSegments: 2
      });


      const moonMaterial = new THREE.MeshBasicMaterial({ 
        map: IconTexture,
        roughness: 0.5,
        metalness: 0.5
      });

      const moon = new THREE.Mesh(moonGeometry, moonMaterial);
      moon.geometry.center(); // Important to center it
      scene.add(moon)

        // Set angle (equally spaced)
        moons.push({
            mesh: moon,
            angle: (i / moonCount) * Math.PI * 2,
            radius: 2.25, // Orbit Controller!
            speed: 0.002
        });
    }

    const handleMouseClick = (event) => {
      // Normalize mouse coordinates
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Cast the ray
      raycaster.setFromCamera(mouse, camera);

      const moonMeshes = moons.map(moon => moon.mesh);
      const intersects = raycaster.intersectObjects(moonMeshes);

      if (intersects.length > 0) {
          const clickedMoon = intersects[0].object;
          const moonIndex = moons.findIndex(moon => moon.mesh === clickedMoon);

          if (moonIndex !== -1) {
              const links = [
                'https://www.instagram.com/jlnmrshll/',
                'https://github.com/iamjalenmarshall',
                'https://www.youtube.com/@jlnmrshll',
                'https://www.tiktok.com/@jlnmrshll'
              ];
              window.open(links[moonIndex], '_blank');
          }
      }
  };

  window.addEventListener('click', handleMouseClick);

    // Animation
    const animate = () => {
        sphere.rotation.x += 0.0001;
        sphere.rotation.y += 0.01;

      //Moon / App Rotations 
      moons.forEach(moon => {
        moon.angle += moon.speed;

        // Update position on XZ plane (unit circle behavior)
        moon.mesh.position.x = moon.radius * Math.cos(moon.angle);
        moon.mesh.position.y = moon.radius * Math.sin(moon.angle);
        moon.mesh.position.z = 0;
        
      });

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Cleanup on unmount
    return () => {
      window.removeEventListener('click', handleMouseClick);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef}></div>;
};

export default ThreeScene;
