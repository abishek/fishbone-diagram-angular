import { Component, OnInit, Input, SimpleChanges, OnChanges, Output, EventEmitter } from '@angular/core';

// D3
import * as d3 from 'd3';
import { forceCollide, forceLink, forceManyBody, forceSimulation } from 'd3-force';
import { scaleLog } from 'd3-scale';

import * as uuid from "uuid";
import * as d3SvgToPng from 'd3-svg-to-png';
import { NgxFishboneDiagramService } from './ngx-fishbone-diagram.service';

@Component({
  selector: 'ngx-fishbone-diagram',
  templateUrl: './ngx-fishbone-diagram.component.html',
  styleUrls: ['./ngx-fishbone-diagram.component.css']
})
export class NgxFishboneDiagramComponent implements OnInit, OnChanges {

  @Input()
  data: any;

  @Input()
  showDowloadButton: boolean = false;

  @Input()
  btnClass = 'downloadButton';

  @Input()
  btnText = 'Download PNG';

  @Output()
  selected = new EventEmitter<string>();

  svg: any;
  force: any;
  root: any;
  node: any;
  link: any;
  nodeIdx = 0;

  margin = 100;

  nodes = new Array<any>();
  links = new Array<any>();
  width = 1280;
  height = 600;

  constructor(
    private svc: NgxFishboneDiagramService
  ) {
    this.svc.restartRequest$.subscribe((req: boolean) => {
      if (req) {
        this.restart();
      }
    });
  }

  ngOnInit(): void {
    this.force = forceSimulation(this.nodes)
      .force("charge", forceManyBody().strength(-10))
      .force("collision", forceCollide(15))
      .force('link', forceLink(this.links).distance(this.linkDistance))
      .on("end", () => this.simulationDone())
      .on("tick", () => this.tick());
  }

  ngOnChanges(changes: SimpleChanges) {
    // check if "data" input has changed
    if (changes.data) {
      if (!this.svg) {
        /* TODO: A more angular way to do this is to use a ViewChild. */
        this.svg = d3.select("#d3Container")
          .append('svg')
          .attr('width', this.width)
          .attr('height', this.height)
          .call(this.defaultArrow);
      }
      this.nodes = [];
      this.links = [];
      if (changes.data.currentValue === null) {
        this.clear();
      } else {
        this.buildNodes(changes.data.currentValue);
        this.restart();
      }
    }
  }

  clear() {
    this.svg.remove();
    this.node.remove();
    this.link.remove();
    this.root.remove();
    this.nodes = [];
    this.links = []; 
    this.force.nodes(this.nodes);
  }

  restart() {
    this.setupNodes();
    if (this.force) {
      this.force.stop(); // this is just in case. ideally, the force system either doesn't exist here or is already stopped.
      this.force.nodes(this.nodes, (d: any) => { return d.uuid; });
      this.force.force('link', forceLink(this.links).distance(this.linkDistance));
      this.force.alpha(1).restart();
    }
  }

  setupNodes() {
    /* setup the nodes */
    this.node = this.svg.selectAll(".node")
      .data(this.nodes, (d: any) => { return d.uuid; });

    this.node.enter()
      .append("g")
      .attr("class", (d: any) => { return d.root ? "node root" : "node"; })
      .on("click", (d: any, i: any) => { this.nodeClicked(d, i); })
      .append("text");

    /* find all text nodes and add the actual text to it. */
    this.svg.selectAll("text")
      .attr("class", (d: any) => "label-" + d.depth)
      .attr("text-anchor", (d: any) => { return !d.depth ? "start" : d.horizontal ? "end" : "middle"; })
      .attr("dy", (d: any) => { return d.horizontal ? ".35em" : d.region === 1 ? "1em" : "-0.2em"; })
      .text((d: any) => { return d.name; });

    this.svg.selectAll("text")
      .call(this.wrap, 100);


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
  }

