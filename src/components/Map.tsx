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
    locations.forEach(location => {
      if (location.north) links.push({ source: location.id, target: location.north });
      if (location.east) links.push({ source: location.id, target: location.east });
      if (location.south) links.push({ source: location.id, target: location.south });
      if (location.west) links.push({ source: location.id, target: location.west });
    });

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Create links
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2);

    // Create nodes
    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

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

    // Drag functions
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

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