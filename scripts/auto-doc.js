const fs = require('fs');
const path = require('path');

const scanComponents = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      scanComponents(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });
  return fileList;
};

const generateGlossary = () => {
  const components = scanComponents(path.join(process.cwd(), 'src/components'));
  let content = '# Component Glossary\n\n';
  components.forEach(file => {
    const name = path.basename(file, path.extname(file));
    content += `- **${name}**: [Path](${file})\n`;
  });
  
  const docPath = path.join(process.cwd(), 'docs/component_glossary.md');
  fs.mkdirSync(path.dirname(docPath), { recursive: true });
  fs.writeFileSync(docPath, content);
  console.log('Generated Component Glossary');
};

generateGlossary();
// Note: Dependency graph generation is complex and omitted for brevity in this bootstrap script.