  /**
   *  buildNodes is a function to rebuild the node list and pad all the nodes with layout directives.
   *  For the layout and forces to work properly, we use a variety of node properties like horizontal,
   *  vertical, region, depth, tail among others.
   * */
  buildNodes(node: any) {
    /* don't add a node that already exists in the list of nodes. */
    const idx = this.nodes.findIndex((val: any) => { return val.uuid === node.uuid; });
    if (idx === -1) {
      this.nodes.push(node);
    } 
    var cx = 0;

    let between = [node, node.connector];
    let nodeLinks = [{
      source: node,
      target: node.connector,
      arrow: true,
      depth: node.depth || 0
    }];
    let prev: any;
    let childLinkCount;

    if (!node.parent) {
      /* don't add a tail, if one already exists in the list. */
      const tailIdx = this.nodes.findIndex((val: any) => { return val.tail; });
      if (tailIdx === -1) {
        this.nodes.push(prev = { tail: true, uuid: uuid.v4() });
      } else {
        prev = this.nodes[tailIdx];
      }
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
          childIdx: prev.childIdx,
          uuid: uuid.v4()
        });
        prev = null;
      } else {
        this.nodes.push(prev = child.connector = { between: between, childIdx: cx++, uuid: uuid.v4() });
      }
      nodeLinks.push({
        source: child,
        target: child.connector,
        depth: child.depth,
        arrow: true
      });

      /* recurse capturing number of links created */
      childLinkCount = this.buildNodes(child);
      node.linkCount += childLinkCount;
      between[1].totalLinks.push(childLinkCount);
    });

    between[1].maxChildIdx = cx;

    nodeLinks.forEach((link: any) => {
      let lidx = this.links.findIndex((val) => {
        return val.source.uuid === link.source.uuid && val.target.uuid === link.target.uuid;
      });
      if (lidx === -1) {
        this.links.push(link);
      }
    });
    //this.links.unshift(...nodeLinks);

    /* the number of links created byt this node and its children...
       TODO: use `linkCount` and/instead of `childIdx` for spacing */
    return node.linkCount;

  }

  /**
   * tick is the actual force layout method. Force is a simulation that happens in
   * steps. At each step, a `tick` event is generated. We connect the event to this
   * method. In this method, we compute the locations of each node based on the forces
   * and position them accordingly.
   * */
  tick() {
    let k = this.force.alpha() * 0.8;
    this.nodes.forEach((n: any) => this.calculateXY(n, k));

    d3.selectAll('.node').attr("transform", function (d: any) {
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
    if (!this.root) {
      return;
    } 
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

  linkDistance(l: any) {
    const linkScale = scaleLog().domain([1, 5]).range([70, 10]);
    return (l.target.maxChildIdx + 1) * linkScale(l.depth + 1);
  }

  nodeClicked(d: any, i: any) {
    if (this.force) {
      this.force.stop();
    }
    this.selected.emit(i.uuid);
  }

  downloadImage() {
    d3SvgToPng.default('svg', 'fishboneDiagram', { download: true, format: 'png' });
  }

  simulationDone() {
    console.info("layout complete.");
    console.log(this.nodes.length + ' nodes and ' + this.links.length + ' links');
  }

  /*
   * text wrap function for use with SVG.
   * https://bl.ocks.org/mbostock/7555321
   */
  wrap(selectionList: any, width: number) {

    selectionList.each(function(selection: any, idx: number, selList: any) {
      let text = selection.name;
      let domNode = d3.select(selList[idx]);
      let dy = parseFloat(domNode.attr('dy'));
      let y = domNode.attr('y');
      let words: Array<string> = [];
      if(text) {
        words = text.split(/\s+/).reverse();
      }
      let word: string | undefined;
      let line: Array<string> = [];
      let lineNumber = 0;
      // let lineHeight = calculatePosition(selection.depth, selection.region, lineNumber);
      let tspan = domNode.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", `${dy}em`);
      while(word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        let tspanNode = tspan.node();
        let t = line.join(" ");
        if (tspanNode && tspanNode.getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          let _dy = calculatePosition(selection.depth, selection.region, ++lineNumber);
          tspan = domNode.append("tspan").attr("x", 0).attr("y", y).attr("dy", `${_dy}em`).text(word);
        }
      }
    });
  }
}

function calculatePosition(depth: number, region:  number, lineNumber: number) {
  // at depth 1, for the top half, increment by one lineNumber;
  // let lh = 1;

  // console.log(`calculateLineHeight(depth: ${depth}, region: ${region}, lineNumber: ${lineNumber}) = ${lh}`);
  return 1;
}
