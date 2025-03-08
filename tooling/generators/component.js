const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask for component name
rl.question('Component name: ', (name) => {
  // Ask for component type
  rl.question('Component type (ui/web): ', (type) => {
    const directory = type === 'ui' 
      ? path.join(__dirname, '../../packages/ui/components') 
      : path.join(__dirname, '../../apps/web/src/components');
    
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    
    const componentPath = path.join(directory, `${name}.tsx`);
    
    // Basic component template
    const componentContent = `import React from 'react';

interface ${name}Props {
  children?: React.ReactNode;
}

export function ${name}({ children }: ${name}Props) {
  return (
    <div>
      {children}
    </div>
  );
}
`;
    
    fs.writeFileSync(componentPath, componentContent);
    console.log(`Component created at ${componentPath}`);
    
    rl.close();
  });
});