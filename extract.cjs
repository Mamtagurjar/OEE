const fs = require('fs');
const transcript = fs.readFileSync('c:/Users/HP/AppData/Roaming/Code/User/workspaceStorage/65a8aa02431c5cff179cacc28eda8f5b/GitHub.copilot-chat/transcripts/b4375a1b-0f91-49f5-a6dd-f4e146b6b1a3.jsonl', 'utf8');

const extracted = [];
transcript.split('\n').forEach(line => {
    if (!line) return;
    try {
        const obj = JSON.parse(line);
        if (obj.type === 'tool.execution_start' && obj.data.toolCall.name === 'create_file') {
            extracted.push(obj.data.toolCall.arguments);
        }
    } catch(e) {}
});

fs.writeFileSync('extracted.json', JSON.stringify(extracted, null, 2));
console.log('Done');
