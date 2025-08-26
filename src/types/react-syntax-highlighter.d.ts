declare module 'react-syntax-highlighter' {
  // Minimal ambient types for the package used in the project.
  import * as React from 'react';
  export const Prism: React.ComponentType<any> & { default?: any };
  const defaultExport: { Prism: typeof Prism } & any;
  export default defaultExport;
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  export const solarizedlight: any;
}
