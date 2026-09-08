# Fishbone Diagram for Angular

This library is a typescript implementation of the [d3.fishbone.js]() and the [angular-fishbone]() library written for angular 1. It is also updated to work with the latest [d3]() library. I'll be adding a few features to this library going forward, but at the moment, it is just a faithful implementation of the said libraries.

## Inputs and Outputs

The component is intialised with a `data` input and generates a `selected` event with the node data on which the select event occured. The component watches for changes to the `data` input. So between these two we should be able to build a fully functional fishbone session.

## Published compatibility releases

| Version | Angular support | npm tag | Install |
| --- | --- | --- | --- |
| `0.5.0` | 13-16 | `ng-13-16` | `npm install ngx-fishbone-diagram@0.5.0` |
| `0.5.1` | 17-19 | `ng-17-19` | `npm install ngx-fishbone-diagram@0.5.1` |
| `0.5.2` | 20-21 | `ng-20-21` | `npm install ngx-fishbone-diagram@0.5.2` |