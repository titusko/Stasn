const fs = require('fs');
const path = require('path');
const prompts = require('prompts');

async function generateComponent() {
  const response = await prompts([
    {
      type: 'text',
      name: 'name',
      message: 'What is your component name?'
    },
    {
      type: 'select',
      name: 'type',
      message: 'What type of component?',
      choices: [
        { title: 'UI Component', value: 'ui' },
        { title: 'Page Component', value: 'page' },
        { title: 'Layout Component', value: 'layout' }
      ]
    },
    {
      type: 'confirm',
      name: 'withStyles',
      message: 'Include styles?'
    },
    {
      type: 'confirm',
      name: 'withTests',
      message: 'Include tests?'
    }
  ]);

  // Generate component files based on response
  const componentDir = path.join(
    __dirname, 
    '../../',
    response.type === 'ui' ? 'packages/ui/src/components' : 'apps/web/src/components',
    response.name
  );

  fs.mkdirSync(componentDir, { recursive: true });

  // Generate component file
  const componentContent = `import React from 'react';
${response.withStyles ? `import styles from './${response.name}.module.css';` : ''}

export interface ${response.name}Props {
  children?: React.ReactNode;
}

export const ${response.name} = ({ children }: ${response.name}Props) => {
  return (
    <div${response.withStyles ? ` className={styles.container}` : ''}>
      {children}
    </div>
  );
};
`;

  fs.writeFileSync(
    path.join(componentDir, `${response.name}.tsx`),
    componentContent
  );

  // Generate styles if needed
  if (response.withStyles) {
    fs.writeFileSync(
      path.join(componentDir, `${response.name}.module.css`),
      `.container {\n  /* Add styles here */\n}\n`
    );
  }

  // Generate test if needed
  if (response.withTests) {
    const testContent = `import { render, screen } from '@testing-library/react';
import { ${response.name} } from './${response.name}';

describe('${response.name}', () => {
  it('renders correctly', () => {
    render(<${response.name}>Test</${response.name}>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
`;
    fs.writeFileSync(
      path.join(componentDir, `${response.name}.test.tsx`),
      testContent
    );
  }

  // Generate index file for exporting
  fs.writeFileSync(
    path.join(componentDir, 'index.ts'),
    `export * from './${response.name}';\n`
  );

  console.log(`✅ Generated ${response.name} component`);
}

generateComponent().catch(console.error);