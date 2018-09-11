#!/usr/bin/env node

var tabula = require('tabula-js'),
    stream = tabula('anc-candidates.pdf', {guess: true, debug: true, spreadsheet: true, pages: 'all'}).streamCsv(),
    parse = require('csv-parse/lib/sync'),
    _ = require('lodash'),
    candidatesBySmd = {},
    columnTitles, columnNames;

stream
    .split()
    .doto(function (line) {
        var record, smd;
        if (!columnTitles) {
            columnTitles = parse(line)[0];
            if (columnTitles[0] === 'ANC/SM') { // Why is Tabula cutting this off?
                columnTitles[0] = 'ANC/SMD';
            }
            columnNames = _.map(columnTitles, _.camelCase);
            return;
        }
        record = parse(line, {columns: columnNames})[0] || {};
        if (!record.name || record.name === 'Name') {
            return;
        }
        smd = record.ancSmd;
        if (!candidatesBySmd[smd]) {
            candidatesBySmd[smd] = [];
        }
        delete record.ancSmd;
        candidatesBySmd[smd].push(record);
    })
    .done(function () {
        console.log(candidatesBySmd);
    /*
        var competitivenessCount = [];
        _.each(candidatesBySmd, function (candidates, smd) {
            var competitiveness = candidates.filter(function (c) { return c.name; }).length;
            if (!competitivenessCount[competitiveness]) {
                competitivenessCount[competitiveness] = 0;
            }
            competitivenessCount[competitiveness]++;
        });
        console.log(competitivenessCount);
     */
    });
