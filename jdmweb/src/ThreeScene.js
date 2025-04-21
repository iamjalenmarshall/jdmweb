import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

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
    let animationFrameId;

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

    // ----- Stars -----
    const stars = []; // Store all star meshes
    const starGroup = new THREE.Group(); // Create a star group
    function addStars() {
      for (let i = 0; i < 300; i++) {  // Make it dense!
        const starGeometry = new THREE.SphereGeometry(0.05, 24, 24); // Tiny star
        const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); // White color
        const star = new THREE.Mesh(starGeometry, starMaterial);
    
        star.position.x = (Math.random() - 0.5) * 200; // Wide spread
        star.position.y = (Math.random() - 0.5) * 200;
        star.position.z = (Math.random() - 0.5) * 200;
    
        stars.push(star);
        scene.add(star);
      }
      scene.add(starGroup);
    }
    addStars();

    const nebulaTexture = new THREE.TextureLoader().load('/nebula.png');

    const nebulaGeometry = new THREE.SphereGeometry(90, 64, 64); // HUGE sphere
    const nebulaMaterial = new THREE.MeshBasicMaterial({
      map: nebulaTexture,
      side: THREE.BackSide,  // <--- Flip it inside out
      transparent: true,
      opacity: 0.5
    });

  const nebulaMesh = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
  scene.add(nebulaMesh);

    // ----- Moons / Link Icons -----
    const Icons =[];
    const IconCount = 4;
    const appIcons = [
      'Instagram_Icon1.png', //https://icon-icons.com/icon/social-media-circled-network-instagram/79487
      'App_Icon2.png',
      'App_Icon3_3.png',
      'App_Icon4.png',
    ];

    // ----- Event (Click) Listeners -----
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    //TODO !! Fix Moon sizes (WIP 04/19)
    for(let i = 0; i < IconCount; i++){
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

      const Icon = new THREE.Mesh(moonGeometry, moonMaterial);
      Icon.geometry.center(); // Important to center it
      scene.add(Icon)

        // Set angle (equally spaced)
        Icons.push({
            mesh: Icon,
            angle: (i / IconCount) * Math.PI * 2,
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

      const IconMeshes = Icons.map(Icon => Icon.mesh);
      const intersects = raycaster.intersectObjects(IconMeshes);

      if (intersects.length > 0) {
          const clickedIcon = intersects[0].object;
          const IconIndex = Icons.findIndex(Icon => Icon.mesh === clickedIcon);

          if (IconIndex !== -1) {
              const links = [
                'https://www.instagram.com/jlnmrshll/',
                'https://github.com/iamjalenmarshall',
                'https://www.youtube.com/@jlnmrshll',
                'https://www.tiktok.com/@jlnmrshll'
              ];
              window.open(links[IconIndex], '_blank');
          }
      }
  };

  window.addEventListener('click', handleMouseClick);

    // Animation
    const animate = () => {
      sphere.rotation.x += 0.0001;
      sphere.rotation.y += 0.01;

      nebulaMesh.rotation.y += 500; // Rotate nebula EVEN slower
      //Moon / App Rotations 
      Icons.forEach(Icon => {
        Icon.angle += Icon.speed;

        // Update position on XZ plane (unit circle behavior)
        Icon.mesh.position.x = Icon.radius * Math.cos(Icon.angle);
        Icon.mesh.position.y = Icon.radius * Math.sin(Icon.angle);
        Icon.mesh.position.z = 0;
        
      });

      stars.forEach(star => {
        star.position.x += (Math.random() - 0.5) * 0.001; // Tiny random movement
        star.position.y += (Math.random() - 0.5) * 0.001;
        star.position.z += (Math.random() - 0.5) * 0.001;
      });

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup on unmount
    return () => {
      window.removeEventListener('click', handleMouseClick);
      if (renderer) {
        renderer.dispose(); // Memory cleanup only, no removeChild()
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId); // <--- Cancel old animation loop!
      }
    };
  }, []);
  
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* WebGL Canvas */}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }}></div>

      {/* Floating HTML Text */}
      <div style={{
        position: 'absolute',
        top: '5%',
        right: '10%',
        color: 'white',
        fontSize: '84px',
        fontFamily: 'Arial, sans-serif',
        pointerEvents: 'none'
      }}>
       JDM WEB
      </div>
      
      <div style={{
        position: 'absolute',
        top: '13%',
        right: '17.75%',
        color: 'white',
        fontSize: '20px',
        fontFamily: 'Arial, sans-serif',
        pointerEvents: 'none'
      }}>
       1.0
      </div>
    </div>
  );
};

export default ThreeScene;
