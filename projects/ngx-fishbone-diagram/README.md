# Fishbone Diagram for Angular 12

This library is a typescript implementation of the [d3.fishbone.js]() and the [angular-fishbone]() library written for angular 1. It is also updated to work with the latest [d3]() library. I'll be adding a few features to this library going forward, but at the moment, it is just a faithful implementation of the said libraries.

## Inputs and Outputs

The component is intialised with a `data` input and generates a `selected` event with the node data on which the select event occured. The component watches for changes to the `data` input. So between these two we should be able to build a fully functional fishbone session.