'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface GreekFlagLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function GreekFlagLogo({ width = 120, height = 80, className = '' }: GreekFlagLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  
  // Flag aspect ratio (width:height = 3:2)
  const flagHeight = height;
  const flagWidth = Math.floor(height * 1.5);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set up canvas with device pixel ratio for sharper rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = flagWidth * dpr;
    canvas.height = flagHeight * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${flagWidth}px`;
    canvas.style.height = `${flagHeight}px`;
    
    // Flag colors
    const BLUE = '#0D5EAF'; // Greek flag blue
    const WHITE = '#FFFFFF';
    
    // Flag dimensions in the canvas
    const poleWidth = Math.max(2, Math.floor(flagWidth * 0.03));
    const flagLeftX = poleWidth;
    
    // Wind and animation parameters
    const waveAmplitude = flagHeight * 0.05; // Max height of wave
    const waveLengthDivisor = 0.6; // Divisor for calculating number of waves
    const windForce = 1.2; // Wind strength (1.0 = normal)
    
    // Create simulation mesh
    const MESH_X = 20; // Horizontal points
    const MESH_Y = 10; // Vertical points
    
    // Mesh points are stored as [x, y, baseX, baseY, speed]
    const meshPoints: number[][] = [];
    
    // Initialize mesh points in a grid
    for (let y = 0; y < MESH_Y; y++) {
      for (let x = 0; x < MESH_X; x++) {
        // Base positions (original position)
        const baseX = flagLeftX + (x / (MESH_X - 1)) * flagWidth;
        const baseY = (y / (MESH_Y - 1)) * flagHeight;
        
        // Current position (will be animated)
        const posX = baseX;
        const posY = baseY;
        
        // Speed varies based on distance from pole
        const distanceFromPole = x / (MESH_X - 1);
        const speed = 0.01 + (distanceFromPole * 0.05);
        
        meshPoints.push([posX, posY, baseX, baseY, speed]);
      }
    }
    
    // Animation frame counter
    let frame = 0;
    
    // Draw flag function
    const drawFlag = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw flag pole
      ctx.fillStyle = '#333';
      ctx.fillRect(0, 0, poleWidth, flagHeight);
      
      // Update mesh points
      for (let i = 0; i < meshPoints.length; i++) {
        const point = meshPoints[i];
        
        // Calculate grid position
        const gx = i % MESH_X;
        const gy = Math.floor(i / MESH_X);
        
        // Only animate points not attached to the pole (gx > 0)
        if (gx > 0) {
          const distanceFromPole = gx / (MESH_X - 1);
          const windEffect = Math.sin(frame * point[4] + (gx * waveLengthDivisor));
          
          // More movement further from the pole
          const displacement = windEffect * waveAmplitude * distanceFromPole * windForce;
          
          // Update position with wind effect
          point[1] = point[3] + displacement;
          
          // Add more horizontal movement for realistic ripples
          const horizontalRipple = Math.sin(frame * point[4] * 0.8 + (gy * 0.4)) * distanceFromPole * 2;
          point[0] = point[2] + horizontalRipple;
        }
      }
      
      // Draw the flag stripes using the mesh for distortion
      for (let y = 0; y < MESH_Y - 1; y++) {
        for (let x = 0; x < MESH_X - 1; x++) {
          const idx = y * MESH_X + x;
          
          // Get the four corners of this grid cell
          const p1 = meshPoints[idx];
          const p2 = meshPoints[idx + 1];
          const p3 = meshPoints[idx + MESH_X];
          const p4 = meshPoints[idx + MESH_X + 1];
          
          // Normalized coordinates for this cell (0-1)
          const nx = x / (MESH_X - 1);
          const ny = y / (MESH_Y - 1);
          const cellHeight = 1 / (MESH_Y - 1);
          const cellWidth = 1 / (MESH_X - 1);
          
          // Determine color based on Greek flag pattern (9 stripes)
          // The Greek flag has 9 equal horizontal stripes, alternating blue and white
          // The canton (top-left corner) is blue with a white cross
          
          // Determine if this cell is part of a stripe (blue or white)
          const stripeIndex = Math.floor(ny * 9);
          const isWhiteStripe = stripeIndex % 2 === 1; // Odd stripes are white
          
          // Determine if this cell is in the canton (top-left)
          const inCanton = nx < 1/3 && ny < 0.5;
          
          // Determine if this cell is part of the white cross in the canton
          const inVerticalCross = nx > (1/3 - cellWidth) * 0.4 && nx < (1/3 + cellWidth) * 0.6;
          const inHorizontalCross = ny > (0.5 - cellHeight) * 0.4 && ny < (0.5 + cellHeight) * 0.6;
          const inCross = inCanton && (inVerticalCross || inHorizontalCross);
          
          // Set fill color based on position
          if (inCross) {
            ctx.fillStyle = WHITE;
          } else if (inCanton) {
            ctx.fillStyle = BLUE;
          } else {
            ctx.fillStyle = isWhiteStripe ? WHITE : BLUE;
          }
          
          // Draw the quadrilateral for this cell
          ctx.beginPath();
          ctx.moveTo(p1[0], p1[1]);
          ctx.lineTo(p2[0], p2[1]);
          ctx.lineTo(p4[0], p4[1]);
          ctx.lineTo(p3[0], p3[1]);
          ctx.closePath();
          ctx.fill();
        }
      }
      
      // Add some subtle sparkles
      if (theme === 'dark') {
        // Sparkles are more visible in dark mode
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      } else {
        // More subtle in light mode
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      }
      
      // Draw sparkles at strategic points
      const sparklePositions = [
        [0.2, 0.25, 0.6], // In the canton
        [0.7, 0.3, 0.7],  // Top right
        [0.5, 0.7, 0.5],  // Middle
        [0.8, 0.8, 0.8]   // Bottom right
      ];
      
      for (const [sparkleX, sparkleY, intensity] of sparklePositions) {
        // Find nearest mesh point
        const x = Math.floor(sparkleX * (MESH_X - 1));
        const y = Math.floor(sparkleY * (MESH_Y - 1));
        const idx = y * MESH_X + x;
        
        if (meshPoints[idx]) {
          const point = meshPoints[idx];
          const sparkleSize = 1.5 + Math.sin(frame * 0.05) * 0.5;
          const opacityPulse = (0.3 + Math.sin(frame * 0.1) * 0.2) * intensity;
          
          ctx.globalAlpha = opacityPulse;
          ctx.beginPath();
          ctx.arc(point[0], point[1], sparkleSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      }
      
      // Request next frame
      frame += 0.05;
      requestAnimationFrame(drawFlag);
    };
    
    // Start animation
    drawFlag();
    
    // Clean up on unmount
    return () => {
      // No need to cancel animation - it will stop when component unmounts
    };
  }, [flagWidth, flagHeight, theme]);
  
  return (
    <div className={`relative ${className}`} style={{ width: flagWidth, height: flagHeight }}>
      <canvas 
        ref={canvasRef}
        style={{
          width: flagWidth,
          height: flagHeight,
          transform: 'rotateY(5deg)',
          transformOrigin: 'left center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
      />
    </div>
  );
} 