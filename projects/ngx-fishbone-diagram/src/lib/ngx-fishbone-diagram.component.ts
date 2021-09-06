import { Component, OnInit, Input } from '@angular/core';

// D3
import * as d3 from 'd3';
import { forceCollide, forceLink, forceManyBody, forceSimulation } from 'd3-force';
import { scaleLog } from 'd3-scale';

@Component({
  selector: 'ngx-fishbone-diagram',
  templateUrl: './ngx-fishbone-diagram.component.html',
  styleUrls: ['./ngx-fishbone-diagram.component.css']
})
export class NgxFishboneDiagramComponent implements OnInit {

  @Input()
  data: any;

  linkScale = scaleLog().domain([1, 5]).range([60, 30]);
  svg: any;
  force: any;
  root: any;
  node: any;
  link: any;
  nodeIdx = 0;

  margin = 50;

  nodes = new Array<any>();
  links = new Array<any>();
  width = 1280;
  height = 600;

  constructor() { }

  ngOnInit(): void {

    /* TODO: A more angular way to do this is to use a ViewChild. */
    this.svg = d3.select("#d3Container")
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .call(this.defaultArrow);

    this.buildNodes(this.data);
    /* setup the nodes */
    this.node = this.svg.selectAll(".node")
      .data(this.nodes);

    this.node.enter()
      .append("g")
      .attr("class", (d: any) => { return d.root ? "node root" : "node"; })
      .on("click", (d: any, i: any) => { this.nodeClicked(d, i); })
      .append("text");

    /* find all text nodes and add the actual text to it. */
    d3.selectAll("text")
      .attr("class", (d: any) => "label-" + d.depth)
      .attr("text-anchor", (d: any) => { return !d.depth ? "start" : d.horizontal ? "end" : "middle"; })
      .attr("dy", (d: any) => { return d.horizontal ? ".35em" : d.region === 1 ? "1em" : "-0.2em"; })
      .text((d: any) => { return d.name; });

    this.node.exit().remove();

    /* setup the links */
    this.link = this.svg.selectAll('.link')
      .data(this.links);
    this.link.enter()
      .append('line')
      .attr("class", (d: any) => { return "link link-" + d.depth; })
      .attr("marker-end", (d: any) => { return d.arrow ? "url(#arrow)" : null; });
    this.link.exit()
      .remove();

    this.root = d3.select(".root").node();

    this.force = forceSimulation(this.nodes)
      .force("charge", forceManyBody().strength(-20))
      .force("collision", forceCollide(10))
      .force('link', forceLink(this.links))
      .on("tick", () => this.tick());
  }

  buildNodes(node: any) {
    this.nodes.push(node);

    var cx = 0;

    var between = [node, node.connector],
      nodeLinks = [{
        source: node,
        target: node.connector,
        arrow: true,
        depth: node.depth || 0
      }],
      prev: any,
      childLinkCount;

    if (!node.parent) {
      this.nodes.push(prev = { tail: true });
      between = [prev, node];
      nodeLinks[0].source = prev;
      nodeLinks[0].target = node;
      node.horizontal = true;
      node.vertical = false;
      node.depth = 0;
      node.root = true;
      node.totalLinks = [];
    } else {
      node.connector.maxChildIdx = 0;
      node.connector.totalLinks = [];
    }

    node.linkCount = 1;

    (node.children || []).forEach((child: any, idx: number) => {
      child.parent = node;
      child.depth = (node.depth || 0) + 1;
      child.childIdx = idx;
      child.region = node.region ? node.region : (idx & 1 ? 1 : -1);
      child.horizontal = !node.horizontal;
      child.vertical = !node.vertical;

      if (node.root && prev && !prev.tail) {
        this.nodes.push(child.connector = {
          between: between,
          childIdx: prev.childIdx
        });
        prev = null;
      } else {
        this.nodes.push(prev = child.connector = { between: between, childIdx: cx++ });
      }

      nodeLinks.push({
        source: child,
        target: child.connector,
        depth: child.depth,
        arrow: true,
      });

      /* recurse capturing number of links created */
      childLinkCount = this.buildNodes(child);
      node.linkCount += childLinkCount;
      between[1].totalLinks.push(childLinkCount);
    });

    between[1].maxChildIdx = cx;

    this.links.unshift(...nodeLinks);

    /* the number of links created byt this node and its children...
       TODO: use `linkCount` and/instead of `childIdx` for spacing */
    return node.linkCount;

  }

  tick() {

    let k = this.force.alpha() * 6;
    this.root = d3.select(".root").node();
    this.nodes.forEach((n: any) => this.calculateXY(n, k));

    d3.selectAll('.node').attr("transform", function (d: any, i: number) {
      return "translate(" + d.x + "," + d.y + ")";
    });

    d3.selectAll('.link')
      .attr("x1", (d: any) => { if (d.source) return d.source.x; })
      .attr("x2", (d: any) => { if (d.target) return d.target.x; })
      .attr("y1", (d: any) => { if (d.source) return d.source.y; })
      .attr("y2", (d: any) => { if (d.target) return d.target.y; });
  }

  calculateXY(d: any, k: number) {
    this.root = d3.select('.root').node();
    /* handle the middle... could probably store the root width... */
    if (d.root) { d.x = this.width - (this.margin + this.root.getBBox().width); }
    if (d.tail) { d.x = this.margin; d.y = this.height / 2; }

    /* put the first-generation items at the top and bottom */
    if (d.depth === 1) {
      d.y = d.region === -1 ? this.margin : (this.height - this.margin);
      d.x -= 10 * k;
    }

    /* vertically-oriented tend towards the top and bottom of the page */
    if (d.vertical) { d.y += k * d.region; }

    /* everything tends to the left */
    if (d.depth) { d.x -= k; }

    /* position synthetic nodes at evently-spaced intervals...
       TODO: do something based on the calculated size of each branch
       since we don't have individual links anymore */
    let a, b: any;
    if (d.between) {
      a = d.between[0];
      b = d.between[1];

      d.x = b.x - (1 + d.childIdx) * (b.x - a.x) / (b.maxChildIdx + 1);
      d.y = b.y - (1 + d.childIdx) * (b.y - a.y) / (b.maxChildIdx + 1);
    }
  }

  defaultArrow(svg: any) {
    /* creates an svg:defs and marker with an arrow if needed...
       really just an example, as they aren't very flexible */
    var defs = svg.selectAll("defs").data([1]);

    defs.enter()
      .append("defs");

    /* create the arrows */
    svg.selectAll("marker#arrow")
      .data([1])
      .enter()
      .append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 10)
      .attr("refY", 0)
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5");
  }

  linkDistance(d: any) {
    const linkScale = scaleLog().domain([1, 5]).range([60, 30]);
    return (d.target.maxChildIdx + 1) * linkScale(d.depth + 1);
  }

  nodeClicked(d: any, i: any) {
    console.log({ d });
    console.log({ i });
  }
}
