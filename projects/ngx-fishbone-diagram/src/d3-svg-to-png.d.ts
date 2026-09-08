declare module 'd3-svg-to-png' {
  const d3SvgToPng: {
    default(selector: string, filename: string, options: { download: boolean; format: string }): void;
  };

  export = d3SvgToPng;
}