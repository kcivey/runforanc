jQuery(function ($) {

    $('#form-search').submit(function (evt) {
        var q = $('#q').val(),
            button = $('button', this);
        evt.preventDefault();
        if (!q) {
            return; // don't search if empty
        }
        button.text('Please Wait').attr('disabled', 'disabled');
        $('#results').empty();
        $.ajax({
            url: 'http://' + window.location.host + ':3000/search',
            data: {q: q},
            dataType: 'jsonp',
            success: handleResults,
            complete: function () { button.text('Search').removeAttr('disabled'); }
        });
    });

    function handleResults(data) {
        var tbody = $('#results'),
            rowTemplate = _.template($('#row-template').html());
        $('#result-div table').toggleClass('hide', data.length ? false : true);
        $('#none-found').toggleClass('hide', data.length ? true : false);
        $.each(data, function (i, r) {
            tbody.append(rowTemplate(r));
        });
    }
});
