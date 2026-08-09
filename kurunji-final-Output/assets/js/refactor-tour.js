const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace links
    content = content.replace(/href="index\.html#360-tour"/g, 'href="tour.html"');
    content = content.replace(/href="#360-tour"/g, 'href="tour.html"');
    
    // Some places it might be 360\? Tour? The grep showed: 360? Tour, wait that was just text content.
    // The grep showed: href="index.html#360-tour" and href="#360-tour"
    
    // Remove the 360-tour section from index.html and attractions.html
    if (file === 'index.html' || file === 'attractions.html') {
        // Regex to match the section. 
        // We know it starts with <section ... id="360-tour" ... > and ends with </section>
        // It's safer to use string manipulation because regex for HTML blocks can be tricky, but we can try.
        const sectionRegex = /<!-- 360 Section -->[\s\S]*?<\/section>/;
        content = content.replace(sectionRegex, '');
        
        // Let's also check for other potential matches
        const sectionRegex2 = /<section[^>]*id="360-tour"[^>]*>[\s\S]*?<\/section>/;
        content = content.replace(sectionRegex2, '');
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
});
