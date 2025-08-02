import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GameMap, Location } from '../game/interfaces';
import './Map.css';

interface MapProps {
  gameMap: GameMap;
  locations: Location[];
}

const Map: React.FC<MapProps> = ({ gameMap, locations }) => {
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
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
              const strength = 0.3;
              const force = strength * (distance - 60) / distance;
              
              switch (constraint.direction) {
                case 'north':
                  // Target should be above source (negative y)
                  if (dy > -20) {
                    target.y -= force * 2;
                    source.y += force * 2;
                  }
                  break;
                case 'east':
                  // Target should be to the right of source (positive x)
                  if (dx < 20) {
                    target.x += force * 2;
                    source.x -= force * 2;
                  }
                  break;
                case 'south':
                  // Target should be below source (positive y)
                  if (dy < 20) {
                    target.y += force * 2;
                    source.y -= force * 2;
                  }
                  break;
                case 'west':
                  // Target should be to the left of source (negative x)
                  if (dx > -20) {
                    target.x -= force * 2;
                    source.x += force * 2;
                  }
                  break;
              }
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

    // Update positions on simulation tick
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
  }, [gameMap, locations]);

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
      </div>
      <svg ref={svgRef} width="600" height="400" className="map-svg"></svg>
    </div>
  );
};

export default Map; 