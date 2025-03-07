
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function generateComponent() {
  try {
    console.log('\n🧩 Component Generator 🧩\n');
    
    // Get component name
    const name = await prompt('Component name: ');
    if (!name) {
      console.log('❌ Component name is required');
      rl.close();
      return;
    }
    
    // Format component name to PascalCase
    const componentName = name
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    
    // Get component type
    const typeOptions = ['ui', 'page', 'layout'];
    console.log('\nComponent type:');
    typeOptions.forEach((type, index) => {
      console.log(`${index + 1}. ${type}`);
    });
    
    const typeChoice = await prompt(`Select type (1-${typeOptions.length}): `);
    const type = typeOptions[parseInt(typeChoice) - 1] || 'ui';
    
    // Styles
    const withStyles = (await prompt('Include styles? (y/n): ')).toLowerCase() === 'y';
    
    // Tests
    const withTests = (await prompt('Include tests? (y/n): ')).toLowerCase() === 'y';
    
    // Generate paths
    const componentDir = path.join(
      __dirname, 
      '../../',
      type === 'ui' ? 'packages/ui/src/components' : `apps/web/src/components/${type}`,
      componentName
    );
    
    // Create directory
    fs.mkdirSync(componentDir, { recursive: true });
    
    // Generate component file
    const componentContent = `import React from 'react';
${withStyles ? `import styles from './${componentName}.module.css';` : ''}

export interface ${componentName}Props {
  children?: React.ReactNode;
}

export const ${componentName} = ({ children }: ${componentName}Props) => {
  return (
    <div${withStyles ? ` className={styles.container}` : ''}>
      {children}
    </div>
  );
};
`;

    fs.writeFileSync(
      path.join(componentDir, `${componentName}.tsx`),
      componentContent
    );

    // Generate styles if needed
    if (withStyles) {
      fs.writeFileSync(
        path.join(componentDir, `${componentName}.module.css`),
        `.container {\n  /* Add styles here */\n}\n`
      );
    }

    // Generate test if needed
    if (withTests) {
      const testContent = `import { render, screen } from '@testing-library/react';
import { ${componentName} } from './${componentName}';

describe('${componentName}', () => {
  it('renders correctly', () => {
    render(<${componentName}>Test</${componentName}>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
`;
      fs.writeFileSync(
        path.join(componentDir, `${componentName}.test.tsx`),
        testContent
      );
    }

    // Generate index file for exporting
    fs.writeFileSync(
      path.join(componentDir, 'index.ts'),
      `export * from './${componentName}';\n`
    );

    console.log(`\n✅ Generated ${componentName} component in ${componentDir}`);
  } catch (error) {
    console.error('Error generating component:', error);
  } finally {
    rl.close();
  }
}

generateComponent();
