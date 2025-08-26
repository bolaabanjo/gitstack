// shim to re-export the TSX implementation so tsc doesn't parse JSX in this .ts file
// Import the explicit .tsx file to avoid resolving back to this .ts file.
import highlightCode from './highlight.tsx';
export { highlightCode };
export default highlightCode;