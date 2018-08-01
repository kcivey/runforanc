const tabula = require('tabula-js');
const stream = tabula('anc-candidates.pdf', {guess: true, debug: true, spreadsheet: true, pages: 'all'}).streamCsv();
stream
    .split()
    .doto(console.log)
    .done(() => console.log('ALL DONE!'));
