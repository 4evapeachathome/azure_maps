declare module '@svg-maps/usa' {
  interface Location {
    id: string;
    name: string;
    path: string;
  }

  interface SVGMap {
    viewBox: string;
    locations: Location[];
  }

  const usaMap: SVGMap;
  export default usaMap;
}
