jQuery(function ($) {

    var deadline = new Date(1344459600000); // 5pm Aug 8
    $('.countdown').countdown({until: deadline});

    $('#form-anc').submit(function (evt) {
        var address = $('#address').val();
        evt.preventDefault();
        $.ajax({
            url: '/findLocation',
            data: {str: address},
            dataType: 'xml',
            success: handleLocationResponse
        });
    });

    function handleLocationResponse(xml) {
        var table = $(xml).find('Table1'),
            data = {},
            smd2002, smd2012, query;
        table.children().each(function (i, node) {
            data[node.tagName] = node.textContent;
        });
        console.log('data', data);
        smd2002 = data.SMD_2002.replace('SMD ', '');
        smd2012 = data.SMD_2012.replace('SMD ', '');
        if (!smd2002.match(/^[1-8][A-Z][01]\d$/) || !smd2012.match(/^[1-8][A-Z][01]\d$/)) {
            $.error("Can't find SMD");
            return;
        }
        $('#address-canonical').text(data.FULLADDRESS);
        $('#smd-2002').text(smd2002);
        $('#smd-2012').text(smd2012);
        query = "SELECT * FROM swdata WHERE smd = '" + smd2002 + "'";
        $.ajax({
            url: 'https://api.scraperwiki.com/api/1.0/datastore/sqlite',
            data: {
                format: 'jsondict',
                name: 'dc_ancs',
                query: query
            },
            dataType: 'jsonp',
            success: handleCommissionerResponse
        });
        query = "SELECT * FROM swdata WHERE smd = '" + smd2012 + "'";
        $.ajax({
            url: 'https://api.scraperwiki.com/api/1.0/datastore/sqlite',
            data: {
                format: 'jsondict',
                name: 'dc_anc_candidates',
                query: query
            },
            dataType: 'jsonp',
            success: handleCandidatesResponse
        });
    }

    function fullName(c) {
        var name = c.first_name + ' ' + c.last_name;
        if (c.suffix) {
            name += ' ' + c.suffix;
        }
        return name;
    }

    function handleCommissionerResponse(data) {
        console.log('commissioner', data);
        var c = data[0];
        if (c) {
            $('#commissioner').text(fullName(c));
        }
    }

    function handleCandidatesResponse(data) {
        console.log('candidates', data);
        var ul = $('<ul/>');
        $.each(data, function (i, c) {
            $('<li/>').text(fullName(c)).appendTo(ul);
        });
        $('#candidates').html(ul);
    }

});
