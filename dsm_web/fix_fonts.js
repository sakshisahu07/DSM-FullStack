const fs = require('fs');
const path = require('path');
const file = path.join('c:', 'Users', 'win 11', 'Desktop', 'DSM-FullStack', 'dsm_web', 'app', 'bulk-inquiry', 'page.tsx');
let content = fs.readFileSync(file, 'utf-8');

// Find the mobile view form block
const formRegex = /(<form className="space-y-7">[\s\S]*?<\/form>)/;
let match = content.match(formRegex);

if (match) {
    let formContent = match[1];
    
    // Replace all font weights with font-medium in the mobile form
    formContent = formContent.replace(/font-black/g, 'font-medium');
    formContent = formContent.replace(/font-bold/g, 'font-medium');
    formContent = formContent.replace(/font-semibold/g, 'font-medium');

    content = content.replace(match[1], formContent);
    fs.writeFileSync(file, content, 'utf-8');
    console.log("Success");
} else {
    console.log("Form block not found");
}
