const fs = require('fs');
const path = require('path');
const file = path.join('c:', 'Users', 'win 11', 'Desktop', 'DSM-FullStack', 'dsm_web', 'app', 'bulk-inquiry', 'page.tsx');
let content = fs.readFileSync(file, 'utf-8');

// Find the mobile view form block
const formRegex = /(<form className="space-y-7">[\s\S]*?<\/form>)/;
let match = content.match(formRegex);

if (match) {
    let formContent = match[1];
    
    // Replace the specific text-gray-400 classes used in labels to text-gray-700
    formContent = formContent.replace(/<span className="text-\[10px\] font-medium text-gray-400 ">/g, '<span className="text-[10px] font-medium text-gray-700 ">');
    
    content = content.replace(match[1], formContent);
    fs.writeFileSync(file, content, 'utf-8');
    console.log("Success");
} else {
    console.log("Form block not found");
}
