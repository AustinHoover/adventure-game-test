import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GameMap, Location } from '../game/interfaces';
import './Map.css';

interface MapProps {
  gameMap: GameMap;
  locations: Location[];
  playerLocationId?: number; // Optional player location ID
}

const Map: React.FC<MapProps> = ({ gameMap, locations, playerLocationId }) => {
  const svgRef = useRef<SVGSVGElement>(null);

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
      discovered: location.discovered
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
      .attr("r", 8)
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
      .attr("stroke-width", 2);

    // Add labels to nodes
    node.append("text")
      .text((d: any) => d.name)
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
    <div className="map-container">
      <h3>Game Map: {gameMap.id}</h3>
      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-color discovered"></div>
          <span>Discovered</span>
        </div>
        <div className="legend-item">
          <div className="legend-color visible"></div>
          <span>Visible</span>
        </div>
        <div className="legend-item">
          <div className="legend-color hidden"></div>
          <span>Hidden</span>
        </div>
        {playerLocationId && (
          <div className="legend-item">
            <div className="legend-color player"></div>
            <span>Player Location</span>
          </div>
        )}
      </div>
      <svg ref={svgRef} width="600" height="400" className="map-svg"></svg>
    </div>
  );
};

export default Map; 