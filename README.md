# Fishbone Diagram for Angular 13/14

This library is a typescript implementation of the [d3 fishbone](http://bl.ocks.org/uredkar/c341cb131226dc53082283b8f853be45) or [d3 fishbone](http://bl.ocks.org/bollwyvl/9239214) and the [d3-fishbone-angular](https://github.com/umitgunduz/d3-fishbone-angular) library written for angular 1. It is also updated to work with the latest [d3](https://d3js.org/) library. I'll be adding a few features to this library going forward, but at the moment, it is just a faithful implementation of the said libraries.

## Usage

You can install the package to your app using
```
npm i ngx-fishbone-diagram
```

Once installed, you can display the diagram in your component/page using the following tag
```
<ngx-fishbone-diagram [data]="data"></ngx-fishbone-diagram>
```

Here `data` is a hierarchical JSON with the following format
```
data = {
  "name": "Topic",
  "children": [
    {"name": "Child 1", "children": [{}]},
    {"name": "Child 2", "children": [{}]},
  ]
}
```

You can take a look at the [test.data.ts file](https://github.com/abishek/fishbone-diagram-angular/blob/main/src/app/test.data.ts) in the repo for the data schema.

## Inputs and Outputs

The component is intialised with a `data` input and generates a `selected` event with the node data on which the select event occured. The component watches for changes to the `data` input. So between these two we should be able to build a fully functional fishbone session.

## Planned Features

- [x] Ability add nodes dynamically
- [ ] Conduct a full Fishbone session starting from a empty canvas.
- [ ] Ability to customize colours and appearance for the nodes and links.

Please feel free to use github issues to request other features. I'll not be taking pull requests for the time being due to time constraints but I hope to be able to integrate any interesting features from the community in the future.

I'll also try to keep with angular updates from time to time :)

