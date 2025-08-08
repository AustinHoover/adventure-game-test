import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { GameMap, Location } from '../game/interface/map-interfaces';
import { CharacterRegistryManager } from '../game/interface/character-interfaces';
import './GameMapVisualizer.css';

interface MapProps {
  gameMap: GameMap;
  locations: Location[];
  playerLocationId?: number; // Optional player location ID
  onLocationClick?: (locationId: number) => void; // Callback for when a location is clicked
}

const GameMapVisualizer: React.FC<MapProps> = ({ gameMap, locations, playerLocationId, onLocationClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Add keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!playerLocationId || !onLocationClick) return;

    // Find the player's current location
    const currentLocation = locations.find(loc => loc.id === playerLocationId);
    if (!currentLocation) return;

    let targetLocationId: number | undefined;
    let isMovementKey = false;

    switch (event.key.toLowerCase()) {
      case 'w':
        targetLocationId = currentLocation.north;
        isMovementKey = true;
        break;
      case 's':
        targetLocationId = currentLocation.south;
        isMovementKey = true;
        break;
      case 'a':
        targetLocationId = currentLocation.west;
        isMovementKey = true;
        break;
      case 'd':
        targetLocationId = currentLocation.east;
        isMovementKey = true;
        break;
      default:
        return; // Not a movement key, ignore
    }

    // Prevent default behavior for movement keys
    if (isMovementKey) {
      event.preventDefault();
    }

    // If there's a valid target location, trigger the movement
    if (targetLocationId !== undefined) {
      onLocationClick(targetLocationId);
    } else if (isMovementKey) {
      // Optional: Add feedback when movement is not possible
      console.log(`Cannot move ${event.key.toUpperCase()} - no path in that direction`);
    }
  };

  useEffect(() => {
    if (!svgRef.current || locations.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);
    const width = 600;
    const height = 400;

    // Create zoom behavior for panning
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    // Apply zoom to SVG
    svg.call(zoom as any);

    // Create a group to hold all content for zooming
    const g = svg.append("g");

    // Create nodes from locations
    const nodes: any[] = locations.map(location => ({
      id: location.id,
      name: location.name,
      type: location.type,
      visible: location.visible,
      discovered: location.discovered,
      exit: location.exit
    }));

    // Create links from location connections
    const links: { source: number; target: number }[] = [];
    const directionalConstraints: { source: number; target: number; direction: string }[] = [];
    
    locations.forEach(location => {
      if (location.north) {
        links.push({ source: location.id, target: location.north });
        directionalConstraints.push({ source: location.id, target: location.north, direction: 'north' });
      }
      if (location.east) {
        links.push({ source: location.id, target: location.east });
        directionalConstraints.push({ source: location.id, target: location.east, direction: 'east' });
      }
      if (location.south) {
        links.push({ source: location.id, target: location.south });
        directionalConstraints.push({ source: location.id, target: location.south, direction: 'south' });
      }
      if (location.west) {
        links.push({ source: location.id, target: location.west });
        directionalConstraints.push({ source: location.id, target: location.west, direction: 'west' });
      }
    });

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX().strength(0.1))
      .force("y", d3.forceY().strength(0.1))
      .force("direction", () => {
        directionalConstraints.forEach(constraint => {
          const source = nodes.find(n => n.id === constraint.source);
          const target = nodes.find(n => n.id === constraint.target);
          
          if (source && target) {
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            
            const strength = 0.8; // Much stronger force
            
            switch (constraint.direction) {
              case 'north':
                // Target should be directly above source (same x, negative y)
                if (Math.abs(dx) > 5) {
                  // Force horizontal alignment
                  const xForce = strength * dx * 0.5;
                  target.x -= xForce;
                  source.x += xForce;
                }
                if (dy > -40) {
                  // Force vertical separation (target above source)
                  const yForce = strength * 2;
                  target.y -= yForce;
                  source.y += yForce;
                }
                break;
              case 'east':
                // Target should be directly to the right of source (same y, positive x)
                if (Math.abs(dy) > 5) {
                  // Force vertical alignment
                  const yForce = strength * dy * 0.5;
                  target.y -= yForce;
                  source.y += yForce;
                }
                if (dx < 40) {
                  // Force horizontal separation (target to the right of source)
                  const xForce = strength * 2;
                  target.x += xForce;
                  source.x -= xForce;
                }
                break;
              case 'south':
                // Target should be directly below source (same x, positive y)
                if (Math.abs(dx) > 5) {
                  // Force horizontal alignment
                  const xForce = strength * dx * 0.5;
                  target.x -= xForce;
                  source.x += xForce;
                }
                if (dy < 40) {
                  // Force vertical separation (target below source)
                  const yForce = strength * 2;
                  target.y += yForce;
                  source.y -= yForce;
                }
                break;
              case 'west':
                // Target should be directly to the left of source (same y, negative x)
                if (Math.abs(dy) > 5) {
                  // Force vertical alignment
                  const yForce = strength * dy * 0.5;
                  target.y -= yForce;
                  source.y += yForce;
                }
                if (dx > -40) {
                  // Force horizontal separation (target to the left of source)
                  const xForce = strength * 2;
                  target.x -= xForce;
                  source.x += xForce;
                }
                break;
            }
          }
        });
      });

    // Create links
    const link = g.append("g")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2);

    // Create nodes
    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .enter().append("g");

    // Add circles to nodes
    node.append("circle")
      .attr("r", 12)
      .attr("fill", (d: any) => {
        // Check if this is the player's location first
        if (playerLocationId && d.id === playerLocationId) {
          return "#ff0000"; // Red for player location
        }
        if (!d.visible) return "#ccc";
        if (!d.discovered) return "#ffd700";
        return "#4CAF50";
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("click", (event, d: any) => {
        if (onLocationClick) {
          onLocationClick(d.id);
        }
      });

    // Add door icon for exit nodes
    node.append("text")
      .text((d: any) => {
        // Show door icon (🚪) for all exit nodes
        if (d.exit) {
          return "🚪";
        }
        return "";
      })
      .attr("x", 0)
      .attr("y", 4)
      .attr("font-size", "14px")
      .attr("text-anchor", "middle")
      .attr("fill", "#000000") // Black door
      .attr("pointer-events", "none"); // Prevent icon from interfering with clicks

    // Add character icon for locations with characters (excluding player)
    node.append("text")
      .text((d: any) => {
        // Get characters at this location (excluding the player)
        const registryManager = CharacterRegistryManager.getInstance();
        const charactersAtLocation = registryManager.getAllCharacters().filter(char => 
          char.location === d.id && 
          char.mapId === gameMap.id
        );
        
        // Show character icon (👤) if there are non-player characters at this location
        if (charactersAtLocation.length > 0) {
          return "👤";
        }
        return "";
      })
      .attr("x", 0)
      .attr("y", 0) // Center the character icon
      .attr("font-size", "12px")
      .attr("text-anchor", "middle")
      .attr("fill", "#000000") // Black character icon
      .attr("pointer-events", "none"); // Prevent icon from interfering with clicks

    // Add labels to nodes (only if showName is true)
    node.append("text")
      .text((d: any) => d.showName ? d.name : "")
      .attr("x", 12)
      .attr("y", 4)
      .attr("font-size", "12px")
      .attr("fill", "#333");

    // Run simulation for 1000 ticks to get nodes mostly in place before displaying
    for (let i = 0; i < 1000; i++) {
      simulation.tick();
    }

    // Set initial positions after pre-calculation
    link
      .attr("x1", (d: any) => d.source.x)
      .attr("y1", (d: any) => d.source.y)
      .attr("x2", (d: any) => d.target.x)
      .attr("y2", (d: any) => d.target.y);

    node
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`);

    // Now start the continuous simulation for gradual adjustments
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [gameMap, locations, playerLocationId]);

  return (
    <div 
      className="map-container"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onFocus={() => console.log('Map focused - keyboard navigation active')}
      onBlur={() => console.log('Map unfocused - keyboard navigation inactive')}
      style={{ outline: 'none' }}
    >
      <h3>Game Map: {gameMap.id}</h3>
      <svg 
        ref={svgRef} 
        width="600" 
        height="400" 
        className="map-svg"
      ></svg>
      <div style={{ 
        textAlign: 'center', 
        marginTop: '0.5rem', 
        fontSize: '0.8rem', 
        color: 'rgba(255, 255, 255, 0.7)' 
      }}>
        Click to focus, then use W/A/S/D keys to move
      </div>
    </div>
  );
};

export default GameMapVisualizer; 