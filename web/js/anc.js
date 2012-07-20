jQuery(function ($) {

    var deadline = new Date(1344459600000); // 5pm Aug 8
    $('.countdown').countdown({until: deadline});

    $('#form-anc').submit(function (evt) {
        var address = $('#address').val(),
            button = $('button', this);
        evt.preventDefault();
        button.text('Please Wait').attr('disabled', 'disabled');
        $('#info').children().hide();
        $('#info').removeClass('hide');
        $.ajax({
            url: '/findLocation',
            data: {str: address},
            dataType: 'xml',
            success: handleLocationResponse,
            complete: function () { button.text('Go').removeAttr('disabled'); }
        });
    });

    function handleLocationResponse(xml) {
        var table = $(xml).find('Table1'),
            data = {},
            smd2002, smd2012, query;
        table.children().each(function (i, node) {
            data[node.tagName] = node.textContent;
        });
        if (data.FULLADDRESS) {
            $('#info .canonical-address').text(data.FULLADDRESS);
            $('#address-found').show();
        }
        else {
            $('#address-not-found').show();
        }
        smd2002 = data.SMD_2002.replace('SMD ', '');
        smd2012 = data.SMD_2012.replace('SMD ', '');
        if (!smd2002.match(/^[1-8][A-Z][01]\d$/) || !smd2012.match(/^[1-8][A-Z][01]\d$/)) {
            $.error("Can't find SMD");
            return;
        }
        $('#info .smd-2002').text(smd2002);
        $('#info .smd-2012').text(smd2012);
        $('#current-smd').show();
        if (smd2002 == smd2012) {
            $('#smd-not-changing').show();
        }
        else {
            $('#smd-changing').show();
        }
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
        var c = data[0];
        if (c) {
            $('#info .commissioner').text(fullName(c));
        }
    }

    function handleCandidatesResponse(data) {
        var n = data.length,
            div, ul;
        if (n) {
            div = $('#candidates');
            ul = div.find('ul').empty();
            div.find('.number-candidates').text(n);
            div.find('.candidate-plural').text(n == 1 ? '' : 's');
            div.find('.candidate-verb').text(n == 1 ? 'has' : 'have');
            $.each(data, function (i, c) {
                var text = fullName(c);
                if (c.filing_date) {
                    text += ' (filed)';
                }
                $('<li/>').text(text).appendTo(ul);
            });
            $('#candidates').show();
        }
        else {
            $('#no-candidates').show();
        }
    }

});
